import { NextRequest } from "next/server";
import { setSessionCookie, verifyMagicToken } from "@/lib/auth";
import { siteOrigin } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const trainerId = token ? await verifyMagicToken(token) : null;

  if (!trainerId) {
    return Response.redirect(new URL("/dashboard?expired=1", siteOrigin()), 303);
  }

  await setSessionCookie(trainerId);
  return Response.redirect(new URL("/dashboard", siteOrigin()), 303);
}
