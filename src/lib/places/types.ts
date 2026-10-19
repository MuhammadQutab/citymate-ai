import type { LatLng } from "../geo/distance";
import type { CategoryId } from "./categories";

/** Normalised place — the only shape the UI and the AI agent ever see. */
export type Place = {
  /** Verified OSM identifier, URL-safe: "node-123", "way-456", "relation-789". */
  id: string;
  name: string | null;
  localName?: string;
  category: CategoryId;
  /** Human label of the specific OSM type, e.g. "Fast food", "ATM". */
  kind: string;
  lat: number;
  lon: number;
  address?: string;
  phone?: string;
  website?: string;
  /** Raw OSM opening_hours string; may be outdated. */
  openingHours?: string;
  cuisine?: string;
  brand?: string;
  wheelchair?: string;
};

export type PlaceWithDistance = Place & { distanceMeters?: number };

export type PlaceSource = "citypack" | "overpass";

export type SearchQuery = {
  category: CategoryId;
  city?: string;
  near?: LatLng;
  limit?: number;
  /** Skip City Packs and search live OSM in a wider radius (rate-limited, slower). */
  wide?: boolean;
};

export type SearchResult = {
  places: PlaceWithDistance[];
  source: PlaceSource;
  /** ISO timestamp of the underlying data snapshot. */
  dataDate: string;
  cityId?: string;
  /** Point distances are measured from. */
  origin: LatLng;
  originLabel: string;
  notices: string[];
};

export type CityPack = {
  cityId: string;
  generatedAt: string;
  source: string;
  license: string;
  attribution: string;
  places: Place[];
};

export interface PlaceProvider {
  search(query: SearchQuery & { near: LatLng }): Promise<{ places: Place[]; dataDate: string }>;
  getById(id: string): Promise<Place | null>;
}
