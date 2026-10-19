import { createBreaker, createCache } from "../server/guards";
import type { OsmElement } from "./normalize";

/**
 * Public Overpass instances, tried in order. These are shared community
 * resources: we keep queries small, cache results, and identify ourselves.
 * https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances
 */
export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export const USER_AGENT = "CityMate-AI-prototype/0.1 (non-commercial open-data prototype)";

export class OverpassUnavailableError extends Error {
  constructor(public readonly attempts: string[]) {
    super(`All Overpass endpoints failed: ${attempts.join("; ")}`);
    this.name = "OverpassUnavailableError";
  }
}

type RunOptions = { timeoutMs?: number; endpoints?: string[]; fetchImpl?: typeof fetch };

export type OverpassResponse = { elements: OsmElement[]; osm3s?: { timestamp_osm_base?: string } };

/** Run an Overpass QL query, failing over between public endpoints. */
/** Per-instance: recent live results (CDN caching sits in front of this) and an outage cooldown. */
const liveCache = createCache<OverpassResponse>({ ttlMs: 60 * 60_000, max: 200 });
export const overpassBreaker = createBreaker();
export const __resetOverpassGuards = () => {
  liveCache.clear();
  overpassBreaker.reset();
};

export async function runOverpass(query: string, opts: RunOptions = {}): Promise<OverpassResponse> {
  const cached = liveCache.get(query);
  if (cached) return cached;
  if (overpassBreaker.isOpen()) throw new OverpassUnavailableError(["cooling down after recent failures"]);
  const { timeoutMs = 7_000, endpoints = OVERPASS_ENDPOINTS, fetchImpl = fetch } = opts;
  const attempts: string[] = [];
  for (const url of endpoints) {
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT },
        body: new URLSearchParams({ data: query }).toString(),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (!res.ok) {
        attempts.push(`${new URL(url).host}: HTTP ${res.status}`);
        continue;
      }
      const json = (await res.json()) as OverpassResponse;
      if (!Array.isArray(json.elements)) {
        attempts.push(`${new URL(url).host}: malformed response`);
        continue;
      }
      liveCache.set(query, json);
      return json;
    } catch (err) {
      attempts.push(`${new URL(url).host}: ${err instanceof Error ? err.name : "error"}`);
    }
  }
  overpassBreaker.trip(60_000);
  throw new OverpassUnavailableError(attempts);
}
