import type { Metadata } from "next";
import { and, desc, eq, isNull, lte, sql } from "drizzle-orm";
import Footer from "@/components/chrome/Footer";
import CopyButton from "@/components/welcome/CopyButton";
import { getSession, isAuthConfigured } from "@/lib/auth";
import { db, isDbConfigured } from "@/lib/db";
import { linkClicks, referredOrders, trainers } from "@/lib/db/schema";
import { formatZar } from "@/lib/calc";
import { vanityLink } from "@/lib/codes";
import { siteOrigin } from "@/lib/email";
import { BRAND, PROGRAMME } from "@/lib/productFacts";
import s from "./dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your earnings",
  robots: { index: false, follow: false },
};

export default async function DashboardPage(
  props: PageProps<"/dashboard">,
) {
  const query = await props.searchParams;
  const trainerId = await getSession();

  if (!trainerId) {
    return (
      <SignIn sent={Boolean(query.sent)} expired={Boolean(query.expired)} />
    );
  }

  const [coach] = await db()
    .select({
      fullName: trainers.fullName,
      code: trainers.discountCode,
      rate: trainers.commissionRate,
      payoutDetailsOnFile: trainers.payoutDetailsOnFile,
    })
    .from(trainers)
    .where(eq(trainers.id, trainerId))
    .limit(1);

  if (!coach) return <SignIn sent={false} expired />;

  const today = new Date().toISOString().slice(0, 10);

  const [totals] = await db()
    .select({
      orders: sql<number>`count(*)::int`,
      earned: sql<number>`coalesce(sum(${referredOrders.commissionC}), 0)::int`,
    })
    .from(referredOrders)
    .where(eq(referredOrders.trainerId, trainerId));

  const [payable] = await db()
    .select({
      amount: sql<number>`coalesce(sum(${referredOrders.commissionC}), 0)::int`,
    })
    .from(referredOrders)
    .where(
      and(
        eq(referredOrders.trainerId, trainerId),
        isNull(referredOrders.payoutId),
        lte(referredOrders.payableFrom, today),
      ),
    );

  const [held] = await db()
    .select({
      amount: sql<number>`coalesce(sum(${referredOrders.commissionC}), 0)::int`,
    })
    .from(referredOrders)
    .where(
      and(
        eq(referredOrders.trainerId, trainerId),
        isNull(referredOrders.payoutId),
        sql`${referredOrders.payableFrom} > ${today}`,
      ),
    );

  const [clicks] = await db()
    .select({ n: sql<number>`count(*)::int` })
    .from(linkClicks)
    .where(eq(linkClicks.trainerId, trainerId));

  const orders = await db()
    .select({
      orderName: referredOrders.orderName,
      processedAt: referredOrders.processedAt,
      subtotalC: referredOrders.subtotalC,
      commissionC: referredOrders.commissionC,
      status: referredOrders.orderStatus,
      attribution: referredOrders.attribution,
      isRecurring: referredOrders.isRecurring,
      payableFrom: referredOrders.payableFrom,
      payoutId: referredOrders.payoutId,
    })
    .from(referredOrders)
    .where(eq(referredOrders.trainerId, trainerId))
    .orderBy(desc(referredOrders.processedAt))
    .limit(100);

  const origin = siteOrigin();
  const vanity = vanityLink(coach.code, origin);
  const firstName = coach.fullName.split(/\s+/)[0];

  return (
    <>
      <div className="flavour-bar" />

      <header className="header">
        <div className="wrap">
          <span className="kicker mono">Coach dashboard</span>
          <h1>
            {firstName}&rsquo;s <span className="accent">earnings.</span>
          </h1>

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statK}>Earned, all time</span>
              <span className={s.statV}>{formatZar(totals?.earned ?? 0)}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statK}>Ready to pay</span>
              <span className={s.statV}>{formatZar(payable?.amount ?? 0)}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statK}>Still in the 30-day hold</span>
              <span className={s.statV}>{formatZar(held?.amount ?? 0)}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statK}>Orders · link clicks</span>
              <span className={s.statV}>
                {totals?.orders ?? 0} · {clicks?.n ?? 0}
              </span>
            </div>
          </div>

          <div className={s.codeRow}>
            <div>
              <span className={s.statK}>Your code</span>
              <div className={s.code}>{coach.code}</div>
            </div>
            <div className={s.codeActions}>
              <CopyButton value={coach.code} label="Copy code" />
              <CopyButton value={vanity} label="Copy link" />
              <a
                className="btn small ghost"
                href={`/coaches/welcome/${coach.code}`}
              >
                QR &amp; assets
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="wrap">
          <h2>Your orders</h2>
          <p className="lede">
            Updated overnight. We show the order number, what it was worth and
            what you earned — never a customer&rsquo;s name, email or address.
            That&rsquo;s their information, not yours or ours to pass on.
          </p>

          {orders.length === 0 ? (
            <div className="callout" style={{ maxWidth: 620 }}>
              Nothing yet. Your first order will appear here the morning after
              it&rsquo;s placed. If a client says they used your code and you
              don&rsquo;t see it within two days, email {BRAND.partnerEmail} and
              we&rsquo;ll look it up.
            </div>
          ) : (
            <div className="table-scroll">
              <table className="pl">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>How</th>
                    <th>Order value</th>
                    <th>You earned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderName}>
                      <td>{o.orderName}</td>
                      <td>
                        {o.processedAt.toISOString().slice(0, 10)}
                      </td>
                      <td>
                        {o.attribution === "discount_code"
                          ? "Your code"
                          : "Repeat client"}
                        {o.isRecurring ? " · subscription" : ""}
                      </td>
                      <td>{formatZar(o.subtotalC)}</td>
                      <td>{formatZar(o.commissionC)}</td>
                      <td>
                        {o.payoutId
                          ? "Paid"
                          : o.status !== "paid"
                            ? titleCase(o.status)
                            : o.payableFrom <= today
                              ? "Ready"
                              : `Held to ${o.payableFrom}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!coach.payoutDetailsOnFile && (payable?.amount ?? 0) > 0 && (
            <div className="banner">
              <strong>We need your bank details.</strong> You&rsquo;ve got{" "}
              {formatZar(payable?.amount ?? 0)} ready to go. Send your account
              holder name, bank, account number and account type to{" "}
              <a
                href={`mailto:${BRAND.partnerEmail}`}
                style={{ color: "inherit" }}
              >
                {BRAND.partnerEmail}
              </a>{" "}
              by the 5th and it&rsquo;ll be in your account on the{" "}
              {PROGRAMME.payoutDay}.
            </div>
          )}

          <form action="/dashboard/logout" method="post" style={{ marginTop: 30 }}>
            <button className="btn ghost small" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

function SignIn({ sent, expired }: { sent: boolean; expired: boolean }) {
  const ready = isDbConfigured() && isAuthConfigured();

  return (
    <>
      <div className="flavour-bar" />
      <header className="header">
        <div className="wrap">
          <span className="kicker mono">Coach dashboard</span>
          <h1>
            Sign <span className="accent">in.</span>
          </h1>

          {sent ? (
            <div className={s.signInBox}>
              <p>
                If that address is on the programme, a link is on its way. It
                works once and expires in 20 minutes.
              </p>
            </div>
          ) : (
            <div className={s.signInBox}>
              {expired && (
                <p className={s.expired}>
                  That link has expired or was already used. Here&rsquo;s a
                  fresh one.
                </p>
              )}
              <p style={{ marginBottom: 16 }}>
                No password. Put in the email you signed up with and we&rsquo;ll
                send you a link.
              </p>
              <form action="/dashboard/login" method="post" className={s.form}>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.co.za"
                  aria-label="Email address"
                  className={s.input}
                  autoComplete="email"
                />
                <button className="btn" type="submit" disabled={!ready}>
                  {ready ? "Send me a link" : "Not switched on yet"}
                </button>
              </form>
            </div>
          )}

          <p style={{ marginTop: 26, fontSize: 14, color: "var(--ink-soft)" }}>
            Not a coach yet? <a href="/coaches">Get your code</a> — it takes
            about ninety seconds.
          </p>
        </div>
      </header>
      <Footer />
    </>
  );
}
