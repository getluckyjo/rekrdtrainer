import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, isDbConfigured } from "@/lib/db";
import { trainers } from "@/lib/db/schema";
import { isEmailConfigured, sendWelcomeEmail } from "@/lib/email";
import { normaliseCode } from "@/lib/codes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Re-send the welcome email — to one coach, or to everyone still owed one.
 *
 * Exists because RESEND_API_KEY was unset for the programme's first four
 * signups, so nobody received anything, and because a coach who loses their
 * QR card needs a way back to it that doesn't involve a developer.
 *
 * POST, not GET: this sends real email to real people, and a GET would be
 * triggerable by anything that follows a link — a crawler, a chat client
 * generating a preview, a prefetch.
 *
 * Guarded by ADMIN_SECRET, deliberately separate from EXPORT_SECRET. The
 * export token is written into a shared spreadsheet where every viewer can
 * read it; it must never be able to mail the coach base.
 *
 * `flags.welcomeEmailSentAt` records delivery so `scope: "pending"` is
 * idempotent — running it twice does not mail anyone twice.
 */

const Payload = z.object({
  /** One coach by discount code. */
  code: z.string().min(3).max(12).optional(),
  /** "pending" = everyone never successfully mailed. "all" = every active coach. */
  scope: z.enum(["pending", "all"]).optional(),
  /** Report who would be mailed, send nothing. */
  dryRun: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return Response.json({ error: "ADMIN_SECRET is not set." }, { status: 503 });
  }
  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (provided !== secret) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return Response.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  let body: unknown = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const parsed = Payload.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Send either { code } or { scope: 'pending' | 'all' }." },
      { status: 400 },
    );
  }
  const { code, scope, dryRun } = parsed.data;

  if (!code && !scope) {
    return Response.json(
      { error: "Nothing selected. Pass { code } or { scope }." },
      { status: 400 },
    );
  }

  const base = {
    id: trainers.id,
    fullName: trainers.fullName,
    email: trainers.email,
    discountCode: trainers.discountCode,
  };

  const targets = code
    ? await db()
        .select(base)
        .from(trainers)
        .where(eq(trainers.discountCode, normaliseCode(code)))
        .limit(1)
    : await db()
        .select(base)
        .from(trainers)
        .where(
          scope === "all"
            ? eq(trainers.status, "active")
            : sql`${trainers.status} = 'active' and ${trainers.flags}->>'welcomeEmailSentAt' is null`,
        );

  if (targets.length === 0) {
    return Response.json({
      sent: 0,
      message: code
        ? `No coach found with code ${normaliseCode(code)}.`
        : "Nobody is waiting for a welcome email.",
    });
  }

  /* Deliberately before the RESEND_API_KEY check: a dry run sends nothing, and
     being able to see who is owed a mail before wiring up Resend is exactly
     when you want to look. */
  if (dryRun) {
    return Response.json({
      dryRun: true,
      wouldSend: targets.length,
      emailConfigured: isEmailConfigured(),
      coaches: targets.map((t) => ({ code: t.discountCode, email: t.email })),
    });
  }

  /* Refuse rather than report a success that sent nothing. This is the exact
     failure that let the first four signups go out unnoticed. */
  if (!isEmailConfigured()) {
    return Response.json(
      {
        error:
          "RESEND_API_KEY is not set, so no email can be sent. Add it in Vercel and redeploy, then run this again.",
        wouldHaveSent: targets.length,
      },
      { status: 503 },
    );
  }

  const sent: string[] = [];
  const failed: { code: string; reason: string }[] = [];

  /* Sequential on purpose. The roster is small, and Resend rate-limits bursts
     — a partial failure here is far more annoying than a slow response. */
  for (const t of targets) {
    try {
      const ok = await sendWelcomeEmail({
        to: t.email,
        fullName: t.fullName,
        code: t.discountCode,
      });
      if (!ok) {
        failed.push({ code: t.discountCode, reason: "email not configured" });
        continue;
      }
      await db()
        .update(trainers)
        .set({ flags: { welcomeEmailSentAt: new Date().toISOString() } })
        .where(eq(trainers.id, t.id));
      sent.push(t.discountCode);
    } catch (err) {
      console.error("[resend-welcome] failed for", t.discountCode, err);
      failed.push({
        code: t.discountCode,
        reason: err instanceof Error ? err.message : "unknown error",
      });
    }
  }

  return Response.json(
    { sent: sent.length, codes: sent, failed },
    { status: failed.length && !sent.length ? 502 : 200 },
  );
}
