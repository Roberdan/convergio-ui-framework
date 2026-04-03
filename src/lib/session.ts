import { cookies } from "next/headers";

/**
 * HMAC-signed session cookie utilities.
 *
 * Signs session values with SESSION_SECRET env var using Web Crypto.
 * Format: `value.signature` where signature is hex-encoded HMAC-SHA256.
 */

const COOKIE_NAME = "session";
const ALGORITHM = { name: "HMAC", hash: "SHA-256" } as const;

/**
 * Return the session signing secret.
 * Falls back to a dev-only default — in production, always set SESSION_SECRET.
 */
function getSecret(): string {
  return process.env.SESSION_SECRET ?? "convergio-dev-secret";
}

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    ALGORITHM,
    false,
    ["sign", "verify"],
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** Sign a value and return `value.signature`. */
export async function signValue(value: string): Promise<string> {
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return `${value}.${toHex(sig)}`;
}

/** Verify a signed cookie string. Returns the value if valid, null otherwise. */
export async function verifyValue(signed: string): Promise<string | null> {
  const dotIdx = signed.lastIndexOf(".");
  if (dotIdx < 1) return null;
  const value = signed.substring(0, dotIdx);
  const sig = signed.substring(dotIdx + 1);
  if (!sig || sig.length < 16) return null;

  const key = await importKey(getSecret());
  const sigBytes = fromHex(sig);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes.buffer as ArrayBuffer,
    new TextEncoder().encode(value),
  );
  return valid ? value : null;
}

/** Set a signed session cookie. */
export async function setSessionCookie(value: string): Promise<void> {
  const signed = await signValue(value);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signed, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/** Read and verify the session cookie. Returns value or null. */
export async function getSessionValue(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifyValue(cookie.value);
}

/** Delete the session cookie. */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
