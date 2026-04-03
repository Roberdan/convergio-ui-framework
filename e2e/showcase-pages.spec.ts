import { test, expect } from "@playwright/test";
import { collectPageIssues, checkErrorBoundary, authenticate } from "./helpers";

test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

test.describe("Showcase Landing", () => {
  test("renders hero, stats, and category cards", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/showcase", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toBeVisible();

    const cards = page.locator("a[href^='/showcase/']");
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(6);

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => (i.type === "error-boundary" || i.type === "blank-page") ||
        (i.type === "pageerror" && !i.message.includes("CanvasRenderingContext2D"))
    );
    expect(crashes, "Showcase landing has crash-level issues").toHaveLength(0);
  });
});

const CATEGORIES = [
  "data-viz", "data-display", "forms", "strategy",
  "network", "ops", "layout", "agentic",
  "feedback", "theme", "navigation", "financial",
];

test.describe("Category Pages", () => {
  for (const cat of CATEGORIES) {
    test(`/showcase/${cat} renders without crashes`, async ({ page }) => {
      const issues = await collectPageIssues(page);
      await page.goto(`/showcase/${cat}`, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1500);

      await expect(page.locator("h1").first()).toBeVisible();
      await expect(page.locator("main").first()).toBeVisible();

      const allIssues = [...issues, ...(await checkErrorBoundary(page))];
      const crashes = allIssues.filter(
        (i) => (i.type === "error-boundary" || i.type === "blank-page") ||
          (i.type === "pageerror" && !i.message.includes("CanvasRenderingContext2D"))
      );
      expect(crashes, `Category ${cat} has crash-level issues`).toHaveLength(0);
    });
  }
});

test.describe("Theme Playground", () => {
  test("renders theme controls and preview", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/showcase/themes", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => (i.type === "error-boundary" || i.type === "blank-page") ||
        (i.type === "pageerror" && !i.message.includes("CanvasRenderingContext2D"))
    );
    expect(crashes, "Theme playground has crash-level issues").toHaveLength(0);
  });
});
