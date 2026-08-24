/**
 * REKRD coach commission maths.
 *
 * Pure. No React, no I/O, no formatting decisions. Everything is in integer
 * cents until the display boundary — floats are never allowed near money.
 *
 * THE RULE, stated once:
 *   Commission is 15% of the price BEFORE the client's 10% discount.
 *   A coach is never penalised for the discount they hand their client.
 *
 * Which gives, per order:
 *   One-off tube ................. client pays R540.00, coach earns R90.00
 *   Subscription, first order .... client pays R486.00, coach earns R81.00
 *   Subscription, every renewal .. client pays R540.00, coach earns R81.00
 *   5-sachet starter pack ........ client pays  R90.00, coach earns R15.00
 *
 * VAT-inclusive, delivery excluded, not paid on refunded orders.
 */

// ---------------------------------------------------------------- constants

/** Cents. A 30-sachet tube at list. */
export const LIST_TUBE_C = 60_000;

/** Cents. The 5-sachet starter pack at list. */
export const LIST_STARTER_C = 10_000;

/** The client's discount for using a coach's code. */
export const CLIENT_DISCOUNT = 0.1;

/** Subscribe & Save, set on the Shopify selling plan. */
export const SUB_DISCOUNT = 0.1;

/** The coach's cut. Stored per-trainer in the DB; this is the default. */
export const COMMISSION_RATE = 0.15;

/** Free delivery threshold, in cents. A single tube clears it. */
export const FREE_DELIVERY_THRESHOLD_C = 50_000;

// ------------------------------------------------------------ derived rates

/**
 * What a client pays, in cents.
 *
 * A coach code and the subscription selling-plan price stack: the sub price is
 * a selling-plan price rather than a discount, so Shopify's `combinesWith`
 * rules don't apply to it. This is deliberate — "your client gets 10% off
 * whatever they buy" is one sentence a coach can remember.
 */
export const PRICE_ONE_OFF_C = Math.round(LIST_TUBE_C * (1 - CLIENT_DISCOUNT)); // 54_000
export const PRICE_SUB_FIRST_C = Math.round(
  LIST_TUBE_C * (1 - SUB_DISCOUNT) * (1 - CLIENT_DISCOUNT),
); // 48_600
export const PRICE_SUB_RENEWAL_C = Math.round(LIST_TUBE_C * (1 - SUB_DISCOUNT)); // 54_000
export const PRICE_STARTER_C = Math.round(
  LIST_STARTER_C * (1 - CLIENT_DISCOUNT),
); // 9_000

/**
 * What the coach earns, in cents. 15% of the price before the client's 10%.
 * Note the subscription figure is the same on the first order and on every
 * renewal — the coach's cut doesn't move when the client's discount lapses.
 */
export const COMM_ONE_OFF_C = Math.round(LIST_TUBE_C * COMMISSION_RATE); // 9_000
export const COMM_SUB_C = Math.round(
  LIST_TUBE_C * (1 - SUB_DISCOUNT) * COMMISSION_RATE,
); // 8_100
export const COMM_STARTER_C = Math.round(LIST_STARTER_C * COMMISSION_RATE); // 1_500

// ------------------------------------------------------------------- inputs

export type CalcInputs = {
  /** Clients the coach trains regularly. */
  clients: number;
  /** Fraction of them who actually buy. 0.30 = 30%. */
  conversion: number;
  /** Tubes per buyer per month. 1 tube = 30 sachets = a month of daily use. */
  tubesPerMonth: number;
  /** Fraction of buyers on a subscription rather than buying ad hoc. */
  subShare: number;
};

/** What we show before anyone touches a slider. Honest, not flattering. */
export const DEFAULT_INPUTS: CalcInputs = {
  clients: 40,
  conversion: 0.3,
  tubesPerMonth: 1,
  subShare: 0.4,
};

export const INPUT_BOUNDS = {
  clients: { min: 5, max: 200, step: 5 },
  conversion: { min: 0.05, max: 0.6, step: 0.05 },
  tubesPerMonth: { min: 0.5, max: 3, step: 0.25 },
  subShare: { min: 0, max: 1, step: 0.05 },
} as const;

export type Preset = {
  id: string;
  label: string;
  inputs: CalcInputs;
  /** Presets that argue against us are what make the others believable. */
  pessimistic?: boolean;
};

export const PRESETS: Preset[] = [
  {
    id: "small",
    label: "Small circle · 20",
    inputs: { clients: 20, conversion: 0.3, tubesPerMonth: 1, subShare: 0.4 },
  },
  {
    id: "full",
    label: "Regulars · 40",
    inputs: { clients: 40, conversion: 0.3, tubesPerMonth: 1, subShare: 0.4 },
  },
  {
    id: "studio",
    label: "Club or studio · 100",
    inputs: { clients: 100, conversion: 0.3, tubesPerMonth: 1, subShare: 0.4 },
  },
  {
    id: "pessimistic",
    label: "What if only 10% buy",
    inputs: { clients: 40, conversion: 0.1, tubesPerMonth: 1, subShare: 0.4 },
    pessimistic: true,
  },
];

// ------------------------------------------------------------------ outputs

export type CalcResult = {
  buyers: number;
  subBuyers: number;
  oneOffBuyers: number;
  tubesSub: number;
  tubesOneOff: number;
  /** Cents. What the coach's clients spend in a month. */
  clientSpendC: number;
  /** Cents. Steady-state monthly commission. */
  monthlyC: number;
  /** Cents. Monthly × 12. A run rate, not a promise — label it as such. */
  annualC: number;
  /** Cents. Monthly commission spread over every client on the books. */
  perClientC: number;
  /** Cents. Monthly commission per client who actually buys. */
  perBuyerC: number;
};

/**
 * The whole model. Uses steady-state subscription pricing (R540 / R81), not
 * the first-order price — a "per month, recurring" number should describe the
 * ongoing state, and the first order's extra R27 saving is a one-off.
 */
export function calculate(inputs: CalcInputs): CalcResult {
  const { clients, conversion, tubesPerMonth, subShare } = inputs;

  const buyers = clients * conversion;
  const subBuyers = buyers * subShare;
  const oneOffBuyers = buyers - subBuyers;

  const tubesSub = subBuyers * tubesPerMonth;
  const tubesOneOff = oneOffBuyers * tubesPerMonth;

  const clientSpendC = Math.round(
    tubesSub * PRICE_SUB_RENEWAL_C + tubesOneOff * PRICE_ONE_OFF_C,
  );
  const monthlyC = Math.round(
    tubesSub * COMM_SUB_C + tubesOneOff * COMM_ONE_OFF_C,
  );

  return {
    buyers,
    subBuyers,
    oneOffBuyers,
    tubesSub,
    tubesOneOff,
    clientSpendC,
    monthlyC,
    annualC: monthlyC * 12,
    perClientC: clients > 0 ? Math.round(monthlyC / clients) : 0,
    perBuyerC: buyers > 0 ? Math.round(monthlyC / buyers) : 0,
  };
}

// --------------------------------------------------- one client, either way

/** Deliveries a year for each Subscribe & Save interval. */
export const SUB_INTERVALS = [
  { weeks: 2, perYear: 26 },
  { weeks: 4, perYear: 13 },
  { weeks: 6, perYear: 8.7 },
  { weeks: 8, perYear: 6.5 },
] as const;

export type SubComparison = {
  oneOffPerYear: number;
  oneOffAnnualC: number;
  subPerYear: number;
  subAnnualC: number;
  /** How many times better the subscription is over a year. */
  multiple: number;
};

/**
 * The single most persuasive comparison on the page — and the only honest way
 * to make it is to lead with the fact that a subscription pays LESS per order.
 */
export function compareSubscription(
  oneOffPerYear = 5,
  subWeeks: (typeof SUB_INTERVALS)[number]["weeks"] = 4,
): SubComparison {
  const interval =
    SUB_INTERVALS.find((i) => i.weeks === subWeeks) ?? SUB_INTERVALS[1];

  const oneOffAnnualC = Math.round(oneOffPerYear * COMM_ONE_OFF_C);
  const subAnnualC = Math.round(interval.perYear * COMM_SUB_C);

  return {
    oneOffPerYear,
    oneOffAnnualC,
    subPerYear: interval.perYear,
    subAnnualC,
    multiple: oneOffAnnualC > 0 ? subAnnualC / oneOffAnnualC : 0,
  };
}

// ------------------------------------------------------- commission on real orders

/**
 * Commission for a real Shopify order, in cents.
 *
 * `subtotalC` is `currentSubtotalPriceSet` — line items after discounts and
 * after any returns, excluding shipping. Dividing by (1 - clientDiscount)
 * reconstructs the pre-discount value the commission is owed on. That is only
 * valid because the coach code is configured never to combine with another
 * order or product discount, so it is the only thing reducing the subtotal.
 *
 * When an order carries no coach code (a subscription renewal or a repeat
 * purchase attributed by 12-month carry-over) pass `codeApplied: false` and
 * the subtotal is already the pre-discount value.
 */
export function commissionForOrder(opts: {
  subtotalC: number;
  codeApplied: boolean;
  commissionRate?: number;
  clientDiscount?: number;
}): number {
  const {
    subtotalC,
    codeApplied,
    commissionRate = COMMISSION_RATE,
    clientDiscount = CLIENT_DISCOUNT,
  } = opts;

  if (subtotalC <= 0) return 0;

  const commissionable = codeApplied
    ? subtotalC / (1 - clientDiscount)
    : subtotalC;

  return Math.round(commissionable * commissionRate);
}

// ---------------------------------------------------------------- formatting

/* en-ZA renders "R1 036,80" — space grouping, comma decimal. South African
   pricing in the wild, and the store itself, is written "R1,036.80". So group
   with en-US and put the R on ourselves. */
const decimals = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatZar(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}R${decimals.format(Math.abs(cents) / 100)}`;
}

/** Whole rands - for headline figures where cents are noise. */
export function formatZarWhole(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}R${whole.format(Math.abs(cents) / 100)}`;
}

/** 7.2 → "7.2", 12 → "12". Buyer counts are fractional and that's honest. */
export function formatCount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function formatPercent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
