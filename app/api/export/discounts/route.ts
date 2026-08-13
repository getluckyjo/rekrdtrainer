import { NextRequest } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import { trainers } from "@/lib/db/schema";
import { isShopifyConfigured } from "@/lib/shopify/client";
import { listDiscountCodes } from "@/lib/shopify/discounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Every discount code in the Shopify store, for a second tab in the same live
 * sheet as the coach roster.
 *
 * Shopify is the source of truth here, not our database: a code minted by hand
 * in the admin, or a coach code someone deleted there, only shows up if we ask
 * Shopify. Coach codes are then matched back against `trainers` so the sheet
 * can tell a programme code from a promo at a glance.
 *
 * Shares EXPORT_SECRET with the coach roster — same sheet, same audience, and
 * one token to rotate rather than two.
 */

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  const safe = s.startsWith("=") ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

const HEADERS = [
  "Code",
  "Belongs to",
  "Coach name",
  "Discount",
  "Type",
  "Status",
  "Times used",
  "Usage limit",
  "Starts",
  "Ends",
  "Title in Shopify",
];

export async function GET(req: NextRequest) {
  const secret = process.env.EXPORT_SECRET;
  if (!secret) {
    return new Response("EXPORT_SECRET is not set.", { status: 503 });
  }
  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (provided !== secret) {
    return new Response("Unauthorised.", { status: 401 });
  }

  if (!isShopifyConfigured()) {
    return new Response("Shopify is not configured.", { status: 503 });
  }

  let codes;
  try {
    codes = await listDiscountCodes();
  } catch (err) {
    console.error("[export/discounts] Shopify listing failed", err);
    return new Response("Could not reach Shopify.", { status: 502 });
  }

  /* Match on the code itself rather than the stored GID: a code recreated by
     hand in the admin gets a new GID but is still that coach's code. */
  const coachByCode = new Map<string, string>();
  if (isDbConfigured()) {
    const rows = await db()
      .select({ code: trainers.discountCode, name: trainers.fullName })
      .from(trainers);
    for (const r of rows) coachByCode.set(r.code.toUpperCase(), r.name);
  }

  const day = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

  /* Coach codes first, then by heaviest use — the rows worth looking at end up
     at the top rather than in Shopify's creation order. */
  const sorted = [...codes].sort((a, b) => {
    const ac = coachByCode.has(a.code.toUpperCase()) ? 0 : 1;
    const bc = coachByCode.has(b.code.toUpperCase()) ? 0 : 1;
    return ac - bc || b.timesUsed - a.timesUsed || a.code.localeCompare(b.code);
  });

  const body = [
    HEADERS.map(csvCell).join(","),
    ...sorted.map((d) => {
      const coach = coachByCode.get(d.code.toUpperCase());
      return [
        d.code,
        coach ? "Coach" : "Other",
        coach ?? "",
        d.value,
        d.kind,
        d.status,
        d.timesUsed,
        d.usageLimit ?? "no limit",
        day(d.startsAt),
        day(d.endsAt) || "no end date",
        d.title,
      ]
        .map(csvCell)
        .join(",");
    }),
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
