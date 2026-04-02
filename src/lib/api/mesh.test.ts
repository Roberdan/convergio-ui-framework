import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
vi.mock("./client", () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
  ApiError: class extends Error {},
  createApiClient: vi.fn(),
}));

import { getMeshTopology, getMeshMetrics, getHeartbeatStatus, listPeers } from "./mesh";

describe("mesh API", () => {
  beforeEach(() => mockGet.mockReset());

  it("getMeshTopology calls /api/mesh", async () => {
    mockGet.mockResolvedValueOnce({ nodes: [], edges: [] });
    await getMeshTopology();
    expect(mockGet).toHaveBeenCalledWith("/api/mesh");
  });

  it("getMeshMetrics calls /api/mesh/metrics", async () => {
    mockGet.mockResolvedValueOnce({ latency: 42 });
    await getMeshMetrics();
    expect(mockGet).toHaveBeenCalledWith("/api/mesh/metrics");
  });

  it("getHeartbeatStatus calls /api/heartbeat/status", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getHeartbeatStatus();
    expect(mockGet).toHaveBeenCalledWith("/api/heartbeat/status");
  });

  it("listPeers calls /api/peers", async () => {
    mockGet.mockResolvedValueOnce([{ id: "m5max", name: "M5 Max" }]);
    const result = await listPeers();
    expect(mockGet).toHaveBeenCalledWith("/api/peers");
    expect(result).toHaveLength(1);
  });
});
