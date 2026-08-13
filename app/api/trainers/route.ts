import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDbConfigured } from "@/lib/db";
import { trainers } from "@/lib/db/schema";
import { nextCandidates, normaliseCode, validateCode } from "@/lib/codes";
import { mintCoachDiscount } from "@/lib/shopify/discounts";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Payload = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(9).max(30),
  city: z.string().min(2).max(120),
  disciplines: z.array(z.string().max(60)).min(1).max(12),
  code: z.string().min(3).max(12),
  gym: z.string().max(160).nullable().optional(),
  instagram: z.string().max(60).nullable().optional(),
  clientBand: z.string().max(20).nullable().optional(),
  marketingOptIn: z.boolean().default(false),
  /* Versions the acknowledgement the coach ticks on the form — "REKRD is a
     food, not a medicine; I'll say what's in the sachet, not what it does."
     That checkbox is required, so in practice this always arrives, but it stays
     nullable: rows predating the acknowledgement have no version to record. */
  claimsCheckVersion: z.string().max(40).nullable().optional(),
  trap: z.string().max(200).optional(),
  elapsedMs: z.number().int().nonnegative().optional(),
});

/** Nobody fills eight fields and picks a code in three seconds. */
const MIN_FILL_MS = 3_000;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = Payload.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Some of those details didn't look right. Have another look." },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Bot signals. Both are silent 400s — never explain the trap.
  if (input.trap) {
    return Response.json({ error: "Something went wrong." }, { status: 400 });
  }
  if (input.elapsedMs !== undefined && input.elapsedMs < MIN_FILL_MS) {
    return Response.json({ error: "Something went wrong." }, { status: 400 });
  }

  const code = normaliseCode(input.code);
  if (validateCode(code)) {
    return Response.json({ error: "Pick a different code." }, { status: 400 });
  }

  if (!isDbConfigured() || !isShopifyConfigured()) {
    return Response.json(
      {
        error:
          "Signups aren't switched on yet. Email partners@rekrd.io and we'll set you up by hand.",
      },
      { status: 503 },
    );
  }

  const email = input.email.trim().toLowerCase();
  const now = new Date();

  /* One coach, one code. Someone coming back should get their existing code,
     not a second one and a confusing 409. */
  const [existing] = await db()
    .select({ code: trainers.discountCode })
    .from(trainers)
    .where(eq(trainers.email, email))
    .limit(1);

  if (existing) {
    return Response.json({ code: existing.code });
  }

  /* Reserve the code in Postgres BEFORE calling Shopify. The unique index is
     the real gate — the availability endpoint is only advisory, and two
     coaches can land on the same name in the same second. */
  let trainerId: string;
  try {
    const [row] = await db()
      .insert(trainers)
      .values({
        fullName: input.fullName.trim(),
        email,
        phone: input.phone.trim(),
        city: input.city.trim(),
        gym: input.gym?.trim() || null,
        instagram: input.instagram?.replace(/^@/, "").trim() || null,
        disciplines: input.disciplines,
        clientBand: input.clientBand || null,
        discountCode: code,
        status: "provisioning",
        marketingOptIn: input.marketingOptIn,
        acceptedTermsAt: now,
        claimsCheckPassedAt: input.claimsCheckVersion ? now : null,
        claimsCheckVersion: input.claimsCheckVersion ?? null,
      })
      .returning({ id: trainers.id });
    trainerId = row.id;
  } catch (err) {
    if (isUniqueViolation(err)) {
      return Response.json(
        {
          error: "That code was just taken.",
          suggestions: nextCandidates(code, input.fullName, 0).slice(0, 2),
        },
        { status: 409 },
      );
    }
    console.error("[trainers] insert failed", err);
    return Response.json(
      { error: "We couldn't save that. Try again in a moment." },
      { status: 500 },
    );
  }

  /* Mint in Shopify. If Shopify says TAKEN, a code exists in the store that
     isn't in our table — a hand-made one, or a leftover. Walk the candidates. */
  let finalCode = code;
  let gid: string | null = null;

  for (let attempt = 0; attempt < 5 && !gid; attempt++) {
    try {
      const result = await mintCoachDiscount({
        code: finalCode,
        coachName: input.fullName.trim(),
      });

      if (result.ok) {
        gid = result.gid;
        break;
      }

      if (result.reason === "taken") {
        const [candidate] = nextCandidates(code, input.fullName, attempt);
        if (!candidate) break;
        finalCode = candidate;
        await db()
          .update(trainers)
          .set({ discountCode: finalCode })
          .where(eq(trainers.id, trainerId));
        continue;
      }

      console.error("[trainers] shopify rejected the discount", result.message);
      break;
    } catch (err) {
      console.error("[trainers] shopify call failed", err);
      break;
    }
  }

  if (!gid) {
    // Compensate: never leave a reserved code with no discount behind it.
    await db().delete(trainers).where(eq(trainers.id, trainerId));
    return Response.json(
      {
        error:
          "We couldn't create your code just now. Try again, and if it keeps happening email partners@rekrd.io — we'll set you up by hand.",
      },
      { status: 502 },
    );
  }

  await db()
    .update(trainers)
    .set({ shopifyDiscountGid: gid, status: "active" })
    .where(eq(trainers.id, trainerId));

  /* Best effort. A failed email must never cost the coach their code — they
     already have it on the next screen. Stamped on success so the resend
     endpoint can tell who is still owed one. */
  try {
    const sent = await sendWelcomeEmail({
      to: email,
      fullName: input.fullName.trim(),
      code: finalCode,
    });
    if (sent) {
      await db()
        .update(trainers)
        .set({ flags: { welcomeEmailSentAt: now.toISOString() } })
        .where(eq(trainers.id, trainerId));
    } else {
      console.warn(
        "[trainers] welcome email skipped — RESEND_API_KEY is not set",
      );
    }
  } catch (err) {
    console.error("[trainers] welcome email failed", err);
  }

  return Response.json({ code: finalCode }, { status: 201 });
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}
