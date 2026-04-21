/**
 * In-memory token bucket rate limiter.
 *
 * Designed for low-ops deployments (single Next.js process, e.g. Vercel
 * single-region or self-hosted). State is per-process — it resets on
 * restart and does not replicate across instances. That is acceptable for
 * the Convergio cockpit, which is a low-concurrency operator tool. When
 * the framework gains multi-instance deployments, swap the `buckets` map
 * for an Upstash / Redis-backed store behind the same surface.
 *
 * The bucket starts full. Every successful `consumeToken` call removes one
 * token. Tokens refill at `refillPerSecond` up to `capacity`.
 */

export interface RateLimitResult {
  /** Whether the request is allowed to proceed. */
  allowed: boolean;
  /** Current token count after this check (pre-consume if allowed). */
  remaining: number;
  /** Bucket capacity (used for `X-RateLimit-Limit`). */
  limit: number;
  /** Seconds until the next token is available (for `Retry-After`). */
  retryAfterSec: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const DEFAULT_CAPACITY = 60;
const DEFAULT_REFILL_PER_SECOND = 1; // 60 requests / minute steady state

const buckets = new Map<string, Bucket>();

function now(): number {
  return Date.now();
}

/**
 * Try to consume one token for `key`.
 *
 * @param key — opaque identifier (session id, IP, etc.).
 * @param capacity — bucket size (default 60).
 * @param refillPerSecond — refill rate (default 1 tok/s).
 */
export function consumeToken(
  key: string,
  capacity = DEFAULT_CAPACITY,
  refillPerSecond = DEFAULT_REFILL_PER_SECOND,
): RateLimitResult {
  const t = now();
  const current = buckets.get(key);

  // Refill.
  let tokens = capacity;
  if (current) {
    const elapsedSec = (t - current.updatedAt) / 1000;
    tokens = Math.min(capacity, current.tokens + elapsedSec * refillPerSecond);
  }

  if (tokens < 1) {
    const needed = 1 - tokens;
    const retryAfterSec = Math.ceil(needed / refillPerSecond);
    buckets.set(key, { tokens, updatedAt: t });
    return {
      allowed: false,
      remaining: Math.floor(tokens),
      limit: capacity,
      retryAfterSec,
    };
  }

  const nextTokens = tokens - 1;
  buckets.set(key, { tokens: nextTokens, updatedAt: t });
  return {
    allowed: true,
    remaining: Math.floor(nextTokens),
    limit: capacity,
    retryAfterSec: 0,
  };
}

/** Clear all bucket state. Test-only helper. */
export function __resetBucketsForTests(): void {
  buckets.clear();
}
