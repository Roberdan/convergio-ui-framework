/**
 * Unit tests for HMAC-signed session cookie utilities.
 *
 * Covers:
 *  - sign → verify round-trip with explicit SESSION_SECRET
 *  - tamper detection
 *  - production guard that rejects missing or dev-sentinel secrets
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

// next/headers only works inside a request scope — tests never call the
// cookie helpers, only signValue/verifyValue, but the import path must resolve.
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => undefined,
    delete: () => undefined,
  }),
}));

describe("session signValue/verifyValue", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("SESSION_SECRET", "test-secret-value");
    vi.resetModules();
  });

  it("round-trips signed values", async () => {
    const { signValue, verifyValue } = await import("./session");
    const signed = await signValue("user-42");
    expect(signed).toMatch(/^user-42\.[0-9a-f]{64}$/);
    expect(await verifyValue(signed)).toBe("user-42");
  });

  it("rejects tampered payload", async () => {
    const { signValue, verifyValue } = await import("./session");
    const signed = await signValue("user-42");
    const [, sig] = signed.split(".");
    expect(await verifyValue(`attacker.${sig}`)).toBeNull();
  });

  it("rejects tampered signature", async () => {
    const { signValue, verifyValue } = await import("./session");
    const signed = await signValue("user-42");
    const [val] = signed.split(".");
    const fakeSig = "0".repeat(64);
    expect(await verifyValue(`${val}.${fakeSig}`)).toBeNull();
  });
});

describe("production SESSION_SECRET guard", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("throws when SESSION_SECRET is missing in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "");
    const { signValue } = await import("./session");
    await expect(signValue("x")).rejects.toThrow(/SESSION_SECRET/);
  });

  it("throws when SESSION_SECRET equals the dev sentinel in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "convergio-dev-secret");
    const { signValue } = await import("./session");
    await expect(signValue("x")).rejects.toThrow(/SESSION_SECRET/);
  });

  it("allows dev fallback when NODE_ENV is not production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("SESSION_SECRET", "");
    const { signValue } = await import("./session");
    await expect(signValue("x")).resolves.toMatch(/^x\.[0-9a-f]{64}$/);
  });
});
