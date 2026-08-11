/**
 * Discount code generation and validation.
 *
 * Codes are the attribution mechanism, the client's incentive and the thing a
 * coach says out loud in a gym — so they have to be memorable, unguessable by
 * coupon scrapers, and impossible to mistake for an official REKRD promo.
 */

export const CODE_MIN = 3;
export const CODE_MAX = 12;

/**
 * Reserved words. Two jobs: stop a coach code impersonating the brand or a
 * store campaign, and stop codes being guessable — a scraped code turns
 * organic sales into commission payouts.
 */
const RESERVED = new Set([
  "ADMIN",
  "BONUS",
  "CHECKOUT",
  "CLEAN",
  "COACH",
  "DEAL",
  "DISCOUNT",
  "FREE",
  "GIFT",
  "HELLO",
  "HYDRATE",
  "LAUNCH",
  "OFFER",
  "PROMO",
  "REFER",
  "SALE",
  "SAVE",
  "SHOP",
  "STAFF",
  "SUMMER",
  "SUPPORT",
  "TEST",
  "TRIAL",
  "VIP",
  "VOUCHER",
  "WELCOME",
  "WINTER",
]);

/** Substrings that are never allowed anywhere in a code. */
const BANNED_SUBSTRINGS = ["REKRD", "REKORD", "RECORD", "SAHPRA"];

const PROFANITY = [
  "FUCK",
  "SHIT",
  "CUNT",
  "DICK",
  "COCK",
  "PISS",
  "TWAT",
  "WANK",
  "KAK",
  "POES",
  "NAAI",
  "DOOS",
  "MOER",
  "BITCH",
  "NIGG",
  "RAPE",
  "NAZI",
  "HITLER",
];

export type CodeIssue =
  | "empty"
  | "too-short"
  | "too-long"
  | "invalid-chars"
  | "reserved"
  | "profanity";

/** Uppercase, strip everything that isn't A-Z or 0-9, clamp the length. */
export function normaliseCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_MAX);
}

export function validateCode(raw: string): CodeIssue | null {
  const code = normaliseCode(raw);

  if (!code) return "empty";
  if (code.length < CODE_MIN) return "too-short";
  if (code.length > CODE_MAX) return "too-long";
  if (!/^[A-Z0-9]+$/.test(code)) return "invalid-chars";
  if (/^\d+$/.test(code)) return "invalid-chars"; // all-numeric reads as a typo
  if (RESERVED.has(code)) return "reserved";
  if (BANNED_SUBSTRINGS.some((s) => code.includes(s))) return "reserved";
  if (PROFANITY.some((s) => code.includes(s))) return "profanity";

  return null;
}

export const CODE_ISSUE_MESSAGE: Record<CodeIssue, string> = {
  empty: "Pick a code",
  "too-short": `At least ${CODE_MIN} characters`,
  "too-long": `At most ${CODE_MAX} characters`,
  "invalid-chars": "Letters and numbers only",
  reserved: "That one's reserved",
  profanity: "Pick something else",
};

/** "Thandi Mokoena" -> ["THANDI", "THANDIM", "THANDIMO", "THANDIMOKOENA"]. */
export function suggestFromName(fullName: string): string[] {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean);

  if (parts.length === 0) return [];

  const first = normaliseCode(parts[0]);
  if (!first) return [];

  const out: string[] = [first];

  const last = parts.length > 1 ? normaliseCode(parts[parts.length - 1]) : "";
  if (last) {
    // Surname-derived before numeric: a number in your code feels like a
    // consolation prize.
    out.push(normaliseCode(first + last.slice(0, 1)));
    out.push(normaliseCode(first + last.slice(0, 2)));
    out.push(normaliseCode(first + last));
  }

  return dedupe(out.filter((c) => validateCode(c) === null));
}

/**
 * Next candidates when a code is taken. Surname variants first, then numbers,
 * and only then a random suffix.
 */
export function nextCandidates(
  desired: string,
  fullName: string,
  attempt: number,
): string[] {
  const base = normaliseCode(desired);
  const fromName = suggestFromName(fullName).filter((c) => c !== base);

  const numeric = [2, 3, 4, 5].map((n) =>
    normaliseCode(base.slice(0, CODE_MAX - String(n).length) + n),
  );

  const candidates = dedupe([...fromName, ...numeric]).filter(
    (c) => validateCode(c) === null,
  );

  if (attempt >= candidates.length) return [randomCode()];
  return candidates.slice(attempt);
}

/**
 * Last-resort fallback. Crockford base32 without I, L, O and U so a coach
 * reading it aloud in a gym can't be misheard.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function randomCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "RK";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

function dedupe(xs: string[]): string[] {
  return [...new Set(xs)];
}

/** The link a coach shares. Shopify applies the code for the session. */
export function shopifyDiscountLink(code: string, redirectPath?: string): string {
  const base = `https://shop.rekrd.io/discount/${encodeURIComponent(code)}`;
  return redirectPath
    ? `${base}?redirect=${encodeURIComponent(redirectPath)}`
    : base;
}

/** The vanity link we print and put in bios. Redirects to the above. */
export function vanityLink(code: string, origin = "https://coach.rekrd.io") {
  return `${origin.replace(/\/$/, "")}/t/${code}`;
}
