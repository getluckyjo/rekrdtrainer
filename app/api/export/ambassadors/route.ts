import { NextRequest } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { referredOrders, trainers } from "@/lib/db/schema";
import { vanityLink } from "@/lib/codes";
import { siteOrigin } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only CSV of the coach roster, for a Google Sheet to pull with
 * IMPORTDATA(). Google's servers fetch this, so the token in the query string
 * is the only thing guarding it.
 *
 * That token is deliberately NOT CRON_SECRET. It ends up written into a
 * formula inside a shared spreadsheet, where anyone with view access can read
 * it — so it must not also unlock the order-sync endpoints. Set EXPORT_SECRET
 * to its own value and rotate it independently.
 *
 * Personal information: this returns coach names, emails and phone numbers.
 * The coaches are REKRD's own programme members, so the company is entitled to
 * the list, but the sheet it lands in should be shared with named people
 * rather than "anyone with the link".
 *
 * Deliberately absent: anything identifying a coach's *clients*. Order rows
 * are aggregated to counts and totals only, which keeps the POPIA boundary in
 * lib/db/schema.ts intact.
 */

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  /* Only "=" actually starts a formula in Sheets, and the apostrophe guard is
     inert under IMPORTDATA — it would render as a literal character rather
     than a text marker. So guard the one real case and leave the rest clean. */
  const safe = s.startsWith("=") ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Group a SA number so the sheet keeps it as text.
 *
 * IMPORTDATA gives the sheet owner no way to force a column to plain text, and
 * an ungrouped number is coerced: "+27794940119" loses its plus and
 * "0832735697" loses its leading zero, which makes it undiallable. Spaces make
 * the value unparseable as a number, so it survives intact.
 */
function formatPhone(raw: string | null): string {
  if (!raw) return "";
  const digits = raw.replace(/[^\d]/g, "");
  const local = digits.startsWith("27")
    ? `0${digits.slice(2)}`
    : digits.startsWith("0")
      ? digits
      : digits;
  return local.length === 10
    ? `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
    : raw;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}

const HEADERS = [
  "Signed up",
  "Name",
  "Email",
  "Mobile",
  "City",
  "Disciplines",
  "Gym or club",
  "Instagram",
  "Discount code",
  "Code active",
  "Client discount",
  "Share link",
  "QR & print card",
  "Status",
  "Audience size",
  "Orders",
  "Client spend (R)",
  "Commission earned (R)",
  "Marketing opt-in",
  /* Appended, never inserted: IMPORTDATA is positional, so anything added in
     the middle would silently shift every column in the live sheet. */
  "Tub due on",
  "Address",
  "Agreed on",
  "Agreement version",
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

  if (!isDbConfigured()) {
    return new Response("Database is not configured.", { status: 503 });
  }

  /* One aggregate per coach rather than a row per order — the sheet is a
     roster, and per-order detail would leak the shape of a coach's book. */
  const rows = await db()
    .select({
      createdAt: trainers.createdAt,
      fullName: trainers.fullName,
      email: trainers.email,
      phone: trainers.phone,
      city: trainers.city,
      disciplines: trainers.disciplines,
      gym: trainers.gym,
      instagram: trainers.instagram,
      discountCode: trainers.discountCode,
      shopifyDiscountGid: trainers.shopifyDiscountGid,
      customerDiscountRate: trainers.customerDiscountRate,
      status: trainers.status,
      clientBand: trainers.clientBand,
      addressLine1: trainers.addressLine1,
      addressLine2: trainers.addressLine2,
      suburb: trainers.suburb,
      postalCode: trainers.postalCode,
      acceptedTermsAt: trainers.acceptedTermsAt,
      agreementVersion: trainers.claimsCheckVersion,
      marketingOptIn: trainers.marketingOptIn,
      orderCount: sql<number>`count(${referredOrders.shopifyOrderId})`,
      subtotalC: sql<number>`coalesce(sum(${referredOrders.subtotalC}), 0)`,
      commissionC: sql<number>`coalesce(sum(${referredOrders.commissionC}), 0)`,
    })
    .from(trainers)
    .leftJoin(referredOrders, eq(referredOrders.trainerId, trainers.id))
    .groupBy(trainers.id)
    .orderBy(desc(trainers.createdAt));

  const rand = (c: number) => (Number(c) / 100).toFixed(2);

  /** 1st, 2nd, 3rd, 21st — not "21th". This lands in a sheet a client reads. */
  const ordinal = (d: number) => {
    const rem100 = d % 100;
    if (rem100 >= 11 && rem100 <= 13) return `${d}th`;
    return `${d}${["th", "st", "nd", "rd"][d % 10] ?? "th"}`;
  };
  const origin = siteOrigin();

  const body = [
    csvRow(HEADERS),
    ...rows.map((r) =>
      csvRow([
        r.createdAt?.toISOString().slice(0, 10),
        r.fullName,
        r.email,
        formatPhone(r.phone),
        r.city,
        Array.isArray(r.disciplines) ? r.disciplines.join(" / ") : "",
        r.gym,
        r.instagram ? `@${r.instagram}` : "",
        r.discountCode,
        /* A row only exists once Shopify has minted the discount — the signup
           route deletes the coach again if minting fails, rather than leaving a
           code behind with nothing behind it. So a GID plus an active status is
           the same thing as a code a client can actually type at checkout. */
        r.shopifyDiscountGid && r.status === "active" ? "yes" : "no",
        `${Math.round(Number(r.customerDiscountRate) * 100)}%`,
        vanityLink(r.discountCode, origin),
        `${origin}/ambassadors/welcome/${r.discountCode}`,
        r.status,
        r.clientBand,
        Number(r.orderCount),
        rand(r.subtotalC),
        rand(r.commissionC),
        r.marketingOptIn ? "yes" : "no",
        /* Day of month their free tub falls due, from signup — lets a monthly
           shipping run be staggered rather than done all at once. */
        r.createdAt ? ordinal(r.createdAt.getUTCDate()) : "",
        [r.addressLine1, r.addressLine2, r.suburb, r.city, r.postalCode]
          .filter(Boolean)
          .join(", "),
        r.acceptedTermsAt?.toISOString().slice(0, 10) ?? "",
        r.agreementVersion ?? "",
      ]),
    ),
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      // IMPORTDATA caches for roughly an hour regardless; this stops any
      // intermediary holding a staler copy than that.
      "cache-control": "no-store",
    },
  });
}
