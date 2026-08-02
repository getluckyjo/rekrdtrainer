import { clearSessionCookie } from "@/lib/auth";
import { siteOrigin } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearSessionCookie();
  return Response.redirect(new URL("/dashboard", siteOrigin()), 303);
}
