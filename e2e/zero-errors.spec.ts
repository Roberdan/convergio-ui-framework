import { test, expect } from "@playwright/test";

const ALL_PAGES = [
  { path: "/", name: "Dashboard" },
  { path: "/agents", name: "Agents" },
  { path: "/activity", name: "Activity" },
  { path: "/security", name: "Security" },
  { path: "/notifications", name: "Notifications" },
  { path: "/projects", name: "Projects" },
  { path: "/settings", name: "Settings" },
  { path: "/docs", name: "Docs" },
  { path: "/help", name: "Help" },
];

function isInfraError(msg: string): boolean {
  return msg.includes("webpack-hmr") || msg.includes("_next/webpack");
}

test.describe("Zero console errors", () => {
  for (const pg of ALL_PAGES) {
    test(`${pg.name} page has zero app errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error" && !isInfraError(msg.text())) {
          errors.push(`console.error: ${msg.text()}`);
        }
      });

      await page.goto(pg.path);
      await page.waitForTimeout(1500);

      await expect(page.locator("h1")).toBeVisible();

      expect(errors, `App errors on ${pg.name}`).toHaveLength(0);
    });
  }
});
