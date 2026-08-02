import type { NextRequest } from "next/server";

/** Returns a Response when the caller isn't allowed, or null when it is. */
export function checkCronAuth(req: NextRequest): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not set." }, { status: 503 });
  }

  // Vercel Cron sends the secret as a bearer token.
  if (req.headers.get("authorization") === `Bearer ${secret}`) return null;

  // Manual runs during setup and end-to-end verification.
  if (req.nextUrl.searchParams.get("secret") === secret) return null;

  return Response.json({ error: "Unauthorised." }, { status: 401 });
}
