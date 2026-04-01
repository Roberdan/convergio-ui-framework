import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    {
      name: "session",
      value: "authenticated",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
});

const THEMES = ["light", "dark", "navy", "colorblind"] as const;

test.describe("Themes", () => {
  for (const theme of THEMES) {
    test(`${theme} theme renders correctly`, async ({ page }) => {
      await page.addInitScript((t) => {
        localStorage.setItem("convergio-theme", t);
      }, theme);

      await page.goto("/");

      // Wait for React to hydrate and apply theme from localStorage
      await expect(page.locator(`html[data-theme="${theme}"]`)).toBeAttached({ timeout: 5000 });

      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("search trigger is visible on desktop", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByText("Search...")).toBeVisible();
  });
});
