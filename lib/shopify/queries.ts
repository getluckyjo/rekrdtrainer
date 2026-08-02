import { respectThrottle, shopifyGraphQL, type ShopifyCost } from "./client";

/**
 * Orders touched since a cursor. Refunds, cancellations and order edits all
 * bump `updated_at`, which is why a rolling window plus a full recompute makes
 * the whole commission ledger self-healing with no webhooks.
 */

const ORDERS_UPDATED_SINCE = /* GraphQL */ `
  query OrdersUpdatedSince($query: String!, $cursor: String) {
    orders(first: 50, after: $cursor, query: $query, sortKey: UPDATED_AT) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        processedAt
        cancelledAt
        displayFinancialStatus
        discountCodes
        customer {
          id
        }
        currentSubtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 10) {
          nodes {
            sellingPlan {
              name
            }
          }
        }
      }
    }
  }
`;

export type ShopifyOrder = {
  id: string;
  name: string;
  processedAt: string;
  cancelledAt: string | null;
  displayFinancialStatus: string | null;
  discountCodes: string[];
  customer: { id: string } | null;
  currentSubtotalPriceSet: {
    shopMoney: { amount: string; currencyCode: string };
  };
  lineItems: { nodes: { sellingPlan: { name: string } | null }[] };
};

type OrdersResponse = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ShopifyOrder[];
  };
};

/** Pages through everything updated since `since`, throttle-aware. */
export async function fetchOrdersUpdatedSince(
  since: Date,
): Promise<ShopifyOrder[]> {
  const query = `updated_at:>='${since.toISOString()}' AND test:false`;

  const out: ShopifyOrder[] = [];
  let cursor: string | null = null;
  let guard = 0;

  do {
    const { data, extensions }: {
      data: OrdersResponse;
      extensions?: { cost?: ShopifyCost };
    } = await shopifyGraphQL<OrdersResponse>(ORDERS_UPDATED_SINCE, {
      query,
      cursor,
    });

    out.push(...data.orders.nodes);
    cursor = data.orders.pageInfo.hasNextPage
      ? data.orders.pageInfo.endCursor
      : null;

    await respectThrottle(extensions?.cost);
  } while (cursor && ++guard < 200);

  return out;
}

/** "gid://shopify/Order/12345" -> 12345n */
export function gidToId(gid: string): bigint {
  const tail = gid.split("/").pop() ?? "";
  return BigInt(tail);
}

/** "570.00" -> 57000 */
export function moneyToCents(amount: string): number {
  return Math.round(Number.parseFloat(amount) * 100);
}
