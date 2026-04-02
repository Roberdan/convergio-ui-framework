import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock("./client", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  ApiError: class extends Error {},
  createApiClient: vi.fn(),
}));

import { listPlans, getPlanContext, getExecutionTree, createPlan, startPlan } from "./plans";

describe("plans API", () => {
  beforeEach(() => { mockGet.mockReset(); mockPost.mockReset(); });

  it("listPlans calls /api/plan-db/list", async () => {
    mockGet.mockResolvedValueOnce([{ id: 1, title: "Migration plan" }]);
    const result = await listPlans();
    expect(mockGet).toHaveBeenCalledWith("/api/plan-db/list");
    expect(result).toHaveLength(1);
  });

  it("getPlanContext calls /api/plan-db/context/:id", async () => {
    mockGet.mockResolvedValueOnce({ id: 42, title: "Deploy" });
    await getPlanContext("42");
    expect(mockGet).toHaveBeenCalledWith("/api/plan-db/context/42");
  });

  it("getExecutionTree calls correct endpoint", async () => {
    mockGet.mockResolvedValueOnce({ nodes: [] });
    await getExecutionTree("100");
    expect(mockGet).toHaveBeenCalledWith("/api/plan-db/execution-tree/100");
  });

  it("createPlan posts to /api/plan-db/create", async () => {
    const payload = { title: "New plan", description: "Build pipeline" };
    mockPost.mockResolvedValueOnce({ id: 999 });
    await createPlan(payload as Parameters<typeof createPlan>[0]);
    expect(mockPost).toHaveBeenCalledWith("/api/plan-db/create", payload);
  });

  it("startPlan posts to /api/plan-db/start/:id", async () => {
    mockPost.mockResolvedValueOnce({ success: true });
    const result = await startPlan("50");
    expect(mockPost).toHaveBeenCalledWith("/api/plan-db/start/50");
    expect(result).toEqual({ success: true });
  });
});
