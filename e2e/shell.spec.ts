import { test, expect } from "@playwright/test";

// Set the session cookie so every test can access protected dashboard routes.
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

  test("sidebar has navigation sections and footer", async ({ page }) => {
    await page.goto("/");
    const aside = page.locator("aside");
    await expect(aside).toBeVisible();

    // Navigation items exist
    await expect(aside.getByText("Dashboard")).toBeVisible();
    await expect(aside.getByText("Projects")).toBeVisible();
    await expect(aside.getByText("Settings").first()).toBeVisible();

    // Section labels exist
    await expect(aside.getByText("OVERVIEW")).toBeVisible();
    await expect(aside.getByText("OPERATIONS")).toBeVisible();
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.locator("text=Page not found")).toBeVisible();
  });
});
