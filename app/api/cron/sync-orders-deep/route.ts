import { NextRequest } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { syncOrders } from "@/lib/commission/sync";
import { checkCronAuth } from "@/lib/cronAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly deep sweep. 45 days covers the full 30-day returns window plus the
 * ECTA cooling-off period, so a late refund can never leave a stale row behind
 * even if a nightly run was missed entirely.
 *
 * Doesn't advance the cursor — it's a safety net, not progress.
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
    const summary = await syncOrders({ lookbackDays: 45, advanceCursor: false });
    return Response.json({ ok: true, deep: true, ...summary });
  } catch (err) {
    console.error("[cron] sync-orders-deep failed", err);
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
