/**
 * Small, dependency-free reliability primitives for serverless routes.
 *
 * IMPORTANT: state lives in one function instance's memory. On Vercel there
 * may be several instances, and they reset on cold starts, so these are
 * best-effort first lines of defence, NOT globally reliable limits. The hard
 * guarantees come from bounded work per request (≤2 model calls, validated
 * input) and graceful degradation when upstream quotas are hit.
 */

/* ---------------- Token-bucket rate limiter ---------------- */

export type RateLimiter = { take: (key: string) => { ok: boolean; retryAfterSec: number } };

export function createRateLimiter({
  capacity,
  refillPerSec,
  maxKeys = 5_000,
  now = () => Date.now(),
}: {
  capacity: number;
  refillPerSec: number;
  maxKeys?: number;
  now?: () => number;
}): RateLimiter {
  const buckets = new Map<string, { tokens: number; at: number }>();
  return {
    take(key) {
      const t = now();
      const b = buckets.get(key) ?? { tokens: capacity, at: t };
      b.tokens = Math.min(capacity, b.tokens + ((t - b.at) / 1000) * refillPerSec);
      b.at = t;
      buckets.delete(key); // re-insert to keep Map order ≈ LRU
      if (buckets.size >= maxKeys) buckets.delete(buckets.keys().next().value!);
      if (b.tokens >= 1) {
        b.tokens -= 1;
        buckets.set(key, b);
        return { ok: true, retryAfterSec: 0 };
      }
      buckets.set(key, b);
      return { ok: false, retryAfterSec: Math.ceil((1 - b.tokens) / refillPerSec) };
    },
  };
}

/** Best-effort client key. The IP stays in memory only; it is never logged or stored. */
export function clientKey(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "anonymous";
}

/* ---------------- TTL + LRU cache ---------------- */

export type TtlCache<V> = { get: (k: string) => V | undefined; set: (k: string, v: V) => void; clear: () => void; size: () => number };

export function createCache<V>({ ttlMs, max = 300, now = () => Date.now() }: { ttlMs: number; max?: number; now?: () => number }): TtlCache<V> {
  const map = new Map<string, { v: V; exp: number }>();
  return {
    get(k) {
      const e = map.get(k);
      if (!e) return undefined;
      if (e.exp < now()) {
        map.delete(k);
        return undefined;
      }
      map.delete(k);
      map.set(k, e); // refresh recency
      return e.v;
    },
    set(k, v) {
      map.delete(k);
      if (map.size >= max) map.delete(map.keys().next().value!);
      map.set(k, { v, exp: now() + ttlMs });
    },
    clear: () => map.clear(),
    size: () => map.size,
  };
}

/* ---------------- Circuit breaker ---------------- */

/** After an upstream failure, skip calls for a cooldown so users get fast fallbacks instead of timeouts. */
export type Breaker = { isOpen: () => boolean; trip: (cooldownMs: number) => void; reset: () => void };

export function createBreaker(now = () => Date.now()): Breaker {
  let openUntil = 0;
  return {
    isOpen: () => now() < openUntil,
    trip: (ms) => {
      openUntil = Math.max(openUntil, now() + ms);
    },
    reset: () => {
      openUntil = 0;
    },
  };
}
