import { CLIENT_DISCOUNT } from "@/lib/calc";
import { ShopifyError, shopifyGraphQL } from "./client";

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
