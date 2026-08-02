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
