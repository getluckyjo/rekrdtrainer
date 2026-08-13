import { CLIENT_DISCOUNT } from "@/lib/calc";
import { ShopifyError, respectThrottle, shopifyGraphQL } from "./client";

/**
 * Mints a coach's 5%-off code in Shopify.
 *
 * Verified against DiscountCodeBasicInput on API 2026-07:
 *   - `context: { all: ALL }` — `customerSelection` is deprecated
 *   - `percentage` is a fraction, 0.00–1.00, NOT 0–100
 *   - `appliesOnSubscription` lives on customerGets, `recurringCycleLimit` on
 *     the top-level input
 */

const DISCOUNT_CODE_BASIC_CREATE = /* GraphQL */ `
  mutation CreateCoachDiscount($input: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $input) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            status
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
        }
      }
      userErrors {
        field
        code
        message
      }
    }
  }
`;

type CreateResponse = {
  discountCodeBasicCreate: {
    codeDiscountNode: { id: string } | null;
    userErrors: { field: string[] | null; code: string | null; message: string }[];
  };
};

export type MintResult =
  | { ok: true; gid: string }
  | { ok: false; reason: "taken" }
  | { ok: false; reason: "rejected"; message: string };

export async function mintCoachDiscount(opts: {
  code: string;
  coachName: string;
  /** Fraction. Defaults to the programme's 5%. */
  percentage?: number;
}): Promise<MintResult> {
  const { code, coachName, percentage = CLIENT_DISCOUNT } = opts;

  const input = {
    title: `Coach · ${coachName} · ${code}`,
    code,
    startsAt: new Date().toISOString(),
    // No endsAt. A code that silently dies breaks every printed QR card.
    context: { all: "ALL" },
    customerGets: {
      value: { percentage },
      items: { all: true },
      appliesOnOneTimePurchase: true,
      // The 5% sweetens the first subscription order — the one that converts —
      // and then stops, so we never stack 5% on the 10% selling-plan price
      // indefinitely. The coach still earns on every renewal via carry-over.
      appliesOnSubscription: true,
    },
    recurringCycleLimit: 1,
    // A per-customer limit would block legitimate repeat purchases, which is
    // the entire point of a hydration subscription.
    appliesOncePerCustomer: false,
    usageLimit: null,
    combinesWith: {
      orderDiscounts: false,
      productDiscounts: false,
      // Harmless, and lets a coach code coexist with a free-shipping promo.
      shippingDiscounts: true,
    },
    tags: ["coach-affiliate"],
  };

  const { data } = await shopifyGraphQL<CreateResponse>(
    DISCOUNT_CODE_BASIC_CREATE,
    { input },
  );

  const result = data.discountCodeBasicCreate;
  const errors = result.userErrors ?? [];

  if (errors.length > 0) {
    if (errors.some((e) => e.code === "TAKEN")) return { ok: false, reason: "taken" };
    return {
      ok: false,
      reason: "rejected",
      message: errors.map((e) => e.message).join("; "),
    };
  }

  if (!result.codeDiscountNode?.id) {
    throw new ShopifyError("Shopify created no discount node and no errors");
  }

  return { ok: true, gid: result.codeDiscountNode.id };
}

/** Used when a signup fails after the code was minted — never leave orphans. */
export async function deleteDiscount(gid: string): Promise<void> {
  await shopifyGraphQL(
    /* GraphQL */ `
      mutation DeleteCoachDiscount($id: ID!) {
        discountCodeDelete(id: $id) {
          deletedCodeDiscountId
          userErrors {
            message
          }
        }
      }
    `,
    { id: gid },
  );
}

// ------------------------------------------------------------- listing --

export type DiscountRow = {
  gid: string;
  code: string;
  title: string;
  kind: string;
  value: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  timesUsed: number;
};

const LIST_DISCOUNTS = /* GraphQL */ `
  query ListDiscounts($cursor: String) {
    codeDiscountNodes(first: 100, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        codeDiscount {
          __typename
          ... on DiscountCodeBasic {
            title
            status
            startsAt
            endsAt
            usageLimit
            asyncUsageCount
            codes(first: 10) {
              nodes {
                code
              }
            }
            customerGets {
              value {
                ... on DiscountPercentage {
                  percentage
                }
                ... on DiscountAmount {
                  amount {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          ... on DiscountCodeFreeShipping {
            title
            status
            startsAt
            endsAt
            usageLimit
            asyncUsageCount
            codes(first: 10) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeBxgy {
            title
            status
            startsAt
            endsAt
            usageLimit
            asyncUsageCount
            codes(first: 10) {
              nodes {
                code
              }
            }
          }
        }
      }
    }
  }
`;

type ListResponse = {
  codeDiscountNodes: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: {
      id: string;
      codeDiscount: {
        __typename: string;
        title?: string;
        status?: string;
        startsAt?: string | null;
        endsAt?: string | null;
        usageLimit?: number | null;
        asyncUsageCount?: number;
        codes?: { nodes: { code: string }[] };
        customerGets?: {
          value?: {
            percentage?: number;
            amount?: { amount: string; currencyCode: string };
          };
        };
      };
    }[];
  };
};

const KIND: Record<string, string> = {
  DiscountCodeBasic: "Amount off",
  DiscountCodeFreeShipping: "Free shipping",
  DiscountCodeBxgy: "Buy X get Y",
};

/**
 * Every code discount in the store, one row per code — a discount can carry
 * several codes, and each is separately typeable at checkout.
 *
 * Paginated to a hard ceiling so a runaway store can't hang the export.
 */
export async function listDiscountCodes(maxPages = 10): Promise<DiscountRow[]> {
  const rows: DiscountRow[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < maxPages; page++) {
    /* Annotated rather than inferred: `cursor` is assigned from this call's
       own result, and letting TS infer both ends of that loop is circular. */
    const res: Awaited<ReturnType<typeof shopifyGraphQL<ListResponse>>> =
      await shopifyGraphQL<ListResponse>(LIST_DISCOUNTS, { cursor });
    const { data, extensions } = res;
    await respectThrottle(extensions?.cost);

    for (const node of data.codeDiscountNodes.nodes) {
      const d = node.codeDiscount;
      const pct = d.customerGets?.value?.percentage;
      const amt = d.customerGets?.value?.amount;
      const value =
        pct !== undefined
          ? `${Math.round(pct * 100)}%`
          : amt
            ? `${amt.currencyCode} ${amt.amount}`
            : d.__typename === "DiscountCodeFreeShipping"
              ? "Free shipping"
              : "";

      for (const c of d.codes?.nodes ?? []) {
        rows.push({
          gid: node.id,
          code: c.code,
          title: d.title ?? "",
          kind: KIND[d.__typename] ?? d.__typename,
          value,
          status: d.status ?? "",
          startsAt: d.startsAt ?? null,
          endsAt: d.endsAt ?? null,
          usageLimit: d.usageLimit ?? null,
          timesUsed: d.asyncUsageCount ?? 0,
        });
      }
    }

    if (!data.codeDiscountNodes.pageInfo.hasNextPage) break;
    cursor = data.codeDiscountNodes.pageInfo.endCursor;
  }

  return rows;
}
