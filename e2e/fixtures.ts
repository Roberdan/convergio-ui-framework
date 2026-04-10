/**
 * Playwright custom fixtures for Convergio E2E tests.
 *
 * Provides: authenticatedPage, apiMock, themeHelper, localeHelper.
 * Import `test` and `expect` from this file instead of @playwright/test.
 */
import { test as base, expect, type Page, type Route } from "@playwright/test";
import { SESSION_COOKIE } from "./helpers";

/* ── Types ── */

type Theme = "light" | "dark" | "navy" | "colorblind";

interface ThemeHelper {
  set(theme: Theme): Promise<void>;
  get(): Promise<Theme>;
  waitFor(theme: Theme): Promise<void>;
}

interface LocaleHelper {
  /** Override a locale namespace key for testing. */
  override(ns: string, key: string, value: string): Promise<void>;
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
  localeHelper: LocaleHelper;
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
          const html = document.documentElement;
          html.setAttribute("data-theme", t);
          if (t === "dark" || t === "navy" || t === "colorblind") {
            html.classList.add("dark");
          } else {
            html.classList.remove("dark");
          }
        }, theme);
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

  localeHelper: async ({ page }, use) => {
    const helper: LocaleHelper = {
      async override(ns: string, key: string, value: string) {
        await page.evaluate(
          ({ ns, key, value }) => {
            const existing = JSON.parse(
              localStorage.getItem("__test_locale_overrides__") || "{}"
            );
            if (!existing[ns]) existing[ns] = {};
            existing[ns][key] = value;
            localStorage.setItem(
              "__test_locale_overrides__",
              JSON.stringify(existing)
            );
          },
          { ns, key, value }
        );
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
        await helper.mockRoute("/api/health", { status: "ok", version: "test" });
        await helper.mockRoute("/api/agents/catalog", []);
        await helper.mockRoute("/api/plan-db/json/*", { plans: [] });
        await helper.mockRoute("/api/orgs", []);
        await helper.mockRoute("/api/mesh/status", { peers: [] });
        await helper.mockRoute("/api/inference/status", { models: [] });
        await helper.mockRoute("/api/observatory/timeline", { events: [] });
        await helper.mockRoute("/api/billing/overview", { total: 0 });
        await helper.mockRoute("/api/night-agents", []);
        await helper.mockRoute("/api/prompts", []);
        await helper.mockRoute("/api/metrics", {});
      },
    };
    await use(helper);
  },
});

export { expect };
