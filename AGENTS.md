# Notes for agents

## This is Next.js 16

Breaking changes from what you may remember: `params` and `searchParams` are
Promises everywhere (`await props.params`), `cookies()`/`headers()` are async,
Turbopack is the default builder, and `next lint` is gone in favour of the
ESLint CLI. Use the globally-available `PageProps<'/route'>` and
`RouteContext<'/route'>` type helpers — run `npx next typegen` after adding a
route. The bundled docs in `node_modules/next/dist/docs/` are authoritative.

## This project

Read `README.md` first — it explains the commission model and why the order
sync is a cron rather than webhooks.

Three rules that matter more than style:

1. **`lib/calc.ts` is the file that can't be wrong.** All money is integer
   cents, the module is pure, and `lib/calc.test.ts` pins the exact figures the
   programme terms promise. If a test there fails, the terms changed — go
   update the terms, the page copy and the plan, not the fixture.
2. **`SHOPIFY_API_VERSION` is pinned on purpose.** Bumping it means
   re-verifying `DiscountCodeBasicInput` against shopify.dev first.
3. **Never expose a customer's identity to a coach.** `referred_orders` holds
   the order name and nothing else about the buyer. That is a POPIA boundary.

## Product facts

Every product claim lives in `lib/productFacts.ts`, `lib/lessons.ts` and
`lib/claims.ts`. Don't inline a fact in a component — and don't invent one.
REKRD is a foodstuff, not SAHPRA-registered, not Informed Sport certified, and
the site must never state or imply what it does to a body. That applies to copy
you write here as much as to the coaches the site is teaching.

**Frame it as permission, not prohibition.** The page used to carry ~1,050 words
on what a coach may not do against ~380 on why the product is good, and coaches
were being put off applying. It was deliberately cut back. So:

- State quantities, never benefits. "500mg of L-glutamine per sachet" is the
  selling line; "supports recovery" is a medicinal claim. Same for zinc and
  immunity, which `NEVER_SAY` still forbids explicitly.
- **Never name a competitor.** Unnamed contrast is allowed, and only for a
  verifiable fact about the category — "most electrolyte sachets don't have any
  L-glutamine" is checkable off the shelf. Never contrast on a health effect,
  and never characterise what a competitor's product does. Where the positive
  version carries the same weight, prefer it: `FORMULA_NOTES` says "there is no
  filler in it", not "unlike the others".
- The regulatory footnote (`REGULATORY_NOTE`) appears in **one** callout on the
  coaches page, plus the footer and terms clause 05. It used to appear seven
  times. Don't re-add it to lessons, spec rows or the welcome flow.
- Worked examples of unsafe lines (`GREY_AREA`) live on the terms page, not
  between a coach and the signup form.
- There is **no claims quiz and no gate on the submit button.** The audit
  artefact is the express acknowledgement checkbox in `ApplyForm`, versioned by
  `CLAIMS_CHECK_VERSION`. If you change that checkbox's wording, bump the
  version.
