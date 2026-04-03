import { test, expect } from "@playwright/test";
import { collectPageIssues, checkErrorBoundary, authenticate } from "./helpers";

test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

test.describe("Showcase Page", () => {
  test("renders all showcase sections", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/showcase", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toContainText("Maranello Component Showcase");

    const sections = page.locator("section[aria-labelledby]");
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThanOrEqual(6);

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => (i.type === "error-boundary" || i.type === "blank-page") ||
        (i.type === "pageerror" && !i.message.includes("CanvasRenderingContext2D"))
    );
    expect(crashes, "Showcase page has crash-level issues").toHaveLength(0);
  });

  test("preview page renders all waves", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/preview", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const sectionCount = await page.locator("section").count();
    expect(sectionCount).toBeGreaterThanOrEqual(2);

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "pageerror" || i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Preview page has crash-level issues").toHaveLength(0);
  });

  test("components page tabs all render", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/components", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    const tabs = page.locator('button[role="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < Math.min(tabCount, 5); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
    }

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "pageerror" || i.type === "error-boundary"
    );
    expect(crashes, "Component tabs crashed").toHaveLength(0);
  });
});

test.describe("New Feature Pages", () => {
  test("agents page renders", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/agents", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("main").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "pageerror" || i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Agents page crashed").toHaveLength(0);
  });

  test("security page loads", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/security", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("main").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "pageerror" || i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Security page crashed").toHaveLength(0);
  });

  test("projects page loads", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/projects", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("main").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "pageerror" || i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Projects page crashed").toHaveLength(0);
  });

  test("notifications page loads", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/notifications", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("main").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "pageerror" || i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Notifications page crashed").toHaveLength(0);
  });

  test("activity page loads", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/activity", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("main").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "pageerror" || i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Activity page crashed").toHaveLength(0);
  });
});
