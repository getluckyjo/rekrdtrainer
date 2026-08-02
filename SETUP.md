# Switching it on

The site is deployed and the marketing, training, claims and calculator
sections work with nothing configured. Signup, the ledger and the dashboard
need the four steps below. Roughly an hour, most of it waiting.

Until step 2 is done, the signup form returns a clear message telling coaches
to email `partners@rekrd.io` — it never fails silently.

---

## 1. Make the site reachable

The first deploy landed behind Vercel's team SSO, so only people logged into
`get-lucky-golf-club` can see it. Turn that off:

**Vercel → rekrd-coaches → Settings → Deployment Protection → Vercel
Authentication → Disabled → Save.**

Then point a domain at it: **Settings → Domains → Add → `coaches.rekrd.io`**,
and add the CNAME Vercel gives you at your DNS provider. The code already
assumes that hostname; if you use a different one, set
`NEXT_PUBLIC_SITE_ORIGIN` to match.

## 2. Supabase

1. New project, region **eu-west-1** (closest to SA, and the cleanest story for
   the POPIA cross-border clause).
2. **Project Settings → Database → Connection string → Transaction pooler**
   (port 6543). That's `DATABASE_URL`.
3. Run the schema: paste `drizzle/0000_init.sql` into the SQL Editor, or
   `npm run db:push` locally with `DATABASE_URL` set.

The **Table Editor** is your admin panel. `trainers.status` is the switch —
set it to `closed` to stop a coach earning. `payouts.status` is where you mark
a run paid. There is deliberately no admin UI to maintain.

## 3. Shopify custom app

**Settings → Apps and sales channels → Develop apps → Create an app.**

Scopes under Admin API integration:

```
write_discounts   read_discounts   read_orders   read_customers   read_products
```

Install it, then reveal the Admin API access token — **it is shown once**. That
is `SHOPIFY_ADMIN_TOKEN`. `SHOPIFY_STORE_DOMAIN` is the `.myshopify.com` one,
not `shop.rekrd.io`.

## 4. Environment variables

Add all of these in **Vercel → Settings → Environment Variables** (Production
and Preview), using `.env.example` as the checklist:

```
SHOPIFY_STORE_DOMAIN     SHOPIFY_ADMIN_TOKEN      SHOPIFY_API_VERSION=2026-07
SHOPIFY_PRODUCT_HANDLE   DATABASE_URL             RESEND_API_KEY
DASHBOARD_JWT_SECRET     CRON_SECRET              NEXT_PUBLIC_SITE_ORIGIN
```

Generate the two secrets:

```bash
openssl rand -base64 32
```

Redeploy so they take effect. The crons in `vercel.json` start running on their
own (02:00 SAST nightly, plus a Sunday deep sweep).

---

# Verifying it end to end

Do this on the real store with one real order. It costs R570 and proves the
whole chain.

1. **Sign up** as a test coach at `/coaches` with a code like `ZZTEST`.
   → the welcome screen should show the code, the QR and the print card.
2. **Check Shopify.** Discounts should list `Coach · <name> · ZZTEST`, 5%,
   tagged `coach-affiliate`, no end date.
3. **Open** `https://shop.rekrd.io/discount/ZZTEST` → add a tube → the cart
   should read **R570**, not R600.
4. **Place the order.**
5. **Run the sync by hand:**
   ```bash
   curl "https://coaches.rekrd.io/api/cron/sync-orders?secret=YOUR_CRON_SECRET"
   ```
   → expect `attributed: 1` and `commissionC: 9000` (R90.00).
6. **Sign in** at `/dashboard` with the test coach's email → the order should
   appear with R90.00 against it, held for 30 days.
7. **Refund the order in Shopify**, run the sync again → the row should
   recompute to R0. This is the important one: it proves the ledger self-heals
   without any webhook.
8. **Place a second order from the same customer with no code**, sync → it
   should attribute as `customer_carryover`. That's the rule that pays coaches
   on subscription renewals.
9. **Delete the test discount code** in Shopify and delete the test rows in the
   Supabase Table Editor.

Also worth checking once: a coach code should **not** combine with any other
order or product discount at checkout, and on a subscription it should apply to
the first order only.

---

# Before you tell coaches about it

- **Coach T&Cs and the coach POPIA notice need attorney review.** `/coaches/terms`
  is a solid draft, but the company name, CIPC number, VAT number and registered
  address are still placeholders, and coaches are a category of data subject the
  existing customer privacy policy doesn't cover.
- **Confirm which subscription app** runs Subscribe & Save. It decides whether
  the 10% is a selling-plan price or a discount, and whether a code can be
  pulled from live contracts when a coach leaves.
- **Update the "~10% kickback" line** in `rekrd-sales-distribution_1.html` — it
  contradicts the 15% this site promises.
- **The flavour names disagree three ways.** The live store says Sour Cherry,
  Pineapple, Orange, Peach, Watermelon. The policies doc says rooibos instead of
  peach. The product shot in the hero shows *Pineapple Raspberry, Blueberry
  Lemonade, Orange, Sour Cherry Apple* and *Salty Watermelon* — which matches
  the financial model, not either of the others. This site follows the live
  store, since that is what a client sees at checkout, but the packaging is
  what they physically hold. Settle it before coaches start naming flavours.
- **The tube says "supports muscle function, nerve function and recovery."**
  That is a function claim printed on the pack, and this site tells coaches
  never to say "you'll recover faster". Worth checking with whoever signed off
  the label that the two positions are reconcilable — a coach reading the pack
  aloud shouldn't be breaking a rule we gave them.
- **Confirm 15% + 5% is intentional.** Check the coach channel against the
  landed cost in the financial model before opening applications — the combined
  giveaway lands materially below the direct-sale margin that model assumes,
  and it's worth being deliberate about that rather than discovering it at
  volume. The rate is stored per coach in `trainers.commission_rate` and
  snapshotted onto every order, so changing it later is a config change that
  never rewrites settled history.
