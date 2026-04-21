import { defineConfig, devices } from "@playwright/test";

const PW_PORT = process.env.PW_PORT ?? "3015";
const PW_BASE_URL = process.env.PW_BASE_URL ?? `http://127.0.0.1:${PW_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry twice in every environment so local runs catch the same flake
  // surface that CI masks with retries.
  retries: 2,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : "html",

  expect: {
    toHaveScreenshot: {
      // 0.01 (1%) flakes on font / GPU / subpixel diffs across runners.
      maxDiffPixelRatio: 0.03,
      animations: "disabled",
    },
  },

  use: {
    baseURL: PW_BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: `pnpm build && pnpm start -p ${PW_PORT}`,
    url: PW_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
