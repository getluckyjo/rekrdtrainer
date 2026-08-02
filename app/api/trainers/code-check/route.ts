import { NextRequest } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { trainers } from "@/lib/db/schema";
import { normaliseCode, validateCode } from "@/lib/codes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Crude in-memory limiter. Enough to stop a browser loop or a lazy scraper;
   swap for Upstash if this ever runs on more than a couple of instances. */
const HITS = new Map<string, { n: number; resetAt: number }>();
const LIMIT = 40;
const WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = HITS.get(ip);

  if (!entry || now > entry.resetAt) {
    HITS.set(ip, { n: 1, resetAt: now + WINDOW_MS });
    if (HITS.size > 5_000) {
      for (const [k, v] of HITS) if (now > v.resetAt) HITS.delete(k);
    }
    return false;
  }

  entry.n += 1;
  return entry.n > LIMIT;
}

/**
 * Availability is advisory. The unique index on trainers.discount_code is the
 * real gate — see the 409 path in POST /api/trainers.
 *
 * Returns a boolean and nothing else, so this can't be used to enumerate the
 * live code list.
 */
export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (rateLimited(ip)) {
    return Response.json({ available: false }, { status: 429 });
  }

  const code = normaliseCode(req.nextUrl.searchParams.get("code") ?? "");

  if (validateCode(code)) {
    return Response.json({ available: false, suggestions: [] });
  }

  if (!isDbConfigured()) {
    // Before Supabase is wired up, don't block a coach on a check we can't do.
    return Response.json({ available: true, suggestions: [] });
  }

  try {
    const [existing] = await db()
      .select({ id: trainers.id })
      .from(trainers)
      .where(eq(sql`upper(${trainers.discountCode})`, code))
      .limit(1);

    return Response.json({ available: !existing, suggestions: [] });
  } catch {
    return Response.json({ available: true, suggestions: [] });
  }
}
