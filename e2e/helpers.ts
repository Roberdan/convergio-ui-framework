import { Page, BrowserContext } from "@playwright/test";

/** HMAC-signed session cookie for dev secret. */
export const SESSION_COOKIE = {
  name: "session",
  value: "authenticated.955738395f27445701db7db7c5262d188f16b7d76d4abaea47905d75a1a960f1",
  domain: "127.0.0.1",
  path: "/",
  httpOnly: true,
  sameSite: "Lax" as const,
};

/** Set authenticated session cookie on the browser context. */
export async function authenticate(context: BrowserContext) {
  await context.addCookies([SESSION_COOKIE]);
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
