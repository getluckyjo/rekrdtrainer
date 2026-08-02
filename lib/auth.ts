import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Magic-link auth. No passwords, because a coach signs in perhaps monthly and
 * a password they'd have to remember is a support ticket waiting to happen.
 */

const COOKIE = "rekrd_coach";
const SESSION_DAYS = 30;
const LINK_MINUTES = 20;

function secret(): Uint8Array {
  const value = process.env.DASHBOARD_JWT_SECRET;
  if (!value) throw new Error("DASHBOARD_JWT_SECRET is not set.");
  return new TextEncoder().encode(value);
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.DASHBOARD_JWT_SECRET);
}

/** Short-lived, single purpose: prove you can read that inbox. */
export async function signMagicToken(trainerId: string): Promise<string> {
  return new SignJWT({ sub: trainerId, purpose: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${LINK_MINUTES}m`)
    .sign(secret());
}

export async function signSessionToken(trainerId: string): Promise<string> {
  return new SignJWT({ sub: trainerId, purpose: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

async function verify(
  token: string,
  purpose: "magic" | "session",
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.purpose !== purpose) return null;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export const verifyMagicToken = (t: string) => verify(t, "magic");

export async function setSessionCookie(trainerId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, await signSessionToken(trainerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** The trainer id for the current request, or null. */
export async function getSession(): Promise<string | null> {
  if (!isAuthConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return token ? verify(token, "session") : null;
}
