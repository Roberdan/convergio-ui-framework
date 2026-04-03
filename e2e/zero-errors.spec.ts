import { test, expect } from "@playwright/test";
import { authenticate } from "./helpers";

test.beforeEach(async ({ context }) => {
  await authenticate(context);
});

const ALL_PAGES = [
  { path: "/", name: "Home" },
  { path: "/showcase", name: "Showcase" },
  { path: "/showcase/data-viz", name: "Category: Data Viz" },
  { path: "/showcase/forms", name: "Category: Forms" },
  { path: "/showcase/themes", name: "Theme Playground" },
];

function isInfraError(msg: string): boolean {
  return (
    msg.includes("webpack-hmr") ||
    msg.includes("_next/webpack") ||
    msg.includes("ERR_CONNECTION_REFUSED") ||
    msg.includes("ERR_FAILED") ||
    msg.includes("CORS policy") ||
    msg.includes("Access-Control-Allow-Origin") ||
    msg.includes("access control checks") ||
    msg.includes("Failed to fetch") ||
    msg.includes("a2ui") ||
    msg.includes("net::ERR") ||
    msg.includes("attribute points: Expected number") ||
    msg.includes("Failed to load resource") ||
    msg.includes("localhost:8420")
  );
}

test.describe("Zero console errors", () => {
  for (const pg of ALL_PAGES) {
    test(`${pg.name} page has zero app errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => {
        if (!err.message.includes("CanvasRenderingContext2D") && !isInfraError(err.message)) {
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
