import { NextRequest } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { syncOrders } from "@/lib/commission/sync";
import { checkCronAuth } from "@/lib/cronAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Nightly. A 3-day rolling window catches refunds, cancellations and order
 * edits, all of which bump `updated_at` — which is why this needs no webhooks
 * to stay correct.
 *
 * Safe to run by hand: every row is recomputed, so a second pass is a no-op.
 */
export async function GET(req: NextRequest) {
  const unauthorised = checkCronAuth(req);
  if (unauthorised) return unauthorised;

  if (!isDbConfigured() || !isShopifyConfigured()) {
    return Response.json(
      { error: "Database or Shopify is not configured." },
      { status: 503 },
    );
  }

  try {
    const summary = await syncOrders({ lookbackDays: 3, advanceCursor: true });
    return Response.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[cron] sync-orders failed", err);
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
