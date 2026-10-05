import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import {
  SITE_COOKIE,
  SITE_COOKIE_DAYS,
  checkSitePassword,
  hasSitePass,
  isSiteGateConfigured,
  safeNext,
} from "@/lib/siteGate";
import { BRAND } from "@/lib/productFacts";
// Same box as the dashboard sign-in, so the two doors look like one house.
import s from "@/app/dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ambassadors only",
  robots: { index: false, follow: false },
};

async function unlock(form: FormData) {
  "use server";
  const next = safeNext(form.get("next"));
  const pass = await checkSitePassword(String(form.get("password") ?? ""));

  if (!pass) {
    redirect(`/unlock?wrong=1&next=${encodeURIComponent(next)}`);
  }

  const jar = await cookies();
  jar.set(SITE_COOKIE, pass, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SITE_COOKIE_DAYS * 86_400,
  });
  redirect(next);
}

export default async function UnlockPage(props: PageProps<"/unlock">) {
  const query = await props.searchParams;
  const next = safeNext(query.next);

  const jar = await cookies();
  if (await hasSitePass(jar.get(SITE_COOKIE)?.value)) redirect(next);

  const ready = isSiteGateConfigured();

  return (
    <>
      <div className="flavour-bar" />
      {/* No footer: its terms link would only lead back here. */}
      <header className="header" style={{ minHeight: "calc(100svh - 3px)" }}>
        <div className="wrap">
          <div style={{ marginBottom: 28 }}>
            <Logo height={22} />
          </div>
          <span className="kicker mono">REKRD Ambassador Programme</span>
          <h1>
            Ambassadors <span className="accent">only.</span>
          </h1>

          <div className={s.signInBox}>
            {query.wrong && (
              <p className={s.expired}>
                That&rsquo;s not it. Check the capitals — the password is
                case-sensitive.
              </p>
            )}
            <p style={{ marginBottom: 16 }}>
              This site is for REKRD ambassadors and the people we&rsquo;ve
              invited to become one. Put in the password you were given.
            </p>
            <form action={unlock} className={s.form}>
              <input type="hidden" name="next" value={next} />
              <input
                type="password"
                name="password"
                required
                aria-label="Password"
                placeholder="Password"
                className={s.input}
                autoComplete="current-password"
                autoCapitalize="none"
                autoFocus
              />
              <button className="btn" type="submit" disabled={!ready}>
                {ready ? "Let me in" : "Not switched on yet"}
              </button>
            </form>
          </div>

          <p style={{ marginTop: 26, fontSize: 14, color: "var(--ink-soft)" }}>
            Don&rsquo;t have it? Email{" "}
            <a href={`mailto:${BRAND.partnerEmail}`}>{BRAND.partnerEmail}</a>{" "}
            and we&rsquo;ll send it to you.
          </p>
        </div>
      </header>
    </>
  );
}
