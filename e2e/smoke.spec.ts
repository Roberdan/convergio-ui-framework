/**
 * Smoke test — first E2E validation for Convergio UI.
 *
 * Verifies: app loads, sidebar renders, theme switching works,
 * and visual regression screenshots in Navy and Dark themes.
 */
import { test, expect } from "./fixtures";

test.describe("Smoke — App bootstrap", () => {
  test.beforeEach(async ({ authenticatedPage, apiMock }) => {
    await apiMock.mockDefaults();
    await authenticatedPage.goto("/");
    await authenticatedPage.waitForLoadState("networkidle");
  });

  test("app loads and shows the dashboard", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("body")).not.toHaveText("Something went wrong");
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(20);
  });

  test("sidebar renders with navigation items", async ({ authenticatedPage }) => {
    const page = authenticatedPage;
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    const navLinks = sidebar.locator("a[href]");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(5);
    await expect(sidebar.getByText("Dashboard")).toBeVisible();
    await expect(sidebar.getByText("Agents")).toBeVisible();
    await expect(sidebar.getByText("Plans")).toBeVisible();
  });
});

test.describe("Smoke — Theme switching", () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockDefaults();
  });

  test("switches from navy to dark and back", async ({
    authenticatedPage,
    themeHelper,
  }) => {
    const page = authenticatedPage;

    // Start with navy theme
    await page.addInitScript(() => {
      localStorage.setItem("convergio-theme", "navy");
    });
    await page.goto("/");
    await themeHelper.waitFor("navy");
    expect(await themeHelper.get()).toBe("navy");

    // Switch to dark
    await themeHelper.set("dark");
    await themeHelper.waitFor("dark");
    expect(await themeHelper.get()).toBe("dark");

    // Switch back to navy
    await themeHelper.set("navy");
    await themeHelper.waitFor("navy");
    expect(await themeHelper.get()).toBe("navy");
  });

  test("theme switcher dropdown works via UI", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Open theme switcher dropdown
    const themeTrigger = page.locator('button[aria-label*="Theme"]');
    await expect(themeTrigger).toBeVisible();
    await themeTrigger.click();

    // Should see theme options
    const darkOption = page.getByRole("menuitem", { name: "Dark" });
    await expect(darkOption).toBeVisible();
    await darkOption.click();

    // Verify theme changed to dark
    await expect(page.locator('html[data-theme="dark"]')).toBeAttached({
      timeout: 5_000,
    });
  });
});

test.describe("Smoke — Visual regression", () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockDefaults();
  });

  test("Navy theme — dashboard screenshot", async ({
    authenticatedPage,
    themeHelper,
  }) => {
    const page = authenticatedPage;
    await page.addInitScript(() => {
      localStorage.setItem("convergio-theme", "navy");
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await themeHelper.waitFor("navy");

    await expect(page).toHaveScreenshot("dashboard-navy.png", {
      fullPage: true,
    });
  });

  test("Dark theme — dashboard screenshot", async ({
    authenticatedPage,
    themeHelper,
  }) => {
    const page = authenticatedPage;
    await page.addInitScript(() => {
      localStorage.setItem("convergio-theme", "dark");
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await themeHelper.waitFor("dark");

    await expect(page).toHaveScreenshot("dashboard-dark.png", {
      fullPage: true,
    });
  });

  test("Navy theme — sidebar screenshot", async ({
    authenticatedPage,
    themeHelper,
  }) => {
    const page = authenticatedPage;
    await page.addInitScript(() => {
      localStorage.setItem("convergio-theme", "navy");
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await themeHelper.waitFor("navy");

    const sidebar = page.locator("aside");
    await expect(sidebar).toHaveScreenshot("sidebar-navy.png");
  });

  test("Dark theme — sidebar screenshot", async ({
    authenticatedPage,
    themeHelper,
  }) => {
    const page = authenticatedPage;
    await page.addInitScript(() => {
      localStorage.setItem("convergio-theme", "dark");
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await themeHelper.waitFor("dark");

    const sidebar = page.locator("aside");
    await expect(sidebar).toHaveScreenshot("sidebar-dark.png");
  });
});

test.describe("Smoke — Locale labels", () => {
  test.beforeEach(async ({ apiMock }) => {
    await apiMock.mockDefaults();
  });

  test("header shows correct locale strings", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Search placeholder uses locale system
    const search = page.getByPlaceholder("Search...");
    await expect(search).toBeVisible();

    // Toggle menu button has localized aria-label
    const menuBtn = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuBtn).toBeVisible();
  });

  test("sidebar labels match locale defaults", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Brand name from convergio.yaml config
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Convergio")).toBeVisible();

    // Collapse button has locale label
    const collapseBtn = page.locator(
      'button[aria-label="Collapse sidebar"]'
    );
    await expect(collapseBtn).toBeVisible();
  });
});
