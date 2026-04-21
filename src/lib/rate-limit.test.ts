import { beforeEach, describe, expect, it, vi } from "vitest";

import { __resetBucketsForTests, consumeToken } from "./rate-limit";

describe("consumeToken (token bucket)", () => {
  beforeEach(() => {
    __resetBucketsForTests();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  it("allows the first request and starts with a full bucket", () => {
    const r = consumeToken("sess-1", 5, 1);
    expect(r.allowed).toBe(true);
    expect(r.limit).toBe(5);
    expect(r.remaining).toBe(4);
  });

  it("drains the bucket and rejects the 6th request with a retry-after", () => {
    for (let i = 0; i < 5; i++) {
      expect(consumeToken("sess-2", 5, 1).allowed).toBe(true);
    }
    const blocked = consumeToken("sess-2", 5, 1);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("refills one token per second up to capacity", () => {
    for (let i = 0; i < 5; i++) {
      consumeToken("sess-3", 5, 1);
    }
    expect(consumeToken("sess-3", 5, 1).allowed).toBe(false);

    vi.advanceTimersByTime(2_000); // 2 tokens refilled

    expect(consumeToken("sess-3", 5, 1).allowed).toBe(true);
    expect(consumeToken("sess-3", 5, 1).allowed).toBe(true);
    expect(consumeToken("sess-3", 5, 1).allowed).toBe(false);
  });

  it("isolates per-key buckets", () => {
    for (let i = 0; i < 5; i++) consumeToken("alice", 5, 1);
    expect(consumeToken("alice", 5, 1).allowed).toBe(false);
    expect(consumeToken("bob", 5, 1).allowed).toBe(true);
  });

  it("caps refill at capacity so idle sessions do not accrue extra tokens", () => {
    consumeToken("sess-4", 3, 1);
    vi.advanceTimersByTime(10_000); // far more refill than capacity
    const r = consumeToken("sess-4", 3, 1);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2); // capped at 3 before consume
  });
});
