import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEventSource } from "./use-event-source";

/** Minimal EventSource mock for happy-dom. */
class MockEventSource {
  static instances: MockEventSource[] = [];
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  close() { this.closed = true; }

  /** Simulate server sending a message. */
  simulateMessage(data: string) {
    this.onmessage?.({ data } as MessageEvent);
  }

  /** Simulate connection open. */
  simulateOpen() {
    this.onopen?.({} as Event);
  }

  /** Simulate connection error. */
  simulateError() {
    this.onerror?.();
  }
}

beforeEach(() => {
  MockEventSource.instances = [];
  vi.stubGlobal("EventSource", MockEventSource);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useEventSource", () => {
  it("connects and parses JSON messages", async () => {
    const { result } = renderHook(() =>
      useEventSource<{ count: number }>("http://localhost:8420/api/sse"),
    );

    const source = MockEventSource.instances[0];
    act(() => source.simulateOpen());
    expect(result.current.connected).toBe(true);

    act(() => source.simulateMessage(JSON.stringify({ count: 7 })));
    expect(result.current.data).toEqual({ count: 7 });
    expect(result.current.error).toBeNull();
  });

  it("does not connect when url is null", () => {
    renderHook(() => useEventSource(null));
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it("does not connect when disabled", () => {
    renderHook(() =>
      useEventSource("http://example.com/sse", { enabled: false }),
    );
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it("calls onMessage callback", () => {
    const onMessage = vi.fn();
    renderHook(() =>
      useEventSource("http://example.com/sse", { onMessage }),
    );

    const source = MockEventSource.instances[0];
    act(() => source.simulateOpen());
    act(() => source.simulateMessage(JSON.stringify({ event: "update" })));
    expect(onMessage).toHaveBeenCalledWith({ event: "update" });
  });

  it("handles non-JSON messages gracefully", () => {
    const { result } = renderHook(() =>
      useEventSource<string>("http://example.com/sse"),
    );

    const source = MockEventSource.instances[0];
    act(() => source.simulateOpen());
    act(() => source.simulateMessage("plain text"));
    expect(result.current.data).toBe("plain text");
  });

  it("reports error and reconnects on disconnect", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useEventSource("http://example.com/sse"),
    );

    const source = MockEventSource.instances[0];
    act(() => source.simulateOpen());
    expect(result.current.connected).toBe(true);

    act(() => source.simulateError());
    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe("Connection lost");

    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(MockEventSource.instances.length).toBeGreaterThan(1);

    vi.useRealTimers();
  });

  it("cleans up on unmount", () => {
    const { unmount } = renderHook(() =>
      useEventSource("http://example.com/sse"),
    );

    const source = MockEventSource.instances[0];
    act(() => source.simulateOpen());
    unmount();
    expect(source.closed).toBe(true);
  });
});
