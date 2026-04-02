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

import {
  listAgents,
  getAgentCatalog,
  getActiveSessions,
  getAgentTree,
  triageAgent,
} from "./agents";

describe("agents API", () => {
  beforeEach(() => { mockGet.mockReset(); mockPost.mockReset(); });

  it("listAgents merges running + recent, deduplicates", async () => {
    mockGet.mockResolvedValueOnce({
      running: [{ agent_id: "w-01", name: "Worker 1", type: "executor", status: "active", model: "sonnet" }],
      recent: [{ agent_id: "w-01", name: "Worker 1", type: "executor" }],
    });
    const result = await listAgents();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("w-01");
  });

  it("listAgents handles empty response", async () => {
    mockGet.mockResolvedValueOnce({});
    const result = await listAgents();
    expect(result).toEqual([]);
  });

  it("getAgentCatalog calls /api/agents/catalog", async () => {
    mockGet.mockResolvedValueOnce([{ id: "planner", name: "Planner" }]);
    await getAgentCatalog();
    expect(mockGet).toHaveBeenCalledWith("/api/agents/catalog");
  });

  it("getActiveSessions calls /api/ipc/agents/list", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getActiveSessions();
    expect(mockGet).toHaveBeenCalledWith("/api/ipc/agents/list");
  });

  it("getAgentTree calls /api/ipc/agents/tree", async () => {
    mockGet.mockResolvedValueOnce({ root: null });
    await getAgentTree();
    expect(mockGet).toHaveBeenCalledWith("/api/ipc/agents/tree");
  });

  it("triageAgent posts to /api/agents/triage", async () => {
    mockPost.mockResolvedValueOnce({ model: "opus", agent: "planner" });
    await triageAgent({ query: "Fix the build" });
    expect(mockPost).toHaveBeenCalledWith("/api/agents/triage", { query: "Fix the build" });
  });
});
