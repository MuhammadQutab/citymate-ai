import { beforeEach, describe, expect, it, vi } from "vitest";
import { matchCategory, overpassStatements } from "./categories";
import { cityAt } from "./cities";
import { matchIntent } from "./intent";
import { normalizeElement, normalizeElements, parsePlaceId } from "./normalize";
import { OverpassUnavailableError, runOverpass } from "./overpass";
import { getPlaceById, searchPlaces } from "./service";

// Tests never touch the public Overpass servers.
vi.mock("./overpass", async (importOriginal) => {
  const mod = await importOriginal<typeof import("./overpass")>();
  return { ...mod, runOverpass: vi.fn() };
});
const mockedRun = vi.mocked(runOverpass);
beforeEach(() => {
  mockedRun.mockReset();
  mockedRun.mockRejectedValue(new OverpassUnavailableError(["test: offline"]));
});

describe("matchCategory", () => {
  it("maps OSM tags to our categories", () => {
    expect(matchCategory({ amenity: "fast_food" })).toBe("food");
    expect(matchCategory({ amenity: "bank" })).toBe("atm");
    expect(matchCategory({ shop: "supermarket" })).toBe("grocery");
    expect(matchCategory({ leisure: "park" })).toBeNull();
  });

  it("only treats muslim places of worship (or masjid-named ones) as mosques", () => {
    expect(matchCategory({ amenity: "place_of_worship", religion: "muslim" })).toBe("mosque");
    expect(matchCategory({ amenity: "place_of_worship", name: "Jamia Masjid" })).toBe("mosque");
    expect(matchCategory({ amenity: "place_of_worship", religion: "christian" })).toBeNull();
  });

  it("builds Overpass statements with the religion filter for mosques", () => {
    const q = overpassStatements(["mosque"], "(around:100,1,2)");
    expect(q).toContain('["religion"~"^(muslim|islam)$"]');
  });
});

describe("normalizeElement", () => {
  it("normalises a way with a centre and sanitises fields", () => {
    const p = normalizeElement({
      type: "way",
      id: 42,
      center: { lat: 33.70001234, lon: 73.05 },
      tags: {
        amenity: "restaurant",
        name: "Test Karahi",
        "addr:street": "Jinnah Avenue",
        "addr:city": "Islamabad",
        website: "example.com",
        cuisine: "pakistani;bbq",
        opening_hours: "Mo-Su 12:00-23:00",
      },
    });
    expect(p).toMatchObject({
      id: "way-42",
      name: "Test Karahi",
      category: "food",
      kind: "Restaurant",
      lat: 33.700012,
      address: "Jinnah Avenue, Islamabad",
      website: "https://example.com/",
      cuisine: "pakistani, bbq",
      openingHours: "Mo-Su 12:00-23:00",
    });
  });

  it("drops unsafe website schemes and keeps unnamed places honest", () => {
    const p = normalizeElement({ type: "node", id: 1, lat: 1, lon: 2, tags: { amenity: "atm", website: "javascript:alert(1)" } });
    expect(p?.name).toBeNull();
    expect(p?.website).toBeUndefined();
  });

  it("skips irrelevant or location-less elements and de-duplicates", () => {
    expect(normalizeElement({ type: "node", id: 1, tags: { amenity: "atm" } })).toBeNull();
    const el = { type: "node" as const, id: 7, lat: 1, lon: 1, tags: { amenity: "fuel" } };
    expect(normalizeElements([el, el])).toHaveLength(1);
  });
});

describe("parsePlaceId", () => {
  it("accepts only verified OSM id shapes", () => {
    expect(parsePlaceId("node-123")).toEqual({ type: "node", osmId: 123 });
    expect(parsePlaceId("node-abc")).toBeNull();
    expect(parsePlaceId("../etc")).toBeNull();
  });
});

describe("matchIntent", () => {
  it("finds categories in order of mention plus city", () => {
    const i = matchIntent("I just landed in Islamabad and need cash and dinner");
    expect(i.categories).toEqual(["atm", "food"]);
    expect(i.cityId).toBe("islamabad");
  });

  it("recognises local terms and near-me phrasing", () => {
    const i = matchIntent("nearest masjid for namaz?");
    expect(i.categories).toEqual(["mosque"]);
    expect(i.nearMe).toBe(true);
  });

  it("returns nothing for unrelated text", () => {
    expect(matchIntent("hello there").categories).toEqual([]);
  });
});

describe("cityAt", () => {
  it("resolves points to the nearest supported city", () => {
    expect(cityAt({ lat: 33.7215, lon: 73.0433 })?.id).toBe("islamabad");
    expect(cityAt({ lat: 33.5651, lon: 73.0169 })?.id).toBe("rawalpindi");
    expect(cityAt({ lat: 31.52, lon: 74.36 })).toBeUndefined();
  });
});

describe("searchPlaces", () => {
  it("serves City Pack results sorted by straight-line distance", async () => {
    const r = await searchPlaces({ category: "atm", city: "islamabad", limit: 5 });
    expect(r.source).toBe("citypack");
    expect(r.places.length).toBe(5);
    const d = r.places.map((p) => p.distanceMeters!);
    expect([...d].sort((a, b) => a - b)).toEqual(d);
    expect(r.places.every((p) => p.category === "atm")).toBe(true);
  });

  it("is honest about thin coverage", async () => {
    const r = await searchPlaces({ category: "pharmacy", city: "kotli" });
    expect(r.places).toHaveLength(0);
    expect(r.notices.join(" ")).toMatch(/No pharmacies are mapped/);
    expect(r.notices.join(" ")).toMatch(/lightly mapped/);
  });

  it("falls back to a nearby City Pack when live Overpass is down", async () => {
    // Just outside Islamabad's box (Margalla foothills ~ 20 km away)
    const r = await searchPlaces({ category: "fuel", near: { lat: 33.82, lon: 73.1 } });
    expect(r.source).toBe("citypack");
    expect(r.notices.join(" ")).toMatch(/Live OpenStreetMap search is busy/);
  });

  it("propagates the outage when no City Pack is nearby", async () => {
    await expect(searchPlaces({ category: "fuel", near: { lat: 24.86, lon: 67.0 } })).rejects.toBeInstanceOf(
      OverpassUnavailableError,
    );
  });
});

describe("getPlaceById", () => {
  it("rejects malformed ids without any network call", async () => {
    expect(await getPlaceById("bogus")).toBeNull();
    expect(mockedRun).not.toHaveBeenCalled();
  });

  it("finds pack places by verified id", async () => {
    const r = await searchPlaces({ category: "mosque", city: "islamabad", limit: 1 });
    const found = await getPlaceById(r.places[0].id);
    expect(found?.place.id).toBe(r.places[0].id);
    expect(found?.source).toBe("citypack");
  });
});
