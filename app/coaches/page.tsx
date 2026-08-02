import type { Metadata } from "next";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import HeroTeaser from "@/components/calculator/HeroTeaser";
import Calculator from "@/components/calculator/Calculator";
import LessonAccordion from "@/components/sections/LessonAccordion";
import ClaimsCheck from "@/components/sections/ClaimsCheck";
import { ClaimsGateProvider } from "@/components/sections/ClaimsGate";
import ApplyForm from "@/components/form/ApplyForm";
import {
  CLAIMS_LEDE,
  GREY_AREA,
  NEVER_SAY,
  POSTING_RULES,
  SAY_THIS,
} from "@/lib/claims";
import { FAQS } from "@/lib/faq";
import { BRAND, NOT_CLAIMS, SPEC_ROWS } from "@/lib/productFacts";
import claims from "@/components/sections/claims.module.css";

export const metadata: Metadata = {
  title: "Earn 15% recommending REKRD",
  alternates: { canonical: "/coaches" },
};

export default function CoachesPage() {
  return (
    <ClaimsGateProvider>
      <a className="skip-link" href="#product">
        Skip to content
      </a>
      <Nav />

      <header className="header" id="top">
        <div className="wrap">
          <span className="kicker mono">
            REKRD Coach Programme · South Africa · Applications open
          </span>
          <h1>
            You already tell them
            <br />
            <span className="accent">to drink more water.</span>
          </h1>
          <p className="sub">
            REKRD is a South African electrolyte sachet — 600mg of sodium, no
            sugar, no caffeine, nothing you don&rsquo;t need. Recommend it with
            your own code: your clients get 5% off, and you earn 15% of
            everything they spend. Every time they buy, not just the first time.
          </p>

          <div className="hero-meta">
            <div>
              <div className="k mono">Your cut</div>
              <div className="v">15%</div>
            </div>
            <div>
              <div className="k mono">Your client saves</div>
              <div className="v">5%</div>
            </div>
            <div>
              <div className="k mono">Setup</div>
              <div className="v">Under 2 minutes</div>
            </div>
            <div>
              <div className="k mono">Cost to you</div>
              <div className="v">R0, forever</div>
            </div>
          </div>

          <HeroTeaser />
        </div>
      </header>

      {/* ------------------------------------------------------- product -- */}
      <section className="section" id="product">
        <div className="wrap">
          <h2>
            <span className="num">01</span>The whole product,{" "}
            <span className="accent">in one paragraph.</span>
          </h2>
          <p className="lede">
            If you only remember one block of text on this page, make it this
            one. It answers nearly everything a client will ask you.
          </p>

          <div className="card" style={{ maxWidth: 720, marginBottom: 26 }}>
            <p style={{ fontSize: 16, color: "var(--ink)" }}>
              A single-serve sachet of electrolytes you tear into 500ml of cold
              water, once a day. 600mg of sodium, plus potassium, magnesium,
              coconut water powder, Himalayan rock salt, 500mg of L-glutamine,
              vitamin C and zinc. No added sugar, no caffeine, no artificial
              sweeteners, colours, flavours or fillers. Five flavours, thirty
              sachets to a tube, R20 a serve. Made in South Africa and
              independently tested by MJ Labs — every batch, not a sample batch.
            </p>
          </div>

          <div className="table-scroll">
            <table className="pl">
              <thead>
                <tr>
                  <th style={{ width: "26%" }}>Fact</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="manifesto" style={{ marginTop: 36 }}>
            <span className="m-kicker">The part nobody else prints</span>
            <h2>And here&rsquo;s what it isn&rsquo;t.</h2>
            <ul>
              {NOT_CLAIMS.map((n) => (
                <li key={n.title}>
                  <strong>{n.title}</strong>
                  {n.body}
                </li>
              ))}
            </ul>
            <div className="m-body">
              <p>
                We&rsquo;d rather you heard all of that from us than found it
                out from a client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- why they buy -- */}
      <section className="section alt">
        <div className="wrap">
          <h2>
            <span className="num">02</span>Cheaper than the smoothie{" "}
            <span className="accent">they buy after.</span>
          </h2>
          <p className="lede">
            Commission only matters if the thing actually sells. Four reasons
            this one does — none of them about what it does to a body.
          </p>
          <div className="cards c4">
            <div className="card">
              <h3>It&rsquo;s a daily habit</h3>
              <p>
                One sachet a day, thirty in a tube. That&rsquo;s a month, and
                then they need another one. Most of what you could recommend is
                an occasional purchase. This isn&rsquo;t.
              </p>
            </div>
            <div className="card">
              <h3>Five flavours</h3>
              <p>
                Sour Cherry, Pineapple, Orange, Peach, Watermelon. Nobody
                abandons a half-used tube because they got bored — and the R100
                starter pack lets them find their one first.
              </p>
            </div>
            <div className="card">
              <h3>Subscription, properly done</h3>
              <p>
                10% off at R540 every 2, 4, 6 or 8 weeks. Pause, skip, change
                flavour or cancel any time. No fee, no minimum, no phone call.
              </p>
            </div>
            <div className="card">
              <h3>R20 a serve</h3>
              <p>
                Free delivery over R500, which one tube clears on its own. It
                arrives at their door in 1–3 working days in the metros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ training -- */}
      <section className="section" id="training">
        <div className="wrap">
          <h2>
            <span className="num">03</span>Learn it properly.{" "}
            <span className="accent">Eight minutes.</span>
          </h2>
          <p className="lede">
            You&rsquo;re going to be asked the same five questions over and
            over. These are the answers. Read them once and you&rsquo;ll never
            be caught out on a gym floor. Lesson 06 is the one that matters
            most.
          </p>
          <LessonAccordion />
        </div>
      </section>

      {/* -------------------------------------------------------- claims -- */}
      <section className="section alt" id="claims">
        <div className="wrap">
          <h2>
            <span className="num">04</span>Say what&rsquo;s in it.{" "}
            <span className="accent">Never say what it does.</span>
          </h2>
          <p className="lede">{CLAIMS_LEDE}</p>
          <div className="callout" style={{ marginBottom: 30, maxWidth: 680 }}>
            The whole rule is one sentence: <strong>describe the sachet,
            never describe the outcome.</strong>
          </div>

          <div className="voice">
            <div className={`card ${claims.sayAccent}`}>
              <div className="vhead">Say this</div>
              <ul>
                {SAY_THIS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className={`card ${claims.neverAccent}`}>
              <div className="vhead">Never say this</div>
              <ul>
                {NEVER_SAY.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={claims.grey}>
            <div className={claims.greyHead}>
              The grey area — the ones that feel safe and aren&rsquo;t
            </div>
            {GREY_AREA.map((g) => (
              <div className={claims.greyRow} key={g.said}>
                <div className={claims.greySaid}>{g.said}</div>
                <div className={claims.greyWhy}>{g.why}</div>
                <div className={claims.greyInstead}>{g.instead}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 36, marginBottom: 14, fontSize: 16 }}>
            And four rules about posting
          </h3>
          <div className="steps">
            {POSTING_RULES.map((r) => (
              <div className="step" key={r.title}>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="callout" style={{ marginTop: 26, maxWidth: 680 }}>
            Not sure whether you can say something? Send it to{" "}
            <a href={`mailto:${BRAND.partnerEmail}`}>{BRAND.partnerEmail}</a>{" "}
            and you&rsquo;ll get an answer within a business day. Nobody has
            ever been told off for asking.
          </div>

          <ClaimsCheck />
        </div>
      </section>

      {/* ---------------------------------------------------- commission -- */}
      <section className="section">
        <div className="wrap">
          <h2>
            <span className="num">05</span>15% of everything,{" "}
            <span className="accent">for as long as they keep buying.</span>
          </h2>
          <p className="lede">
            Not 15% of the first order. 15% of every order, including every
            subscription renewal, for as long as that client stays with REKRD.
          </p>

          <div className="table-scroll" style={{ marginBottom: 26 }}>
            <table className="pl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Your client pays</th>
                  <th>You earn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>One-off tube</td>
                  <td>R570.00</td>
                  <td>R90.00</td>
                </tr>
                <tr>
                  <td>Subscription — first order</td>
                  <td>R513.00</td>
                  <td>R81.00</td>
                </tr>
                <tr>
                  <td>Subscription — every renewal</td>
                  <td>R540.00</td>
                  <td>R81.00</td>
                </tr>
                <tr>
                  <td>5-sachet starter pack</td>
                  <td>R95.00</td>
                  <td>R15.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="voice">
            <div className="card">
              <div className="vhead">What you get</div>
              <ul>
                <li>15% of what your client&rsquo;s order was worth before their 5% came off</li>
                <li>Commission on every renewal and every repeat order, for 12 months from their first</li>
                <li>Paid monthly by EFT — statement on the 1st, money on the 7th</li>
                <li>A code that never expires, so printed cards keep working</li>
                <li>Captions, bio lines and a print card, all written for you</li>
              </ul>
            </div>
            <div className="card">
              <div className="vhead">What you don&rsquo;t</div>
              <ul>
                <li>No stock to buy, ever. You never hold product</li>
                <li>No fee, no minimum, no target</li>
                <li>No recruiting other coaches — this isn&rsquo;t that</li>
                <li>No handling anyone&rsquo;s money. Clients buy direct</li>
                <li>No commission on delivery, and none on refunded orders</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ earnings -- */}
      <section className="section alt" id="earnings">
        <div className="wrap">
          <h2>
            <span className="num">06</span>Do the sums{" "}
            <span className="accent">yourself.</span>
          </h2>
          <p className="lede">
            The defaults below are 40 clients, 30% who buy, one tube a month and
            40% on subscription. That&rsquo;s what we actually see — we
            didn&rsquo;t pick the numbers that make the answer big. Drag them to
            what you believe.
          </p>
          <Calculator />
        </div>
      </section>

      {/* --------------------------------------------------- how it works -- */}
      <section className="section">
        <div className="wrap">
          <h2>
            <span className="num">07</span>How it works.
          </h2>
          <p className="lede">Four steps. The first three take two minutes.</p>
          <div className="steps">
            <div className="step">
              <div>
                <h3>Apply</h3>
                <p>
                  Name, email, mobile, and pick your code. No banking details —
                  we ask for those once you&rsquo;ve earned something.
                </p>
              </div>
            </div>
            <div className="step">
              <div>
                <h3>Get your code</h3>
                <p>
                  Instantly. Your discount code goes live on shop.rekrd.io the
                  moment you submit, along with a share link, a QR code and an
                  A6 card you can print for the noticeboard.
                </p>
              </div>
            </div>
            <div className="step">
              <div>
                <h3>Tell people</h3>
                <p>
                  We give you the captions, the bio line and the first message
                  to send a client. All of it compliance-clean, so you can
                  paste it without thinking about it.
                </p>
              </div>
            </div>
            <div className="step">
              <div>
                <h3>Get paid</h3>
                <p>
                  Statement on the 1st, EFT on the 7th, covering the previous
                  month. There&rsquo;s a 30-day hold per order so returns settle
                  first. R200 minimum — below that it rolls over.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- apply -- */}
      <section className="section alt" id="apply">
        <div className="wrap">
          <h2>
            <span className="num">08</span>Get your code.
          </h2>
          <p className="lede">
            Ninety seconds. Your code is live on shop.rekrd.io before you close
            the tab.
          </p>
          <ApplyForm />
        </div>
      </section>

      {/* ----------------------------------------------------------- faq -- */}
      <section className="section" id="faq">
        <div className="wrap">
          <h2>
            <span className="num">09</span>Questions coaches actually ask.
          </h2>
          <div style={{ marginTop: 26 }}>
            {FAQS.map((f, i) => (
              <details className="post" key={f.q}>
                <summary>
                  <span className="pnum">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ptitle">{f.q}</span>
                </summary>
                <div className="body">
                  <p>{f.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="banner">
            <strong>Still stuck?</strong> Email{" "}
            <a href={`mailto:${BRAND.partnerEmail}`} style={{ color: "inherit" }}>
              {BRAND.partnerEmail}
            </a>
            . A person answers, usually within a business day.
          </div>
        </div>
      </section>

      <Footer />
    </ClaimsGateProvider>
  );
}
