# REKRD Coach Programme

The coach-facing side of REKRD's referral channel: a training site, an earnings
calculator, and the plumbing that mints a coach's Shopify discount code and
tracks what they're owed.

**Live:** `coaches.rekrd.io` · **Store:** `shop.rekrd.io` (Shopify)

## The deal

| | |
|---|---|
| Coach earns | **15%** of the order value *before* the client's discount |
| Client saves | **10%** with the coach's code |
| Carry-over | **12 months** from a client's first coded order |
| Payment | Statement on the 1st, EFT on the 7th, R200 minimum, 30-day hold |

Per order: **R90** on a one-off tube (client pays R540), **R81** on a
subscription order (client pays R486 first, then R540), **R15** on a starter
pack. A coach is never penalised for the discount they give.

## How attribution works

**The discount code *is* the attribution token.** No cookies, no pixel, no
theme edits. The primary use case is a coach saying "use my code" on a gym
floor, where nobody clicks anything.

1. Coach signs up → `discountCodeBasicCreate` mints a 10% code in Shopify.
2. Client checks out with the code → it's recorded permanently on the order.
3. Nightly cron reads orders updated in the last 3 days and rebuilds the ledger.
4. First coded order links that Shopify customer to the coach for 12 months, so
   subscription renewals and forgotten-the-code repeat orders still pay out.

`coaches.rekrd.io/t/CODE` is a vanity redirect to Shopify's own
`/discount/CODE` share link. It logs clicks for the dashboard and is **never**
the attribution source of truth.

### Why a cron and not webhooks

Refunds, cancellations and order edits all bump `updated_at`, and every ledger
row is recomputed from the order's current values on each pass. So they
self-heal for free — no HMAC middleware, no duplicate-delivery dedupe, no
missed-delivery hole. Cost: the dashboard is a night behind. Webhooks are a
latency optimisation for later; keep the cron as the reconciler if you add them.

A weekly deep sweep re-reads 45 days, covering the full 30-day returns window.

Rows already attached to a paid payout are never mutated (`setWhere payout_id is
null`) — a late refund becomes a negative `commission_adjustments` row instead.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run db:push              # or: psql < drizzle/0000_init.sql
npm run dev
```

Admin is the **Supabase Table Editor** — flip `trainers.status`, eyeball
signups, mark payouts paid. There is deliberately no admin UI to maintain.

## Scripts

| | |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | Vitest. `lib/calc.test.ts` pins the exact commission figures |
| `npm run build` | Production build |
| `npm run db:generate` | New migration from `lib/db/schema.ts` |
| `npm run db:push` | Apply the schema to `DATABASE_URL` |
| `npm run db:studio` | Drizzle Studio |

## Layout

```
app/coaches/                 the page: training, claims, calculator, signup
app/coaches/welcome/[code]/  code + QR + print card + share assets
app/coaches/terms/           programme terms
app/dashboard/               magic-link earnings dashboard
app/api/trainers/            signup (reserve code -> mint -> activate)
app/api/cron/                nightly + weekly order sync
app/t/[code]/                vanity redirect

lib/calc.ts                  ALL money maths. Pure, integer cents, tested
lib/productFacts.ts          single source of truth for every product fact
lib/lessons.ts               the 8 training lessons
lib/claims.ts                say / never say / grey area + the claims check
lib/codes.ts                 code generation, blocklist, collision handling
lib/shopify/                 version-pinned Admin API client
lib/commission/sync.ts       the ledger reconciler
```

`lib/calc.ts` is the file that can't be wrong. Change it and the tests fail
loudly, which is the point — those figures are the contract between the
programme terms, the page copy and what a coach actually gets paid.

## Things to know before you touch it

- **Money is integer cents everywhere.** Never a float.
- **`SHOPIFY_API_VERSION` is pinned.** Before bumping, re-verify
  `DiscountCodeBasicInput` — `customerSelection` is already deprecated in favour
  of `context`, and `percentage` is a 0–1 fraction, not 0–100.
- **Auth is the client credentials grant, not a static token.** Shopify retired
  admin-created custom apps; Dev Dashboard apps exchange a client id and secret
  for a 24-hour token. `lib/shopify/client.ts` caches and refreshes it, and
  retries once on a 401 in case it expired early. `SHOPIFY_ADMIN_TOKEN` still
  works for legacy apps and takes precedence when set.
- **Codes stack with the subscription price** (a selling-plan price, not a
  discount, so `combinesWith` doesn't govern it). `recurringCycleLimit: 1`
  keeps the 5% to the first subscription order only.
- **Never expose customer identity to a coach.** `referred_orders` stores the
  order *name* and nothing else about the buyer. That's a POPIA line, not a
  style preference.
- **Banking details are not stored.** Collected at first payout, kept in Xero.

## Still open

- Coach T&Cs and the coach-specific POPIA notice need attorney review; company
  name, CIPC number, VAT number and registered address are still placeholders.
- Confirm which subscription app runs Subscribe & Save — it decides whether a
  code can be pulled from live contracts when a coach leaves.
- "Sales by discount" reporting isn't on the Shopify Basic plan. This ledger
  *is* the reporting.
