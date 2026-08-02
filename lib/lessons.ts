/**
 * The eight-lesson training module.
 *
 * Written to be read on a phone between clients. Every lesson is deep-linkable
 * (#lesson-06) so a specific one can be sent to a coach who got a claim wrong.
 * Nothing here describes what REKRD does to a body — see lib/claims.ts.
 */

export type LessonBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "callout"; label: string; text: string };

export type Lesson = {
  id: string;
  n: string;
  title: string;
  seconds: number;
  blocks: LessonBlock[];
};

export const LESSONS: Lesson[] = [
  {
    id: "lesson-01",
    n: "01",
    title: "What REKRD actually is",
    seconds: 40,
    blocks: [
      {
        kind: "p",
        text: "An electrolyte hydration system in a single-serve sachet, made in South Africa. You tear one into 500ml of cold water, stir, and that's it. Once a day is the routine — with breakfast, on the first tee, before a flight, after training. Thirty sachets to a tube. Five flavours.",
      },
      {
        kind: "p",
        text: "The positioning matters as much as the product. REKRD is built for the everyday athlete — the person keeping a record, not chasing one. It is not a performance supplement aimed at the top 1%, and it does not shout in neon.",
      },
      {
        kind: "callout",
        label: "The line to memorise",
        text: "“It's a sachet of electrolytes you put in your water once a day. No sugar, no caffeine, R20 a serve.”",
      },
    ],
  },
  {
    id: "lesson-02",
    n: "02",
    title: "What's in the sachet",
    seconds: 60,
    blocks: [
      {
        kind: "list",
        items: [
          "600mg sodium — the number you'll be asked about most",
          "Potassium",
          "Magnesium",
          "Coconut water powder",
          "Himalayan rock salt, for trace minerals",
          "500mg L-glutamine",
          "Vitamin C",
          "Zinc",
        ],
      },
      {
        kind: "p",
        text: "No added sugar. No caffeine. No artificial sweeteners, colours, flavours or fillers. Nothing hidden behind a proprietary blend — the full ingredient list is printed on every tube and published on the product page.",
      },
      {
        kind: "callout",
        label: "Coaching note",
        text: "Sodium is the headline because it's the electrolyte most present in sweat. State the quantity. Do not state what it does to a body — that's lesson 06, and it's the one that matters.",
      },
    ],
  },
  {
    id: "lesson-03",
    n: "03",
    title: "The price, and the maths a client does in their head",
    seconds: 45,
    blocks: [
      {
        kind: "p",
        text: "A 30-sachet tube is R600, which is R20 a sachet. The 5-sachet starter pack is R100 — and that is your best first ask, not the tube. Subscribe & Save is 10% off at R540, delivered every 2, 4, 6 or 8 weeks, and a client can pause, skip, change flavour or cancel any time with no fee and no phone call.",
      },
      {
        kind: "p",
        text: "With your code they get a further 5% off: R570 for a one-off tube, R513 on their first subscription order. Free delivery over R500, which a single tube clears on its own. Thirty days to return an unopened tube.",
      },
      {
        kind: "callout",
        label: "The comparison to have ready",
        text: "R20 a day is less than a flat white.",
      },
    ],
  },
  {
    id: "lesson-04",
    n: "04",
    title: "Flavours, and picking one for a client",
    seconds: 30,
    blocks: [
      {
        kind: "p",
        text: "Sour Cherry, Pineapple, Orange, Peach and Watermelon. The taste is clean and light rather than syrupy — closer to flavoured water than to a sports drink. If a flavour isn't for someone, REKRD will help them find one that is.",
      },
      {
        kind: "callout",
        label: "The practical advice",
        text: "Start people on the R100 starter pack. Flavour is the number one reason a hydration product ends up half-used in a cupboard. Let them find theirs before they buy thirty of the wrong one.",
      },
    ],
  },
  {
    id: "lesson-05",
    n: "05",
    title: "Where it's made and how it's tested",
    seconds: 30,
    blocks: [
      {
        kind: "p",
        text: "Manufactured in South Africa and independently tested by MJ Labs — every batch, not a sample batch. A certificate of analysis is available on request from hello@rekrd.io, including for the specific batch a client is holding.",
      },
      {
        kind: "p",
        text: "If your client is the kind who reads labels, this is the fact that closes them. It is also a fact, not a claim, which is why you can say it freely.",
      },
    ],
  },
  {
    id: "lesson-06",
    n: "06",
    title: "What REKRD is NOT — the lesson that keeps you out of trouble",
    seconds: 60,
    blocks: [
      {
        kind: "p",
        text: "Read this one twice. Everything above is a fact you can repeat. This is the boundary around it.",
      },
      {
        kind: "list",
        items: [
          "Not registered with SAHPRA. It is a foodstuff, not a medicine.",
          "Not Informed Sport or Informed Choice certified. If a client competes under a code that requires certified supplements, say so plainly and send them to their team doctor and their federation list. Never imply certification that doesn't exist.",
          "Not a treatment for cramp, hangovers, migraines, illness or fatigue.",
          "Not your call if a client is pregnant, breastfeeding, on chronic medication, or managing blood pressure or kidney conditions. Your entire answer is: show the label to your doctor or pharmacist.",
          "Not a meal replacement and not a pre-workout. There's no caffeine in it.",
        ],
      },
      {
        kind: "callout",
        label: "Why this is your problem too",
        text: "A health claim from you is a health claim from the brand. It lands on both of us. Nobody has ever been told off for asking partners@rekrd.io whether a line is safe.",
      },
    ],
  },
  {
    id: "lesson-07",
    n: "07",
    title: "The five questions you will actually be asked",
    seconds: 90,
    blocks: [
      {
        kind: "p",
        text: "These five come up over and over. Learn the answers and you'll never be caught out on a gym floor.",
      },
      {
        kind: "list",
        items: [
          "“Is there sugar in it?” — “No added sugar, and no artificial sweeteners. The full supplement facts are on the tube and on the product page.”",
          "“How much sodium?” — “600mg a sachet.”",
          "“Can I have two?” — “One a day is the routine. On a very hot day or a big-sweat session, a second is fine.”",
          "“Is it safe for me?” — “It's a foodstuff, not a medicine. If you're pregnant, breastfeeding, on chronic medication, or managing sodium, potassium or fluid intake, show the label to your doctor or pharmacist.”",
          "“Where do I get it?” — “shop.rekrd.io. Use my code, you get 5% off.”",
        ],
      },
      {
        kind: "callout",
        label: "Note on that last one",
        text: "You never handle their money and you never hold stock. The client buys direct from REKRD. That's the whole arrangement.",
      },
    ],
  },
  {
    id: "lesson-08",
    n: "08",
    title: "Recommending it without becoming a salesman",
    seconds: 45,
    blocks: [
      {
        kind: "p",
        text: "Don't pitch. Use it yourself, in front of them — the sachet on the bench does more work than a speech ever will.",
      },
      {
        kind: "p",
        text: "The moments that convert: the end of a hot session, the week before a race or a golf day, a client heading to a tournament, and January. Put your link in your Instagram bio and in your booking confirmation email — that's where most of this programme's money actually comes from.",
      },
      {
        kind: "callout",
        label: "The rule",
        text: "Ask once, then leave it. The client relationship is worth more than R90.",
      },
    ],
  },
];
