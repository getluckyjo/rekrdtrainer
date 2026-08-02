/**
 * Coach-facing FAQ. Deliberately about the programme, not the product —
 * product questions are answered in the training module and on shop.rekrd.io.
 */

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "What does it cost me to join?",
    a: "Nothing. There's no fee, no minimum, no target and no stock to buy. If you never make a sale you never owe anybody anything.",
  },
  {
    q: "How is the 15% actually worked out?",
    a: "15% of the price before your client's 5% discount. A one-off tube lists at R600, your client pays R570, and you earn R90 — your discount doesn't come out of your cut. On a subscription the tube is R540 and you earn R81, on the first order and on every renewal after it. Delivery is excluded, and commission isn't paid on refunded orders.",
  },
  {
    q: "Do I earn on repeat orders, or only the first one?",
    a: "Every order. The first time a client buys with your code we link that client to you for 12 months. Everything they order in that window earns you commission — subscription renewals included, and repeat purchases where they forgot to type the code.",
  },
  {
    q: "When do I get paid?",
    a: "Your statement goes out on the 1st and payment lands by EFT on the 7th, covering the previous calendar month. There's a 30-day hold on each order so that returns are settled before we pay on them. Minimum payout is R200 — anything below that rolls over to the next month.",
  },
  {
    q: "You didn't ask for my bank details. Why not?",
    a: "Because you haven't earned anything yet. We ask once your first commission is on the board, which is a much better moment for both of us. Until then there's nothing to pay and no reason for us to hold your account number.",
  },
  {
    q: "Does my code work on the subscription price too?",
    a: "Your 5% applies to your client's first subscription order, on top of the 10% Subscribe & Save price — so R513 instead of R600. After that they keep the 10% subscription price for as long as they stay subscribed, and you keep earning R81 on every delivery.",
  },
  {
    q: "Can I use my own code?",
    a: "Yes, for the 5% — please do, you'll recommend it better once you've tasted all five flavours. But we don't pay commission on your own orders. It's your discount, not a way to buy at 20% off.",
  },
  {
    q: "Can I buy stock and sell it to my clients myself?",
    a: "No. Your clients buy direct from shop.rekrd.io. You never hold product and you never handle anyone's money — which is precisely what makes this safe and simple for you. If you run a pro shop, a club or a store and want to stock it properly, that's a different conversation: email partners@rekrd.io.",
  },
  {
    q: "What am I not allowed to say?",
    a: "Anything about what REKRD does to a body. It's a foodstuff, not a medicine, it isn't registered with SAHPRA, and it isn't Informed Sport certified. Describe the sachet — the sodium, the ingredients, the price, the testing — and never describe the outcome. The claims section above has the full say-this / never-say-this list, and if you're unsure about a line, send it to partners@rekrd.io and you'll get an answer within a business day.",
  },
  {
    q: "Does my code expire?",
    a: "No. It has no end date, so the QR code you print and the link in your bio keep working. If you leave the programme we'll tell you before we switch it off.",
  },
  {
    q: "What if a client buys on their laptop after clicking my link on their phone?",
    a: "The link only carries the discount within one browser session, which is why the code matters more than the link. Always give people the code itself — say it out loud, put it in your bio, print the card. A typed code works from any device, any time.",
  },
  {
    q: "Do I have to declare this income?",
    a: "Yes — commission is income and it's yours to declare. If you're VAT registered, tell us, because commission is inclusive of VAT where it applies. We're not able to give you tax advice; your accountant can.",
  },
  {
    q: "Can I recruit other coaches and earn off them?",
    a: "No, and we're not going to build that. This isn't a multi-level scheme. You earn on what your own clients buy, and that's the whole model.",
  },
  {
    q: "How do I leave?",
    a: "Email partners@rekrd.io and we'll close your code. You'll still be paid everything already earned on your next payout run.",
  },
];
