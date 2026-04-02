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

import { listIdeas, createIdea, promoteIdea } from "./ideas";

describe("ideas API", () => {
  beforeEach(() => { mockGet.mockReset(); mockPost.mockReset(); });

  it("listIdeas calls /api/ideas", async () => {
    mockGet.mockResolvedValueOnce([{ id: "i1", title: "Mesh autoscale" }]);
    const result = await listIdeas();
    expect(mockGet).toHaveBeenCalledWith("/api/ideas");
    expect(result).toHaveLength(1);
  });

  it("createIdea posts to /api/ideas", async () => {
    const data = { title: "Batch inference" };
    mockPost.mockResolvedValueOnce({ id: "i2" });
    await createIdea(data as Parameters<typeof createIdea>[0]);
    expect(mockPost).toHaveBeenCalledWith("/api/ideas", data);
  });

  it("promoteIdea posts to /api/ideas/:id/promote", async () => {
    mockPost.mockResolvedValueOnce({ success: true });
    const result = await promoteIdea("i1");
    expect(mockPost).toHaveBeenCalledWith("/api/ideas/i1/promote");
    expect(result).toEqual({ success: true });
  });
});
