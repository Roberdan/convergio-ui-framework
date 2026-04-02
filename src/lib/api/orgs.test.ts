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

import { listOrgs, getOrg, getOrgChart, getOrgMetrics, getOrgTimeline, createOrg } from "./orgs";

describe("orgs API", () => {
  beforeEach(() => { mockGet.mockReset(); mockPost.mockReset(); });

  it("listOrgs calls /api/orgs", async () => {
    mockGet.mockResolvedValueOnce([{ id: "1", name: "Acme Corp" }]);
    const result = await listOrgs();
    expect(mockGet).toHaveBeenCalledWith("/api/orgs");
    expect(result[0].name).toBe("Acme Corp");
  });

  it("getOrg calls /api/orgs/:id", async () => {
    mockGet.mockResolvedValueOnce({ id: "5", name: "TechCo" });
    await getOrg("5");
    expect(mockGet).toHaveBeenCalledWith("/api/orgs/5");
  });

  it("getOrgChart calls /api/orgs/:slug/orgchart", async () => {
    mockGet.mockResolvedValueOnce({ nodes: [] });
    await getOrgChart("acme");
    expect(mockGet).toHaveBeenCalledWith("/api/orgs/acme/orgchart");
  });

  it("getOrgMetrics calls /api/orgs/:slug/metrics", async () => {
    mockGet.mockResolvedValueOnce({ revenue: 100 });
    await getOrgMetrics("acme");
    expect(mockGet).toHaveBeenCalledWith("/api/orgs/acme/metrics");
  });

  it("getOrgTimeline calls /api/orgs/:slug/timeline", async () => {
    mockGet.mockResolvedValueOnce([]);
    await getOrgTimeline("acme");
    expect(mockGet).toHaveBeenCalledWith("/api/orgs/acme/timeline");
  });

  it("createOrg posts to /api/orgs", async () => {
    const data = { name: "NewOrg", slug: "neworg" };
    mockPost.mockResolvedValueOnce({ id: "10" });
    await createOrg(data as Parameters<typeof createOrg>[0]);
    expect(mockPost).toHaveBeenCalledWith("/api/orgs", data);
  });
});
