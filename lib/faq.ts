/**
 * Coach FAQ. Only questions the page doesn't already answer — anything
 * covered by the commission table, the calculator or the training module
 * has been cut rather than restated.
 */

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "Do I earn on repeat orders, or only the first one?",
    a: "Every order. The first time a client buys with your code we link them to you for 12 months — subscription renewals included, and repeat orders where they forgot to type the code.",
  },
  {
    q: "You didn't ask for my bank details. Why not?",
    a: "Because you haven't earned anything yet. We ask once your first commission is on the board. Until then there's nothing to pay and no reason for us to hold your account number.",
  },
  {
    q: "Can I use my own code?",
    a: "Yes, for the 5% — please do, you'll recommend it better once you've tasted the flavours. We don't pay commission on your own orders. It's your discount, not a way to buy at 20% off.",
  },
  {
    q: "Can I buy stock and sell it to my clients myself?",
    a: "No. Clients buy direct from shop.rekrd.io, which is what makes this safe and simple for you. If you run a pro shop, club or store and want to stock it properly, email partners@rekrd.io — that's a different conversation.",
  },
  {
    q: "What if a client clicks my link on their phone and buys on a laptop?",
    a: "The link only carries the discount within one browser session, which is why the code matters more than the link. Always give people the code itself — a typed code works from any device, any time.",
  },
  {
    q: "Do I have to declare this income?",
    a: "Yes, it's yours to declare. If you're VAT registered, tell us — commission is inclusive of VAT where it applies. We can't give you tax advice; your accountant can.",
  },
  {
    q: "Can I recruit other coaches and earn off them?",
    a: "No, and we won't build it. You earn on what your own clients buy. That's the whole model.",
  },
  {
    q: "How do I leave?",
    a: "Email partners@rekrd.io and we'll close your code. You'll still be paid everything already earned on your next payout run.",
  },
];
