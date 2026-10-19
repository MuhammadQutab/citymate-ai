/**
 * Discovery category taxonomy. IDs are stable: they appear in URLs, API calls
 * and are the only categories the AI agent may choose from.
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

/** Plural noun phrase for sentences ("No pharmacies are mapped…"). */
export const CATEGORY_NOUNS: Record<CategoryId, string> = {
  food: "places to eat",
  cafe: "cafés",
  atm: "ATMs or banks",
  pharmacy: "pharmacies",
  hospital: "hospitals or clinics",
  mosque: "mosques",
  hotel: "places to stay",
  transport: "transport stations",
  fuel: "fuel stations",
  grocery: "grocery shops",
};

/** Short glyph shown inside map markers and chips. */
export const CATEGORY_GLYPHS: Record<CategoryId, string> = {
  food: "🍽",
  cafe: "☕",
  atm: "🏧",
  pharmacy: "💊",
  hospital: "🏥",
  mosque: "🕌",
  hotel: "🛏",
  transport: "🚌",
  fuel: "⛽",
  grocery: "🛒",
};

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value);
}

/** OSM tag selectors per category: [key, allowed values]. */
export const CATEGORY_OSM: Record<CategoryId, [key: string, values: string[]][]> = {
  food: [["amenity", ["restaurant", "fast_food", "food_court"]]],
  cafe: [["amenity", ["cafe"]]],
  atm: [["amenity", ["atm", "bank"]]],
  pharmacy: [
    ["amenity", ["pharmacy"]],
    ["healthcare", ["pharmacy"]],
  ],
  hospital: [
    ["amenity", ["hospital", "clinic", "doctors"]],
    ["healthcare", ["hospital", "clinic", "doctor"]],
  ],
  // Narrowed to religion=muslim/islam in matchCategory and the Overpass query.
  mosque: [["amenity", ["place_of_worship"]]],
  hotel: [["tourism", ["hotel", "guest_house", "hostel", "motel"]]],
  transport: [
    ["amenity", ["bus_station", "taxi"]],
    ["railway", ["station"]],
    ["aeroway", ["terminal"]],
  ],
  fuel: [["amenity", ["fuel"]]],
  grocery: [["shop", ["supermarket", "convenience", "grocery", "greengrocer"]]],
};

const MUSLIM = new Set(["muslim", "islam"]);

/** Classify raw OSM tags into one of our categories (or null if irrelevant). */
export function matchCategory(tags: Record<string, string>): CategoryId | null {
  for (const id of CATEGORY_IDS) {
    for (const [key, values] of CATEGORY_OSM[id]) {
      const v = tags[key];
      if (!v || !values.includes(v)) continue;
      if (id === "mosque") {
        const religion = tags.religion?.toLowerCase();
        const name = `${tags.name ?? ""} ${tags["name:en"] ?? ""}`.toLowerCase();
        if (!(religion && MUSLIM.has(religion)) && !/masjid|mosque|مسجد/.test(name)) continue;
      }
      return id;
    }
  }
  return null;
}

/** Overpass QL statements selecting a category, given a spatial filter like `(around:2000,33.7,73.0)`. */
export function overpassStatements(categories: readonly CategoryId[], spatial: string): string {
  return categories
    .flatMap((id) =>
      CATEGORY_OSM[id].map(([key, values]) => {
        const religion = id === "mosque" ? `["religion"~"^(muslim|islam)$"]` : "";
        return `nwr["${key}"~"^(${values.join("|")})$"]${religion}${spatial};`;
      }),
    )
    .join("\n");
}
