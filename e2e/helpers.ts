import { createHmac } from "node:crypto";
import { Page, BrowserContext } from "@playwright/test";

const DEV_SESSION_SECRET = "convergio-dev-secret";
const SESSION_VALUE = "authenticated";

/**
 * Sign a session value with HMAC-SHA256, matching `src/lib/session.ts`.
 *
 * Secret resolution:
 *   E2E_SESSION_SECRET ?? SESSION_SECRET ?? dev fallback (non-prod only)
 *
 * Throws when NODE_ENV === "production" and no explicit secret is provided,
 * mirroring the production guard in src/lib/session.ts.
 */
function signE2EValue(value: string): string {
  const secret =
    process.env.E2E_SESSION_SECRET ?? process.env.SESSION_SECRET ?? "";
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret === DEV_SESSION_SECRET) {
      throw new Error(
        "E2E_SESSION_SECRET / SESSION_SECRET must be set to a non-default value in production",
      );
    }
    return `${value}.${createHmac("sha256", secret).update(value).digest("hex")}`;
  }
  const effective = secret || DEV_SESSION_SECRET;
  return `${value}.${createHmac("sha256", effective).update(value).digest("hex")}`;
}

/** HMAC-signed session cookie computed at test boot from env-supplied secret. */
export const SESSION_COOKIE = {
  name: "session",
  value: signE2EValue(SESSION_VALUE),
  domain: "127.0.0.1",
  path: "/",
  httpOnly: true,
  sameSite: "Lax" as const,
};

/** Set authenticated session cookie on the browser context. */
export async function authenticate(context: BrowserContext) {
  await context.addCookies([SESSION_COOKIE]);
}

/** Cheap reachability probe for the Convergio daemon. */
export async function isDaemonReachable(
  url = process.env.CONVERGIO_DAEMON_URL ?? "http://localhost:8420",
  timeoutMs = 1000,
): Promise<boolean> {
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    const res = await fetch(`${url}/health`, { signal: ac.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/** Infrastructure error filter for console noise. */
export function isInfraError(msg: string): boolean {
  return (
    msg.includes("webpack-hmr") ||
    msg.includes("_next/webpack") ||
    msg.includes("favicon") ||
    msg.includes("hydration") ||
    msg.includes("ERR_CONNECTION_REFUSED") ||
    msg.includes("ERR_FAILED") ||
    msg.includes("CORS policy") ||
    msg.includes("Access-Control-Allow-Origin") ||
    msg.includes("access control checks") ||
    msg.includes("Failed to fetch") ||
    msg.includes("fetch") && msg.includes("localhost:8420") ||
    msg.includes("localhost:8420") ||
    msg.includes("a2ui") ||
    msg.includes("net::ERR") ||
    msg.includes("attribute points: Expected number") ||
    msg.includes("Failed to load resource")
  );
}

export interface PageIssue {
  type: "pageerror" | "console.error" | "error-boundary" | "blank-page";
  message: string;
}

export async function collectPageIssues(page: Page): Promise<PageIssue[]> {
  const issues: PageIssue[] = [];

  page.on("pageerror", (err) => {
    if (!isInfraError(err.message)) {
      issues.push({ type: "pageerror", message: err.message });
    }
  });

  page.on("console", (msg) => {
    if (msg.type() === "error" && !isInfraError(msg.text())) {
      issues.push({ type: "console.error", message: msg.text() });
    }
  });

  return issues;
}

export async function checkErrorBoundary(page: Page): Promise<PageIssue[]> {
  const issues: PageIssue[] = [];
  const body = await page.locator("body").textContent();

  if (body?.includes("Something went wrong")) {
    issues.push({
      type: "error-boundary",
      message: "Error boundary triggered: 'Something went wrong'",
    });
  }

  if (body?.includes("undefined is not an object")) {
    issues.push({
      type: "error-boundary",
      message: "Runtime error visible: 'undefined is not an object'",
    });
  }

  if (!body || body.trim().length < 20) {
    issues.push({
      type: "blank-page",
      message: `Page appears blank (body length: ${body?.trim().length ?? 0})`,
    });
  }

  return issues;
}
