import { CATEGORY_CONFIG, CATEGORY_IDS, CATEGORY_URDU, type CategoryId } from "./categories";
import { CITIES, type CityId } from "./cities";

/**
 * Deterministic, AI-free intent matching from the central taxonomy keywords.
 * Used when the AI is off/unavailable and as a free pre-check before a model call.
 */
export type Intent = { categories: CategoryId[]; cityId?: CityId; nearMe: boolean };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PATTERNS = CATEGORY_IDS.map((id) => ({
  id,
  res: [...CATEGORY_CONFIG[id].keywords, ...CATEGORY_URDU[id].keywords].map(
    (w) => new RegExp(`\\s${escape(w.toLowerCase())}s?\\s`),
  ),
}));

export function matchIntent(text: string): Intent {
  const t = ` ${text.toLowerCase().replace(/&/g, " & ").replace(/[^\p{L}\p{M}\p{N}&\s]/gu, " ").replace(/\s+/g, " ")} `;
  const hits: { id: CategoryId; at: number }[] = [];
  for (const { id, res } of PATTERNS) {
    let first = Infinity;
    for (const re of res) {
      const m = re.exec(t);
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
