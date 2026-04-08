import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:3015",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: process.env.CI
      ? "pnpm start -p 3015"
      : "pnpm build && pnpm start -p 3015",
    url: "http://127.0.0.1:3015",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
