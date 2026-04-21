import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    environment: "happy-dom",
    setupFiles: ["src/test-setup.ts"],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // Ratchet floor. Current actual with the v1.8.3 + high-blast-radius
      // smoke suite: statements ~49.9%, branches ~49%, functions ~57%,
      // lines ~63%. Thresholds sit 1–3 points below those so regressions
      // fail CI but normal refactors have breathing room.
      thresholds: {
        statements: 48,
        branches: 46,
        functions: 55,
        lines: 60,
      },
    },
  },
});
