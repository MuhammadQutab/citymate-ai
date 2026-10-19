/**
 * Discovery category taxonomy (IDs are stable and used in URLs & by the agent).
 * Phase 2 attaches OpenStreetMap tag filters to each category.
 */
export const CATEGORY_IDS = [
  "food",
  "cafe",
  "atm",
  "pharmacy",
  "hospital",
  "mosque",
  "hotel",
  "transport",
  "fuel",
  "grocery",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  food: "Food",
  cafe: "Cafés",
  atm: "ATMs & Banks",
  pharmacy: "Pharmacies",
  hospital: "Hospitals & Clinics",
  mosque: "Mosques",
  hotel: "Stays",
  transport: "Transport",
  fuel: "Fuel",
  grocery: "Groceries",
};

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value);
}
