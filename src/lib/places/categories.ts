/**
 * Central category taxonomy — the single source of truth for every page, API,
 * the AI agent and future mobile clients. To add a category, add one entry to
 * CATEGORY_CONFIG (and its id to CATEGORY_IDS); nothing else needs rewriting.
 * IDs are stable: they appear in URLs and API payloads.
 */
export const CATEGORY_IDS = [
  // Daily essentials
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
  "cash_carry",
  // Home services (tradespeople)
  "plumber",
  "electrician",
  "ac_repair",
  "appliance_repair",
  "cleaning",
  "carpenter",
  "painter",
  // Shopping for the home
  "hardware",
  "appliance_store",
  "furniture",
  // Family & lifestyle
  "park",
  "playground",
  "market",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type CategoryGroup = "essentials" | "home_services" | "home_shopping" | "family";

export type CategoryConfig = {
  label: string;
  /** Plural noun phrase for sentences ("No pharmacies are mapped…"). */
  noun: string;
  glyph: string;
  group: CategoryGroup;
  /** OSM tag selectors: [key, allowed values]. Order matters for classification. */
  osm: [key: string, values: string[]][];
  /** Everyday words and problem phrases that imply this category (AI-free matching). */
  keywords: string[];
  /** True for people who provide a service (vs. shops/facilities). */
  serviceProvider?: boolean;
  /** Related categories to suggest when nothing is found — clearly labelled as alternatives. */
  alternatives?: { id: CategoryId; note: string }[];
  /** One-line description for category cards. */
  blurb: string;
};

export const CATEGORY_GROUPS: Record<CategoryGroup, { label: string; blurb: string }> = {
  essentials: { label: "Daily essentials", blurb: "Food, cash, medicine and getting around" },
  home_services: { label: "Home services", blurb: "Trusted trades for repairs and upkeep" },
  home_shopping: { label: "Home setup shopping", blurb: "Supplies, appliances and furniture" },
  family: { label: "Family & lifestyle", blurb: "Parks, play areas and markets" },
};

export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = {
  food: {
    label: "Food", noun: "places to eat", glyph: "🍽", group: "essentials",
    osm: [["amenity", ["restaurant", "fast_food", "food_court"]]],
    keywords: ["food", "eat", "eating", "hungry", "dinner", "lunch", "breakfast", "restaurant", "meal", "biryani", "karahi", "bbq", "burger", "pizza", "dhaba", "khana"],
    blurb: "Restaurants, fast food and food courts",
  },
  cafe: {
    label: "Cafés", noun: "cafés", glyph: "☕", group: "essentials",
    osm: [["amenity", ["cafe"]]],
    keywords: ["cafe", "café", "coffee", "tea", "chai", "bakery", "dessert"],
    blurb: "Coffee, chai and a place to sit",
  },
  atm: {
    label: "ATMs & Banks", noun: "ATMs or banks", glyph: "🏧", group: "essentials",
    osm: [["amenity", ["atm", "bank"]]],
    keywords: ["atm", "cash", "bank", "money", "withdraw", "paisa", "paise"],
    blurb: "Withdraw cash or open an account",
  },
  pharmacy: {
    label: "Pharmacies", noun: "pharmacies", glyph: "💊", group: "essentials",
    osm: [["amenity", ["pharmacy"]], ["healthcare", ["pharmacy"]]],
    keywords: ["pharmacy", "chemist", "medicine", "medical store", "drugstore", "dawai", "tablets"],
    blurb: "Medicines and medical stores",
  },
  hospital: {
    label: "Hospitals & Clinics", noun: "hospitals or clinics", glyph: "🏥", group: "essentials",
    osm: [["amenity", ["hospital", "clinic", "doctors"]], ["healthcare", ["hospital", "clinic", "doctor"]]],
    keywords: ["hospital", "clinic", "doctor", "emergency", "urgent care", "injury", "sick", "ill", "fever"],
    blurb: "Hospitals, clinics and doctors",
  },
  mosque: {
    label: "Mosques", noun: "mosques", glyph: "🕌", group: "essentials",
    osm: [["amenity", ["place_of_worship"]]], // narrowed to muslim in matchCategory/overpassStatements
    keywords: ["mosque", "masjid", "pray", "prayer", "namaz", "salah", "jummah", "jumma"],
    blurb: "Places for prayer",
  },
  hotel: {
    label: "Stays", noun: "places to stay", glyph: "🛏", group: "essentials",
    osm: [["tourism", ["hotel", "guest_house", "hostel", "motel"]]],
    keywords: ["hotel", "stay", "sleep", "guest house", "guesthouse", "hostel", "motel", "accommodation", "lodging"],
    blurb: "Hotels and guest houses",
  },
  transport: {
    label: "Transport", noun: "transport stations", glyph: "🚌", group: "essentials",
    osm: [["amenity", ["bus_station", "taxi"]], ["railway", ["station"]], ["aeroway", ["terminal"]]],
    keywords: ["bus", "taxi", "transport", "station", "train", "railway", "airport", "terminal", "metro"],
    blurb: "Bus and rail stations, taxi stands",
  },
  fuel: {
    label: "Fuel", noun: "fuel stations", glyph: "⛽", group: "essentials",
    osm: [["amenity", ["fuel"]]],
    keywords: ["fuel", "petrol", "diesel", "gas station", "cng", "pump"],
    blurb: "Petrol, diesel and CNG",
  },
  grocery: {
    label: "Groceries", noun: "grocery shops", glyph: "🛒", group: "essentials",
    osm: [["shop", ["supermarket", "convenience", "grocery", "greengrocer"]]],
    keywords: ["grocery", "groceries", "supermarket", "mart", "convenience", "vegetables", "fruit", "kiryana", "karyana"],
    blurb: "Supermarkets and corner stores",
  },
  cash_carry: {
    label: "Cash & Carry", noun: "cash-and-carry or wholesale stores", glyph: "📦", group: "essentials",
    osm: [["shop", ["wholesale"]]],
    keywords: ["cash and carry", "cash & carry", "wholesale", "bulk", "metro store"],
    alternatives: [{ id: "grocery", note: "Supermarkets are an alternative, not wholesale stores." }],
    blurb: "Bulk shopping for a new home",
  },
  plumber: {
    label: "Plumbers", noun: "plumbers", glyph: "🔧", group: "home_services", serviceProvider: true,
    osm: [["craft", ["plumber"]]],
    keywords: ["plumber", "plumbing", "leak", "leaking", "leaks", "tap", "pipe", "pipes", "drain", "blocked drain", "toilet", "flush", "geyser", "water tank", "sink", "nalka"],
    alternatives: [{ id: "hardware", note: "Hardware shops sell plumbing parts. They are not confirmed plumbers, though staff may know local tradespeople." }],
    blurb: "Leaks, taps, pipes, drains and geysers",
  },
  electrician: {
    label: "Electricians", noun: "electricians", glyph: "💡", group: "home_services", serviceProvider: true,
    osm: [["craft", ["electrician"]]],
    keywords: ["electrician", "electrical", "wiring", "socket", "switch", "switchboard", "ceiling fan", "fan", "fans", "short circuit", "power cut", "ups", "inverter", "light fitting", "bijli"],
    alternatives: [
      { id: "hardware", note: "Hardware shops sell electrical supplies. They are not confirmed electricians." },
      { id: "appliance_store", note: "Electronics stores sell fans and fittings. They are not confirmed installers." },
    ],
    blurb: "Wiring, fans, sockets and power issues",
  },
  ac_repair: {
    label: "AC & Fridge Repair", noun: "AC or refrigeration technicians", glyph: "❄️", group: "home_services", serviceProvider: true,
    osm: [["craft", ["hvac", "refrigeration"]]],
    keywords: ["ac", "air conditioner", "air conditioning", "aircon", "cooling", "not cooling", "fridge", "refrigerator", "freezer", "hvac", "gas refill"],
    alternatives: [
      { id: "appliance_repair", note: "General appliance and electronics repair shops. They may not service ACs." },
      { id: "appliance_store", note: "Appliance stores. They are not confirmed repair services." },
    ],
    blurb: "AC not cooling, fridge and freezer faults",
  },
  appliance_repair: {
    label: "Appliance Repair", noun: "appliance or electronics repair shops", glyph: "🛠", group: "home_services", serviceProvider: true,
    osm: [["craft", ["electronics_repair"]], ["shop", ["repair", "electronics_repair"]]],
    keywords: ["appliance repair", "electronics repair", "washing machine", "microwave", "oven", "tv repair", "television", "iron", "mobile repair", "laptop repair", "stove"],
    alternatives: [{ id: "appliance_store", note: "Appliance stores. They are not confirmed repair services." }],
    blurb: "Washing machines, microwaves, TVs and more",
  },
  cleaning: {
    label: "Cleaning & Laundry", noun: "cleaning or laundry services", glyph: "🧽", group: "home_services", serviceProvider: true,
    osm: [["craft", ["cleaning"]], ["shop", ["laundry", "dry_cleaning"]]],
    keywords: ["clean", "cleaning", "cleaner", "maid", "housekeeping", "deep clean", "laundry", "dry clean", "dry cleaning", "washing clothes", "dhobi"],
    blurb: "Home cleaning, laundry and dry cleaning",
  },
  carpenter: {
    label: "Carpenters", noun: "carpenters", glyph: "🪚", group: "home_services", serviceProvider: true,
    osm: [["craft", ["carpenter", "joiner", "cabinet_maker"]]],
    keywords: ["carpenter", "carpentry", "wood", "wooden", "furniture repair", "cupboard", "wardrobe", "door repair", "hinge", "bed repair", "lakri"],
    alternatives: [
      { id: "furniture", note: "Furniture shops. They are not confirmed repair services." },
      { id: "hardware", note: "Hardware shops sell fittings and tools. They are not confirmed carpenters." },
    ],
    blurb: "Doors, cupboards and furniture repairs",
  },
  painter: {
    label: "Painters", noun: "painters", glyph: "🎨", group: "home_services", serviceProvider: true,
    osm: [["craft", ["painter"]], ["shop", ["paint"]]],
    keywords: ["painter", "paint", "painting", "repaint", "whitewash", "walls", "damp", "rang"],
    alternatives: [{ id: "hardware", note: "Hardware shops may sell paint. They are not confirmed painters." }],
    blurb: "Interior and exterior painting",
  },
  hardware: {
    label: "Hardware Shops", noun: "hardware shops", glyph: "🔩", group: "home_shopping",
    osm: [["shop", ["hardware", "doityourself", "trade"]]],
    keywords: ["hardware", "tools", "screws", "nails", "drill", "bulb", "bulbs", "extension cord", "sanitary"],
    blurb: "Tools, fittings and repair supplies",
  },
  appliance_store: {
    label: "Appliance & Electronics", noun: "appliance or electronics stores", glyph: "🔌", group: "home_shopping",
    osm: [["shop", ["appliance", "electronics", "electrical"]]],
    keywords: ["appliance", "appliances", "electronics", "buy fan", "buy ac", "kettle", "home appliances", "electric store"],
    blurb: "Fans, ACs, kitchen appliances, electronics",
  },
  furniture: {
    label: "Furniture & Household", noun: "furniture or household stores", glyph: "🛋", group: "home_shopping",
    osm: [["shop", ["furniture", "houseware", "household_linen", "interior_decoration", "bed", "curtain"]]],
    keywords: ["furniture", "sofa", "mattress", "bed", "curtains", "household", "kitchenware", "utensils", "crockery", "home essentials"],
    blurb: "Furniture, bedding and kitchenware",
  },
  park: {
    label: "Parks", noun: "parks", glyph: "🌳", group: "family",
    osm: [["leisure", ["park"]]],
    keywords: ["park", "parks", "garden", "walk", "jogging", "green space", "picnic"],
    blurb: "Green spaces for walks and picnics",
  },
  playground: {
    label: "Play Areas", noun: "children's play areas", glyph: "🛝", group: "family",
    osm: [["leisure", ["playground"]]],
    keywords: ["playground", "play area", "kids", "children", "child friendly", "family friendly", "swings"],
    alternatives: [{ id: "park", note: "Parks, some of which may have play equipment." }],
    blurb: "Playgrounds for children",
  },
  market: {
    label: "Markets & Malls", noun: "markets or malls", glyph: "🛍", group: "family",
    osm: [["amenity", ["marketplace"]], ["shop", ["mall", "department_store"]]],
    keywords: ["market", "bazaar", "bazar", "mall", "shopping", "shopping centre", "department store"],
    blurb: "Bazaars, malls and shopping centres",
  },
};

/* ---- Derived lookups (kept for existing imports) ---- */

const map = <T>(f: (c: CategoryConfig) => T) =>
  Object.fromEntries(CATEGORY_IDS.map((id) => [id, f(CATEGORY_CONFIG[id])])) as Record<CategoryId, T>;

export const CATEGORY_LABELS = map((c) => c.label);
export const CATEGORY_NOUNS = map((c) => c.noun);
export const CATEGORY_GLYPHS = map((c) => c.glyph);
export const CATEGORY_OSM = map((c) => c.osm);

export function categoriesInGroup(group: CategoryGroup): CategoryId[] {
  return CATEGORY_IDS.filter((id) => CATEGORY_CONFIG[id].group === group);
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value);
}

const MUSLIM = new Set(["muslim", "islam"]);

/** Classify raw OSM tags: the matched category and the specific tag value. */
export function matchCategoryTag(tags: Record<string, string>): { id: CategoryId; value: string } | null {
  for (const id of CATEGORY_IDS) {
    for (const [key, values] of CATEGORY_CONFIG[id].osm) {
      const v = tags[key];
      if (!v || !values.includes(v)) continue;
      if (id === "mosque") {
        const religion = tags.religion?.toLowerCase();
        const name = `${tags.name ?? ""} ${tags["name:en"] ?? ""}`.toLowerCase();
        if (!(religion && MUSLIM.has(religion)) && !/masjid|mosque|مسجد/.test(name)) continue;
      }
      return { id, value: v };
    }
  }
  return null;
}

export function matchCategory(tags: Record<string, string>): CategoryId | null {
  return matchCategoryTag(tags)?.id ?? null;
}

/** Overpass QL statements selecting categories, given a spatial filter like `(around:2000,33.7,73.0)`. */
export function overpassStatements(categories: readonly CategoryId[], spatial: string): string {
  return categories
    .flatMap((id) =>
      CATEGORY_CONFIG[id].osm.map(([key, values]) => {
        const religion = id === "mosque" ? `["religion"~"^(muslim|islam)$"]` : "";
        return `nwr["${key}"~"^(${values.join("|")})$"]${religion}${spatial};`;
      }),
    )
    .join("\n");
}
