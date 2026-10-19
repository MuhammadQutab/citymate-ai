import { matchCategory } from "./categories";
import type { Place } from "./types";

export type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const KIND_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  fast_food: "Fast food",
  food_court: "Food court",
  cafe: "Café",
  atm: "ATM",
  bank: "Bank",
  pharmacy: "Pharmacy",
  hospital: "Hospital",
  clinic: "Clinic",
  doctors: "Doctor",
  doctor: "Doctor",
  place_of_worship: "Mosque",
  hotel: "Hotel",
  guest_house: "Guest house",
  hostel: "Hostel",
  motel: "Motel",
  bus_station: "Bus station",
  taxi: "Taxi stand",
  station: "Railway station",
  terminal: "Airport terminal",
  fuel: "Fuel station",
  supermarket: "Supermarket",
  convenience: "Convenience store",
  grocery: "Grocery",
  greengrocer: "Greengrocer",
};

const OSM_ID = /^(node|way|relation)-(\d{1,15})$/;

export function toPlaceId(type: OsmElement["type"], id: number): string {
  return `${type}-${id}`;
}

export function parsePlaceId(id: string): { type: OsmElement["type"]; osmId: number } | null {
  const m = OSM_ID.exec(id);
  return m ? { type: m[1] as OsmElement["type"], osmId: Number(m[2]) } : null;
}

export function osmUrl(id: string): string | null {
  const p = parsePlaceId(id);
  return p ? `https://www.openstreetmap.org/${p.type}/${p.osmId}` : null;
}

const clean = (v: string | undefined) => {
  const t = v?.trim();
  return t ? t.slice(0, 200) : undefined;
};

function buildAddress(t: Record<string, string>): string | undefined {
  if (t["addr:full"]) return clean(t["addr:full"]);
  const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
  const parts = [street, t["addr:sector"] ?? t["addr:suburb"] ?? t["addr:neighbourhood"], t["addr:city"]];
  const joined = parts.filter(Boolean).join(", ");
  return clean(joined);
}

function safeUrl(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Convert a raw Overpass element into a Place, or null if it isn't one we support. */
export function normalizeElement(el: OsmElement): Place | null {
  const tags = el.tags ?? {};
  const category = matchCategory(tags);
  if (!category) return null;
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  const rawKind =
    tags.amenity ?? tags.tourism ?? tags.shop ?? tags.healthcare ?? tags.railway ?? tags.aeroway ?? "";
  const name = clean(tags["name:en"]) ?? clean(tags.name) ?? null;
  const localName = clean(tags["name:ur"]);

  const place: Place = {
    id: toPlaceId(el.type, el.id),
    name,
    category,
    kind: KIND_LABELS[rawKind] ?? rawKind.replace(/_/g, " "),
    lat: Math.round(lat * 1e6) / 1e6,
    lon: Math.round(lon * 1e6) / 1e6,
  };
  if (localName && localName !== name) place.localName = localName;
  const address = buildAddress(tags);
  if (address) place.address = address;
  const phone = clean(tags.phone ?? tags["contact:phone"]);
  if (phone) place.phone = phone;
  const website = safeUrl(clean(tags.website ?? tags["contact:website"]));
  if (website) place.website = website;
  const hours = clean(tags.opening_hours);
  if (hours) place.openingHours = hours;
  const cuisine = clean(tags.cuisine);
  if (cuisine) place.cuisine = cuisine.replace(/[_;]/g, (c) => (c === ";" ? ", " : " "));
  const brand = clean(tags.brand);
  if (brand && brand !== name) place.brand = brand;
  const wheelchair = clean(tags.wheelchair);
  if (wheelchair) place.wheelchair = wheelchair;
  return place;
}

/** Normalise and de-duplicate a list of Overpass elements. */
export function normalizeElements(elements: OsmElement[]): Place[] {
  const seen = new Set<string>();
  const out: Place[] = [];
  for (const el of elements) {
    const p = normalizeElement(el);
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}
