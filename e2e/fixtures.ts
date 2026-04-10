/**
 * Playwright custom fixtures for Convergio E2E tests.
 *
 * Provides: authenticatedPage, apiMock, themeHelper.
 * Import `test` and `expect` from this file instead of @playwright/test.
 */
import { test as base, expect, type Page, type Route } from "@playwright/test";
import { SESSION_COOKIE } from "./helpers";

/* ── Types ── */

type Theme = "light" | "dark" | "navy" | "colorblind";

interface ThemeHelper {
  /** Set theme via localStorage + page reload (goes through ThemeProvider). */
  set(theme: Theme): Promise<void>;
  get(): Promise<Theme>;
  waitFor(theme: Theme): Promise<void>;
}

interface ApiMock {
  /** Mock a daemon API route with a JSON response. */
  mockRoute(path: string, body: unknown, status?: number): Promise<void>;
  /** Mock all common daemon API routes with safe defaults. */
  mockDefaults(): Promise<void>;
}

/* ── Fixtures ── */

export const test = base.extend<{
  authenticatedPage: Page;
  themeHelper: ThemeHelper;
  apiMock: ApiMock;
}>({
  authenticatedPage: async ({ page, context }, use) => {
    await context.addCookies([SESSION_COOKIE]);
    await use(page);
  },

  themeHelper: async ({ page }, use) => {
    const helper: ThemeHelper = {
      async set(theme: Theme) {
        await page.evaluate((t) => {
          localStorage.setItem("convergio-theme", t);
        }, theme);
        await page.reload();
        await helper.waitFor(theme);
      },

      async get(): Promise<Theme> {
        return page.evaluate(() => {
          return (document.documentElement.getAttribute("data-theme") ?? "navy") as Theme;
        });
      },

      async waitFor(theme: Theme) {
        await expect(page.locator(`html[data-theme="${theme}"]`)).toBeAttached({
          timeout: 5_000,
        });
      },
    };
    await use(helper);
  },

  apiMock: async ({ page }, use) => {
    const DAEMON_BASE = "http://localhost:8420";

    const helper: ApiMock = {
      async mockRoute(path: string, body: unknown, status = 200) {
        await page.route(`${DAEMON_BASE}${path}`, (route: Route) =>
          route.fulfill({
            status,
            contentType: "application/json",
            body: JSON.stringify(body),
          })
        );
      },

      async mockDefaults() {
        await helper.mockRoute("/api/health", { status: "ok", timestamp: new Date().toISOString() });
        await helper.mockRoute("/api/health/deep", { status: "ok", components: [] });
        await helper.mockRoute("/api/agents/runtime", { active_agents: [], discovered_agents: [], queue_depth: 0, total_spent_usd: 0, total_budget_usd: 0, delegations_active: 0, stale_count: 0 });
        await helper.mockRoute("/api/agents/catalog", { agents: [], ok: true });
        await helper.mockRoute("/api/agents**", []);
        await helper.mockRoute("/api/orgs", []);
        await helper.mockRoute("/api/inference/costs**", { costs: [] });
        await helper.mockRoute("/api/metrics", { metrics: [] });
        await helper.mockRoute("/api/observatory/timeline**", []);
        await helper.mockRoute("/api/night-agents", []);
      },
    };
    await use(helper);
  },
});

export { expect };
