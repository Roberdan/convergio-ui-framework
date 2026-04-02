import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiClient, ApiError } from "./client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("ApiClient", () => {
  const client = createApiClient("http://localhost:8420");

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("sends GET with auth headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, items: [1, 2] }),
    });

    const result = await client.get("/api/test");
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:8420/api/test");
    expect(opts.method).toBe("GET");
    expect(opts.headers).toHaveProperty("Authorization");
    expect(result).toEqual([1, 2]);
  });

  it("unwraps single-key responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, plans: [{ id: 1 }] }),
    });

    const result = await client.get("/api/plans");
    expect(result).toEqual([{ id: 1 }]);
  });

  it("returns full object when multiple data keys", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ a: 1, b: 2 }),
    });

    const result = await client.get("/api/multi");
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not found"),
    });

    try {
      await client.get("/api/missing");
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });

  it("sends POST with JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: "created" }),
    });

    await client.post("/api/create", { name: "Acme Corp" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({ name: "Acme Corp" });
  });

  it("sends PUT with JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, result: "updated" }),
    });

    await client.put("/api/update/1", { name: "Updated" });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("PUT");
  });

  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    await client.delete("/api/remove/1");
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe("DELETE");
  });

  it("appends query params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, data: [] }),
    });

    await client.get("/api/search", { params: { q: "test" } });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("q=test");
  });
});
