import { test, expect } from "@playwright/test";
import { collectPageIssues, checkErrorBoundary } from "./helpers";

// --- Auth setup: login through the real form to get signed cookie ---
test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  const usernameInput = page.locator('input[name="username"], input[type="text"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitBtn = page.locator('button[type="submit"]');

  if ((await usernameInput.count()) > 0) {
    await usernameInput.first().fill("admin");
    await passwordInput.first().fill("admin");
    await submitBtn.first().click();
    await page.waitForURL("**/dashboard**", { timeout: 5000 }).catch(() => {
      /* May redirect elsewhere -- that is fine */
    });
  }
});

// --- Pages to audit ---
const PAGES = [
  { path: "/login", name: "Login", auth: false, key: 'button[type="submit"]' },
  { path: "/", name: "Root redirect", auth: true, key: "main" },
  { path: "/dashboard", name: "Dashboard", auth: true, key: "h1" },
  { path: "/plans", name: "Plans list", auth: true, key: "h1" },
  { path: "/plans/10050", name: "Plan detail", auth: true, key: "main" },
  { path: "/agents", name: "Agents", auth: true, key: "h1" },
  { path: "/orgs", name: "Orgs", auth: true, key: "h1" },
  { path: "/mesh", name: "Mesh", auth: true, key: "h1" },
  { path: "/chat", name: "Chat", auth: true, key: "main" },
  { path: "/operations", name: "Operations", auth: true, key: "h1" },
  { path: "/settings", name: "Settings", auth: true, key: "h1" },
  { path: "/ideas", name: "Ideas", auth: true, key: "h1" },
  { path: "/strategy", name: "Strategy", auth: true, key: "main" },
  { path: "/components", name: "Components", auth: true, key: "main" },
  { path: "/showcase", name: "Showcase", auth: true, key: "main" },
  { path: "/preview", name: "Preview", auth: true, key: "main" },
  { path: "/projects", name: "Projects", auth: true, key: "main" },
  { path: "/activity", name: "Activity", auth: true, key: "main" },
  { path: "/security", name: "Security", auth: true, key: "main" },
  { path: "/notifications", name: "Notifications", auth: true, key: "main" },
  { path: "/docs", name: "Docs", auth: true, key: "main" },
  { path: "/help", name: "Help", auth: true, key: "main" },
] as const;

// --- Test: Login form works ---
test.describe("Full Audit -- Login", () => {
  test("login form renders and submits", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/login");
    await page.waitForTimeout(1000);

    const usernameInput = page.locator('input[name="username"], input[type="text"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    const hasForm = (await usernameInput.count()) > 0 && (await passwordInput.count()) > 0;
    if (hasForm) {
      await usernameInput.first().fill("admin");
      await passwordInput.first().fill("admin");
      await submitBtn.first().click();
      await page.waitForTimeout(2000);
      console.log(`[AUDIT] Login redirect URL: ${page.url()}`);
    } else {
      console.log("[AUDIT] WARNING: No login form found on /login");
    }

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    if (allIssues.length > 0) {
      console.log(`[AUDIT] /login issues:\n${allIssues.map((i) => `  ${i.type}: ${i.message}`).join("\n")}`);
    }
  });
});

// --- Test: Each page loads without errors ---
test.describe("Full Audit -- Page Load", () => {
  for (const pg of PAGES) {
    if (!pg.auth) continue;

    test(`${pg.name} (${pg.path}) loads cleanly`, async ({ page }) => {
      const issues = await collectPageIssues(page);

      const resp = await page.goto(pg.path, { waitUntil: "networkidle", timeout: 15000 });
      const status = resp?.status() ?? 0;
      if (status >= 400) {
        issues.push({ type: "pageerror", message: `HTTP ${status} on ${pg.path}` });
      }

      await page.waitForTimeout(1500);

      // Check key element is visible
      if (pg.key) {
        const el = page.locator(pg.key).first();
        const isVisible = await el.isVisible().catch(() => false);
        if (!isVisible) {
          console.log(`[AUDIT] ${pg.name}: key element "${pg.key}" not visible`);
        }
      }

      const allIssues = [...issues, ...(await checkErrorBoundary(page))];
      if (allIssues.length > 0) {
        console.log(`[AUDIT] ${pg.name} (${pg.path}) issues:\n${allIssues.map((i) => `  ${i.type}: ${i.message}`).join("\n")}`);
      }

      const crashes = allIssues.filter(
        (i) => i.type === "pageerror" || i.type === "error-boundary" || i.type === "blank-page"
      );
      expect(
        crashes,
        `Crash-level issues on ${pg.name} (${pg.path}):\n${crashes.map((i) => `${i.type}: ${i.message}`).join("\n")}`
      ).toHaveLength(0);
    });
  }
});

// --- Test: Components page tabs ---
test.describe("Full Audit -- Components Tabs", () => {
  test("all component tabs render without error", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/components", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    const tabs = page.locator('button[role="tab"], [data-tab], .tab-button');
    const tabCount = await tabs.count();
    console.log(`[AUDIT] Components page: found ${tabCount} tabs`);

    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
    }

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter((i) => i.type === "pageerror" || i.type === "error-boundary");
    expect(crashes, "Component tabs crashed").toHaveLength(0);
  });
});

// --- Test: Dashboard interactive elements ---
test.describe("Full Audit -- Dashboard Interactivity", () => {
  test("dashboard key elements are clickable", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);

    if (page.url().includes("/login")) {
      console.log("[AUDIT] INFO: /dashboard redirected to /login");
      return;
    }

    const content = page.locator("body *").first();
    await expect(content).toBeVisible({ timeout: 5000 });

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    if (allIssues.length > 0) {
      console.log(`[AUDIT] Dashboard issues:\n${allIssues.map((i) => `  ${i.type}: ${i.message}`).join("\n")}`);
    }
  });
});

// --- Test: Operations tabs ---
test.describe("Full Audit -- Operations Tabs", () => {
  test("operations page tabs render", async ({ page }) => {
    await page.goto("/operations", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    const tabs = page.locator('button[role="tab"], [data-tab], .tab-button');
    const tabCount = await tabs.count();
    console.log(`[AUDIT] Operations page: found ${tabCount} tabs`);

    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(500);
      const boundaryIssues = await checkErrorBoundary(page);
      if (boundaryIssues.length > 0) {
        console.log(`[AUDIT] Operations tab issues:\n${boundaryIssues.map((i) => `  ${i.type}: ${i.message}`).join("\n")}`);
      }
    }
  });
});
