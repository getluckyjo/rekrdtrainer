# Switching it on

**Shopify and Supabase are live and verified.** An ambassador can sign up right now
and get a real discount code. What remains is the domain, email, and the
commercial and legal sign-offs at the bottom of this file.

| | |
|---|---|
| Shopify | ✅ Dev Dashboard app, client credentials, all five scopes |
| Database | ✅ Supabase `rekrd-ambassadors`, eu-west-1, seven tables |
| Vercel env | ✅ 10 variables across production, preview and development |
| Crons | ✅ Nightly 02:00 SAST + Sunday deep sweep, both tested |
| Domain | ⬜ Still on `rekrd-ambassadors.vercel.app` |
| Email | ⬜ No `RESEND_API_KEY` — no welcome mail, no dashboard magic links |

Verified end to end against production on 3 August 2026: signup created a
trainer row, minted a live Shopify code, and the welcome page, vanity redirect
and both cron endpoints all responded correctly. The test ambassador was removed
from both systems afterwards.

---


## 1. Point a domain at it

The site is public at `rekrd-ambassadors.vercel.app`. To move it: **Settings → Domains → Add → `ambassador.rekrd.io`**,
and add the CNAME Vercel gives you at your DNS provider. The code already
assumes that hostname; if you use a different one, set
`NEXT_PUBLIC_SITE_ORIGIN` to match.

## 2. Supabase — done

Project `rekrd-ambassadors`, ref `nexbfbvemvdmldyqxsbn`, **West EU (Ireland)**,
behind the shared transaction pooler on `aws-0-eu-west-1`. All seven tables
created, defaults verified at 15% ambassador / 10% client.

`npm run db:check` re-verifies any time. `npm run db:connect` rebuilds
`DATABASE_URL` from a password if it is ever rotated.

<details><summary>Original instructions, if it ever needs recreating</summary>

1. New project, region **eu-west-1** (closest to SA, and the cleanest story for
   the POPIA cross-border clause).
2. **Project Settings → Database → Connection string → Transaction pooler**
   (port 6543). That's `DATABASE_URL`.
3. Run the schema: paste `drizzle/0000_init.sql` into the SQL Editor, or
   `npm run db:push` locally with `DATABASE_URL` set.

</details>

The **Table Editor** is your admin panel. `trainers.status` is the switch —
set it to `closed` to stop an ambassador earning. `payouts.status` is where you mark
a run paid. There is deliberately no admin UI to maintain.

## 3. Shopify app — done

Shopify has retired admin-created custom apps — the store's App development
page now only offers the Dev Dashboard. So there is no static `shpat_` token
any more. Instead the app authenticates with the **client credentials grant**:
a client id and secret are exchanged for a 24-hour access token, which
`lib/shopify/client.ts` fetches, caches in memory and refreshes on its own.

This only works because the app and the store are in the same Shopify
organisation. It is the supported path for server-to-server integrations you
own, and needs no OAuth callback.

1. **dev.shopify.com** → your app (or create one)
2. **Configuration** → Admin API scopes → tick these → Save:
   ```
   write_discounts  read_discounts  read_orders  read_customers  read_products
   ```
3. **Install** it on `rekrd.myshopify.com` — the grant fails without an install
4. **Settings** → copy the **Client ID** and **Client secret** (`shpss_…`)

Both go in the environment as `SHOPIFY_CLIENT_ID` and
`SHOPIFY_CLIENT_SECRET`. Leave `SHOPIFY_ADMIN_TOKEN` empty — it exists only
for legacy apps and overrides the grant when set.

Verify before going further:

```bash
npm run shopify:check
npm run shopify:check -- --write-test
```

The second one mints a throwaway discount code and deletes it, which is the
only way to prove `write_discounts` works before a real ambassador signs up.

## 4. Environment variables — done

Add all of these in **Vercel → Settings → Environment Variables** (Production
and Preview), using `.env.example` as the checklist:

```
SHOPIFY_STORE_DOMAIN     SHOPIFY_CLIENT_ID        SHOPIFY_CLIENT_SECRET
SHOPIFY_API_VERSION      SHOPIFY_PRODUCT_HANDLE   DATABASE_URL
RESEND_API_KEY           DASHBOARD_JWT_SECRET     CRON_SECRET
NEXT_PUBLIC_SITE_ORIGIN
```

Generate the two secrets:

```bash
openssl rand -base64 32
```

Redeploy so they take effect. The crons in `vercel.json` start running on their
own (02:00 SAST nightly, plus a Sunday deep sweep).

---

# Verifying it end to end

Do this on the real store with one real order. It costs R540 and proves the
whole chain.

1. **Sign up** as a test ambassador at `/ambassadors` with a code like `ZZTEST`.
   → the welcome screen should show the code, the QR and the print card.
2. **Check Shopify.** Discounts should list `Ambassador · <name> · ZZTEST`, 10%,
   tagged `ambassador-affiliate`, no end date.
3. **Open** `https://shop.rekrd.io/discount/ZZTEST` → add a tube → the cart
   should read **R540**, not R600.
4. **Place the order.**
5. **Run the sync by hand:**
   ```bash
   curl "https://ambassador.rekrd.io/api/cron/sync-orders?secret=YOUR_CRON_SECRET"
   ```
   → expect `attributed: 1` and `commissionC: 9000` (R90.00).
6. **Sign in** at `/dashboard` with the test ambassador's email → the order should
   appear with R90.00 against it, held for 30 days.
7. **Refund the order in Shopify**, run the sync again → the row should
   recompute to R0. This is the important one: it proves the ledger self-heals
   without any webhook.
8. **Place a second order from the same customer with no code**, sync → it
   should attribute as `customer_carryover`. That's the rule that pays ambassadors
   on subscription renewals.
9. **Delete the test discount code** in Shopify and delete the test rows in the
   Supabase Table Editor.

Also worth checking once: an ambassador code should **not** combine with any other
order or product discount at checkout, and on a subscription it should apply to
the first order only.

---

# Before you tell ambassadors about it

- **Ambassador T&Cs and the ambassador POPIA notice need attorney review.** `/ambassadors/terms`
  is a solid draft, but the company name, CIPC number, VAT number and registered
  address are still placeholders, and ambassadors are a category of data subject the
  existing customer privacy policy doesn't cover.
- **The store already has Friends25, Wholesale25 and Welcome10.** Ambassador codes
  are configured never to combine with other order or product discounts, so
  they cannot stack — but a client who knows `Wholesale25` gets more off than a
  ambassador code gives, and the ambassador earns nothing on that order. Worth deciding
  whether those public codes should stay live once ambassadors are recruiting.
- **Confirm which subscription app** runs Subscribe & Save. It decides whether
  the Subscribe & Save 10% is a selling-plan price or a discount, and whether a
  code can be pulled from live contracts when an ambassador leaves.
- **At 10%, an ambassador code now matches the Subscribe & Save price exactly.** A
  one-off tube with a code is R540; a subscription renewal is also R540. So a
  ambassador-referred client has no *price* reason to subscribe any more — only
  convenience. The ambassador's own incentive is untouched (a subscriber is still
  worth ~2.3x more to them over a year), but if subscription take-up matters to
  you, the Subscribe & Save discount may need to move.
- **Update the "~10% kickback" line** in `rekrd-sales-distribution_1.html` — it
  contradicts the 15% this site promises.
- **The flavour names disagree three ways.** The live store says Sour Cherry,
  Pineapple, Orange, Peach, Watermelon. The policies doc says rooibos instead of
  peach. The product shot in the hero shows *Pineapple Raspberry, Blueberry
  Lemonade, Orange, Sour Cherry Apple* and *Salty Watermelon* — which matches
  the financial model, not either of the others. This site follows the live
  store, since that is what a client sees at checkout, but the packaging is
  what they physically hold. Settle it before ambassadors start naming flavours.
- **The tube says "supports muscle function, nerve function and recovery."**
  That is a function claim printed on the pack, and this site tells ambassadors
  never to say "you'll recover faster". Worth checking with whoever signed off
  the label that the two positions are reconcilable — an ambassador reading the pack
  aloud shouldn't be breaking a rule we gave them.
- **Confirm 15% + 10% is intentional.** Check the ambassador channel against the
  landed cost in the financial model before opening applications — the combined
  giveaway lands materially below the direct-sale margin that model assumes,
  and it's worth being deliberate about that rather than discovering it at
  volume. The rate is stored per ambassador in `trainers.commission_rate` and
  snapshotted onto every order, so changing it later is a config change that
  never rewrites settled history.
