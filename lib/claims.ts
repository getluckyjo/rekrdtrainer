/**
 * The claims discipline. The section that keeps REKRD and the coach out of
 * trouble, and the only part of the training that gates the signup.
 *
 * The whole rule in one sentence:
 *   Describe the sachet. Never describe the outcome.
 */

export const CLAIMS_CHECK_VERSION = "2026-08-v1";

export const CLAIMS_LEDE =
  "REKRD is a foodstuff, not a medicine. It isn't registered with SAHPRA and it makes no health claims — so neither can you, in a session, a caption or a WhatsApp. A health claim from you is a health claim from the brand, and it lands on both of us.";

export const SAY_THIS: string[] = [
  "“600mg of sodium per sachet.”",
  "“No added sugar, no caffeine, no artificial sweeteners.”",
  "“Potassium, magnesium, coconut water powder, L-glutamine, vitamin C, zinc.”",
  "“Made in South Africa, every batch independently tested by MJ Labs.”",
  "“One sachet in 500ml of cold water, once a day.”",
  "“R600 a tube, so R20 a serve.”",
  "“I drink it every day.”",
  "“If you're on medication or pregnant, show the label to your doctor.”",
];

export const NEVER_SAY: string[] = [
  "“It cures cramp.” / “It stops you cramping.”",
  "“It prevents dehydration.” / “It'll stop heat stroke.”",
  "“It boosts your immunity.” / “The zinc stops you getting sick.”",
  "“You'll recover faster.”",
  "“It's basically a drip in a sachet.” / “It fixes a hangover.”",
  "“It's safe for drug testing.” / “It's Informed Sport approved.”",
  "“SAHPRA approved.” / “Doctors recommend it.”",
  "“It's fine for your blood pressure.” / “It'll help you lean out.”",
];

/** The ones that feel safe and aren't. This is the useful part. */
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
    instead: "Follow it straight away with “no added sugar, no artificial sweeteners”",
  },
  {
    said: "“My client's cramping stopped once she started it”",
    why: "A testimonial you repeat is a claim you made",
    instead: "Don't say it, don't post it, don't screenshot it",
  },
  {
    said: "“It's natural, it can't hurt you”",
    why: "Never tell anyone something can't hurt them",
    instead: "“It's a foodstuff — show the label to your doctor”",
  },
  {
    said: "A before/after photo next to a REKRD tube",
    why: "Implies a body-composition claim",
    instead: "Photo of the sachet on the bench. That's it.",
  },
];

export const POSTING_RULES: { title: string; body: string }[] = [
  {
    title: "Disclose, every time",
    body: "“I'm a REKRD coach — my code gets you 10% off.” In the caption, not buried in hashtags.",
  },
  {
    title: "Never DM a claim you wouldn't put on a poster",
    body: "A WhatsApp is not private for this purpose. Screenshots travel.",
  },
  {
    title: "Don't buy stock and resell it",
    body: "Clients buy direct. You never touch product and never touch anyone's money.",
  },
  {
    title: "Don't bid on “REKRD” in Google or post your code on coupon sites",
    body: "That's intercepting, not recommending — and the fastest way to lose your code.",
  },
];

// ------------------------------------------------------------ claims check

/**
 * Five cards, two taps each, ~25 seconds. Not a knowledge test — this is
 * consent with comprehension, and it produces the audit artefact
 * (claims_check_passed_at + version) if a complaint ever lands.
 *
 * It cannot be permanently failed. A wrong answer explains why and moves on.
 */
export type ClaimsCard = {
  id: string;
  statement: string;
  answer: "say" | "never";
  explain: string;
};

export const CLAIMS_CARDS: ClaimsCard[] = [
  {
    id: "c1",
    statement: "“REKRD helps prevent cramp.”",
    answer: "never",
    explain:
      "Cramp is a medical outcome, and “helps prevent” is a claim about it. REKRD isn't licensed to make that claim, so neither are you. Name what's in the sachet and stop there.",
  },
  {
    id: "c2",
    statement: "“Each sachet has 600mg of sodium.”",
    answer: "say",
    explain:
      "A quantity printed on the pack. Facts about what's in the sachet are always safe — it's what you say it does that isn't.",
  },
  {
    id: "c3",
    statement: "“The zinc and vitamin C boost your immune system.”",
    answer: "never",
    explain:
      "The zinc and the vitamin C are both in the sachet, and you can absolutely say that. The moment you say what they do to a body, it stops being a food and becomes a medicine claim. Name the ingredient. Stop there.",
  },
  {
    id: "c4",
    statement: "“Every batch is independently tested by MJ Labs.”",
    answer: "say",
    explain:
      "True, checkable, and one of the strongest things you can say. A certificate of analysis is available on request for any batch.",
  },
  {
    id: "c5",
    statement: "“It's Informed Sport certified, so it's fine for competition.”",
    answer: "never",
    explain:
      "REKRD holds no banned-substance certification. Batch testing by MJ Labs is not the same thing. If a client competes under a code that requires certified supplements, send them to their team doctor.",
  },
];
