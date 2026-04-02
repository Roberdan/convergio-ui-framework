import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
vi.mock("./client", () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
  ApiError: class extends Error {},
  createApiClient: vi.fn(),
}));

import { getNightlyJobs, getExecutionRuns, getAuditLog, getNotifications } from "./operations";

describe("operations API", () => {
  beforeEach(() => mockGet.mockReset());

  it("getNightlyJobs calls /api/nightly/jobs", async () => {
    mockGet.mockResolvedValueOnce([{ id: "j1", status: "completed" }]);
    const result = await getNightlyJobs();
    expect(mockGet).toHaveBeenCalledWith("/api/nightly/jobs");
    expect(result).toHaveLength(1);
  });

  it("getExecutionRuns calls /api/runs", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getExecutionRuns();
    expect(mockGet).toHaveBeenCalledWith("/api/runs");
  });

  it("getAuditLog calls /api/audit/log", async () => {
    mockGet.mockResolvedValueOnce([{ action: "plan.create" }]);
    await getAuditLog();
    expect(mockGet).toHaveBeenCalledWith("/api/audit/log");
  });

  it("getNotifications calls /api/notifications", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getNotifications();
    expect(mockGet).toHaveBeenCalledWith("/api/notifications");
  });
});
