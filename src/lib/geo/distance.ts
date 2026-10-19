export type LatLng = { lat: number; lon: number };

const EARTH_RADIUS_M = 6_371_008.8;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle ("as the crow flies") distance in metres — NOT a route distance. */
export function straightLineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Human label that always signals the distance is approximate and straight-line. */
export function formatStraightLine(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return "Distance unknown";
  if (meters < 50) return "Under 50 m away (straight line)";
  if (meters < 1000) return `≈ ${Math.round(meters / 10) * 10} m away (straight line)`;
  const km = meters / 1000;
  return `≈ ${km < 10 ? km.toFixed(1) : Math.round(km)} km away (straight line)`;
}
