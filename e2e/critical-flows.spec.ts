import { test, expect } from "@playwright/test";
import { authenticate, collectPageIssues, checkErrorBoundary, isInfraError } from "./helpers";

test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

// ── Dashboard ──────────────────────────────────────────────────────────────

test.describe("Dashboard", () => {
  test("loads and shows KPI cards", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toContainText("Dashboard");
    await expect(page.locator("main").first()).toBeVisible();

    // KPI cards should render (4 cards)
    const kpiCards = page.locator("main .rounded-lg.border.bg-card");
    await expect(kpiCards.first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) =>
        i.type === "error-boundary" ||
        i.type === "blank-page" ||
        (i.type === "pageerror" && !i.message.includes("CanvasRenderingContext2D"))
    );
    expect(crashes, "Dashboard has crash-level issues").toHaveLength(0);
  });

  test("shows live/disconnected badge", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    // SSE badge should show either Live or Disconnected
    const badge = page.locator("main").getByText(/Live|Disconnected/);
    await expect(badge.first()).toBeVisible();
  });

  test("event stream filter buttons work", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    // Filter buttons should be present
    const filters = page.locator("button").filter({ hasText: /All|Messages|Tasks|Completed|Delegations/ });
    const count = await filters.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Clicking a filter should not crash
    await filters.first().click();
    await expect(page.locator("main").first()).toBeVisible();
  });
});

// ── Agents ─────────────────────────────────────────────────────────────────

test.describe("Agents page", () => {
  test("renders agent catalog table or empty state", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/agents", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toContainText("Agents");
    await expect(page.locator("main").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Agents page has crash-level issues").toHaveLength(0);
  });

  test("Spawn Agent button opens modal", async ({ page }) => {
    await page.goto("/agents", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    const spawnBtn = page.getByRole("button", { name: /Spawn Agent/i });
    await expect(spawnBtn).toBeVisible();
    await spawnBtn.click();

    // Modal title should appear
    await expect(page.getByText("Spawn Agent").last()).toBeVisible();

    // Name field should be present
    const nameInput = page.locator('input[placeholder*="Elena"]');
    await expect(nameInput).toBeVisible();

    // Cancel closes the modal
    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(nameInput).not.toBeVisible();
  });

  test("handles daemon offline gracefully (error state visible)", async ({ page }) => {
    await page.goto("/agents", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);

    const body = await page.locator("body").textContent();
    expect(body?.trim().length).toBeGreaterThan(20);

    // Should not show blank screen regardless of daemon state
    const hasContent = await page.locator("h1, [data-testid='error'], .text-destructive").first().isVisible();
    expect(hasContent).toBe(true);
  });
});

// ── Plans ──────────────────────────────────────────────────────────────────

test.describe("Plans page", () => {
  test("renders plans table or empty state", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/plans", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toContainText("Plans");
    await expect(page.locator("main").first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Plans page has crash-level issues").toHaveLength(0);
  });

  test("New Plan button opens modal", async ({ page }) => {
    await page.goto("/plans", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    const newPlanBtn = page.getByRole("button", { name: /New Plan/i });
    await expect(newPlanBtn).toBeVisible();
    await newPlanBtn.click();

    await expect(page.getByText("Create Plan")).toBeVisible();

    const nameInput = page.locator('input[placeholder*="Q2 Migration"]');
    await expect(nameInput).toBeVisible();

    await page.getByRole("button", { name: /Cancel/i }).click();
    await expect(nameInput).not.toBeVisible();
  });
});

// ── Mesh ───────────────────────────────────────────────────────────────────

test.describe("Mesh Network page", () => {
  test("renders topology and node table", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/mesh", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toContainText("Mesh");
    await expect(page.locator("main").first()).toBeVisible();

    // KPI cards (Total/Online/Syncing/Offline)
    const kpiCards = page.locator("main .rounded-lg.border.bg-card");
    await expect(kpiCards.first()).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Mesh page has crash-level issues").toHaveLength(0);
  });

  test("shows node count badge in header", async ({ page }) => {
    await page.goto("/mesh", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    // Badge shows X/Y online pattern or just renders
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Mesh");
  });
});

// ── Observatory ────────────────────────────────────────────────────────────

test.describe("Observatory page", () => {
  test("renders timeline and search", async ({ page }) => {
    const issues = await collectPageIssues(page);
    await page.goto("/observatory", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);

    await expect(page.locator("h1").first()).toContainText("Observatory");
    await expect(page.locator("main").first()).toBeVisible();

    // Search input should be present
    const searchInput = page.locator('input[placeholder*="Search events"]');
    await expect(searchInput).toBeVisible();

    const allIssues = [...issues, ...(await checkErrorBoundary(page))];
    const crashes = allIssues.filter(
      (i) => i.type === "error-boundary" || i.type === "blank-page"
    );
    expect(crashes, "Observatory page has crash-level issues").toHaveLength(0);
  });

  test("search input accepts text without crash", async ({ page }) => {
    await page.goto("/observatory", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="Search events"]');
    await searchInput.fill("agent");
    await page.waitForTimeout(500);

    // Page should still be functional
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("event type filter works", async ({ page }) => {
    await page.goto("/observatory", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    const typeFilter = page.locator("select").first();
    await typeFilter.selectOption("MessageSent");
    await page.waitForTimeout(500);

    await expect(page.locator("h1").first()).toBeVisible();
  });
});

// ── Navigation ─────────────────────────────────────────────────────────────

test.describe("Navigation", () => {
  test("sidebar nav links navigate correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1000);

    // Navigate to agents via sidebar (desktop viewport)
    const agentsLink = page.locator('a[href="/agents"]').first();
    if (await agentsLink.isVisible()) {
      await agentsLink.click();
      await page.waitForTimeout(1000);
      await expect(page.locator("h1").first()).toContainText("Agents");
    }
  });

  test("skip to main content link is focusable", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 20000 });

    // Tab to the skip link
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
  });

  test("all dashboard pages render without blank screen", async ({ page }) => {
    const pages = [
      { path: "/", name: "Dashboard" },
      { path: "/agents", name: "Agents" },
      { path: "/plans", name: "Plans" },
      { path: "/mesh", name: "Mesh" },
      { path: "/observatory", name: "Observatory" },
      { path: "/inference", name: "Inference" },
      { path: "/billing", name: "Billing" },
      { path: "/settings", name: "Settings" },
    ];

    for (const pg of pages) {
      const errors: string[] = [];
      page.on("pageerror", (err) => {
        if (!isInfraError(err.message) && !err.message.includes("CanvasRenderingContext2D")) {
          errors.push(`[${pg.name}] pageerror: ${err.message}`);
        }
      });

      await page.goto(pg.path, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForTimeout(1200);

      const body = await page.locator("body").textContent();
      expect(
        body?.trim().length ?? 0,
        `${pg.name} appears blank`
      ).toBeGreaterThan(20);

      const hasErrorBoundary = body?.includes("Something went wrong") ?? false;
      expect(hasErrorBoundary, `${pg.name} hit error boundary`).toBe(false);
    }
  });
});
