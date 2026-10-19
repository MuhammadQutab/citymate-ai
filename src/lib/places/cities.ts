import type { LatLng } from "../geo/distance";
import { straightLineMeters } from "../geo/distance";

export type BBox = { south: number; west: number; north: number; east: number };

export type City = {
  id: string;
  name: string;
  region: string;
  center: LatLng;
  bbox: BBox;
  zoom: number;
  /** Honest note shown when OSM coverage is known to be thin. */
  coverageNote?: string;
};

export const CITIES = [
  {
    id: "islamabad",
    name: "Islamabad",
    region: "Islamabad Capital Territory",
    center: { lat: 33.6938, lon: 73.0652 },
    bbox: { south: 33.6, west: 72.93, north: 33.78, east: 73.22 },
    zoom: 13,
  },
  {
    id: "rawalpindi",
    name: "Rawalpindi",
    region: "Punjab",
    center: { lat: 33.5973, lon: 73.0479 },
    bbox: { south: 33.53, west: 72.98, north: 33.66, east: 73.12 },
    zoom: 13,
  },
  {
    id: "kotli",
    name: "Kotli",
    region: "Azad Jammu & Kashmir",
    center: { lat: 33.5156, lon: 73.9019 },
    bbox: { south: 33.47, west: 73.85, north: 33.56, east: 73.95 },
    zoom: 14,
    coverageNote:
      "Kotli is only lightly mapped on OpenStreetMap, so many real places are missing. You can help by adding them at openstreetmap.org.",
  },
] as const satisfies readonly City[];

export type CityId = (typeof CITIES)[number]["id"];

export const DEFAULT_CITY: CityId = "islamabad";

export function getCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function isCityId(value: unknown): value is CityId {
  return typeof value === "string" && CITIES.some((c) => c.id === value);
}

export function inBBox(p: LatLng, b: BBox): boolean {
  return p.lat >= b.south && p.lat <= b.north && p.lon >= b.west && p.lon <= b.east;
}

/** The supported city containing a point (nearest centre wins where boxes overlap). */
export function cityAt(p: LatLng): City | undefined {
  return CITIES.filter((c) => inBBox(p, c.bbox)).sort(
    (a, b) => straightLineMeters(p, a.center) - straightLineMeters(p, b.center),
  )[0];
}
