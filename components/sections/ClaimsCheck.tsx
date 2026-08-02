"use client";

import { useState } from "react";
import { CLAIMS_CARDS } from "@/lib/claims";
import { useClaimsGate } from "./ClaimsGate";
import s from "./claims.module.css";

type Verdict = { correct: boolean; explain: string } | null;

/**
 * Five statements, two taps each, about 25 seconds. It cannot be permanently
 * failed — a wrong answer explains why and moves on.
 *
 * This is consent with comprehension, not a knowledge test. The point is the
 * audit artefact: every coach was shown the claims rules and answered them.
 */
export default function ClaimsCheck() {
  const [index, setIndex] = useState(0);
  const [verdict, setVerdict] = useState<Verdict>(null);
  const { passed, pass } = useClaimsGate();

  const card = CLAIMS_CARDS[index];

  const answer = (choice: "say" | "never") => {
    setVerdict({ correct: choice === card.answer, explain: card.explain });
  };

  const next = () => {
    setVerdict(null);
    if (index + 1 >= CLAIMS_CARDS.length) {
      pass();
    } else {
      setIndex(index + 1);
    }
  };

  if (passed) {
    return (
      <div className={s.check} id="claims-check">
        <div className={s.passed}>
          <div>
            <div className={s.passedTitle}>Claims check done.</div>
            <p className={s.passedSub}>
              That&rsquo;s the only thing standing between you and a code. The
              rule, one more time: describe the sachet, never describe the
              outcome.
            </p>
          </div>
          <a className="btn" href="#apply">
            Get my code
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={s.check} id="claims-check">
      <div className={s.checkHead}>
        <span className={s.checkTitle}>Claims check</span>
        <span className={s.checkMeta}>
          {CLAIMS_CARDS.length} statements · about 25 seconds
        </span>
      </div>
      <p className={s.checkLede}>
        Not a test — you can&rsquo;t fail it and you can&rsquo;t get locked
        out. It&rsquo;s here so that we both know you&rsquo;ve seen the rules
        before your code goes live.
      </p>

      <div className={s.dots} aria-hidden="true">
        {CLAIMS_CARDS.map((c, i) => (
          <span
            key={c.id}
            className={`${s.dot} ${i < index ? s.dotDone : ""} ${
              i === index ? s.dotNow : ""
            }`}
          />
        ))}
      </div>

      <p className={s.statement} aria-live="polite">
        {card.statement}
      </p>

      {verdict === null ? (
        <div className={s.answers}>
          <button
            type="button"
            className={`${s.answer} ${s.answerSay}`}
            onClick={() => answer("say")}
          >
            Say this
          </button>
          <button
            type="button"
            className={`${s.answer} ${s.answerNever}`}
            onClick={() => answer("never")}
          >
            Never say this
          </button>
        </div>
      ) : (
        <div
          className={`${s.verdict} ${
            verdict.correct ? s.verdictRight : s.verdictWrong
          }`}
          role="status"
        >
          <span className={s.verdictK}>
            {verdict.correct ? "Correct" : "Not this one"}
          </span>
          <p className={s.verdictBody}>{verdict.explain}</p>
          <div className={s.verdictActions}>
            <button type="button" className="btn small" onClick={next}>
              {index + 1 >= CLAIMS_CARDS.length ? "Finish" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
