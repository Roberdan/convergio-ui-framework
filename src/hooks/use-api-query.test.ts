import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useApiQuery } from "./use-api-query";

vi.mock("@/lib/api", () => ({
  ApiError: class extends Error {
    status: number;
    body: string;
    constructor(s: number, b: string) { super(`API ${s}`); this.status = s; this.body = b; }
  },
}));

afterEach(() => vi.restoreAllMocks());

describe("useApiQuery", () => {
  it("fetches data on mount", async () => {
    const fetcher = vi.fn().mockResolvedValue({ count: 42 });
    const { result } = renderHook(() => useApiQuery(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ count: 42 });
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("handles fetch errors", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("Network failure"));
    const { result } = renderHook(() => useApiQuery(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Network failure");
    expect(result.current.data).toBeNull();
  });

  it("does not fetch when disabled", async () => {
    const fetcher = vi.fn().mockResolvedValue("data");
    const { result } = renderHook(() => useApiQuery(fetcher, { enabled: false }));

    /* Give it a tick to not fetch */
    await new Promise((r) => setTimeout(r, 50));
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it("refetch can be called manually", async () => {
    const fetcher = vi.fn().mockResolvedValue("initial");
    const { result } = renderHook(() => useApiQuery(fetcher));

    await waitFor(() => expect(result.current.data).toBe("initial"));

    fetcher.mockResolvedValue("refreshed");
    await act(async () => { result.current.refetch(); });
    await waitFor(() => expect(result.current.data).toBe("refreshed"));
  });

  it("cleans up polling interval on unmount", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    const fetcher = vi.fn().mockResolvedValue("data");
    const { unmount } = renderHook(() =>
      useApiQuery(fetcher, { pollInterval: 60000 }),
    );

    await waitFor(() => expect(fetcher).toHaveBeenCalledOnce());
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
