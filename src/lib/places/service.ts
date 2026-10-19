import { straightLineMeters, type LatLng } from "../geo/distance";
import { CATEGORY_CONFIG, CATEGORY_NOUNS, type CategoryId } from "./categories";
import { CITIES, cityAt, DEFAULT_CITY, getCity, inBBox, type City } from "./cities";
import { OverpassUnavailableError } from "./overpass";
import { parsePlaceId } from "./normalize";
import { cityPackProvider, loadCityPack, PACK_CITY_IDS } from "./providers/citypack";
import { overpassProvider } from "./providers/overpass";
import type { Place, PlaceSource, SearchQuery, SearchResult } from "./types";

export const MAX_LIMIT = 60;
const LIVE_RADII_M = [3000, 8000];
const WIDE_RADIUS_M = 15_000;

/**
 * Single entry point for place discovery. Chooses the data source:
 * City Pack when the search origin is inside a supported city, otherwise
 * a live, radius-bounded Overpass lookup. Never invents data.
 */
export async function searchPlaces(q: SearchQuery): Promise<SearchResult> {
  const limit = Math.min(Math.max(q.limit ?? 30, 1), MAX_LIMIT);
  const label = CATEGORY_NOUNS[q.category];
  const notices: string[] = [];

  const requested = q.city ? getCity(q.city) : undefined;
  let city: City | undefined;
  let origin: LatLng;
  let originLabel: string;

  if (q.near && requested) {
    if (inBBox(q.near, requested.bbox)) {
      city = requested;
      origin = q.near;
      originLabel = "your location";
    } else {
      city = requested;
      origin = requested.center;
      originLabel = `${requested.name} centre`;
      notices.push(`You appear to be outside ${requested.name}, so distances are measured from the city centre.`);
    }
  } else if (q.near) {
    city = cityAt(q.near);
    origin = q.near;
    originLabel = "your location";
  } else {
    city = requested ?? getCity(DEFAULT_CITY)!;
    origin = city.center;
    originLabel = `${city.name} centre`;
  }

  if (city?.coverageNote) notices.push(city.coverageNote);

  let places: Place[];
  let dataDate: string;
  let source: PlaceSource;

  if (city && PACK_CITY_IDS.includes(city.id) && !q.wide) {
    ({ places, dataDate } = await cityPackProvider(city.id).search({ category: q.category, near: origin, limit }));
    source = "citypack";
  } else {
    try {
      places = [];
      dataDate = new Date().toISOString();
      let usedRadius = LIVE_RADII_M[0];
      for (const radius of q.wide ? [WIDE_RADIUS_M] : LIVE_RADII_M) {
        usedRadius = radius;
        ({ places, dataDate } = await overpassProvider(radius).search({ category: q.category, near: origin, limit }));
        if (places.length >= 3) break;
      }
      source = "overpass";
      notices.push(
        q.wide
          ? `Wider search: live OpenStreetMap results within ${usedRadius / 1000} km.`
          : `Outside our City Packs — showing live OpenStreetMap results within ${usedRadius / 1000} km.`,
      );
    } catch (err) {
      // Live search down: fall back to the nearest City Pack if it is reasonably close.
      const fallback = nearestPackCity(origin);
      if (!(err instanceof OverpassUnavailableError) || !fallback) throw err;
      city = fallback.city;
      ({ places, dataDate } = await cityPackProvider(city.id).search({ category: q.category, near: origin, limit }));
      source = "citypack";
      notices.push(
        `Live OpenStreetMap search is busy, so these results come from our ${city.name} City Pack (about ${Math.round(fallback.meters / 1000)} km away).`,
      );
    }
  }

  const withDistance = places
    .map((p) => ({ ...p, distanceMeters: Math.round(straightLineMeters(origin, p)) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);

  if (withDistance.length === 0) {
    notices.unshift(
      `No ${label} are mapped on OpenStreetMap ${city ? `in ${city.name}` : "near this location"} yet. That doesn't mean none exist: many local businesses simply aren't listed online.`,
    );
  }

  return { places: withDistance, source, dataDate, cityId: city?.id, origin, originLabel, notices };
}

const FALLBACK_MAX_M = 60_000;

function nearestPackCity(p: LatLng): { city: City; meters: number } | null {
  const best = CITIES.filter((c) => PACK_CITY_IDS.includes(c.id))
    .map((city) => ({ city: city as City, meters: straightLineMeters(p, city.center) }))
    .sort((a, b) => a.meters - b.meters)[0];
  return best && best.meters <= FALLBACK_MAX_M ? best : null;
}

export type PlaceLookup ={ place: Place; source: PlaceSource; dataDate: string; cityId?: string };

/** Resolve a verified place ID. Returns null for unknown/unsupported IDs. */
export async function getPlaceById(id: string): Promise<PlaceLookup | null> {
  if (!parsePlaceId(id)) return null;
  for (const cityId of PACK_CITY_IDS) {
    const pack = await loadCityPack(cityId);
    const place = pack?.places.find((p) => p.id === id);
    if (place && pack) return { place, source: "citypack", dataDate: pack.generatedAt, cityId };
  }
  const place = await overpassProvider(0).getById(id);
  return place ? { place, source: "overpass", dataDate: new Date().toISOString() } : null;
}

export type AlternativeResult = { category: CategoryId; note: string; result: SearchResult };
export type ServiceSearchResult = SearchResult & {
  category: CategoryId;
  /** Related categories shown when real providers are scarce — never presented as providers. */
  alternatives: AlternativeResult[];
};

const ALTERNATIVES_BELOW = 3;

/**
 * Search a category and, when few real matches exist, add clearly-labelled
 * alternatives (e.g. hardware shops when no plumbers are mapped).
 * Alternatives only use City Packs to stay within public Overpass usage limits.
 */
export async function searchWithAlternatives(q: SearchQuery): Promise<ServiceSearchResult> {
  const primary = await searchPlaces(q);
  const cfg = CATEGORY_CONFIG[q.category];
  let alternatives: AlternativeResult[] = [];
  if (cfg.alternatives && primary.places.length < ALTERNATIVES_BELOW && primary.source === "citypack") {
    const cityId = primary.cityId;
    alternatives = (
      await Promise.all(
        cfg.alternatives.map(async (a) => ({
          category: a.id,
          note: a.note,
          result: await searchPlaces({ category: a.id, city: cityId, near: q.near, limit: Math.min(q.limit ?? 10, 10) }),
        })),
      )
    ).filter((a) => a.result.places.length > 0);
  }
  return { ...primary, category: q.category, alternatives };
}
