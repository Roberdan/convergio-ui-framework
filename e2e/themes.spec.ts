import { test, expect } from "@playwright/test";

const THEMES = ["light", "dark", "navy", "colorblind"] as const;

test.describe("Themes", () => {
  for (const theme of THEMES) {
    test(`${theme} theme renders correctly`, async ({ page }) => {
      await page.goto("/");

      // Set theme via localStorage and reload
      await page.evaluate((t) => {
        localStorage.setItem("convergio-theme", t);
      }, theme);
      await page.reload();

      // Wait for React hydration to apply theme
      await expect(page.locator(`html[data-theme="${theme}"]`)).toBeAttached({ timeout: 5000 });

      // Verify page renders — header and content visible
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
    });
  }

  test("search trigger is visible on desktop", async ({ page }) => {
    await page.goto("/");
    // Verify the search area exists in the header
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByText("Search...")).toBeVisible();
  });
});
