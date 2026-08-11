import type { Metadata } from "next";
import Footer from "@/components/chrome/Footer";
import { BRAND, PROGRAMME } from "@/lib/productFacts";

export const metadata: Metadata = {
  title: "Programme terms",
};

const CLAUSES: { n: string; title: string; body: string[] }[] = [
  {
    n: "01",
    title: "What this is",
    body: [
      `This agreement is between you and ${BRAND.legalName}, a company incorporated in the Republic of South Africa, which we call “we” and “us” throughout.`,
      "You recommend REKRD to people you already know. They buy directly from shop.rekrd.io using your code. You earn a commission on what they spend. You never hold stock, never handle anyone's money, and never invoice a client.",
      "This is not employment, not a partnership, and not an agency. You are an independent person recommending a product, and you may stop at any time.",
    ],
  },
  {
    n: "02",
    title: "What you earn",
    body: [
      `Commission is ${PROGRAMME.commissionRateLabel} of the value of a qualifying order before your client's ${PROGRAMME.clientDiscountLabel} discount is applied. A one-off 30-sachet tube lists at R600, your client pays R540, and you earn R90. On a Subscribe & Save order the tube is R540 and you earn R81, on the first order and on every renewal.`,
      "Commission is calculated on product value only. Delivery is excluded. Commission is inclusive of VAT where you are VAT registered — tell us if you are, and invoice us accordingly.",
      "We may change the commission rate. If we do, we will tell you at least 30 days beforehand, and every order placed before the change is paid at the old rate.",
    ],
  },
  {
    n: "03",
    title: "Which orders qualify",
    body: [
      `An order qualifies if your code was applied at checkout, or if it was placed by a customer whose first REKRD order carried your code within the last ${PROGRAMME.carryOverMonths} months. That second rule is what pays you on subscription renewals and on repeat orders where your client forgot to type the code.`,
      "Orders that are cancelled, or refunded in full, earn nothing. Partially refunded orders earn commission on what the customer actually kept.",
      "Orders you place yourself do not earn commission. You are welcome to use your own code for the discount — please do — but it is your discount, not a way to buy at 25% off.",
    ],
  },
  {
    n: "04",
    title: "How and when we pay",
    body: [
      `Each order is held for ${PROGRAMME.holdDays} days so that returns settle before we pay on it. Your statement goes out on the ${PROGRAMME.statementDay} of each month and payment is made by EFT on the ${PROGRAMME.payoutDay}, covering the previous calendar month.`,
      "The minimum payout is R200. Below that, the balance rolls over to the next month and nothing is lost.",
      "We will ask for your banking details when your first commission is recorded, not before. We need them by the 5th to pay you on the 7th.",
      "If an order is refunded after we have already paid you for it, the amount is deducted from your next statement rather than reclaimed from you.",
      "Commission is income and it is yours to declare. We cannot give you tax advice.",
    ],
  },
  {
    n: "05",
    title: "Talking about the product",
    body: [
      "Describe REKRD in your own words. Everything printed on the pack is our own approved language, so you are on solid ground repeating any of it, along with the ingredients, the quantities, how to use it, what it costs, where it is made and that every batch is independently lab tested.",
      "Two things we ask you to pass on rather than answer yourself. If a client is pregnant, breastfeeding, on chronic medication or managing a condition, send them to their doctor or pharmacist. And if a client competes under a code that requires certified supplements, send them to their team doctor — every batch is independently lab tested, but REKRD holds no banned-substance certification such as Informed Sport.",
      "REKRD is a foodstuff and it is not registered with SAHPRA as a medicine. Please do not present it as one, or present yourself as medically qualified in relation to it.",
      "You must disclose that you earn from the recommendation, in the caption and not buried in hashtags. That is an advertising rule and it protects you.",
      `If you would like a second opinion on anything you are about to post, ${BRAND.partnerEmail} will give you one. Nobody has ever been told off for asking.`,
    ],
  },
  {
    n: "06",
    title: "What you may not do",
    body: [
      "Do not buy REKRD to resell it. Your clients buy direct.",
      "Do not bid on “REKRD” or any close variant in paid search, and do not post your code on coupon, cashback or deal sites. That is intercepting sales, not recommending a product, and it is the fastest way to lose your code.",
      "Do not present yourself as REKRD, or as speaking for REKRD.",
      "Do not recruit other coaches for a share of their commission. This is not a multi-level scheme and we will not build one.",
      "Do not give medical advice about REKRD to anyone, including your own clients.",
    ],
  },
  {
    n: "07",
    title: "Your information",
    body: [
      "We collect your name, email, mobile number, town, what you coach and, optionally, your gym and Instagram handle. We use it to run the programme, pay you and send you programme information. Our lawful basis is the performance of this agreement, under section 11(1)(b) of POPIA — not consent.",
      "Marketing email is separate and optional, and you can stop it at any time without affecting your code or your commission.",
      "We do not share your clients' identities with you, and we do not share your details with other coaches. Your dashboard shows order numbers, values and commission — never a customer's name, email or address.",
      "Our systems are hosted outside South Africa by providers bound by data protection agreements. We keep coach and payment records for five years, as tax law requires.",
      `To ask what we hold, correct it, or have it deleted, email ${BRAND.partnerEmail}.`,
    ],
  },
  {
    n: "08",
    title: "Ending it",
    body: [
      `You can leave whenever you like — email ${BRAND.partnerEmail} and we will close your code. You will still be paid everything already earned, on the next payout run.`,
      "We may close your code if you break the claims rules in clause 05, do any of the things in clause 06, or if the programme ends. Except in the case of a serious claims breach, we will tell you first, and you will still be paid what you have already earned.",
      "Your code has no end date. If we ever need to switch it off, we will tell you before we do, so that anything you have printed can be replaced.",
    ],
  },
  {
    n: "09",
    title: "The legal bit",
    body: [
      `This agreement is between you and ${BRAND.legalName}, and it is governed by the laws of the Republic of South Africa.`,
      "We will not be liable for indirect or consequential loss. Nothing here limits any right you have under the Consumer Protection Act.",
      "We may update these terms. Material changes will be emailed to you at least 30 days before they take effect.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <div className="flavour-bar" />

      <header className="header">
        <div className="wrap">
          <span className="kicker mono">REKRD Coach Programme</span>
          <h1>
            Programme <span className="accent">terms.</span>
          </h1>
          <p className="sub">
            Written to be read, not to be survived. If anything here is
            unclear, email{" "}
            <a href={`mailto:${BRAND.partnerEmail}`}>{BRAND.partnerEmail}</a>{" "}
            and a person will answer.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="wrap">
          <div className="steps">
            {CLAUSES.map((c) => (
              <div className="step" key={c.n}>
                <div>
                  <h3>{c.title}</h3>
                  {c.body.map((p, i) => (
                    <p key={i} style={{ marginTop: i === 0 ? 6 : 10 }}>
                      {p}
                    </p>
                  ))}

                </div>
              </div>
            ))}
          </div>

          <div className="banner">
            <strong>Questions about any of this?</strong> Email{" "}
            <a href={`mailto:${BRAND.partnerEmail}`} style={{ color: "inherit" }}>
              {BRAND.partnerEmail}
            </a>{" "}
            and a person will answer — before you sign up, not after.
          </div>

          <p style={{ marginTop: 26 }}>
            <a className="btn ghost" href="/coaches">
              Back to the programme
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
