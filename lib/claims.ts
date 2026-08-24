/**
 * How a coach talks about REKRD.
 *
 * Deliberately light. The legal position taken on this programme is that the
 * coaches site is not consumer-facing and that a coach may speak about the
 * product in their own words, so this file is not a rulebook — the training in
 * lib/lessons.ts is where the effort goes.
 *
 * The anchor is the pack: everything printed on it is the brand's own approved
 * language, so a coach repeating it is on solid ground. What survives here is
 * the short list of things that protect the coach rather than the brand —
 * disclosing that they earn from it, and sending medical and competition
 * questions to someone qualified to answer them.
 */

/**
 * Versions the agreement an ambassador ticks on the apply form. Stored against
 * their row and quoted back to them in the welcome email.
 *
 * **Bump this whenever AGREEMENT_COMMITMENTS changes.** The version is the only
 * thing linking a stored acceptance to the words that were actually on screen,
 * and without that link the record proves nothing.
 */
export const AGREEMENT_VERSION = "2026-08-ambassador-v1";

/**
 * What an ambassador commits to. Each is a separate required tick on the form,
 * rather than one blanket "I agree" — Frans asked whether these could be signed
 * like a contract, and separate ticks against named obligations are far closer
 * to that than a single box swallowing everything.
 *
 * South Africa's ECTA makes an ordinary electronic signature valid for an
 * agreement of this kind; advanced signatures are reserved for cases like
 * suretyship and the alienation of land. What matters is not the mechanism but
 * that the person can show what they agreed to — which is why lib/email.ts
 * quotes these back verbatim with the version and date.
 *
 * Keep in step with AMBASSADOR_ASKS in lib/productFacts.ts.
 */
export const AGREEMENT_COMMITMENTS: { id: string; label: string }[] = [
  {
    id: "posts",
    label:
      "I'll mention REKRD in a story or post once or twice a week, and tag you.",
  },
  {
    id: "bio",
    label:
      "I'll say I'm a REKRD ambassador in my bio, with my link.",
  },
  {
    id: "terms",
    label:
      "I'll say I earn from my code when I recommend it, and I accept the programme terms.",
  },
];

export const CLAIMS_LEDE =
  "Talk about it the way you'd talk about anything else you rate. Everything printed on the pack is the brand's own language, so if it's on there, it's yours to use — and the numbers below are all checkable. You don't need a script.";

export const SAY_THIS: string[] = [
  "“600mg of sodium per sachet.”",
  "“500mg of L-glutamine in there too — most electrolyte sachets don't have any.”",
  "“30mg of vitamin C, 7mg of zinc and 7mg of calcium in there as well.”",
  "“It's about 4.5g of powder — no fillers, so the sachet looks small.”",
  "“No added sugar, no caffeine, no artificial sweeteners.”",
  "“Made in South Africa, every batch tested by an independent lab.”",
  "“One sachet in 500ml of cold water, once a day. Big sweat day, have two.”",
  "“R600 a tube, so R20 a serve.”",
  "“I drink it every day.”",
];

/** Printed on the tub. The brand's own words, so a coach can use them freely. */
export const ON_PACK_CLAIMS = [
  "Hydration",
  "Sports recovery",
  "Endurance",
  "Anti-cramping",
] as const;

/**
 * Two, and both are about looking after the client rather than the brand.
 * Framed as "send it on", not "never say".
 */
export const LEAVE_TO_A_PRO: { title: string; body: string }[] = [
  {
    title: "Anything medical",
    body: "Pregnant, breastfeeding, on chronic medication, managing blood pressure or a kidney condition — “show the label to your doctor” is the whole answer, and it's the right one.",
  },
  {
    title: "Anyone who gets drug tested",
    body: "Every batch is independently lab tested, but that isn't the same as a banned-substance certification like Informed Sport, which REKRD doesn't hold. If a client competes under a testing code, send them to their team doctor.",
  },
];

/** The one rule that protects the coach, not the brand. */
export const POSTING_RULES: { title: string; body: string }[] = [
  {
    title: "Say it's your code",
    body: "“I'm a REKRD ambassador — my code gets you 10% off.” In the caption, not buried in the hashtags. It keeps you right with the ad rules, and it also just reads better.",
  },
];
