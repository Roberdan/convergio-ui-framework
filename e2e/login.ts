/**
 * Login flow helper for Convergio E2E tests.
 *
 * Provides a full browser login flow (form submission) and
 * re-exports the fast cookie-based authentication from helpers.
 */
import type { Page } from "@playwright/test";
import { authenticate } from "./helpers";

/** Authenticate via cookie injection (fast, no UI interaction). */
export const authenticateViaCookie = authenticate;

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
