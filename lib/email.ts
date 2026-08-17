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

/**
 * Whether mail can actually go out. Worth checking explicitly before reporting
 * success: RESEND_API_KEY went unset for the programme's first four signups
 * and nothing complained, because sending is best-effort by design.
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * The origin every coach-facing link is built from — the print card, the QR,
 * the welcome email and the dashboard. Set NEXT_PUBLIC_SITE_ORIGIN to the
 * branded domain; it is baked in at build time, so changing it needs a redeploy.
 *
 * `||` rather than `??` so that an empty-string value falls through as well.
 * `??` only catches null/undefined, and a blank var would otherwise yield
 * host-less links like "/t/CODE" — on a printed QR card that is unrecoverable.
 *
 * VERCEL_PROJECT_PRODUCTION_URL is the deployment's own *.vercel.app host
 * rather than the branded domain, so it is a fallback and not the answer.
 */
export function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_ORIGIN ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://coach.rekrd.io")
  );
}

/**
 * Returns true only when a message actually went to Resend. Callers that must
 * not fail on a mail problem (the signup route) can ignore it; callers that
 * report back to a human (the resend endpoint) must not claim success without
 * it.
 */
export async function sendWelcomeEmail(opts: {
  to: string;
  fullName: string;
  code: string;
}): Promise<boolean> {
  const resend = client();
  if (!resend) return false;

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
      `And this is where you check what you've earned. Enter this same email`,
      `address and we'll send you a link in — no password to remember:`,
      `${origin}/dashboard`,
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

  return true;
}
