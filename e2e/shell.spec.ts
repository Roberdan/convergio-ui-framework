import { test, expect } from "@playwright/test";
import { authenticate } from "./helpers";

// Set the signed session cookie so every test can access protected dashboard routes.
test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

test.describe("App Shell", () => {
  test("renders dashboard with header and sidebar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");
    const settingsLink = page.locator('a[href="/settings"]').first();
    await settingsLink.click({ timeout: 10000 });
    await expect(page).toHaveURL("/settings");
    await expect(page.locator("h1").first()).toContainText("Settings");
  });

  test("projects page loads successfully", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.locator("main").first()).toBeVisible();
  });

  test("sidebar has navigation sections", async ({ page }) => {
    await page.goto("/");
    const aside = page.locator("aside");
    await expect(aside).toBeVisible();
    await expect(aside.getByText("Dashboard")).toBeVisible();
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("text=Page not found")).toBeVisible({ timeout: 10000 });
  });
});
