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

**Train on the product, not on prohibitions.** The legal position taken on this
programme is that the coaches site is not consumer-facing and that a coach may
describe the product in their own words. The page was rebalanced accordingly —
six product lessons, and the restrictions cut to two referrals. So:

- **The pack is the anchor.** `ON_PACK_CLAIMS` holds the four claims printed on
  the tub (hydration, sports recovery, endurance, anti-cramping). Those are the
  brand's own approved language and coaches are told to use them freely. If the
  packaging changes, that constant changes with it.
- State quantities off the printed per-serving panel. There is **no NRV
  percentage anywhere on the pack** — give milligrams only.
- **Never name a competitor.** Unnamed contrast is allowed, and only for a
  verifiable fact about the category — "most electrolyte sachets don't have any
  L-glutamine" is checkable off the shelf. Prefer the positive version where it
  carries the same weight: `FORMULA_NOTES` says "there is no filler in it".
- Only two restrictions survive on the page, both in `LEAVE_TO_A_PRO`, and both
  are about protecting the client rather than the brand: medical questions go to
  a doctor, and drug-tested athletes go to their team doctor (every batch is lab
  tested, but there is no Informed Sport certification). Plus one disclosure rule
  in `POSTING_RULES`, which protects the coach under the ad rules.
- Do not reintroduce a "never say" list, a claims quiz, or a gate on the submit
  button. The audit artefact is the acknowledgement checkbox in `ApplyForm`,
  versioned by `CLAIMS_CHECK_VERSION`. If you change its wording, bump the
  version.
