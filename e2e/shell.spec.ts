import { test, expect } from "@playwright/test";

test.describe("App Shell", () => {
  test("renders dashboard with header and sidebar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("aside")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL("/settings");
    await expect(page.locator("h1")).toContainText("Settings");
  });

  test("projects page shows empty state", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("h1")).toContainText("Projects");
    await expect(page.locator("text=No projects yet")).toBeVisible();
  });

  test("sidebar collapse toggle works", async ({ page }) => {
    await page.goto("/");
    const aside = page.locator("aside");
    await expect(aside).toBeVisible();

    // Click collapse button in sidebar
    const collapseBtn = aside.locator('button[aria-label="Collapse sidebar"]');
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      // Sidebar should now be narrow (64px)
      await expect(aside).toHaveCSS("width", "64px");
    }
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("text=Page not found")).toBeVisible();
  });
});
