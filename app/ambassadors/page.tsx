import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import Icon from "@/components/Icon";
import Calculator from "@/components/calculator/Calculator";
import LessonAccordion from "@/components/sections/LessonAccordion";
import ApplyForm from "@/components/form/ApplyForm";
import {
  CLAIMS_LEDE,
  LEAVE_TO_A_PRO,
  ON_PACK_CLAIMS,
  POSTING_RULES,
  SAY_THIS,
} from "@/lib/claims";
import { FAQS, PRODUCT_FAQS } from "@/lib/faq";
import {
  AMBASSADOR_ASKS,
  AMBASSADOR_GETS,
  BRAND,
  FORMULA_NOTES,
  KEY_FACTS,
  SPEC_ROWS,
} from "@/lib/productFacts";
import claims from "@/components/sections/claims.module.css";

export const metadata: Metadata = {
  title: "Become a REKRD ambassador",
  alternates: { canonical: "/ambassadors" },
};

export default function AmbassadorsPage() {
  return (
    <>
      <a className="skip-link" href="#deal">
        Skip to content
      </a>
      <Nav />

      {/* ---------------------------------------------------------- hero -- */}
      <header className="header" id="top">
        <div className="wrap hero-split">
          <div>
            <span className="kicker mono">
              REKRD Ambassador Programme · Applications open
            </span>
            <h1>
              You already tell them
              <br />
              <span className="accent">to drink more water.</span>
            </h1>
            <p className="sub">
              Post about REKRD once or twice a week and we&rsquo;ll send you a
              tub every month, free. Thirty sachets, delivered. Want to earn as
              well? Your code gets people 10% off and pays you 15% of everything
              they spend — every order, for a year.
            </p>

            <div className="hero-meta">
              <div>
                <div className="k mono">Every month</div>
                <div className="v">A free tub</div>
              </div>
              <div>
                <div className="k mono">We ask</div>
                <div className="v">1–2 posts a week</div>
              </div>
              <div>
                <div className="k mono">If you sell</div>
                <div className="v">15%</div>
              </div>
              <div>
                <div className="k mono">Cost to you</div>
                <div className="v">R0, forever</div>
              </div>
            </div>

            <p className="sub" style={{ marginTop: 22 }}>
              <a className="btn" href="#apply">
                Become an ambassador
              </a>
            </p>
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

      {/* ------------------------------------------------------- the deal -- */}
      <section className="section" id="deal">
        <div className="wrap">
          <h2>
            <span className="num">01</span>What we ask,{" "}
            <span className="accent">and what you get.</span>
          </h2>
          <p className="lede">
            Two things from you. Four back. No targets, no minimum, and nothing
            to buy — ever.
          </p>

          <div className="deal">
            <div className="card">
              <div className="ico-head">
                <Icon name="people" size={18} />
                <h3>What we ask</h3>
              </div>
              <ul>
                {AMBASSADOR_ASKS.map((a) => (
                  <li key={a.title}>
                    <Icon name={a.icon} size={15} />
                    <span>
                      <strong>{a.title}.</strong> {a.body}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card yes">
              <div className="ico-head">
                <Icon name="check" size={18} />
                <h3>What you get</h3>
              </div>
              <ul>
                {AMBASSADOR_GETS.map((g) => (
                  <li key={g.title}>
                    <Icon name={g.icon} size={15} />
                    <span>
                      <strong>{g.title}.</strong> {g.body}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="callout" style={{ marginTop: 22, maxWidth: 720 }}>
            <strong>The tub is the deal.</strong> Keep posting and it keeps
            coming. The commission is yours if you want it, but nobody is going
            to chase you about sales — that part is entirely up to you.
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ earnings -- */}
      <section className="section alt" id="earnings">
        <div className="wrap">
          <h2>
            <span className="num">02</span>Want to earn as well?{" "}
            <span className="accent">15% of everything.</span>
          </h2>
          <p className="lede">
            A tube is thirty sachets — about a month. So someone who sticks
            with it re-orders every month, and you earn on every one of those
            orders, not just their first.
          </p>

          <div className="table-scroll" style={{ marginBottom: 20 }}>
            <table className="pl">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>They pay</th>
                  <th>You earn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>One-off tube</td>
                  <td>R540.00</td>
                  <td>R90.00</td>
                </tr>
                <tr>
                  <td>Subscription — first order</td>
                  <td>R486.00</td>
                  <td>R81.00</td>
                </tr>
                <tr>
                  <td>Subscription — every renewal</td>
                  <td>R540.00</td>
                  <td>R81.00</td>
                </tr>
                <tr>
                  <td>5-sachet starter pack</td>
                  <td>R90.00</td>
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
                  <span>15% of the order before their 10% comes off</span>
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
            <div className="card yes">
              <div className="ico-head">
                <Icon name="check" size={18} />
                <h3>What it costs you</h3>
              </div>
              <ul>
                <li>
                  <Icon name="check" size={15} />
                  <span>Nothing to buy — you never hold stock</span>
                </li>
                <li>
                  <Icon name="check" size={15} />
                  <span>No fee, no minimum, no target</span>
                </li>
                <li>
                  <Icon name="check" size={15} />
                  <span>No admin — they buy direct, you never invoice</span>
                </li>
                <li>
                  <Icon name="check" size={15} />
                  <span>Commission on product, not delivery. R0, forever</span>
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

      {/* ------------------------------------------------------- product -- */}
      <section className="section" id="product">
        <div className="wrap">
          <h2>
            <span className="num">03</span>The product,{" "}
            <span className="accent">in sixty seconds.</span>
          </h2>
          <p className="lede">
            These six answer almost everything anyone will ask you.
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
            to a tube. Made in South Africa, every batch third-party lab tested.
          </div>

          {/* The line-up carries the per-serving panel on every stick, which is
              the "nothing hidden" point made better than a sentence can. */}
          <figure className="shot">
            <Image
              src="/flavours.webp"
              alt="The five REKRD flavours — Salty Watermelon, Rooibos Peach Iced-Tea, Orange Zest, Pineapple Berry and Sour Cherry Apple — each stick printed with its per-serving amounts"
              width={1400}
              height={1008}
              sizes="(max-width: 900px) 100vw, 900px"
            />
            <figcaption>
              Five flavours · every amount printed on the stick
            </figcaption>
          </figure>

          <div className="manifesto" style={{ marginTop: 30 }}>
            <span className="m-kicker">Every day, every sport</span>
            <h2>Why it looks like this.</h2>
            <ul>
              {FORMULA_NOTES.map((n) => (
                <li key={n.title}>
                  <strong>{n.title}</strong>
                  {n.body}
                </li>
              ))}
            </ul>
          </div>

          <h3 style={{ fontSize: 16, marginTop: 34, marginBottom: 6 }}>
            The two questions you&rsquo;ll get most
          </h3>
          <p className="lede" style={{ marginBottom: 16 }}>
            Both of these are answers you can read straight out loud.
          </p>
          {PRODUCT_FAQS.map((f, i) => (
            <details className="post" key={f.q}>
              <summary>
                <span className="pnum">{String(i + 1).padStart(2, "0")}</span>
                <span className="ptitle">{f.q}</span>
              </summary>
              <div className="body">
                <p>{f.a}</p>
              </div>
            </details>
          ))}

          {/* Sits directly under "why is there so little powder" — it shows the
              actual volume better than the answer describes it. */}
          <figure className="shot portrait">
            <Image
              src="/sachet-pour.webp"
              alt="A REKRD Salty Watermelon sachet being poured into a clear water bottle on a tennis court"
              width={1100}
              height={1467}
              sizes="(max-width: 480px) 100vw, 380px"
            />
            <figcaption>One sachet · 500ml of water · about 4.5g of powder</figcaption>
          </figure>

          <details className="tuck">
            <summary>All the numbers</summary>
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

        </div>
      </section>

      {/* Campaign band. Carries "every day, every sport" better than the copy
          does, and it sits on the seam between the product and the mechanics. */}
      <div className="band">
        <Image
          src="/game-set-rekrd.webp"
          alt="A tennis player mid-match in hard sunlight, sweat on her face, with the line Game. Set. REKRD."
          width={1600}
          height={2133}
          sizes="100vw"
        />
      </div>

      {/* --------------------------------------------------- how it works -- */}
      <section className="section">
        <div className="wrap">
          <h2>
            <span className="num">04</span>How it works.
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
                Captions and messages written for you — ready to paste.
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

      {/* ------------------------------------------------------ training -- */}
      <section className="section alt" id="say">
        <div className="wrap">
          <h2>
            <span className="num">05</span>Know it well enough{" "}
            <span className="accent">to talk about it.</span>
          </h2>
          <p className="lede">{CLAIMS_LEDE}</p>

          <div className="deal" style={{ marginBottom: 30 }}>
            <div className={`card ${claims.sayAccent} yes`}>
              <div className="ico-head">
                <Icon name="check" size={18} />
                <h3>Lines that do the work</h3>
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
            <div className="card">
              <div className="ico-head">
                <Icon name="sachet" size={18} />
                <h3>Straight off the pack</h3>
              </div>
              <p style={{ marginBottom: 12 }}>
                These four are printed on the tub. They&rsquo;re our own words,
                so use them freely:
              </p>
              <ul>
                {ON_PACK_CLAIMS.map((c) => (
                  <li key={c}>
                    <Icon name="check" size={15} />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: 14 }}>
                Past that, describe it however feels natural to you. There is no
                script to learn.
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: 16, marginBottom: 6 }}>
            Six lessons, about four minutes
          </h3>
          <p className="lede" style={{ marginBottom: 20 }}>
            Read them once and you&rsquo;ll never be caught out.
          </p>
          <LessonAccordion />

          <div className="steps" style={{ marginTop: 30 }}>
            {POSTING_RULES.map((r) => (
              <div className="step" key={r.title}>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </div>
            ))}
            {LEAVE_TO_A_PRO.map((r) => (
              <div className="step" key={r.title}>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="callout" style={{ marginTop: 22, maxWidth: 680 }}>
            Want a second opinion on something before you post it? Send it to{" "}
            <a href={`mailto:${BRAND.partnerEmail}`}>{BRAND.partnerEmail}</a>.
            Nobody has ever been told off for asking.
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- apply -- */}
      <section className="section" id="apply">
        <div className="wrap">
          <h2>
            <span className="num">06</span>Become an ambassador.
          </h2>
          <p className="lede">
            Ninety seconds, and it&rsquo;s live before you close the tab.
          </p>
          <ApplyForm />
        </div>
      </section>

      {/* ----------------------------------------------------------- faq -- */}
      <section className="section alt" id="faq">
        <div className="wrap">
          <h2>
            <span className="num">07</span>Questions people ask.
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
    </>
  );
}
