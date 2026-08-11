/**
 * What a coach can say. Framed as permission, because almost everything true
 * about REKRD is safe to say and the page used to bury that under a list of
 * prohibitions long enough to put people off applying.
 *
 * The whole rule in one sentence:
 *   Say what's in the sachet. Don't say what it does to a body.
 *
 * The worked examples that used to sit on the page (GREY_AREA) now live on the
 * terms page — nothing was lost, it just stopped standing between a coach and
 * the signup form.
 */

/** Versions the acknowledgement wording on the apply form, not a quiz. */
export const CLAIMS_CHECK_VERSION = "2026-08-v2";

export const CLAIMS_LEDE =
  "Here's the good news: almost everything true about REKRD is safe to say. It's a food, not a medicine, so you can name every ingredient, every quantity, the price, where it's made and who tests it. The one line you don't cross is describing what it does to a body. Say what's in the sachet — that's the whole rule.";

export const SAY_THIS: string[] = [
  "“600mg of sodium per sachet.”",
  "“500mg of L-glutamine in there too — most electrolyte sachets don't have any.”",
  "“Zinc and vitamin C as well. 7mg of zinc, which is 64% of your daily NRV.”",
  "“No fillers — that's why the sachet looks small.”",
  "“No added sugar, no caffeine, no artificial sweeteners.”",
  "“Made in South Africa, every batch tested by an independent lab.”",
  "“One sachet in 500ml of cold water, once a day. Big sweat day, have two.”",
  "“R600 a tube, so R20 a serve.”",
  "“I drink it every day.”",
];

/**
 * Three, not eight. These cover the real risk surface — a medicinal claim, a
 * tested athlete taking a certification on trust, and an advertisement made out
 * of someone's health story. The five we cut were all variations on the first.
 */
export const NEVER_SAY: string[] = [
  "Anything about what it does to a body — cures, prevents, boosts, speeds up, fixes.",
  "“It's fine for drug testing” or “it's certified.” It isn't — independent batch testing is a different thing.",
  "A client's health story, repeated. A testimonial you pass on is a claim you made.",
];

/** The one posting rule that stays on the page. The rest are in the terms. */
export const POSTING_RULES: { title: string; body: string }[] = [
  {
    title: "Say it's your code",
    body: "“I'm a REKRD coach — my code gets you 10% off.” In the caption, not buried in the hashtags. It's the rule, and it also just reads better.",
  },
];

// ------------------------------------------------- worked examples (terms) --

/** The ones that feel safe and aren't. Rendered on the terms page now. */
export type GreyArea = { said: string; why: string; instead: string };

export const GREY_AREA: GreyArea[] = [
  {
    said: "“It helps with hydration”",
    why: "“Helps with” is a function claim",
    instead: "“It's an electrolyte sachet you put in your water”",
  },
  {
    said: "“It replaces what you sweat out”",
    why: "Implies a physiological effect",
    instead: "“600mg of sodium a sachet”",
  },
  {
    said: "“It's clean”",
    why: "Fine as brand language, meaningless as a fact",
    instead: "Follow it straight away with “no added sugar, no artificial sweeteners, no fillers”",
  },
  {
    said: "“My client's cramping stopped once she started it”",
    why: "A testimonial you repeat is a claim you made",
    instead: "Talk about your own routine instead — “I drink it every day”",
  },
  {
    said: "“The zinc will keep you from getting sick”",
    why: "Naming the zinc is fine. Saying what it does is not",
    instead: "“7mg of zinc, 64% of your daily NRV”",
  },
  {
    said: "A before/after photo next to a REKRD tube",
    why: "Implies a body-composition claim",
    instead: "Photo of the sachet on the bench. That's it.",
  },
];
