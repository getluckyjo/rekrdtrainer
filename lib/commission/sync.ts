import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  referredCustomers,
  referredOrders,
  syncState,
  trainers,
} from "@/lib/db/schema";
import { commissionForOrder } from "@/lib/calc";
import {
  fetchOrdersUpdatedSince,
  gidToId,
  moneyToCents,
  type ShopifyOrder,
} from "@/lib/shopify/queries";
import { PROGRAMME } from "@/lib/productFacts";

const CURSOR_KEY = "orders.lastSyncedAt";
const CARRY_OVER_MONTHS = PROGRAMME.carryOverMonths;
const HOLD_DAYS = PROGRAMME.holdDays;

export type SyncSummary = {
  windowStart: string;
  ordersScanned: number;
  attributed: number;
  skipped: number;
  commissionC: number;
};

/**
 * The commission ledger, rebuilt from Shopify's current view of each order.
 *
 * Every row is recomputed from scratch on every pass, keyed on the Shopify
 * order id, so refunds, cancellations and order edits self-heal — that is the
 * entire reason this is a cron and not a webhook.
 *
 * Settled history is never touched: a row already attached to a paid payout is
 * left alone and the difference becomes a commission_adjustments row instead.
 */
export async function syncOrders(opts: {
  /** How far back to look. 3 days nightly; 45 for the weekly deep sweep. */
  lookbackDays: number;
  /** Deep sweeps don't move the cursor — they're a safety net, not progress. */
  advanceCursor: boolean;
}): Promise<SyncSummary> {
  const { lookbackDays, advanceCursor } = opts;
  const database = db();
  const startedAt = new Date();

  const cursor = await readCursor();
  const windowStart = new Date(
    Math.min(
      startedAt.getTime() - lookbackDays * 86_400_000,
      (cursor?.getTime() ?? Infinity) - 86_400_000,
    ),
  );

  const orders = await fetchOrdersUpdatedSince(windowStart);

  // One read, then everything is in memory. The coach list is small by design.
  const coaches = await database
    .select({
      id: trainers.id,
      code: trainers.discountCode,
      rate: trainers.commissionRate,
      customerDiscountRate: trainers.customerDiscountRate,
      status: trainers.status,
    })
    .from(trainers);

  const byCode = new Map(coaches.map((c) => [c.code.toUpperCase(), c]));
  const byId = new Map(coaches.map((c) => [c.id, c]));

  let attributed = 0;
  let skipped = 0;
  let commissionC = 0;

  for (const order of orders) {
    const result = await applyOrder(order, byCode, byId);
    if (result === null) {
      skipped++;
    } else {
      attributed++;
      commissionC += result;
    }
  }

  if (advanceCursor) {
    await writeCursor(startedAt);
  }

  return {
    windowStart: windowStart.toISOString(),
    ordersScanned: orders.length,
    attributed,
    skipped,
    commissionC,
  };
}

type Coach = {
  id: string;
  code: string;
  rate: string;
  customerDiscountRate: string;
  status: string;
};

/** Returns the commission in cents, or null if the order isn't attributable. */
async function applyOrder(
  order: ShopifyOrder,
  byCode: Map<string, Coach>,
  byId: Map<string, Coach>,
): Promise<number | null> {
  const database = db();
  const orderId = gidToId(order.id);

  /* Attribution precedence: a code on the order beats everything, then the
     12-month customer carry-over, then nothing. */
  const usedCode = order.discountCodes
    .map((c) => c.toUpperCase())
    .find((c) => byCode.has(c));

  let coach: Coach | undefined;
  let attribution: "discount_code" | "customer_carryover";

  if (usedCode) {
    coach = byCode.get(usedCode);
    attribution = "discount_code";
  } else {
    const customerId = order.customer?.id
      ? gidToId(order.customer.id)
      : null;
    if (!customerId) return null;

    const [link] = await database
      .select({
        trainerId: referredCustomers.trainerId,
        expiresAt: referredCustomers.expiresAt,
      })
      .from(referredCustomers)
      .where(eq(referredCustomers.shopifyCustomerId, customerId))
      .limit(1);

    if (!link) return null;
    if (link.expiresAt.getTime() < new Date(order.processedAt).getTime())
      return null;

    coach = byId.get(link.trainerId);
    attribution = "customer_carryover";
  }

  if (!coach || coach.status === "closed") return null;

  /* Record the customer link on the first coded order, so renewals and
     forgotten-the-code repeat purchases still pay out. */
  if (attribution === "discount_code" && order.customer?.id) {
    const customerId = gidToId(order.customer.id);
    const firstSeen = new Date(order.processedAt);
    const expiresAt = new Date(firstSeen);
    expiresAt.setMonth(expiresAt.getMonth() + CARRY_OVER_MONTHS);

    await database
      .insert(referredCustomers)
      .values({
        shopifyCustomerId: customerId,
        trainerId: coach.id,
        firstOrderId: orderId,
        firstSeenAt: firstSeen,
        expiresAt,
      })
      .onConflictDoNothing();
  }

  const subtotalC = moneyToCents(
    order.currentSubtotalPriceSet.shopMoney.amount,
  );
  const rate = Number.parseFloat(coach.rate);
  const clientDiscount = Number.parseFloat(coach.customerDiscountRate);

  const cancelled = Boolean(order.cancelledAt);
  const financial = (order.displayFinancialStatus ?? "").toUpperCase();

  const commissionC = cancelled
    ? 0
    : commissionForOrder({
        subtotalC,
        codeApplied: attribution === "discount_code",
        commissionRate: rate,
        clientDiscount,
      });

  const commissionableC =
    attribution === "discount_code"
      ? Math.round(subtotalC / (1 - clientDiscount))
      : subtotalC;

  const processedAt = new Date(order.processedAt);
  const payableFrom = new Date(processedAt);
  payableFrom.setDate(payableFrom.getDate() + HOLD_DAYS);

  const orderStatus = cancelled
    ? "cancelled"
    : financial === "REFUNDED"
      ? "refunded"
      : financial === "PARTIALLY_REFUNDED"
        ? "partially_refunded"
        : "paid";

  const isRecurring = order.lineItems.nodes.some((l) => l.sellingPlan !== null);

  const row = {
    shopifyOrderId: orderId,
    shopifyOrderGid: order.id,
    orderName: order.name,
    trainerId: coach.id,
    attribution,
    discountCode: usedCode ?? null,
    processedAt,
    currency: order.currentSubtotalPriceSet.shopMoney.currencyCode,
    subtotalC,
    commissionableC: cancelled ? 0 : commissionableC,
    commissionRate: coach.rate,
    commissionC,
    orderStatus,
    isRecurring,
    payableFrom: payableFrom.toISOString().slice(0, 10),
    lastSyncedAt: new Date(),
  };

  /* Never rewrite a row that has already been paid out. The difference is
     handled as a clawback so settled statements stay true. */
  await database
    .insert(referredOrders)
    .values(row)
    .onConflictDoUpdate({
      target: referredOrders.shopifyOrderId,
      set: {
        orderName: row.orderName,
        subtotalC: row.subtotalC,
        commissionableC: row.commissionableC,
        commissionC: row.commissionC,
        orderStatus: row.orderStatus,
        isRecurring: row.isRecurring,
        lastSyncedAt: row.lastSyncedAt,
      },
      setWhere: sql`${referredOrders.payoutId} is null`,
    });

  return commissionC;
}

async function readCursor(): Promise<Date | null> {
  const [row] = await db()
    .select({ value: syncState.value })
    .from(syncState)
    .where(eq(syncState.key, CURSOR_KEY))
    .limit(1);

  const at = row?.value?.at;
  return typeof at === "string" ? new Date(at) : null;
}

async function writeCursor(at: Date): Promise<void> {
  await db()
    .insert(syncState)
    .values({ key: CURSOR_KEY, value: { at: at.toISOString() } })
    .onConflictDoUpdate({
      target: syncState.key,
      set: { value: { at: at.toISOString() } },
    });
}
