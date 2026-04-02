import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
vi.mock("./client", () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
  ApiError: class extends Error {},
  createApiClient: vi.fn(),
}));

import { getDeepHealth, getReadinessChecks, getKernelStatus, getNotificationChannels } from "./settings";

describe("settings API", () => {
  beforeEach(() => mockGet.mockReset());

  it("getDeepHealth calls /api/health/deep", async () => {
    mockGet.mockResolvedValueOnce({ status: "healthy" });
    const result = await getDeepHealth();
    expect(mockGet).toHaveBeenCalledWith("/api/health/deep");
    expect(result.status).toBe("healthy");
  });

  it("getReadinessChecks calls /api/node/readiness", async () => {
    mockGet.mockResolvedValueOnce([{ check: "db", ok: true }]);
    await getReadinessChecks();
    expect(mockGet).toHaveBeenCalledWith("/api/node/readiness");
  });

  it("getKernelStatus calls /api/kernel/status", async () => {
    mockGet.mockResolvedValueOnce({ running: true });
    await getKernelStatus();
    expect(mockGet).toHaveBeenCalledWith("/api/kernel/status");
  });

  it("getNotificationChannels calls /api/channels", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getNotificationChannels();
    expect(mockGet).toHaveBeenCalledWith("/api/channels");
  });
});
