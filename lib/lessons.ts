/**
 * The training module. Four lessons, none longer than a minute.
 *
 * Written for a coach reading on a phone between clients, so every lesson
 * leads with the thing they'd actually say out loud. Deep-linkable
 * (#lesson-04) so a specific one can be sent to someone who asked.
 *
 * This used to be six lessons and its own numbered section. What's in it and
 * how it's tested are now told properly in the product section, so those two
 * lessons merged; the old lesson 05 ("what it is NOT — read this one twice")
 * is gone, and its one genuinely load-bearing line lives in a single callout
 * on the page and in the programme terms.
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
        text: "An electrolyte sachet you tear into 500ml of cold water, once a day. Thirty to a tube. Built for every day and every sport — the person keeping a record, not just the one chasing one.",
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
    title: "What's in it, and why it's built that way",
    icon: "drop",
    seconds: 45,
    blocks: [
      {
        kind: "list",
        items: [
          "600mg sodium — the number you'll be asked about most",
          "500mg L-glutamine",
          "7mg zinc (64% NRV) and 30mg vitamin C",
          "Potassium and magnesium",
          "Coconut water powder and Himalayan rock salt for trace minerals",
        ],
      },
      {
        kind: "p",
        text: "No fillers, and nothing hidden behind a proprietary blend — the full list is printed on the tube, with the quantities. Made in South Africa and tested by an independent third-party lab, every batch, not a sample batch. A certificate of analysis is available on request.",
      },
      {
        kind: "callout",
        label: "The one discipline",
        text: "State the quantity. Don't state what it does to a body. Naming the zinc is fine; saying the zinc stops you getting sick is not.",
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
    title: "The questions you'll actually get",
    icon: "people",
    seconds: 60,
    blocks: [
      {
        kind: "list",
        items: [
          "“Why is there so little powder in it?” — “No fillers. You're paying for the actives, not for something to bulk out the sachet.”",
          "“Isn't 1000mg of sodium better?” — “Different job. 600mg is a daily amount — one a day, whether you trained or not. Brutal sweaty session, take two.”",
          "“Is there sugar in it?” — “No added sugar, and no artificial sweeteners. The supplement facts are on the tube.”",
          "“Can I have two?” — “One a day is the routine. On a very hot day or a big-sweat session, a second is fine.”",
          "“Is it safe for me?” — “It's a food, not a medicine. If you're pregnant, on medication, or managing your sodium, show the label to your doctor.”",
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
