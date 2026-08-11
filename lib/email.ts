import { Resend } from "resend";
import { shopifyDiscountLink, vanityLink } from "./codes";
import { BRAND } from "./productFacts";

/**
 * Transactional email. Deliberately best-effort everywhere it's called: a
 * coach already has their code on screen, so a mail failure must never cost
 * them the signup.
 */

const FROM = "REKRD Coaches <partners@rekrd.io>";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://coaches.rekrd.io")
  );
}

export async function sendWelcomeEmail(opts: {
  to: string;
  fullName: string;
  code: string;
}): Promise<void> {
  const resend = client();
  if (!resend) return;

  const { to, fullName, code } = opts;
  const firstName = fullName.split(/\s+/)[0];
  const origin = siteOrigin();
  const welcome = `${origin}/coaches/welcome/${code}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're in, ${firstName} — your code is ${code}`,
    text: [
      `You're in, ${firstName}.`,
      ``,
      `Your code is ${code}. It's live on ${BRAND.shopUrl} right now.`,
      ``,
      `Your clients get 10% off with it. You earn 15% of what they spend —`,
      `R90 on a one-off tube, R81 on every subscription delivery — including`,
      `their repeat orders for 12 months, whether they type the code or not.`,
      ``,
      `Your share link:  ${vanityLink(code, origin)}`,
      `Direct link:      ${shopifyDiscountLink(code)}`,
      ``,
      `Your QR code, print card and ready-made captions are here:`,
      `${welcome}`,
      ``,
      `Two things worth remembering:`,
      `1. Give people the code, not just the link. A typed code works from any`,
      `   device; a link only carries the discount within one browser session.`,
      `2. Learn the numbers and you'll never be stuck: 600mg sodium, 500mg`,
      `   L-glutamine, about 4.5g a sachet with no fillers, R20 a serve.`,
      `   Everything printed on the pack is ours, so use it freely. Send`,
      `   medical and drug-testing questions to a professional, and say that`,
      `   you earn from your code when you recommend it. That's the lot.`,
      ``,
      `We don't need your banking details yet. We'll ask once you've actually`,
      `earned something — statements go out on the 1st, EFT on the 7th.`,
      ``,
      `${BRAND.partnerEmail}`,
    ].join("\n"),
  });
}
