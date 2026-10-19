import { overpassStatements } from "../categories";
import { normalizeElement, normalizeElements, parsePlaceId } from "../normalize";
import { runOverpass } from "../overpass";
import type { PlaceProvider } from "../types";

/** Live OSM lookups, used outside City Pack coverage. */
export function overpassProvider(radiusM: number): PlaceProvider {
  return {
    async search({ category, near, limit = 30 }) {
      // Round to ~100 m: better cache hits and we never send exact user coordinates.
      const lat = near.lat.toFixed(3);
      const lon = near.lon.toFixed(3);
      const query = `[out:json][timeout:15];\n(\n${overpassStatements([category], `(around:${radiusM},${lat},${lon})`)}\n);\nout tags center ${limit * 3};`;
      const res = await runOverpass(query);
      return {
        places: normalizeElements(res.elements).filter((p) => p.category === category),
        dataDate: res.osm3s?.timestamp_osm_base ?? new Date().toISOString(),
      };
    },
    async getById(id) {
      const parsed = parsePlaceId(id);
      if (!parsed) return null;
      const res = await runOverpass(`[out:json][timeout:15];\n${parsed.type}(${parsed.osmId});\nout tags center;`);
      return res.elements[0] ? normalizeElement(res.elements[0]) : null;
    },
  };
}
