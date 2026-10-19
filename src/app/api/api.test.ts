import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetAgentCache } from "@/lib/agent/agent";
import { OverpassUnavailableError } from "@/lib/places/overpass";
import { GET as categoriesGET } from "./categories/route";
import { POST as chatPOST } from "./chat/route";
import { GET as placesGET } from "./places/route";
import { GET as servicesGET } from "./services/route";

// No network from tests: live Overpass always "down", AI switched off.
vi.mock("@/lib/places/overpass", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/places/overpass")>();
  return { ...mod, runOverpass: vi.fn().mockRejectedValue(new mod.OverpassUnavailableError(["test"])) };
});

let ip = 0;
const nextIp = () => `203.0.113.${++ip}`;
const get = (path: string, client = nextIp()) =>
  new NextRequest(`http://localhost:3000${path}`, { headers: { "x-forwarded-for": client } });
const post = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", host: "localhost:3000", "x-forwarded-for": nextIp(), ...headers },
  });

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "");
  __resetAgentCache();
});
afterEach(() => vi.unstubAllEnvs());

describe("GET /api/places", () => {
  it("returns City Pack results with CDN cache headers", async () => {
    const res = await placesGET(get("/api/places?category=atm&city=islamabad&limit=3"));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toContain("s-maxage=86400");
    const body = await res.json();
    expect(body.places).toHaveLength(3);
    expect(body.source).toBe("citypack");
  });

  it("rejects invalid input with the shared error shape", async () => {
    const res = await placesGET(get("/api/places?category=nope&lat=91"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ error: "invalid_request", message: expect.any(String) });
    expect(body.issues.length).toBeGreaterThan(0);
  });

  it("maps a live-data outage far from any City Pack to 503", async () => {
    const res = await placesGET(get("/api/places?category=fuel&lat=24.86&lon=67.0"));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("data_source_unavailable");
  });

  it("rate-limits a single client that floods searches", async () => {
    const client = "198.51.100.7";
    let last = 200;
    for (let i = 0; i < 61; i++) last = (await placesGET(get("/api/places?category=atm&city=islamabad&limit=1", client))).status;
    expect(last).toBe(429);
  });
});

describe("GET /api/services and /api/categories", () => {
  it("returns labelled alternatives for plumbers", async () => {
    const body = await (await servicesGET(get("/api/services?category=plumber&city=islamabad"))).json();
    expect(body.alternatives[0].category).toBe("hardware");
  });

  it("exposes the taxonomy", async () => {
    const body = await (await categoriesGET()).json();
    expect(body.categories).toHaveLength(24);
    expect(body.cities.map((c: { id: string }) => c.id)).toEqual(["islamabad", "rawalpindi", "kotli"]);
  });
});

describe("POST /api/chat", () => {
  it("answers in basic mode when AI is off", async () => {
    const res = await chatPOST(post({ message: "nearest pharmacy", city: "islamabad" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mode).toBe("basic");
    expect(body.categories).toEqual(["pharmacy"]);
  });

  it("rejects malformed JSON and oversized messages", async () => {
    const bad = new NextRequest("http://localhost:3000/api/chat", { method: "POST", body: "{nope", headers: { host: "localhost:3000" } });
    expect((await chatPOST(bad)).status).toBe(400);
    expect((await chatPOST(post({ message: "x".repeat(501) }))).status).toBe(400);
  });

  it("blocks cross-site browser requests but allows same-origin and native apps", async () => {
    expect((await chatPOST(post({ message: "atm" }, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await chatPOST(post({ message: "atm" }, { origin: "http://localhost:3000" }))).status).toBe(200);
    expect((await chatPOST(post({ message: "atm" }))).status).toBe(200); // no Origin (mobile app)
  });

  it("rate-limits chat bursts per client", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) {
      const req = post({ message: "atm" }, { "x-forwarded-for": "192.0.2.50" });
      statuses.push((await chatPOST(req)).status);
    }
    expect(statuses.slice(0, 8).every((s) => s === 200)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });

  it("returns 503 (not a crash) when live data is down far from our cities", async () => {
    const res = await chatPOST(post({ message: "petrol", near: { lat: 24.86, lon: 67.0 } }));
    expect(res.status).toBe(503);
    expect(OverpassUnavailableError).toBeDefined();
  });
});
