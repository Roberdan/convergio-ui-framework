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
      // Ratchet from prior 40% floor. Current actual on main: statements ~46%,
      // branches ~44%, functions ~53%, lines ~59%. Thresholds sit just below
      // those to block regressions without forcing a speculative raise.
      thresholds: {
        statements: 45,
        branches: 42,
        functions: 50,
        lines: 55,
      },
    },
  },
});
