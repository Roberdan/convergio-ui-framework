import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
vi.mock("./client", () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
  ApiError: class extends Error { status: number; body: string; constructor(s: number, b: string) { super(); this.status = s; this.body = b; } },
  createApiClient: vi.fn(),
}));

import { getOverview, getBrainData, getTokenUsageDaily, getTaskDistribution } from "./dashboard";

describe("dashboard API", () => {
  beforeEach(() => mockGet.mockReset());

  it("getOverview calls /api/overview", async () => {
    mockGet.mockResolvedValueOnce({ agents: 5, plans: 3 });
    const result = await getOverview();
    expect(mockGet).toHaveBeenCalledWith("/api/overview");
    expect(result).toEqual({ agents: 5, plans: 3 });
  });

  it("getBrainData calls /api/brain", async () => {
    mockGet.mockResolvedValueOnce({ nodes: [] });
    await getBrainData();
    expect(mockGet).toHaveBeenCalledWith("/api/brain");
  });

  it("getTokenUsageDaily calls /api/tokens/daily", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getTokenUsageDaily();
    expect(mockGet).toHaveBeenCalledWith("/api/tokens/daily");
  });

  it("getTaskDistribution calls /api/tasks/distribution", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getTaskDistribution();
    expect(mockGet).toHaveBeenCalledWith("/api/tasks/distribution");
  });
});
