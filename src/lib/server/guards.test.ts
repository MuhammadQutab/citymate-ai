import { describe, expect, it } from "vitest";
import { clientKey, createBreaker, createCache, createRateLimiter } from "./guards";

describe("createRateLimiter", () => {
  it("allows a burst, blocks, then refills over time", () => {
    let t = 0;
    const rl = createRateLimiter({ capacity: 3, refillPerSec: 1, now: () => t });
    expect([rl.take("a"), rl.take("a"), rl.take("a")].every((r) => r.ok)).toBe(true);
    const blocked = rl.take("a");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBe(1);
    expect(rl.take("b").ok).toBe(true); // other clients unaffected
    t = 1_000;
    expect(rl.take("a").ok).toBe(true);
  });

  it("bounds memory by evicting the oldest keys", () => {
    const rl = createRateLimiter({ capacity: 1, refillPerSec: 0.001, maxKeys: 2, now: () => 0 });
    rl.take("a");
    rl.take("b");
    rl.take("c"); // evicts "a"
    expect(rl.take("a").ok).toBe(true);
  });
});

describe("createCache", () => {
  it("expires entries and evicts least-recently-used", () => {
    let t = 0;
    const c = createCache<number>({ ttlMs: 100, max: 2, now: () => t });
    c.set("x", 1);
    c.set("y", 2);
    c.get("x"); // x is now most recent
    c.set("z", 3); // evicts y
    expect(c.get("y")).toBeUndefined();
    expect(c.get("x")).toBe(1);
    t = 200;
    expect(c.get("x")).toBeUndefined();
  });
});

describe("createBreaker", () => {
  it("opens for the cooldown then closes", () => {
    let t = 0;
    const b = createBreaker(() => t);
    expect(b.isOpen()).toBe(false);
    b.trip(1_000);
    expect(b.isOpen()).toBe(true);
    t = 1_001;
    expect(b.isOpen()).toBe(false);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    expect(clientKey(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientKey(new Headers())).toBe("anonymous");
  });
});
