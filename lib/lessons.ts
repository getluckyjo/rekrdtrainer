/**
 * The training module. Six lessons, none longer than a minute.
 *
 * Written for a coach reading on a phone between clients, so every lesson
 * leads with the thing they'd actually say out loud. Deep-linkable
 * (#lesson-05) so a specific one can be sent to someone who got a claim wrong.
 */

import type { IconName } from "@/components/Icon";

export type LessonBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "callout"; label: string; text: string };

export type Lesson = {
  id: string;
  n: string;
  title: string;
  icon: IconName;
  seconds: number;
  blocks: LessonBlock[];
};

export const LESSONS: Lesson[] = [
  {
    id: "lesson-01",
    n: "01",
    title: "What it is, in one line",
    icon: "sachet",
    seconds: 30,
    blocks: [
      {
        kind: "p",
        text: "An electrolyte sachet you tear into 500ml of cold water, once a day. Thirty to a tube. Built for the everyday athlete — the person keeping a record, not chasing one.",
      },
      {
        kind: "callout",
        label: "Memorise this",
        text: "“It's a sachet of electrolytes you put in your water once a day. No sugar, no caffeine, R20 a serve.”",
      },
    ],
  },
  {
    id: "lesson-02",
    n: "02",
    title: "What's in it",
    icon: "drop",
    seconds: 45,
    blocks: [
      {
        kind: "list",
        items: [
          "600mg sodium — the number you'll be asked about most",
          "Potassium, magnesium, zinc, vitamin C",
          "Coconut water powder and Himalayan rock salt for trace minerals",
          "500mg L-glutamine",
        ],
      },
      {
        kind: "p",
        text: "Nothing hidden behind a proprietary blend — the full list is printed on the tube.",
      },
      {
        kind: "callout",
        label: "The discipline",
        text: "State the quantity. Never state what it does to a body. That's lesson 05, and it's the one that matters.",
      },
    ],
  },
  {
    id: "lesson-03",
    n: "03",
    title: "The price, and the first ask",
    icon: "rand",
    seconds: 45,
    blocks: [
      {
        kind: "p",
        text: "A tube is R600 — thirty sachets, R20 a serve. Subscribe & Save is R540 with pause, skip or cancel any time, no fee. Your code takes a further 10% off: R540 one-off, R486 on a first subscription order.",
      },
      {
        kind: "callout",
        label: "Start people on the R100 starter pack",
        text: "Five sachets, all the flavours. Flavour is the number one reason a hydration product ends up half-used in a cupboard — let them find theirs before they buy thirty of the wrong one.",
      },
    ],
  },
  {
    id: "lesson-04",
    n: "04",
    title: "Where it's made, how it's tested",
    icon: "flask",
    seconds: 25,
    blocks: [
      {
        kind: "p",
        text: "Made in South Africa. Independently tested by MJ Labs — every batch, not a sample batch. A certificate of analysis is available on request for any batch.",
      },
      {
        kind: "p",
        text: "For a client who reads labels, this is the fact that closes them. It's a fact, not a claim, which is why you can say it freely.",
      },
    ],
  },
  {
    id: "lesson-05",
    n: "05",
    title: "What it is NOT — read this one twice",
    icon: "alert",
    seconds: 45,
    blocks: [
      {
        kind: "list",
        items: [
          "Not registered with SAHPRA. A foodstuff, not a medicine.",
          "Not Informed Sport certified. Batch testing is not the same thing — if a client competes under a code requiring certified supplements, send them to their team doctor.",
          "Not a treatment for cramp, hangovers, illness or fatigue.",
          "Not a meal replacement and not a pre-workout. No caffeine.",
          "Not your call if a client is pregnant, breastfeeding or on chronic medication. Your whole answer: show the label to your doctor or pharmacist.",
        ],
      },
      {
        kind: "callout",
        label: "Why it's your problem too",
        text: "A health claim from you is a health claim from the brand. It lands on both of us.",
      },
    ],
  },
  {
    id: "lesson-06",
    n: "06",
    title: "The five questions you'll actually get",
    icon: "people",
    seconds: 60,
    blocks: [
      {
        kind: "list",
        items: [
          "“Is there sugar in it?” — “No added sugar, and no artificial sweeteners. The supplement facts are on the tube.”",
          "“How much sodium?” — “600mg a sachet.”",
          "“Can I have two?” — “One a day is the routine. On a very hot day or a big-sweat session, a second is fine.”",
          "“Is it safe for me?” — “It's a foodstuff, not a medicine. If you're pregnant, on medication, or managing your sodium, show the label to your doctor.”",
          "“Where do I get it?” — “shop.rekrd.io. Use my code, you get 10% off.”",
        ],
      },
      {
        kind: "callout",
        label: "And the way to recommend it",
        text: "Don't pitch. Use it yourself in front of them — the sachet on the bench does more than a speech. Best moments: the end of a hot session, the week before a race, January. Ask once, then leave it.",
      },
    ],
  },
];
