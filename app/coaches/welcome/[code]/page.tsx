import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import Footer from "@/components/chrome/Footer";
import CopyButton from "@/components/welcome/CopyButton";
import QrCard from "@/components/welcome/QrCard";
import ShareActions from "@/components/welcome/ShareActions";
import { db, isDbConfigured } from "@/lib/db";
import { trainers } from "@/lib/db/schema";
import { normaliseCode, shopifyDiscountLink, validateCode } from "@/lib/codes";
import { siteOrigin } from "@/lib/email";
import { BRAND } from "@/lib/productFacts";
import s from "@/components/welcome/welcome.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "You're in",
  robots: { index: false, follow: false },
};

export default async function WelcomePage(
  props: PageProps<"/coaches/welcome/[code]">,
) {
  const { code: raw } = await props.params;
  const code = normaliseCode(raw);

  if (!code || validateCode(code)) notFound();

  /* The code is public by design — it's printed on cards and read aloud in
     gyms — so this page carries nothing sensitive and needs no auth. */
  let firstName: string | null = null;
  if (isDbConfigured()) {
    try {
      const [trainer] = await db()
        .select({ fullName: trainers.fullName })
        .from(trainers)
        .where(eq(sql`upper(${trainers.discountCode})`, code))
        .limit(1);
      if (!trainer) notFound();
      firstName = trainer.fullName.split(/\s+/)[0];
    } catch {
      // A database blip must not lose a coach the screen with their code on it.
      firstName = null;
    }
  }

  const origin = siteOrigin();
  const vanity = `${origin}/t/${code}`;
  const display = `${origin.replace(/^https?:\/\//, "")}/t/${code}`;

  return (
    <>
      <div className="flavour-bar" />

      <header className={s.hero}>
        <div className="wrap">
          <span className="kicker mono">REKRD Coach Programme</span>
          <h1>
            You&rsquo;re in{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="sub">
            Your code is live on {BRAND.shopUrl.replace("https://", "")} right
            now. Give people the code itself, not just the link — a typed code
            works from any device, and a link only carries the discount within
            one browser session.
          </p>

          <div className={s.codePanel}>
            <div>
              <span className={s.codeLabel}>Your code</span>
              <div className={s.code}>{code}</div>
              <div className={s.link}>{display}</div>
              <div className={s.copyRow}>
                <CopyButton value={code} label="Copy code" />
                <CopyButton value={vanity} label="Copy link" />
                <a
                  className="btn small ghost"
                  href={shopifyDiscountLink(code)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Test it
                </a>
              </div>
            </div>
            <QrCard url={vanity} code={code} display={display} />
          </div>
        </div>
      </header>

      <section className="section">
        <div className="wrap">
          <h2>
            <span className="num">01</span>Do these three things{" "}
            <span className="accent">now.</span>
          </h2>
          <p className="lede">
            About four minutes, and then you can forget about it. A code
            nobody has seen earns nothing, and the easiest time to share it is
            while you&rsquo;re still on this page.
          </p>
          <ShareActions code={code} vanity={vanity} />
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <h2>
            <span className="num">02</span>What happens next.
          </h2>

          <div className="steps">
            <div className="step">
              <div>
                <h3>Your first sale</h3>
                <p>
                  It appears on your statement the day after the order is
                  placed. Commission is 15% of the order before your
                  client&rsquo;s 10% came off — R90 on a one-off tube, R81 on a
                  subscription delivery.
                </p>
              </div>
            </div>
            <div className="step">
              <div>
                <h3>Their repeat orders</h3>
                <p>
                  The first time a client buys with your code, they&rsquo;re
                  linked to you for 12 months. Everything they order in that
                  window earns you commission — renewals included, and repeat
                  orders where they forgot to type the code.
                </p>
              </div>
            </div>
            <div className="step">
              <div>
                <h3>Getting paid</h3>
                <p>
                  Statement on the 1st, EFT on the 7th, covering the previous
                  month. There&rsquo;s a 30-day hold per order so returns settle
                  first. R200 minimum — below that it rolls over.
                </p>
              </div>
            </div>
          </div>

          <div className={s.payout}>
            <span className={s.payoutK}>Payout details · not needed yet</span>
            <p style={{ fontSize: 14.5, color: "var(--ink-soft)", maxWidth: "62ch" }}>
              We haven&rsquo;t asked for your bank account, and we won&rsquo;t
              until there&rsquo;s money to send. The moment your first
              commission lands we&rsquo;ll email you for it — we need it by the
              5th to pay you on the 7th.
            </p>
          </div>

          <div className="banner">
            <strong>One last thing.</strong> Order a 5-sachet pack for yourself
            at R90 with your own code. You&rsquo;ll recommend it far better once
            you&rsquo;ve tasted all five flavours. We don&rsquo;t pay commission
            on your own orders — it&rsquo;s your discount, not a way to buy at
            25% off.
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
