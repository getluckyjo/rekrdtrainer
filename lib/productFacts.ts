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
  { name: "Vitamin C", detail: null },
  { name: "Zinc", detail: null },
] as const;

export const FREE_FROM = [
  "No added sugar",
  "No caffeine",
  "No artificial sweeteners",
  "No artificial colours or flavours",
  "No fillers",
  "No proprietary blends — the full list is printed on the tube",
] as const;

/** The lines a coach must never soften. */
export const NOT_CLAIMS = [
  {
    title: "Not registered with SAHPRA",
    body: "REKRD is a foodstuff, not a medicine. It is not registered as a medicine and makes no health claims.",
  },
  {
    title: "Not Informed Sport certified",
    body: "Every batch is independently tested by MJ Labs, but REKRD holds no banned-substance certification. If a client competes under a code that requires certified supplements, send them to their team doctor and their federation list.",
  },
  {
    title: "Not a treatment",
    body: "Not for cramp, hangovers, migraines, illness or fatigue. Not for anything.",
  },
  {
    title: "Not your call, medically",
    body: "Pregnant, breastfeeding, on chronic medication, managing blood pressure or kidney conditions — your whole answer is “show the label to your doctor or pharmacist.”",
  },
  {
    title: "Not a meal replacement, not a pre-workout",
    body: "There is no caffeine in it and it is not built to fuel a session.",
  },
] as const;

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
  { label: "Also in it", value: "Potassium, magnesium, coconut water powder, Himalayan rock salt, 500mg L-glutamine, vitamin C, zinc" },
  { label: "Not in it", value: "No added sugar, no caffeine, no artificial sweeteners, colours, flavours or fillers" },
  { label: "Flavours", value: "Sour Cherry, Pineapple, Orange, Peach, Watermelon" },
  { label: "Tube", value: "30 sachets · R600 · R20 a serve" },
  { label: "Starter pack", value: "5 sachets · R100" },
  { label: "Subscription", value: "10% off at R540 a tube, every 2, 4, 6 or 8 weeks. Pause, skip or cancel any time, no fee" },
  { label: "Made in", value: "South Africa" },
  { label: "Tested by", value: "MJ Labs, every batch. Certificate of analysis on request" },
  { label: "Delivery", value: "BobGo nationwide. Free over R500 — a tube clears it on its own" },
  { label: "Returns", value: "30 days on unopened tubes" },
  { label: "Regulatory", value: "A foodstuff. Not a medicine, not SAHPRA-registered, not Informed Sport certified" },
];

/** Programme terms, in one place, so page copy and emails can't drift. */
export const PROGRAMME = {
  commissionRateLabel: "15%",
  clientDiscountLabel: "5%",
  carryOverMonths: 12,
  statementDay: "1st",
  payoutDay: "7th",
  minimumPayoutC: 20_000,
  holdDays: 30,
} as const;

/**
 * The six facts a coach needs at a glance. Everything else lives in the full
 * spec table, which is collapsed by default — a coach between clients should
 * not have to read fourteen rows to learn the product.
 */
export const KEY_FACTS: { icon: IconName; k: string; v: string }[] = [
  { icon: "drop", k: "Sodium", v: "600mg a sachet" },
  { icon: "no-sugar", k: "Sugar", v: "None added" },
  { icon: "no-caffeine", k: "Caffeine", v: "None" },
  { icon: "flavours", k: "Flavours", v: "Five" },
  { icon: "rand", k: "Price", v: "R20 a serve" },
  { icon: "flask", k: "Testing", v: "Every batch, MJ Labs" },
];
