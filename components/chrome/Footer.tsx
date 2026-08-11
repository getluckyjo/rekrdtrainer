import { BRAND } from "@/lib/productFacts";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="flavour-bar" style={{ marginBottom: 28 }} />
        <p className="mono" style={{ fontSize: 11 }}>
          REKRD Coach Programme · South Africa
        </p>
        <p>
          Questions about the programme?{" "}
          <a href={`mailto:${BRAND.partnerEmail}`}>{BRAND.partnerEmail}</a>. A
          person answers, usually within a business day.
        </p>
        <p>
          <a href="/coaches/terms">Programme terms</a> ·{" "}
          <a href="https://shop.rekrd.io/policies/privacy-policy">
            Privacy policy
          </a>{" "}
          · <a href={BRAND.shopUrl}>shop.rekrd.io</a>
        </p>
        <p style={{ marginTop: 20, maxWidth: 620 }}>
          REKRD is a foodstuff. It is not a medicine, it is not registered with
          SAHPRA, and it is not certified under Informed Sport or any comparable
          banned-substance programme. Nothing on this page is medical advice.
        </p>
      </div>
    </footer>
  );
}
