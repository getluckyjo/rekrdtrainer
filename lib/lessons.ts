/**
 * Product training. Six lessons, none longer than a minute.
 *
 * The emphasis is deliberate: this teaches the product, not a list of things a
 * coach may not say. A coach who knows the formula, the flavours and the price
 * answers a client's question without needing a rulebook.
 *
 * Written for a coach reading on a phone between clients, so every lesson
 * leads with the thing they'd actually say out loud. Deep-linkable
 * (#lesson-04) so a specific one can be sent to someone who asked.
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
    seconds: 60,
    blocks: [
      {
        kind: "list",
        items: [
          "600mg sodium — the number you'll be asked about most",
          "500mg L-glutamine",
          "150mg potassium, 100mg magnesium",
          "30mg vitamin C, 7mg zinc, 7mg calcium",
          "Coconut water powder and Himalayan rock salt for trace minerals",
        ],
      },
      {
        kind: "p",
        text: "The whole sachet is about 4.5g. No fillers, and nothing hidden behind a proprietary blend — the full list is printed on the pack, with the quantities. That is why the sachet looks small next to others on the shelf: you're paying for the actives, not for something to bulk it out.",
      },
      {
        kind: "callout",
        label: "Why 600mg and not 1000",
        text: "600mg is a daily amount, not a race-day amount. It's built around one sachet a day, every day, whether they trained or not. Big sweat session? Two.",
      },
    ],
  },
  {
    id: "lesson-03",
    n: "03",
    title: "The five flavours, and where to start someone",
    icon: "flavours",
    seconds: 40,
    blocks: [
      {
        kind: "list",
        items: [
          "Sour Cherry Apple",
          "Pineapple Berry — also carries vitamin B2",
          "Orange Zest — also carries vitamin B2",
          "Rooibos Peach Iced-Tea — plus 200mg rooibos extract",
          "Salty Watermelon",
        ],
      },
      {
        kind: "callout",
        label: "Start people on the R100 starter pack",
        text: "Five sachets, one of each. Flavour is the number one reason a hydration product ends up half-used in a cupboard — let them find theirs before they buy thirty of the wrong one.",
      },
    ],
  },
  {
    id: "lesson-04",
    n: "04",
    title: "When to reach for it",
    icon: "clock",
    seconds: 30,
    blocks: [
      {
        kind: "p",
        text: "One a day is the routine — training day or not. That's the whole point of the dose. On a brutal, soaking session, or a very hot day, a second sachet is fine.",
      },
      {
        kind: "p",
        text: "The pack itself lists hydration, sports recovery, endurance and anti-cramping. That's the brand's own language, printed on the tub, so you're on solid ground using it with a client.",
      },
      {
        kind: "callout",
        label: "The moments that actually convert",
        text: "The end of a hot session, the week before a race, the first week of January, and travel. Ask once, then leave it.",
      },
    ],
  },
  {
    id: "lesson-05",
    n: "05",
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
        label: "Don't pitch",
        text: "Use it yourself in front of them. The sachet on the bench does more than a speech.",
      },
    ],
  },
  {
    id: "lesson-06",
    n: "06",
    title: "The questions you'll actually get",
    icon: "people",
    seconds: 60,
    blocks: [
      {
        kind: "list",
        items: [
          "“Why is there so little powder in it?” — “No fillers. About 4.5g, and all of it is on the label.”",
          "“Isn't 1000mg of sodium better?” — “Different job. 600mg is a daily amount. Brutal sweaty session, take two.”",
          "“Is there sugar in it?” — “No added sugar, and no artificial sweeteners.”",
          "“Can I have two?” — “One a day is the routine. Very hot day or a big-sweat session, a second is fine.”",
          "“What's the L-glutamine for?” — “It's 500mg a sachet. Most electrolyte sachets don't have any.”",
          "“Where do I get it?” — “shop.rekrd.io. Use my code, you get 10% off.”",
        ],
      },
      {
        kind: "callout",
        label: "If you don't know, say so",
        text: "“I'll find out” is a perfectly good answer, and partners@rekrd.io will have it back to you the same day.",
      },
    ],
  },
];
