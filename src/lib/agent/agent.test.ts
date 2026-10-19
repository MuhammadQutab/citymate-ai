import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAgent } from "./agent";
import { AiUnavailableError, generateJson } from "./gemini";
import { ChatRequestSchema } from "./types";

vi.mock("./gemini", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./gemini")>();
  return { ...mod, generateJson: vi.fn() };
});
// Never reach public Overpass from tests (pack cities don't need it).
vi.mock("../places/overpass", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../places/overpass")>();
  return { ...mod, runOverpass: vi.fn().mockRejectedValue(new mod.OverpassUnavailableError(["test"])) };
});

const gen = vi.mocked(generateJson);
const req = (message: string, extra: object = {}) => ChatRequestSchema.parse({ message, ...extra });

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  gen.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe("runAgent", () => {
  it("skips the planning call when keywords are clear, and keeps only verified picks", async () => {
    gen.mockResolvedValueOnce({
      reply: "I found ATMs near Islamabad centre.",
      picks: [{ ref: "P1", why: "Nearest result" }, { ref: "P99", why: "Invented" }],
    });
    const res = await runAgent(req("need cash", { city: "islamabad" }));
    expect(gen).toHaveBeenCalledTimes(1); // narrate only
    expect(res.mode).toBe("ai");
    expect(res.categories).toEqual(["atm"]);
    expect(res.picks).toHaveLength(1); // P99 rejected
    expect(res.picks[0].place.category).toBe("atm");
    expect(res.groups[0].result.length).toBeGreaterThan(0);
  });

  it("uses the AI planner for indirect requests, capped at two model calls", async () => {
    gen
      .mockResolvedValueOnce({ intent: "search", categories: ["hospital"], city: "rawalpindi", reply: "" })
      .mockResolvedValueOnce({ reply: "Here are some options.", picks: [] });
    const res = await runAgent(req("my child is unwell"));
    expect(gen).toHaveBeenCalledTimes(2);
    expect(res.categories).toEqual(["hospital"]);
    expect(res.cityId).toBe("rawalpindi");
    expect(res.picks.length).toBeGreaterThan(0); // falls back to deterministic picks
  });

  it("answers off-topic questions without searching", async () => {
    gen.mockResolvedValueOnce({ intent: "unsupported", categories: [], city: "none", reply: "I can only help find places." });
    const res = await runAgent(req("who won the cricket match?"));
    expect(res.groups).toEqual([]);
    expect(res.reply).toBe("I can only help find places.");
  });

  it("degrades to basic mode when the free quota is exhausted", async () => {
    gen.mockRejectedValue(new AiUnavailableError("quota"));
    const res = await runAgent(req("pharmacy please", { city: "islamabad" }));
    expect(res.mode).toBe("basic");
    expect(res.aiNotice).toMatch(/quota/);
    expect(res.reply).toMatch(/pharmacies/);
    expect(res.picks[0].place.category).toBe("pharmacy");
  });

  it("works with the AI switched off entirely", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await runAgent(req("mosque nearby", { city: "islamabad" }));
    expect(gen).not.toHaveBeenCalled();
    expect(res.mode).toBe("basic");
    expect(res.categories).toEqual(["mosque"]);
  });

  it("is honest when a city has no mapped results", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await runAgent(req("pharmacy in kotli"));
    expect(res.groups[0].result).toHaveLength(0);
    expect(res.reply).toMatch(/couldn.t find any mapped pharmacies/);
  });
});

describe("ChatRequestSchema", () => {
  it("rejects oversized or empty input", () => {
    expect(ChatRequestSchema.safeParse({ message: "" }).success).toBe(false);
    expect(ChatRequestSchema.safeParse({ message: "x".repeat(501) }).success).toBe(false);
    expect(ChatRequestSchema.safeParse({ message: "hi", city: "lahore" }).success).toBe(false);
  });
});

describe("stripClaims", () => {
  it("removes unsupported endorsement words", async () => {
    const { stripClaims } = await import("./agent");
    expect(stripClaims("I found a verified technician and some great places.")).toBe("I found a technician and some places.");
    expect(stripClaims("A highly rated, trusted plumber")).not.toMatch(/highly rated|trusted/);
  });
});
