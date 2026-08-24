"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import s from "./welcome.module.css";

/**
 * Three one-tap actions. This is what turns a signup into a first sale.
 *
 * Every opener is compliance-clean by construction — which is the real reason
 * to supply them. A coach who pastes ours never writes "helps with cramp".
 */
export default function ShareActions({
  code,
  vanity,
}: {
  code: string;
  vanity: string;
}) {
  const [opener, setOpener] = useState(0);

  const bioLine = `10% off REKRD with code ${code} 👇 ${vanity}`;

  const openers = [
    {
      tab: "WhatsApp a client",
      text: `Hey — I've started using REKRD, it's a South African electrolyte sachet you put in 500ml of water once a day. 600mg of sodium, plus 500mg of L-glutamine, zinc and vitamin C. No sugar, no caffeine, no fillers. If you want to try it, my code ${code} gets you 10% off at shop.rekrd.io. There's a 5-sachet pack for R100 if you want to taste the flavours first.`,
    },
    {
      tab: "Story caption",
      text: `One sachet, 500ml of cold water, once a day.\n600mg of sodium. 500mg of L-glutamine, zinc, vitamin C.\nNo sugar, no caffeine, no fillers.\nI'm a REKRD ambassador — code ${code} gets you 10% off.\n${vanity}`,
    },
    {
      tab: "End of a session",
      text: `"I use REKRD — it's an electrolyte sachet, one in 500ml of water a day. R20 a serve. If you want to try it, my code's ${code} and it gets you 10% off. No pressure either way."`,
    },
  ];

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `My REKRD ambassador link: ${vanity} — code ${code} for 10% off.`,
  )}`;

  return (
    <div className={s.actions}>
      <div className={s.action}>
        <div>
          <div className={s.actionTitle}>Send yourself the link on WhatsApp</div>
          <div className={s.actionBody}>
            Then forward it to the three clients who&rsquo;d actually want it.
            Not all of them. Three.
          </div>
        </div>
        <a
          className="btn small"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open WhatsApp
        </a>
      </div>

      <div className={s.action}>
        <div>
          <div className={s.actionTitle}>Your Instagram bio line</div>
          <div className={s.actionBody}>
            Disclose in the caption, not in the hashtags. That&rsquo;s the ASA
            and the CPA, and it&rsquo;s also just decent.
          </div>
          <div className={s.snippet}>{bioLine}</div>
        </div>
        <CopyButton value={bioLine} label="Copy" />
      </div>

      <div className={s.action}>
        <div>
          <div className={s.actionTitle}>The first message to a client</div>
          <div className={s.actionBody}>
            Three tones. All of them describe the sachet and none of them
            describe an outcome, so you can paste them without thinking.
          </div>
          <div className={s.openerTabs}>
            {openers.map((o, i) => (
              <button
                key={o.tab}
                type="button"
                className={s.openerTab}
                aria-pressed={opener === i}
                onClick={() => setOpener(i)}
              >
                {o.tab}
              </button>
            ))}
          </div>
          <div className={s.snippet}>{openers[opener].text}</div>
        </div>
        <CopyButton value={openers[opener].text} label="Copy" />
      </div>
    </div>
  );
}
