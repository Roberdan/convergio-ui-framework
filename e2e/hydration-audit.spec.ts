import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.addCookies([{
    name: "session",
    value: "authenticated.955738395f27445701db7db7c5262d188f16b7d76d4abaea47905d75a1a960f1",
    domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax",
  }]);
});

const PAGES = [
  "/showcase", "/showcase/data-viz", "/showcase/forms",
  "/showcase/themes", "/",
];

for (const path of PAGES) {
  test(`hydration ${path}`, async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if ((text.includes("Hydration failed") || text.includes("did not match") ||
          text.includes("server rendered text didn't match")) &&
          !text.includes("[a2ui]")) {
        hydrationErrors.push(text.substring(0, 300));
      }
    });

    page.on("pageerror", (err) => {
      const msg = err.message;
      if (msg.includes("access control") || msg.includes("localhost:8420") || msg.includes("CORS")) return;
      hydrationErrors.push(`PAGEERROR: ${msg.substring(0, 200)}`);
    });

    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);

    if (hydrationErrors.length > 0) {
      console.log(`\n=== ${path}: ${hydrationErrors.length} hydration issues ===`);
      hydrationErrors.forEach(e => console.log(`  ${e.substring(0, 150)}`));
    }

    expect(hydrationErrors, `Hydration errors on ${path}`).toHaveLength(0);
  });
}
