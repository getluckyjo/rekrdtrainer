/**
 * Shopify Admin GraphQL client.
 *
 * Auth is a custom app created in the Shopify admin (Settings → Apps →
 * Develop apps), so there is no OAuth flow — one long-lived shpat_ token.
 * Required scopes: write_discounts, read_discounts, read_orders,
 * read_customers, read_products.
 */

/* Pinned deliberately — never "latest". Current stable as of Aug 2026.
   Bumping this is a decision, not a side effect: verify DiscountCodeBasicInput
   still matches lib/shopify/discounts.ts before you move it. */
const DEFAULT_API_VERSION = "2026-07";

export type ShopifyCost = {
  throttleStatus: {
    maximumAvailable: number;
    currentlyAvailable: number;
    restoreRate: number;
  };
};

export class ShopifyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

export function isShopifyConfigured(): boolean {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN,
  );
}

function endpoint(): string {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new ShopifyError("SHOPIFY_STORE_DOMAIN is not set");

  const version = process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION;
  return `https://${domain}/admin/api/${version}/graphql.json`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One request, with leaky-bucket backoff. Mutations cost 10 points against a
 * 100/sec bucket on standard plans, so a signup will never throttle — the
 * nightly order sync is the only caller that can, and it paginates.
 */
export async function shopifyGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  attempt = 0,
): Promise<{ data: T; extensions?: { cost?: ShopifyCost } }> {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) throw new ShopifyError("SHOPIFY_ADMIN_TOKEN is not set");

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 3) {
      throw new ShopifyError(
        `Shopify returned ${res.status} after ${attempt} retries`,
        res.status,
      );
    }
    await sleep(1000 * (attempt + 1));
    return shopifyGraphQL<T>(query, variables, attempt + 1);
  }

  if (!res.ok) {
    throw new ShopifyError(
      `Shopify HTTP ${res.status}`,
      res.status,
      await res.text().catch(() => undefined),
    );
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string; extensions?: { code?: string } }[];
    extensions?: { cost?: ShopifyCost };
  };

  if (json.errors?.length) {
    const throttled = json.errors.some(
      (e) => e.extensions?.code === "THROTTLED",
    );
    if (throttled && attempt < 3) {
      await sleep(1000 * (attempt + 1));
      return shopifyGraphQL<T>(query, variables, attempt + 1);
    }
    throw new ShopifyError(
      json.errors.map((e) => e.message).join("; "),
      res.status,
      json.errors,
    );
  }

  if (!json.data) throw new ShopifyError("Shopify returned no data");

  return { data: json.data, extensions: json.extensions };
}

/** Pause when the bucket runs low, so a long sync degrades instead of failing. */
export async function respectThrottle(cost?: ShopifyCost) {
  const available = cost?.throttleStatus.currentlyAvailable;
  if (available !== undefined && available < 200) await sleep(1000);
}
