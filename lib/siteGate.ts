/**
 * The shared password in front of the site.
 *
 * The programme's legal position is that this site is not consumer-facing —
 * it trains ambassadors, it doesn't advertise to their clients. A password
 * makes that true in practice and not only on paper.
 *
 * It is one shared key, not an account. An ambassador's own identity is still
 * the magic link in lib/auth.ts; this only decides who may look at all.
 *
 * The key lives in SITE_PASSWORD and never in the code, because this repo is
 * public. Unset means locked, not open: a gate that silently lets everyone in
 * when a variable goes missing is worse than no gate, because nobody notices.
 *
 * The cookie holds a hash of the password rather than the password, so
 * changing SITE_PASSWORD signs every browser out on its next request.
 *
 * Pure apart from reading the environment, so proxy.ts can run it before a
 * route renders and the tests can run it without Next.
 */

export const SITE_COOKIE = "rekrd_site";
export const SITE_COOKIE_DAYS = 30;

/** Where someone lands after unlocking when they weren't headed anywhere. */
export const HOME = "/ambassadors";

/**
 * Paths that answer without the password. Each has its own guard, or must
 * have none. Anything not listed here is behind the gate.
 */
const OPEN_PATHS = [
  // The gate itself.
  "/unlock",
  // The vanity link on every printed QR card and in every bio. The people
  // following it are clients, who never get the password. Gating this
  // breaks every card already printed.
  "/t",
  // Vercel Cron. CRON_SECRET.
  "/api/cron",
  // Google Sheets IMPORTDATA. EXPORT_SECRET.
  "/api/export",
  // Welcome-email resends. ADMIN_SECRET.
  "/api/admin",
];

export function isOpenPath(pathname: string): boolean {
  return OPEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isSiteGateConfigured(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

/** True when the cookie value was minted from the current SITE_PASSWORD. */
export async function hasSitePass(cookie: string | undefined): Promise<boolean> {
  const expected = await currentPass();
  return Boolean(expected && cookie && constantTimeEqual(cookie, expected));
}

/**
 * The cookie value to set when `candidate` is the password, otherwise null.
 *
 * Surrounding whitespace is forgiven — phone keyboards append a space after
 * an autocompleted word — but case is not.
 */
export async function checkSitePassword(
  candidate: string,
): Promise<string | null> {
  const expected = await currentPass();
  if (!expected) return null;
  const given = await passFor(candidate.trim());
  return constantTimeEqual(given, expected) ? expected : null;
}

/**
 * Where to send someone once they're in. `next` arrives in a query string, so
 * it is attacker-controlled: anything that would leave this origin — "//evil",
 * "/\evil", a smuggled tab or newline — falls back to HOME, as does the gate
 * itself, which would only loop.
 */
export function safeNext(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/")) return HOME;

  const base = "https://gate.invalid";
  let url: URL;
  try {
    url = new URL(raw, base);
  } catch {
    return HOME;
  }
  if (url.origin !== base || isGatePath(url.pathname)) return HOME;

  return `${url.pathname}${url.search}${url.hash}`;
}

function isGatePath(pathname: string): boolean {
  return pathname === "/unlock" || pathname.startsWith("/unlock/");
}

async function currentPass(): Promise<string | null> {
  const password = process.env.SITE_PASSWORD;
  return password ? passFor(password) : null;
}

async function passFor(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`rekrd-site:v1:${password}`),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
