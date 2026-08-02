"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COMM_ONE_OFF_C,
  COMM_SUB_C,
  DEFAULT_INPUTS,
  INPUT_BOUNDS,
  PRESETS,
  PRICE_ONE_OFF_C,
  PRICE_SUB_RENEWAL_C,
  SUB_INTERVALS,
  calculate,
  compareSubscription,
  formatCount,
  formatPercent,
  formatZar,
  type CalcInputs,
} from "@/lib/calc";
import Slider from "./Slider";
import { useTweenedNumber } from "./useTweenedNumber";
import s from "./calculator.module.css";

const SESSION_RATE_C = 45_000; // R450 — a mid-market PT session in SA

export default function Calculator() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS);
  const [subWeeks, setSubWeeks] = useState<2 | 4 | 6 | 8>(4);
  const [oneOffPerYear, setOneOffPerYear] = useState(5);

  const result = useMemo(() => calculate(inputs), [inputs]);
  const comparison = useMemo(
    () => compareSubscription(oneOffPerYear, subWeeks),
    [oneOffPerYear, subWeeks],
  );

  const monthly = useTweenedNumber(result.monthlyC);
  const annual = useTweenedNumber(result.annualC);

  const set = <K extends keyof CalcInputs>(key: K, v: CalcInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: v }));

  const activePreset = PRESETS.find(
    (p) =>
      p.inputs.clients === inputs.clients &&
      p.inputs.conversion === inputs.conversion &&
      p.inputs.tubesPerMonth === inputs.tubesPerMonth &&
      p.inputs.subShare === inputs.subShare,
  );

  /* Shareable scenarios, and the most useful analytics on the site: what
     number did a coach have on screen just before they signed up. */
  useUrlSync(inputs, setInputs);

  const sessions = result.monthlyC / SESSION_RATE_C;

  return (
    <>
      <div className={s.grid}>
        <div className={s.controls}>
          <div className={s.presets}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${s.preset} ${p.pessimistic ? s.pessimistic : ""}`}
                aria-pressed={activePreset?.id === p.id}
                onClick={() => setInputs(p.inputs)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Slider
            id="calc-clients"
            label="Clients you train regularly"
            hint="People who'd actually take a recommendation from you."
            value={inputs.clients}
            displayValue={String(inputs.clients)}
            valueText={`${inputs.clients} clients`}
            {...INPUT_BOUNDS.clients}
            onChange={(n) => set("clients", n)}
          />

          <Slider
            id="calc-conversion"
            label="How many will actually buy"
            hint="30% is what we see, not what we hope. Move it."
            value={inputs.conversion}
            displayValue={formatPercent(inputs.conversion)}
            valueText={`${Math.round(inputs.conversion * 100)} percent`}
            {...INPUT_BOUNDS.conversion}
            onChange={(n) => set("conversion", n)}
          />

          <Slider
            id="calc-tubes"
            label="Tubes per buyer, per month"
            hint="One tube = 30 sachets = a month of daily use."
            value={inputs.tubesPerMonth}
            displayValue={`${inputs.tubesPerMonth}`}
            valueText={`${inputs.tubesPerMonth} tubes a month`}
            {...INPUT_BOUNDS.tubesPerMonth}
            onChange={(n) => set("tubesPerMonth", n)}
          />

          <Slider
            id="calc-sub"
            label="How many go on subscription"
            hint="This is the number that matters most — see the comparison below."
            value={inputs.subShare}
            displayValue={formatPercent(inputs.subShare)}
            valueText={`${Math.round(inputs.subShare * 100)} percent on subscription`}
            {...INPUT_BOUNDS.subShare}
            onChange={(n) => set("subShare", n)}
          />
        </div>

        <div className={s.output}>
          <span className={s.eyebrow}>A month, recurring</span>
          <div className={s.headline}>{formatZar(Math.round(monthly))}</div>
          <div className={s.annual}>
            {formatZar(Math.round(annual))} a year
          </div>
          <p className={s.disclaimer}>
            Annual is monthly × 12, assuming your book holds. It won&rsquo;t be
            a straight line. Treat it as a run rate, not a promise.
          </p>
          {result.monthlyC > 0 && (
            <p className={s.translate}>
              At R450 a session, that&rsquo;s{" "}
              <strong>{sessions.toFixed(1)} sessions</strong>{" "}
              you didn&rsquo;t have to coach for.
            </p>
          )}

          <Ledger result={result} inputs={inputs} />

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.statK}>Per client on your books</span>
              <span className={s.statV}>{formatZar(result.perClientC)}</span>
            </div>
            <div className={s.stat}>
              <span className={s.statK}>Per client who buys</span>
              <span className={s.statV}>{formatZar(result.perBuyerC)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.compare}>
        <h3 style={{ fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 900 }}>
          The same client, <span className="accent">two ways.</span>
        </h3>

        <div className={s.compareGrid}>
          <div className={s.col}>
            <div className={s.colHead}>Buys when they remember</div>
            <div className={s.colBig}>
              {formatZar(comparison.oneOffAnnualC)}
            </div>
            <div className={s.colSub}>to you, over a year</div>
            <div className={s.bar}>
              <span
                style={{
                  width: `${pctOf(comparison.oneOffAnnualC, comparison.subAnnualC)}%`,
                }}
              />
            </div>
            <div className={s.colRows}>
              <div className={s.colRow}>
                <span>Orders a year</span>
                <b>{formatCount(comparison.oneOffPerYear)}</b>
              </div>
              <div className={s.colRow}>
                <span>Per order to you</span>
                <b>{formatZar(COMM_ONE_OFF_C)}</b>
              </div>
              <div className={s.colRow}>
                <span>Client pays</span>
                <b>{formatZar(PRICE_ONE_OFF_C)}</b>
              </div>
            </div>
            <div className={s.intervalPicker}>
              {[2, 3, 4, 5, 6, 8, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={s.intervalBtn}
                  aria-pressed={oneOffPerYear === n}
                  onClick={() => setOneOffPerYear(n)}
                >
                  {n}×/yr
                </button>
              ))}
            </div>
          </div>

          <div className={`${s.col} ${s.win}`}>
            <div className={s.colHead}>
              On subscription, every {subWeeks} weeks
            </div>
            <div className={s.colBig}>{formatZar(comparison.subAnnualC)}</div>
            <div className={s.colSub}>
              to you, over a year —{" "}
              <strong>{comparison.multiple.toFixed(1)}× more</strong>
            </div>
            <div className={s.bar}>
              <span
                style={{
                  width: `${pctOf(comparison.subAnnualC, comparison.oneOffAnnualC)}%`,
                }}
              />
            </div>
            <div className={s.colRows}>
              <div className={s.colRow}>
                <span>Deliveries a year</span>
                <b>{formatCount(comparison.subPerYear)}</b>
              </div>
              <div className={s.colRow}>
                <span>Per order to you</span>
                <b>{formatZar(COMM_SUB_C)}</b>
              </div>
              <div className={s.colRow}>
                <span>Client pays</span>
                <b>{formatZar(PRICE_SUB_RENEWAL_C)}</b>
              </div>
            </div>
            <div className={s.intervalPicker}>
              {SUB_INTERVALS.map((i) => (
                <button
                  key={i.weeks}
                  type="button"
                  className={s.intervalBtn}
                  aria-pressed={subWeeks === i.weeks}
                  onClick={() => setSubWeeks(i.weeks as 2 | 4 | 6 | 8)}
                >
                  every {i.weeks}w
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className={s.compareNote}>
          Notice the subscription pays you <strong>less</strong> per tube —{" "}
          {formatZar(COMM_SUB_C)} against {formatZar(COMM_ONE_OFF_C)}{" "}
          — because your client gets the 10% Subscribe &amp; Save price on top
          of your 5%.
          It&rsquo;s still worth {comparison.multiple.toFixed(1)}× more over a
          year, because it arrives {formatCount(comparison.subPerYear)} times
          instead of {formatCount(comparison.oneOffPerYear)}.{" "}
          <strong>
            Getting one client onto a subscription is worth more to you than
            finding two new ones.
          </strong>
        </p>
      </div>

      <StickyTotal monthlyC={result.monthlyC} />
    </>
  );
}

/* ------------------------------------------------------------------ ledger */

function Ledger({
  result,
  inputs,
}: {
  result: ReturnType<typeof calculate>;
  inputs: CalcInputs;
}) {
  const flash = useFlashOnChange(result.monthlyC);

  const oneOffSpend = Math.round(result.tubesOneOff * PRICE_ONE_OFF_C);
  const subSpend = Math.round(result.tubesSub * PRICE_SUB_RENEWAL_C);

  return (
    <div className={s.ledger}>
      <div className={s.ledgerRow}>
        <span className={s.ledgerLabel}>
          {inputs.clients} clients × {formatPercent(inputs.conversion)} who buy
        </span>
        <span className={s.ledgerAmount}>
          {formatCount(round1(result.buyers))} buyers
        </span>
      </div>
      <div className={s.ledgerRule} />
      <div className={`${s.ledgerRow} ${flash ? s.flash : ""}`}>
        <span className={s.ledgerLabel}>
          {formatCount(round1(result.tubesOneOff))} one-off ·{" "}
          {formatZar(PRICE_ONE_OFF_C)}
        </span>
        <span className={s.ledgerAmount}>{formatZar(oneOffSpend)}</span>
      </div>
      <div className={`${s.ledgerRow} ${flash ? s.flash : ""}`}>
        <span className={s.ledgerLabel}>
          {formatCount(round1(result.tubesSub))} subscription ·{" "}
          {formatZar(PRICE_SUB_RENEWAL_C)}
        </span>
        <span className={s.ledgerAmount}>{formatZar(subSpend)}</span>
      </div>
      <div className={s.ledgerRule} />
      <div className={`${s.ledgerRow} ${s.ledgerSaved}`}>
        <span className={s.ledgerLabel}>Your clients spend</span>
        <span className={s.ledgerAmount}>{formatZar(result.clientSpendC)}</span>
      </div>
      <div className={`${s.ledgerRow} ${s.ledgerTotal}`}>
        <span className={s.ledgerLabel}>Your commission</span>
        <span className={s.ledgerAmount}>{formatZar(result.monthlyC)}</span>
      </div>

      <p className={s.basis}>
        15% of R600 a tube ({formatZar(COMM_ONE_OFF_C)}), or R540 on
        subscription ({formatZar(COMM_SUB_C)}). Your client&rsquo;s 5%
        doesn&rsquo;t come out of your cut. Delivery excluded. Not paid on
        refunded orders.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- sticky bar */

function StickyTotal({ monthlyC }: { monthlyC: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("earnings");
    const apply = document.getElementById("apply");
    if (!target) return;

    const onScroll = () => {
      const rect = target.getBoundingClientRect();
      const applyRect = apply?.getBoundingClientRect();
      const inCalc = rect.top < window.innerHeight * 0.4 && rect.bottom > 120;
      const atForm = applyRect ? applyRect.top < window.innerHeight : false;
      setVisible(inCalc && !atForm);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`${s.sticky} ${visible ? s.visible : ""} no-print`}
      aria-hidden={!visible}
    >
      <div>
        <span>A month</span>
        <br />
        <b>{formatZar(monthlyC)}</b>
      </div>
      <a href="#apply">Get my code</a>
    </div>
  );
}

/* ---------------------------------------------------------------- helpers */

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function pctOf(a: number, b: number) {
  const max = Math.max(a, b);
  return max === 0 ? 0 : Math.round((a / max) * 100);
}

/** A 400ms powder wash on rows whose value just moved. */
function useFlashOnChange(value: number) {
  const [on, setOn] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setOn(true);
    const t = setTimeout(() => setOn(false), 30);
    return () => clearTimeout(t);
  }, [value]);

  return on;
}

/** Two-way sync between the sliders and ?c=&p=&t=&s= */
function useUrlSync(
  inputs: CalcInputs,
  setInputs: (i: CalcInputs) => void,
) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const q = new URLSearchParams(window.location.search);
    const num = (k: string) => {
      const v = q.get(k);
      if (v === null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const c = num("c");
    const p = num("p");
    const t = num("t");
    const sub = num("s");
    if (c === null && p === null && t === null && sub === null) return;

    setInputs({
      clients: clamp(c ?? DEFAULT_INPUTS.clients, INPUT_BOUNDS.clients),
      conversion: clamp(
        p === null ? DEFAULT_INPUTS.conversion : p / 100,
        INPUT_BOUNDS.conversion,
      ),
      tubesPerMonth: clamp(
        t ?? DEFAULT_INPUTS.tubesPerMonth,
        INPUT_BOUNDS.tubesPerMonth,
      ),
      subShare: clamp(
        sub === null ? DEFAULT_INPUTS.subShare : sub / 100,
        INPUT_BOUNDS.subShare,
      ),
    });
  }, [setInputs]);

  useEffect(() => {
    if (!hydrated.current) return;
    const q = new URLSearchParams(window.location.search);
    q.set("c", String(inputs.clients));
    q.set("p", String(Math.round(inputs.conversion * 100)));
    q.set("t", String(inputs.tubesPerMonth));
    q.set("s", String(Math.round(inputs.subShare * 100)));
    window.history.replaceState(null, "", `?${q}${window.location.hash}`);
  }, [inputs]);
}

function clamp(n: number, b: { min: number; max: number }) {
  return Math.min(b.max, Math.max(b.min, n));
}
