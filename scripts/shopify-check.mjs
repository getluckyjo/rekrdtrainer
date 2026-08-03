/**
 * Shopify connection checker.
 *
 *   node --env-file=.env.local scripts/shopify-check.mjs
 *   node --env-file=.env.local scripts/shopify-check.mjs --write-test
 *
 * Read-only by default. `--write-test` additionally mints a throwaway discount
 * code and deletes it again, which is the only way to actually prove
 * write_discounts works before a real coach signs up.
 *
 * Never prints the access token.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";
const WRITE_TEST = process.argv.includes("--write-test");

const ok = (s) => `\x1b[32m✓\x1b[0m ${s}`;
const bad = (s) => `\x1b[31m✗\x1b[0m ${s}`;
const warn = (s) => `\x1b[33m!\x1b[0m ${s}`;

if (!DOMAIN || !TOKEN) {
  console.error(bad("SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN must be set."));
  console.error("  Run with:  node --env-file=.env.local scripts/shopify-check.mjs");
  process.exit(1);
}

if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(DOMAIN)) {
  console.error(
    bad(`SHOPIFY_STORE_DOMAIN looks wrong: "${DOMAIN}"`),
  );
  console.error(
    "  It must be the myshopify domain (e.g. rekrd.myshopify.com), not shop.rekrd.io.",
  );
  process.exit(1);
}

/* The two credentials sit on the same page of a custom app, so mixing them up
   is the single most common setup mistake. Name it precisely. */
if (TOKEN.startsWith("shpss_")) {
  console.error(bad("That's the API secret key, not the Admin API access token."));
  console.error("");
  console.error("  Shopify admin → Settings → Apps and sales channels → Develop apps");
  console.error("    → your app → API credentials");
  console.error("");
  console.error("  Use the token under the heading \"Admin API access token\" at the");
  console.error("  TOP of that page — it starts shpat_ and is shown only once.");
  console.error("  \"API key and secret key\" lower down is a different thing; keep the");
  console.error("  shpss_ value for SHOPIFY_API_SECRET if we add webhooks later.");
  console.error("");
  console.error("  If that section says \"Install app to reveal\", the app isn't");
  console.error("  installed yet — click Install app and the token will appear.");
  process.exit(1);
}

if (TOKEN.startsWith("shppa_")) {
  console.error(bad("That's a legacy private app password. Create a custom app instead."));
  process.exit(1);
}

if (!TOKEN.startsWith("shpat_")) {
  console.log(warn(`Token starts "${TOKEN.slice(0, 6)}" — expected shpat_. Continuing anyway.`));
}

const endpoint = `https://${DOMAIN}/admin/api/${VERSION}/graphql.json`;

async function gql(query, variables) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `HTTP ${res.status} — the token was rejected, or the app lacks the scope for this call.`,
    );
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data;
}

console.log(`\nStore    ${DOMAIN}`);
console.log(`API      ${VERSION}`);
console.log(`Token    ${TOKEN.slice(0, 6)}…${TOKEN.slice(-4)}  (${TOKEN.length} chars)\n`);

let failed = false;

/* ---------------------------------------------------------------- shop -- */
try {
  const d = await gql(`{ shop { name myshopifyDomain currencyCode ianaTimezone } }`);
  console.log(ok(`Connected to "${d.shop.name}"`));
  console.log(`   currency ${d.shop.currencyCode} · timezone ${d.shop.ianaTimezone}`);
  if (d.shop.currencyCode !== "ZAR") {
    console.log(warn(`Store currency is ${d.shop.currencyCode}, but all commission maths assumes ZAR.`));
  }
} catch (e) {
  console.log(bad(`Could not reach the store: ${e.message}`));
  process.exit(1);
}

/* -------------------------------------------------------------- scopes -- */
const NEEDED = [
  "write_discounts",
  "read_discounts",
  "read_orders",
  "read_customers",
  "read_products",
];
try {
  const d = await gql(`{ currentAppInstallation { accessScopes { handle } } }`);
  const have = d.currentAppInstallation.accessScopes.map((s) => s.handle);
  const missing = NEEDED.filter((s) => !have.includes(s));

  if (missing.length === 0) {
    console.log(ok(`All ${NEEDED.length} required scopes granted`));
  } else {
    failed = true;
    console.log(bad(`Missing scopes: ${missing.join(", ")}`));
    console.log("   Add them in Shopify admin → Apps → your app → Configuration,");
    console.log("   then click Save AND re-install the app, or the token won't pick them up.");
  }
  const extra = have.filter((s) => !NEEDED.includes(s));
  if (extra.length) console.log(`   also granted: ${extra.join(", ")}`);
} catch (e) {
  failed = true;
  console.log(bad(`Could not read scopes: ${e.message}`));
}

/* ------------------------------------------------------------ products -- */
try {
  const d = await gql(`{
    products(first: 10) {
      nodes { handle title status
        variants(first: 5) { nodes { price title } } }
    }
  }`);
  console.log(ok(`Read products (${d.products.nodes.length} found)`));
  for (const p of d.products.nodes) {
    const prices = p.variants.nodes.map((v) => v.price).join(", ");
    console.log(`   ${p.handle}  —  ${p.title} [${p.status}]  ${prices}`);
  }
  const want = process.env.SHOPIFY_PRODUCT_HANDLE;
  if (want) {
    const found = d.products.nodes.some((p) => p.handle === want);
    console.log(
      found
        ? ok(`SHOPIFY_PRODUCT_HANDLE "${want}" matches a real product`)
        : bad(`SHOPIFY_PRODUCT_HANDLE "${want}" does NOT match any product above`),
    );
    if (!found) failed = true;
  } else {
    console.log(warn("SHOPIFY_PRODUCT_HANDLE not set — /t/CODE links will land on the store root."));
  }
} catch (e) {
  failed = true;
  console.log(bad(`Could not read products: ${e.message}`));
}

/* -------------------------------------------------------------- orders -- */
try {
  const d = await gql(`{
    orders(first: 3, sortKey: UPDATED_AT, reverse: true) {
      nodes { name processedAt discountCodes
        currentSubtotalPriceSet { shopMoney { amount currencyCode } } }
    }
  }`);
  console.log(ok(`Read orders (${d.orders.nodes.length} most recent)`));
  for (const o of d.orders.nodes) {
    const codes = o.discountCodes.length ? o.discountCodes.join(",") : "no code";
    console.log(
      `   ${o.name}  ${o.currentSubtotalPriceSet.shopMoney.amount} ${o.currentSubtotalPriceSet.shopMoney.currencyCode}  ${codes}`,
    );
  }
} catch (e) {
  failed = true;
  console.log(bad(`Could not read orders: ${e.message}`));
  console.log("   read_orders only covers the last 60 days without Shopify approval,");
  console.log("   which is fine for a rolling nightly sync.");
}

/* --------------------------------------------------------- write test -- */
if (WRITE_TEST) {
  const code = `ZZSELFTEST${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  console.log(`\nWrite test — creating ${code}, then deleting it…`);
  let gid = null;
  try {
    const d = await gql(
      `mutation C($input: DiscountCodeBasicInput!) {
         discountCodeBasicCreate(basicCodeDiscount: $input) {
           codeDiscountNode { id }
           userErrors { field code message }
         }
       }`,
      {
        input: {
          title: `SELF TEST — safe to delete — ${code}`,
          code,
          startsAt: new Date().toISOString(),
          context: { all: "ALL" },
          customerGets: {
            value: { percentage: 0.1 },
            items: { all: true },
            appliesOnOneTimePurchase: true,
            appliesOnSubscription: true,
          },
          recurringCycleLimit: 1,
          appliesOncePerCustomer: false,
          usageLimit: null,
          combinesWith: {
            orderDiscounts: false,
            productDiscounts: false,
            shippingDiscounts: true,
          },
          tags: ["coach-affiliate", "self-test"],
        },
      },
    );
    const r = d.discountCodeBasicCreate;
    if (r.userErrors?.length) {
      failed = true;
      console.log(bad(`Discount creation rejected: ${JSON.stringify(r.userErrors)}`));
    } else {
      gid = r.codeDiscountNode.id;
      console.log(ok(`Created a 10% code — the signup path will work`));
    }
  } catch (e) {
    failed = true;
    console.log(bad(`Discount creation failed: ${e.message}`));
  }

  if (gid) {
    try {
      await gql(
        `mutation D($id: ID!) {
           discountCodeDelete(id: $id) { deletedCodeDiscountId userErrors { message } }
         }`,
        { id: gid },
      );
      console.log(ok("Deleted the test code — nothing left behind"));
    } catch (e) {
      console.log(bad(`Could not delete ${code}: ${e.message}`));
      console.log(`   Remove it by hand in Shopify admin → Discounts.`);
    }
  }
} else {
  console.log(`\n${warn("Write path not tested.")} Re-run with --write-test to mint and delete a throwaway code.`);
}

console.log(
  failed
    ? `\n${bad("Some checks failed — see above.")}\n`
    : `\n${ok("Shopify is ready.")}\n`,
);
process.exit(failed ? 1 : 0);
