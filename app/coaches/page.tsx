import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import Icon from "@/components/Icon";
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
import { BRAND, KEY_FACTS, NOT_CLAIMS, SPEC_ROWS } from "@/lib/productFacts";
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

      {/* ---------------------------------------------------------- hero -- */}
      <header className="header" id="top">
        <div className="wrap hero-split">
          <div>
            <span className="kicker mono">
              REKRD Coach Programme · Applications open
            </span>
            <h1>
              You already tell them
              <br />
              <span className="accent">to drink more water.</span>
            </h1>
            <p className="sub">
              One electrolyte sachet a day. 600mg of sodium, no sugar, no
              caffeine. Recommend it with your code — your clients get 5% off,
              you earn 15% of everything they spend. Every order, not just the
              first.
            </p>

            <div className="hero-meta">
              <div>
                <div className="k mono">Your cut</div>
                <div className="v">15%</div>
              </div>
              <div>
                <div className="k mono">They save</div>
                <div className="v">5%</div>
              </div>
              <div>
                <div className="k mono">Setup</div>
                <div className="v">90 seconds</div>
              </div>
              <div>
                <div className="k mono">Cost to you</div>
                <div className="v">R0, forever</div>
              </div>
            </div>

            <HeroTeaser />
          </div>

          <div className="hero-shot">
            <div className="shot-inner">
              <Image
                src="/product-tube.jpg"
                alt="A REKRD tube of 30 electrolyte sachets with five flavour sachets standing in it"
                fill
                sizes="(max-width: 900px) 300px, 380px"
                priority
              />
            </div>
            <div className="flavour-bar" />
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------- product -- */}
      <section className="section" id="product">
        <div className="wrap">
          <h2>
            <span className="num">01</span>The product,{" "}
            <span className="accent">in sixty seconds.</span>
          </h2>
          <p className="lede">
            These six answer almost everything a client will ask you.
          </p>

          <div className="fact-grid">
            {KEY_FACTS.map((f) => (
              <div className="fact" key={f.k}>
                <Icon name={f.icon} size={20} />
                <div>
                  <span className="k">{f.k}</span>
                  <span className="v">{f.v}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="callout" style={{ marginTop: 18, maxWidth: 720 }}>
            <strong>The whole thing, out loud:</strong> a single-serve sachet of
            electrolytes you tear into 500ml of cold water, once a day. Thirty
            to a tube. Made in South Africa, every batch tested by MJ Labs.
          </div>

          <details className="tuck">
            <summary>All the details</summary>
            <div className="tuck-body table-scroll">
              <table className="pl">
                <tbody>
                  {SPEC_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td style={{ width: "26%" }}>{row.label}</td>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <div className="manifesto" style={{ marginTop: 30 }}>
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
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ training -- */}
      <section className="section alt" id="training">
        <div className="wrap">
          <h2>
            <span className="num">02</span>Learn it properly.{" "}
            <span className="accent">Four minutes.</span>
          </h2>
          <p className="lede">
            Six lessons, none longer than a minute. Read them once and
            you&rsquo;ll never be caught out on a gym floor. Lesson 05 is the
            one that matters most.
          </p>
          <LessonAccordion />
        </div>
      </section>

      {/* -------------------------------------------------------- claims -- */}
      <section className="section" id="claims">
        <div className="wrap">
          <h2>
            <span className="num">03</span>Say what&rsquo;s in it.{" "}
            <span className="accent">Never say what it does.</span>
          </h2>
          <p className="lede">{CLAIMS_LEDE}</p>

          <div className="deal">
            <div className={`card ${claims.sayAccent} yes`}>
              <div className="ico-head">
                <Icon name="check" size={18} />
                <h3>Say this</h3>
              </div>
              <ul>
                {SAY_THIS.map((line) => (
                  <li key={line}>
                    <Icon name="check" size={15} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`card ${claims.neverAccent} no`}>
              <div className="ico-head">
                <Icon name="cross" size={18} />
                <h3>Never say this</h3>
              </div>
              <ul>
                {NEVER_SAY.map((line) => (
                  <li key={line}>
                    <Icon name="cross" size={15} />
                    <span>{line}</span>
                  </li>
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

          <div className="steps" style={{ marginTop: 26 }}>
            {POSTING_RULES.map((r) => (
              <div className="step" key={r.title}>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="callout" style={{ marginTop: 22, maxWidth: 680 }}>
            Unsure about a line? Send it to{" "}
            <a href={`mailto:${BRAND.partnerEmail}`}>{BRAND.partnerEmail}</a>.
            Nobody has ever been told off for asking.
          </div>

          <ClaimsCheck />
        </div>
      </section>

      {/* ------------------------------------------------------ earnings -- */}
      <section className="section alt" id="earnings">
        <div className="wrap">
          <h2>
            <span className="num">04</span>15% of everything,{" "}
            <span className="accent">for as long as they keep buying.</span>
          </h2>
          <p className="lede">
            A tube is thirty sachets — about a month. So a client who sticks
            with it re-orders every month, and you earn on every one of those
            orders, not just their first.
          </p>

          <div className="table-scroll" style={{ marginBottom: 20 }}>
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

          <div className="deal" style={{ marginBottom: 34 }}>
            <div className="card yes">
              <div className="ico-head">
                <Icon name="check" size={18} />
                <h3>What you get</h3>
              </div>
              <ul>
                <li>
                  <Icon name="check" size={15} />
                  <span>15% of the order before your client&rsquo;s 5% comes off</span>
                </li>
                <li>
                  <Icon name="repeat" size={15} />
                  <span>Every renewal and repeat order for 12 months</span>
                </li>
                <li>
                  <Icon name="calendar" size={15} />
                  <span>Paid by EFT — statement on the 1st, money on the 7th</span>
                </li>
                <li>
                  <Icon name="qr" size={15} />
                  <span>A code that never expires, plus a QR and print card</span>
                </li>
              </ul>
            </div>
            <div className="card no">
              <div className="ico-head">
                <Icon name="cross" size={18} />
                <h3>What you don&rsquo;t</h3>
              </div>
              <ul>
                <li>
                  <Icon name="cross" size={15} />
                  <span>No stock to buy. You never hold product</span>
                </li>
                <li>
                  <Icon name="cross" size={15} />
                  <span>No fee, no minimum, no target</span>
                </li>
                <li>
                  <Icon name="cross" size={15} />
                  <span>No recruiting other coaches — this isn&rsquo;t that</span>
                </li>
                <li>
                  <Icon name="cross" size={15} />
                  <span>No commission on delivery or refunded orders</span>
                </li>
              </ul>
            </div>
          </div>

          <h3 style={{ fontSize: 16, marginBottom: 6 }}>
            Do the sums yourself
          </h3>
          <p className="lede" style={{ marginBottom: 22 }}>
            Defaults are what we actually see, not what we&rsquo;d like you to
            believe. Drag them to what you believe.
          </p>
          <Calculator />
        </div>
      </section>

      {/* --------------------------------------------------- how it works -- */}
      <section className="section">
        <div className="wrap">
          <h2>
            <span className="num">05</span>How it works.
          </h2>
          <div className="cards c4" style={{ marginTop: 26 }}>
            <div className="card">
              <div className="ico-head">
                <Icon name="people" size={20} />
                <h3>Apply</h3>
              </div>
              <p>Name, email, mobile, pick your code. No banking details.</p>
            </div>
            <div className="card">
              <div className="ico-head">
                <Icon name="tag" size={20} />
                <h3>Get your code</h3>
              </div>
              <p>
                Live on shop.rekrd.io instantly, with a link, QR and printable
                card.
              </p>
            </div>
            <div className="card">
              <div className="ico-head">
                <Icon name="qr" size={20} />
                <h3>Tell people</h3>
              </div>
              <p>
                Captions and messages written for you — all compliance-clean.
              </p>
            </div>
            <div className="card">
              <div className="ico-head">
                <Icon name="rand" size={20} />
                <h3>Get paid</h3>
              </div>
              <p>
                EFT on the 7th for the month before. 30-day hold, R200 minimum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- apply -- */}
      <section className="section alt" id="apply">
        <div className="wrap">
          <h2>
            <span className="num">06</span>Get your code.
          </h2>
          <p className="lede">
            Ninety seconds, and it&rsquo;s live before you close the tab.
          </p>
          <ApplyForm />
        </div>
      </section>

      {/* ----------------------------------------------------------- faq -- */}
      <section className="section" id="faq">
        <div className="wrap">
          <h2>
            <span className="num">07</span>Questions coaches ask.
          </h2>
          <div style={{ marginTop: 24 }}>
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
