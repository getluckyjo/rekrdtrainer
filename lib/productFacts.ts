import type { IconName } from "@/components/Icon";

/**
 * Single source of truth for every product fact on this site.
 *
 * Grounded in shop.rekrd.io and the approved store FAQ. If the store and this
 * file ever disagree, the store wins and this file gets updated — a coach
 * quoting a stale fact is worse than a coach quoting no fact.
 */

export const BRAND = {
  name: "REKRD",
  /** The contracting party on the programme terms. */
  legalName: "REKRD (Pty) Ltd",
  meaning: "Personal Record",
  tagline: "Ready. Set. Hydrate.",
  positioningLine: "Clean hydration for the everyday athlete.",
  shopUrl: "https://shop.rekrd.io",
  productUrl: "https://shop.rekrd.io/products/electrolyte-hydration-system",
  supportEmail: "hello@rekrd.io",
  partnerEmail: "partners@rekrd.io",
} as const;

export const PRODUCT = {
  name: "Electrolyte Hydration System",
  format: "Single-serve sachet",
  sachetsPerTube: 30,
  servingSize: "1 sachet in 500ml of cold water",
  frequency: "Once a day",
  madeIn: "South Africa",
  testedBy: "MJ Labs",
  testingScope: "Every batch, not a sample batch",
} as const;

export const FLAVOURS = [
  { name: "Sour Cherry", token: "--fl-cherry" },
  { name: "Pineapple", token: "--fl-pineapple" },
  { name: "Orange", token: "--fl-orange" },
  { name: "Peach", token: "--fl-rooibos" },
  { name: "Watermelon", token: "--fl-watermelon" },
] as const;

/** Quantities are safe to state. What they do to a body is not. */
export const INGREDIENTS = [
  { name: "Sodium", detail: "600mg per sachet" },
  { name: "Potassium", detail: null },
  { name: "Magnesium", detail: null },
  { name: "Coconut water powder", detail: null },
  { name: "Himalayan rock salt", detail: "for trace minerals" },
  { name: "L-glutamine", detail: "500mg per sachet" },
  { name: "Vitamin C", detail: "30mg per sachet" },
  { name: "Zinc", detail: "7mg per sachet — 64% NRV" },
] as const;

export const FREE_FROM = [
  "No added sugar",
  "No caffeine",
  "No artificial sweeteners",
  "No artificial colours or flavours",
  "No fillers",
  "No proprietary blends — the full list is printed on the tube",
] as const;

/**
 * Why the formula looks the way it does. The three questions people actually
 * ask, answered as design decisions rather than as apologies.
 *
 * Every line here states what we chose and what is in the sachet. None of them
 * states what any of it does to a body, and none of them names another brand —
 * a comparative claim needs documentary substantiation we do not have.
 */
export const FORMULA_NOTES: { title: string; body: string }[] = [
  {
    title: "The sachet looks small on purpose.",
    body: "There is no filler in it. You are paying for the actives, not for something to bulk the sachet out.",
  },
  {
    title: "600mg of sodium is a daily number, not a race number.",
    body: "It is built around one sachet a day, every day — training or not. Hard sweat day? Take two.",
  },
  {
    title: "It isn't only electrolytes.",
    body: "500mg of L-glutamine, 7mg of zinc and 30mg of vitamin C sit in the same sachet alongside the salts. One sachet, one list, printed on the tube.",
  },
];

/**
 * The regulatory footnote. This is a footnote, not a manifesto — it renders as
 * one small callout on the coaches page, and clause 05 of the programme terms
 * restates it at length in a legal register.
 *
 * It used to be a five-item `NOT_CLAIMS` list set as a full-width dark block
 * under the kicker "The part nobody else prints". That framing was doing more
 * to put coaches off applying than it was doing to protect anyone.
 */
export const REGULATORY_NOTE = {
  lead: "REKRD is a foodstuff, not a medicine. It isn't SAHPRA-registered and it isn't Informed Sport certified.",
  deferral:
    "If a client is pregnant, on medication or competing under a testing code, your whole answer is",
  deferralEmphasis: "show the label to your doctor.",
} as const;

/** All prices in cents. Money lives in lib/calc.ts; this is display context. */
export const PRICING = {
  tubeC: 60_000,
  tubePerSachetC: 2_000,
  starterPackC: 10_000,
  starterPackSachets: 5,
  subscriptionTubeC: 54_000,
  subscriptionDiscountLabel: "10% off",
  subscriptionIntervals: "2, 4, 6 or 8 weeks",
  freeDeliveryOverC: 50_000,
} as const;

export const DELIVERY = {
  courier: "BobGo",
  metros: "1 to 3 working days",
  regional: "2 to 5 working days",
  returns: "30 days on unopened tubes, in original packaging",
  ectaCooling: "7-day right to cancel under ECTA",
} as const;

/** The spec table. Every row is a fact a coach can repeat verbatim. */
export const SPEC_ROWS: { label: string; value: string }[] = [
  { label: "What it is", value: "Electrolyte hydration system, single-serve sachet" },
  { label: "How to use it", value: "One sachet in 500ml of cold water, once a day" },
  { label: "Sodium", value: "600mg per sachet" },
  { label: "L-glutamine", value: "500mg per sachet" },
  { label: "Zinc", value: "7mg per sachet — 64% NRV" },
  { label: "Vitamin C", value: "30mg per sachet" },
  { label: "Also in it", value: "Potassium, magnesium, coconut water powder, Himalayan rock salt" },
  { label: "Not in it", value: "No added sugar, no caffeine, no artificial sweeteners, colours, flavours or fillers" },
  { label: "Not built to be", value: "A meal replacement or a pre-workout. There is no caffeine in it" },
  { label: "Flavours", value: "Sour Cherry, Pineapple, Orange, Peach, Watermelon" },
  { label: "Tube", value: "30 sachets · R600 · R20 a serve" },
  { label: "Starter pack", value: "5 sachets · R100" },
  { label: "Subscription", value: "10% off at R540 a tube, every 2, 4, 6 or 8 weeks. Pause, skip or cancel any time, no fee" },
  { label: "Made in", value: "South Africa" },
  { label: "Tested by", value: "MJ Labs — an independent third-party lab, every batch. Certificate of analysis on request" },
  { label: "Delivery", value: "BobGo nationwide. Free over R500 — a tube clears it on its own" },
  { label: "Returns", value: "30 days on unopened tubes" },
  { label: "Regulatory", value: "A foodstuff. Not a medicine, not SAHPRA-registered, not Informed Sport certified" },
];

/** Programme terms, in one place, so page copy and emails can't drift. */
export const PROGRAMME = {
  commissionRateLabel: "15%",
  clientDiscountLabel: "10%",
  carryOverMonths: 12,
  statementDay: "1st",
  payoutDay: "7th",
  minimumPayoutC: 20_000,
  holdDays: 30,
} as const;

/**
 * The six facts a coach needs at a glance, cut to lead on what makes this
 * sachet different rather than on what every electrolyte has. Flavours and
 * caffeine moved into the spec table — the hero flavour bar and the product
 * shot already sell flavour.
 *
 * Everything else lives in the full spec table, collapsed by default. A coach
 * between clients should not have to read sixteen rows to learn the product.
 */
export const KEY_FACTS: { icon: IconName; k: string; v: string }[] = [
  { icon: "drop", k: "Sodium", v: "600mg a sachet" },
  { icon: "sachet", k: "L-glutamine", v: "500mg a sachet" },
  { icon: "flavours", k: "Zinc", v: "7mg — 64% NRV" },
  { icon: "no-sugar", k: "Sugar", v: "None added" },
  { icon: "rand", k: "Price", v: "R20 a serve" },
  { icon: "flask", k: "Tested", v: "Third-party lab" },
];
