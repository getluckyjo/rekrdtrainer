"use client";

import s from "./calculator.module.css";

type Props = {
  id: string;
  label: string;
  hint: string;
  /** Human phrasing for screen readers, e.g. "40 clients". */
  valueText: string;
  /** What sighted users see next to the label. */
  displayValue: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
};

export default function Slider({
  id,
  label,
  hint,
  valueText,
  displayValue,
  min,
  max,
  step,
  value,
  onChange,
}: Props) {
  /* Firefox paints ::-moz-range-progress for us; WebKit needs a gradient. */
  const pct = ((value - min) / (max - min)) * 100;
  const track = `linear-gradient(90deg, var(--ink) 0 ${pct}%, var(--hairline-strong) ${pct}% 100%)`;

  return (
    <div className={s.field}>
      <div className={s.fieldTop}>
        <label className={s.fieldLabel} htmlFor={id}>
          {label}
        </label>
        <span className={s.fieldValue} aria-hidden="true">
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        className={s.range}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ["--track" as string]: track }}
      />
      <p className={s.fieldHint}>{hint}</p>
    </div>
  );
}
