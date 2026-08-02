"use client";

import { useState } from "react";
import { DEFAULT_INPUTS, calculate, formatZar } from "@/lib/calc";
import { useTweenedNumber } from "./useTweenedNumber";
import s from "./calculator.module.css";

/**
 * One slider, one number. Answers "is this worth my time" in four seconds and
 * earns the scroll. The real calculator sits further down, next to the form,
 * where the emotional peak and the submit button belong on the same screen.
 */
export default function HeroTeaser() {
  const [clients, setClients] = useState(DEFAULT_INPUTS.clients);
  const monthlyC = calculate({ ...DEFAULT_INPUTS, clients }).monthlyC;
  const shown = useTweenedNumber(monthlyC);

  const pct = ((clients - 5) / (200 - 5)) * 100;
  const track = `linear-gradient(90deg, var(--ink) 0 ${pct}%, var(--hairline-strong) ${pct}% 100%)`;

  return (
    <div className={s.teaser}>
      <div className={s.teaserTop}>
        <label className={s.teaserLabel} htmlFor="teaser-clients">
          How many clients do you train?
        </label>
        <span className={s.teaserCount} aria-hidden="true">
          {clients}
        </span>
      </div>
      <input
        id="teaser-clients"
        className={s.range}
        type="range"
        min={5}
        max={200}
        step={5}
        value={clients}
        aria-valuetext={`${clients} clients`}
        onChange={(e) => setClients(Number(e.target.value))}
        style={{ ["--track" as string]: track }}
      />
      <div className={s.teaserOut}>
        <span className={s.teaserBig}>≈ {formatZar(Math.round(shown))}</span>
        <span className={s.teaserUnit}>a month, recurring</span>
      </div>
      <a className={s.teaserLink} href="#earnings">
        See the working ↓
      </a>
    </div>
  );
}
