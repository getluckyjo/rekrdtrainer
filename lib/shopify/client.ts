/**
 * Shopify Admin GraphQL client.
 *
 * Two auth modes, because Shopify changed this out from under everyone:
 *
 *   1. CLIENT CREDENTIALS (current). Dev Dashboard apps have no static token.
 *      You POST client_id + client_secret to the store's oauth endpoint and
 *      get a token valid for 24 hours, which we cache in memory and refresh.
 *      Only works when the app and the store are in the same Shopify
 *      organisation, which is exactly our case — we own both.
 *
 *   2. STATIC shpat_ TOKEN (legacy). Custom apps created in the store admin.
 *      Shopify no longer lets you create these, but existing ones still work,
 *      so SHOPIFY_ADMIN_TOKEN still takes precedence if it's set.
 *
 * Required scopes either way: write_discounts, read_discounts, read_orders,
 * read_customers, read_products.
 */

/* Pinned deliberately — never "latest". Current stable as of Aug 2026.
   Bumping this is a decision, not a side effect: verify DiscountCodeBasicInput
   still matches lib/shopify/discounts.ts before you move it. */
const DEFAULT_API_VERSION = "2026-07";

/** Refresh this long before the 24h expiry, so a request never races it. */
const EXPIRY_MARGIN_MS = 5 * 60_000;

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
  if (!process.env.SHOPIFY_STORE_DOMAIN) return false;
  if (process.env.SHOPIFY_ADMIN_TOKEN) return true;
  return Boolean(
    process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET,
  );
}

function storeDomain(): string {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new ShopifyError("SHOPIFY_STORE_DOMAIN is not set");
  return domain;
}

function endpoint(): string {
  const version = process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION;
  return `https://${storeDomain()}/admin/api/${version}/graphql.json`;
}

/* Module-level, so a warm serverless instance reuses the token for its whole
   24h life. A cold start costs one extra round trip and nothing else. */
let cached: { token: string; expiresAt: number } | null = null;

/** Drops the cached token so the next call fetches a fresh one. */
export function invalidateToken(): void {
  cached = null;
}

async function getAccessToken(): Promise<string> {
  const staticToken = process.env.SHOPIFY_ADMIN_TOKEN;
  if (staticToken) return staticToken;

  if (cached && Date.now() < cached.expiresAt) return cached.token;

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ShopifyError(
      "Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET (Dev Dashboard app), or SHOPIFY_ADMIN_TOKEN (legacy custom app).",
    );
  }

  const res = await fetch(`https://${storeDomain()}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ShopifyError(
      `Could not get an access token (HTTP ${res.status}). Check the client id and secret, that the app is installed on ${storeDomain()}, and that the app and store are in the same Shopify organisation.`,
      res.status,
      body,
    );
  }

  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    scope?: string;
  };

  if (!data.access_token) {
    throw new ShopifyError("Token endpoint returned no access_token", 200, data);
  }

  const ttlMs = (data.expires_in ?? 86_399) * 1000;
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(ttlMs - EXPIRY_MARGIN_MS, 30_000),
  };

  return cached.token;
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
  const token = await getAccessToken();

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  /* A 401 on a client-credentials token means it expired early or was revoked.
     Drop it and try once with a fresh one before giving up. */
  if (res.status === 401 && !process.env.SHOPIFY_ADMIN_TOKEN && attempt === 0) {
    invalidateToken();
    return shopifyGraphQL<T>(query, variables, attempt + 1);
  }

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
