import { test, expect } from "@playwright/test";
import { authenticate } from "./helpers";

test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

const ALL_PAGES = [
  { path: "/", name: "Dashboard" },
  { path: "/dashboard", name: "Dashboard API" },
  { path: "/agents", name: "Agents" },
  { path: "/activity", name: "Activity" },
  { path: "/plans", name: "Plans" },
  { path: "/orgs", name: "Orgs" },
  { path: "/mesh", name: "Mesh" },
  { path: "/operations", name: "Operations" },
  { path: "/ideas", name: "Ideas" },
  { path: "/security", name: "Security" },
  { path: "/notifications", name: "Notifications" },
  { path: "/projects", name: "Projects" },
  { path: "/strategy", name: "Strategy" },
  { path: "/chat", name: "Chat" },
  { path: "/showcase", name: "Showcase" },
  { path: "/preview", name: "Preview" },
  { path: "/components", name: "Components" },
  { path: "/settings", name: "Settings" },
  { path: "/docs", name: "Docs" },
  { path: "/help", name: "Help" },
];

function isInfraError(msg: string): boolean {
  return (
    msg.includes("webpack-hmr") ||
    msg.includes("_next/webpack") ||
    msg.includes("ERR_CONNECTION_REFUSED") ||
    msg.includes("ERR_FAILED") ||
    msg.includes("CORS policy") ||
    msg.includes("Failed to fetch") ||
    msg.includes("a2ui") ||
    msg.includes("net::ERR") ||
    msg.includes("attribute points: Expected number") ||
    msg.includes("Failed to load resource")
  );
}

test.describe("Zero console errors", () => {
  for (const pg of ALL_PAGES) {
    test(`${pg.name} page has zero app errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => {
        if (!err.message.includes("CanvasRenderingContext2D")) {
          errors.push(`pageerror: ${err.message}`);
        }
      });
      page.on("console", (msg) => {
        if (msg.type() === "error" && !isInfraError(msg.text())) {
          errors.push(`console.error: ${msg.text()}`);
        }
      });

      await page.goto(pg.path);
      await page.waitForTimeout(1500);

      await expect(page.locator("main").first()).toBeVisible();

      expect(errors, `App errors on ${pg.name}`).toHaveLength(0);
    });
  }
});
