import type { CategoryId } from "./categories";
import { CITIES, type CityId } from "./cities";

/**
 * Deterministic, AI-free intent matching. Used when the AI is off/unavailable
 * and as a free pre-check before spending a model call.
 */
const KEYWORDS: Record<CategoryId, string[]> = {
  food: ["food", "eat", "eating", "hungry", "dinner", "lunch", "breakfast", "restaurant", "meal", "biryani", "karahi", "bbq", "burger", "pizza", "dhaba", "khana"],
  cafe: ["cafe", "café", "coffee", "tea", "chai", "bakery", "dessert"],
  atm: ["atm", "cash", "bank", "money", "withdraw", "paisa", "paise"],
  pharmacy: ["pharmacy", "chemist", "medicine", "medical store", "drugstore", "dawai", "tablets"],
  hospital: ["hospital", "clinic", "doctor", "emergency", "urgent care", "injury", "sick", "ill", "fever"],
  mosque: ["mosque", "masjid", "pray", "prayer", "namaz", "salah", "jummah", "jumma"],
  hotel: ["hotel", "stay", "room", "sleep", "guest house", "guesthouse", "hostel", "motel", "accommodation", "lodging"],
  transport: ["bus", "taxi", "transport", "station", "train", "railway", "airport", "terminal", "metro", "ride"],
  fuel: ["fuel", "petrol", "diesel", "gas station", "cng", "pump"],
  grocery: ["grocery", "groceries", "supermarket", "mart", "convenience", "vegetables", "fruit", "kiryana", "karyana"],
};

export type Intent = { categories: CategoryId[]; cityId?: CityId; nearMe: boolean };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function matchIntent(text: string): Intent {
  const t = ` ${text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ")} `;
  const hits: { id: CategoryId; at: number }[] = [];
  for (const [id, words] of Object.entries(KEYWORDS) as [CategoryId, string[]][]) {
    let first = Infinity;
    for (const w of words) {
      const m = new RegExp(`\\s${escape(w)}s?\\s`).exec(t);
      if (m && m.index < first) first = m.index;
    }
    if (first !== Infinity) hits.push({ id, at: first });
  }
  const city = CITIES.find((c) =>
    [c.name.toLowerCase(), c.id, ...("aliases" in c ? c.aliases : [])].some((n) => t.includes(` ${n} `)),
  );
  return {
    categories: hits.sort((a, b) => a.at - b.at).map((h) => h.id),
    cityId: city?.id,
    nearMe: /\b(near|nearby|nearest|closest|around me|close by)\b/.test(t),
  };
}
