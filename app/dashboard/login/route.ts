import { NextRequest } from "next/server";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { trainers } from "@/lib/db/schema";
import { isAuthConfigured, signMagicToken } from "@/lib/auth";
import { siteOrigin } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Always redirects to the same "check your inbox" screen, whether or not the
 * address is on the programme. Otherwise this endpoint tells a stranger which
 * of their competitors is a REKRD coach.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();

  const sent = new URL("/dashboard?sent=1", siteOrigin());

  if (!email || !isDbConfigured() || !isAuthConfigured()) {
    return Response.redirect(sent, 303);
  }

  try {
    const [trainer] = await db()
      .select({ id: trainers.id, fullName: trainers.fullName })
      .from(trainers)
      .where(eq(trainers.email, email))
      .limit(1);

    if (trainer) {
      const token = await signMagicToken(trainer.id);
      const link = `${siteOrigin()}/dashboard/enter?token=${encodeURIComponent(token)}`;

      const key = process.env.RESEND_API_KEY;
      if (key) {
        await new Resend(key).emails.send({
          from: "REKRD Coaches <partners@rekrd.io>",
          to: email,
          subject: "Your REKRD coach dashboard link",
          text: [
            `Hi ${trainer.fullName.split(/\s+/)[0]},`,
            ``,
            `Here's your link in. It works once and expires in 20 minutes:`,
            ``,
            link,
            ``,
            `If you didn't ask for this, you can ignore it — nothing has changed.`,
            ``,
            `partners@rekrd.io`,
          ].join("\n"),
        });
      }
    }
  } catch (err) {
    console.error("[dashboard] magic link failed", err);
  }

  return Response.redirect(sent, 303);
}
