"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Logo from "@/components/Logo";
import s from "./welcome.module.css";

/**
 * Generated client-side so the welcome route stays a plain render with no
 * server dependency. SVG on screen (crisp at any size), PNG on download.
 *
 * The print card is the highest-ROI asset here — gyms, pro shops and club
 * receptions are a physical channel, and a card on a noticeboard works when
 * nobody clicks anything.
 */
export default function QrCard({
  url,
  code,
  display,
}: {
  url: string;
  code: string;
  display: string;
}) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toString(url, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#0B1220", light: "#FDFCF9" },
    })
      .then(setSvg)
      .catch(() => setSvg(null));
  }, [url]);

  const downloadPng = async () => {
    const dataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      width: 1200,
      errorCorrectionLevel: "M",
      color: { dark: "#0B1220", light: "#FDFCF9" },
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `rekrd-${code.toLowerCase()}-qr.png`;
    a.click();
  };

  return (
    <>
      <div className={s.qrBox}>
        {svg ? (
          <div
            className={s.qr}
            role="img"
            aria-label={`QR code linking to ${display}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className={s.qr} aria-hidden="true" />
        )}
        <div className={s.qrCaption}>{display}</div>
        <div className={s.qrActions}>
          <button type="button" className="btn small ghost" onClick={downloadPng}>
            PNG
          </button>
          <button
            type="button"
            className="btn small ghost"
            onClick={() => window.print()}
          >
            Print card
          </button>
        </div>
      </div>

      {/* A6, print stylesheet only. Goes on the gym noticeboard. */}
      <div className={s.printCard} aria-hidden="true">
        <div className={s.pcBrand}>
          <Logo height={34} title={null} />
        </div>
        <div className={s.pcLead}>
          Clean hydration for the everyday athlete.
          <br />
          10% off with my code:
        </div>
        <div className={s.pcCode}>{code}</div>
        {svg && (
          <div className={s.pcQr} dangerouslySetInnerHTML={{ __html: svg }} />
        )}
        <div className={s.pcUrl}>{display}</div>
        <div className={s.pcBar} />
        <div className={s.pcFine}>
          REKRD is a foodstuff, not a medicine. shop.rekrd.io
        </div>
      </div>
    </>
  );
}
