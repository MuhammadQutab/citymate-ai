import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetOverpassGuards, OverpassUnavailableError, runOverpass } from "./overpass";

const ok = (elements: unknown[] = []) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify({ elements }), { status: 200, headers: { "content-type": "application/json" } }));

beforeEach(() => __resetOverpassGuards());

describe("runOverpass", () => {
  it("fails over to the next endpoint", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 502 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ elements: [] }), { status: 200 }));
    await expect(runOverpass("q1", { fetchImpl, endpoints: ["https://a.test/i", "https://b.test/i"] })).resolves.toEqual({ elements: [] });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("serves repeated queries from cache", async () => {
    const fetchImpl = ok();
    await runOverpass("q2", { fetchImpl, endpoints: ["https://a.test/i"] });
    await runOverpass("q2", { fetchImpl, endpoints: ["https://a.test/i"] });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("after a full outage, fails fast without hammering the servers", async () => {
    const down = vi.fn().mockResolvedValue(new Response("busy", { status: 504 }));
    await expect(runOverpass("q3", { fetchImpl: down, endpoints: ["https://a.test/i"] })).rejects.toBeInstanceOf(OverpassUnavailableError);
    const later = ok();
    await expect(runOverpass("q4", { fetchImpl: later, endpoints: ["https://a.test/i"] })).rejects.toBeInstanceOf(OverpassUnavailableError);
    expect(later).not.toHaveBeenCalled();
  });
});
