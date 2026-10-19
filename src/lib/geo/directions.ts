import type { LatLng } from "./distance";

/** External turn-by-turn navigation links (we never compute routes ourselves). */
export function directionsLinks(to: LatLng, from?: LatLng) {
  const dest = `${to.lat},${to.lon}`;
  const origin = from ? `${from.lat},${from.lon}` : "";
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${dest}${origin ? `&origin=${origin}` : ""}`,
    osm: `https://www.openstreetmap.org/directions?route=${encodeURIComponent(`${origin};${dest}`)}`,
  };
}
