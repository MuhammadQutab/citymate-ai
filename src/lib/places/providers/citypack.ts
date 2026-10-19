import { straightLineMeters } from "../../geo/distance";
import type { CityPack, Place, PlaceProvider } from "../types";

// Static imports per city keep packs bundled with the serverless function.
const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  islamabad: () => import("@/data/citypacks/islamabad.json"),
  rawalpindi: () => import("@/data/citypacks/rawalpindi.json"),
  kotli: () => import("@/data/citypacks/kotli.json"),
};

const cache = new Map<string, Promise<CityPack | null>>();

export function loadCityPack(cityId: string): Promise<CityPack | null> {
  const load = loaders[cityId];
  if (!load) return Promise.resolve(null);
  let pending = cache.get(cityId);
  if (!pending) {
    pending = load()
      .then((m) => m.default as CityPack)
      .catch(() => {
        cache.delete(cityId);
        return null;
      });
    cache.set(cityId, pending);
  }
  return pending;
}

export const PACK_CITY_IDS = Object.keys(loaders);

export function cityPackProvider(cityId: string): PlaceProvider {
  return {
    async search({ category, near, limit = 30 }) {
      const pack = await loadCityPack(cityId);
      if (!pack) throw new Error(`City Pack "${cityId}" unavailable`);
      const places = pack.places
        .filter((p) => p.category === category)
        .map((p) => [p, straightLineMeters(near, p)] as const)
        .sort((a, b) => a[1] - b[1])
        .slice(0, limit)
        .map(([p]) => p);
      return { places, dataDate: pack.generatedAt };
    },
    async getById(id: string): Promise<Place | null> {
      const pack = await loadCityPack(cityId);
      return pack?.places.find((p) => p.id === id) ?? null;
    },
  };
}
