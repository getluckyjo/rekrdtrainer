import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { linkClicks, trainers } from "@/lib/db/schema";
import { normaliseCode, shopifyDiscountLink } from "@/lib/codes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The vanity link a coach prints and puts in their bio.
 *
 * The click log exists so a coach can see "142 clicks → 11 orders", which is a
 * powerful motivator. It is NEVER the attribution source of truth — that is
 * always the discount code on the order.
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/t/[code]">) {
  const { code: raw } = await ctx.params;
  const code = normaliseCode(raw);

  const target = shopifyDiscountLink(
    code,
    process.env.SHOPIFY_PRODUCT_HANDLE
      ? `/products/${process.env.SHOPIFY_PRODUCT_HANDLE}`
      : undefined,
  );

  if (isDbConfigured() && code) {
    // Fire and forget — a slow insert must never delay the redirect.
    void logClick(code, req).catch(() => {});
  }

  return Response.redirect(target, 302);
}

async function logClick(code: string, req: NextRequest) {
  const [trainer] = await db()
    .select({ id: trainers.id })
    .from(trainers)
    .where(eq(sql`upper(${trainers.discountCode})`, code))
    .limit(1);

  if (!trainer) return;

  await db().insert(linkClicks).values({
    trainerId: trainer.id,
    referer: req.headers.get("referer")?.slice(0, 500) ?? null,
    country: req.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
  });
}
