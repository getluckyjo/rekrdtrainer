import { NextResponse, type NextRequest } from "next/server";
import { SITE_COOKIE, hasSitePass, isOpenPath } from "@/lib/siteGate";

/**
 * Sends anyone without the site password to /unlock, and brings them back to
 * the page they asked for afterwards. What stays open, and why, is in
 * lib/siteGate.ts.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isOpenPath(pathname)) return NextResponse.next();
  if (await hasSitePass(req.cookies.get(SITE_COOKIE)?.value)) {
    return NextResponse.next();
  }

  // A fetch() can't do anything useful with a redirect to a form.
  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Password required." }, { status: 401 });
  }

  const unlock = new URL("/unlock", req.url);
  const back = req.nextUrl.clone();
  // The RSC payload marker from a client-side navigation isn't a page.
  back.searchParams.delete("_rsc");
  if (back.pathname !== "/" || back.search) {
    unlock.searchParams.set("next", `${back.pathname}${back.search}`);
  }
  return NextResponse.redirect(unlock);
}

export const config = {
  // Build output and public images carry nothing worth hiding, and the
  // unlock page needs its fonts and logo before anyone has the password.
  matcher: [
    "/((?!_next/|__nextjs|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
