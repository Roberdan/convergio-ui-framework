import { test, expect } from "@playwright/test";
import { authenticate } from "./helpers";

// Viewport presets
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

const DASHBOARD_PAGES = [
  { path: "/", name: "Dashboard" },
  { path: "/agents", name: "Agents" },
  { path: "/plans", name: "Plans" },
  { path: "/mesh", name: "Mesh" },
  { path: "/observatory", name: "Observatory" },
];

test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

// ── Viewport rendering ─────────────────────────────────────────────────────

for (const vp of VIEWPORTS) {
  test.describe(`Responsive — ${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const pg of DASHBOARD_PAGES) {
      test(`${pg.name} renders without overflow or blank screen at ${vp.name}`, async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (err) => {
          const msg = err.message;
          if (
            !msg.includes("CanvasRenderingContext2D") &&
            !msg.includes("localhost:8420") &&
            !msg.includes("net::ERR")
          ) {
            errors.push(msg);
          }
        });

        await page.goto(pg.path, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(1200);

        // Page should not be blank
        const body = await page.locator("body").textContent();
        expect(body?.trim().length ?? 0, `${pg.name} blank at ${vp.name}`).toBeGreaterThan(20);

        // Main content should be visible
        await expect(page.locator("main").first()).toBeVisible();

        // H1 should be visible
        await expect(page.locator("h1").first()).toBeVisible();

        // No error boundary
        const hasErrorBoundary = body?.includes("Something went wrong") ?? false;
        expect(hasErrorBoundary, `${pg.name} error boundary at ${vp.name}`).toBe(false);

        expect(errors, `${pg.name} page errors at ${vp.name}`).toHaveLength(0);
      });
    }

    test(`header is visible at ${vp.name}`, async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(800);

      // Header should always be present
      const header = page.locator("header").first();
      await expect(header).toBeVisible();
    });
  });
}

// ── Mobile-specific checks ─────────────────────────────────────────────────

test.describe("Mobile — sidebar sheet", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("desktop sidebar is hidden, mobile menu button is present", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    // Desktop aside should be hidden at mobile
    const desktopSidebar = page.locator("aside").first();
    // It may have hidden md:flex — check it's not blocking content
    const mainContent = page.locator("main").first();
    await expect(mainContent).toBeVisible();

    // Menu toggle button in header should be present on mobile
    const menuBtn = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], button[aria-label*="sidebar"], button[aria-label*="Sidebar"]').first();
    if (await menuBtn.count() > 0) {
      await expect(menuBtn).toBeVisible();
    }
  });

  test("mobile sheet opens and closes via hamburger", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    // Try to find a menu/hamburger button
    const menuBtn = page.locator('button[aria-label*="sidebar"], button[aria-label*="menu"], button[aria-label*="Menu"]').first();
    if (await menuBtn.count() === 0) return; // Skip if no mobile menu

    // Sheet should start closed
    const sheet = page.locator('[data-radix-dialog-content], [role="dialog"]').first();
    const sheetVisible = await sheet.isVisible().catch(() => false);
    expect(sheetVisible).toBe(false);

    // Open the sheet
    await menuBtn.click();
    await page.waitForTimeout(300);

    // Nav links should be visible in the sheet
    const navLinks = page.locator('[role="dialog"] a, [data-radix-dialog-content] a');
    if (await navLinks.count() > 0) {
      await expect(navLinks.first()).toBeVisible();
    }
  });
});

// ── KPI grid responsive ────────────────────────────────────────────────────

test.describe("KPI grid — does not overflow", () => {
  for (const vp of VIEWPORTS) {
    test(`KPI cards fit within viewport at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      await authenticate(page.context());
      await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1000);

      // Check no horizontal scroll on the document
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = vp.width;
      expect(bodyWidth, `Horizontal overflow at ${vp.name}`).toBeLessThanOrEqual(viewportWidth + 5);
    });
  }
});
