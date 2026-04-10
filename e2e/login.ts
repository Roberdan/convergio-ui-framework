/**
 * Login flow helper for Convergio E2E tests.
 *
 * Provides a full browser login flow (form submission) and
 * a fast cookie-based authentication for tests that don't test login itself.
 */
import type { Page, BrowserContext } from "@playwright/test";
import { SESSION_COOKIE } from "./helpers";

/** Authenticate via cookie injection (fast, no UI interaction). */
export async function authenticateViaCookie(context: BrowserContext): Promise<void> {
  await context.addCookies([SESSION_COOKIE]);
}

/** Perform full login flow through the UI. */
export async function loginViaUI(
  page: Page,
  username = "admin",
  password = "admin"
): Promise<void> {
  await page.goto("/login");
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/", { timeout: 10_000 });
}
