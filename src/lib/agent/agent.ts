import type { Content } from "@google/genai";
import { z } from "zod";
import { formatStraightLine } from "../geo/distance";
import { CATEGORY_IDS, CATEGORY_LABELS, CATEGORY_NOUNS, type CategoryId } from "../places/categories";
import { CITIES, getCity } from "../places/cities";
import { matchIntent } from "../places/intent";
import { searchPlaces } from "../places/service";
import type { PlaceWithDistance } from "../places/types";
import { AiUnavailableError, aiEnabled, generateJson } from "./gemini";
import type { ChatRequest, ChatResponse, Pick } from "./types";

const MAX_CATEGORIES = 3;
const PER_CATEGORY = 5;

const PERSONA = `You are Mate, the friendly guide inside CityMate AI, a non-commercial prototype that helps travellers and newcomers find everyday places in Pakistani cities (supported: ${CITIES.map((c) => c.name).join(", ")}) using OpenStreetMap data. Be warm, brief and practical. Never claim to have done anything you did not do.`;

/* ---------------- PLAN ---------------- */

const PlanSchema = z.object({
  intent: z.enum(["search", "clarify", "smalltalk", "unsupported"]),
  categories: z.array(z.enum(CATEGORY_IDS)).max(MAX_CATEGORIES),
  city: z.enum(["none", ...CITIES.map((c): string => c.id)]),
  reply: z.string().max(400),
});
type Plan = z.infer<typeof PlanSchema>;

const PLAN_SYSTEM = `${PERSONA}
Your job now is ONLY to understand the user's need and choose from these categories: ${CATEGORY_IDS.map((c) => `${c} (${CATEGORY_LABELS[c]})`).join(", ")}.
Rules:
- intent "search": the user needs one or more of those categories. Pick up to ${MAX_CATEGORIES}, most important first. Use earlier conversation for follow-ups like "what about closer ones?". reply = "".
- intent "clarify": the need is related but too vague; reply with ONE short clarifying question.
- intent "smalltalk": greetings/thanks/questions about CityMate; reply briefly and invite them to ask for a place.
- intent "unsupported": anything outside finding these places (e.g. tourist history, prices, ratings, events, other categories). Reply briefly that you can only help find the listed kinds of places.
- city: one of the supported city ids if the user names it, else "none".
- NEVER mention specific businesses, addresses, ratings, prices, opening hours or distances in reply.`;

function toContents(req: ChatRequest): Content[] {
  return [
    ...req.history.map((h) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text }] })),
    { role: "user", parts: [{ text: req.message }] },
  ];
}

async function plan(req: ChatRequest): Promise<{ plan: Plan; usedAi: boolean }> {
  // Free, deterministic pre-check: skip the model call when keywords are unambiguous.
  const kw = matchIntent(req.message);
  if (kw.categories.length > 0) {
    return {
      plan: { intent: "search", categories: kw.categories.slice(0, MAX_CATEGORIES), city: kw.cityId ?? "none", reply: "" },
      usedAi: false,
    };
  }
  const contextNote = req.lastCategories.length
    ? `\n(Context: the user was last shown: ${req.lastCategories.join(", ")}.)`
    : "";
  const p = await generateJson({
    schema: PlanSchema,
    system: PLAN_SYSTEM + contextNote,
    contents: toContents(req),
    maxOutputTokens: 200,
  });
  // Belt and braces: drop duplicates, keep within bounds.
  return { plan: { ...p, categories: [...new Set(p.categories)].slice(0, MAX_CATEGORIES) }, usedAi: true };
}

/* ---------------- NARRATE ---------------- */

const NarrationSchema = z.object({
  reply: z.string().min(1).max(600),
  picks: z.array(z.object({ ref: z.string().max(8), why: z.string().max(140) })).max(3),
});

const NARRATE_SYSTEM = `${PERSONA}
You are given VERIFIED search results, each with a reference like P1. Write a short, friendly reply (max 70 words) to the user's latest message.
Hard rules:
- Do NOT write any place names, addresses, phone numbers or distances in "reply". The app shows those from verified data. Talk about the results in general ("the closest ATM is under a kilometre away" is NOT allowed; "I found several ATMs near you" is fine).
- "picks": choose up to 3 references from the list that best fit the request. "why" (max 18 words) may ONLY use facts present in that item's fields (e.g. nearest, has listed opening hours, cuisine). Never invent ratings, prices, quality, safety or whether a place is open now.
- Results are measured from the point given in each heading. Only say "near you" if it says "your location"; otherwise say e.g. "near Islamabad centre".
- If a category has no results, say so honestly and suggest trying another city or category.
- Do not add disclaimers about distances or outdated data; the app already shows them.`;

type Ref = { ref: string; place: PlaceWithDistance };

function describe(r: Ref): string {
  const p = r.place;
  const parts = [`${r.ref}: ${p.kind}`, p.name ? `named` : `unnamed`];
  if (p.distanceMeters !== undefined) parts.push(formatStraightLine(p.distanceMeters));
  if (p.cuisine) parts.push(`cuisine: ${p.cuisine}`);
  if (p.openingHours) parts.push(`opening hours listed: ${p.openingHours}`);
  if (p.phone) parts.push("phone listed");
  if (p.address) parts.push("address listed");
  return parts.join("; ");
}

async function narrateWithAi(req: ChatRequest, groups: ChatResponse["groups"], refs: Ref[]) {
  const listing = groups
    .map((g) => {
      const items = refs.filter((r) => r.place.category === g.category).map(describe);
      return `## ${CATEGORY_LABELS[g.category]} (measured from ${g.originLabel})\n${items.length ? items.join("\n") : "NO RESULTS"}${g.notices.length ? `\nNotes: ${g.notices.join(" ")}` : ""}`;
    })
    .join("\n\n");
  const out = await generateJson({
    schema: NarrationSchema,
    system: NARRATE_SYSTEM,
    contents: [...toContents(req).slice(0, -1), { role: "user", parts: [{ text: `${req.message}\n\n[VERIFIED RESULTS]\n${listing}` }] }],
    maxOutputTokens: 350,
  });
  const byRef = new Map(refs.map((r) => [r.ref, r.place]));
  // Only keep picks that reference real results.
  const picks: Pick[] = out.picks.flatMap((p) => {
    const place = byRef.get(p.ref.trim().toUpperCase());
    return place ? [{ place, why: p.why.trim() }] : [];
  });
  return { reply: out.reply.trim(), picks: dedupe(picks) };
}

/** Drop repeated places, including separate OSM entries sharing a name. */
function dedupe(picks: Pick[]): Pick[] {
  const seen = new Set<string>();
  return picks.filter((p) => {
    const keys = [p.place.id, p.place.name?.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")].filter(Boolean) as string[];
    if (keys.some((k) => seen.has(k))) return false;
    keys.forEach((k) => seen.add(k));
    return true;
  });
}

function basicNarration(groups: ChatResponse["groups"]): { reply: string; picks: Pick[] } {
  const found = groups.filter((g) => g.result.length);
  const missing = groups.filter((g) => !g.result.length);
  const parts: string[] = [];
  if (found.length) {
    parts.push(
      `Here are the nearest ${found.map((g) => CATEGORY_NOUNS[g.category]).join(" and ")} from ${found[0].originLabel}.`,
    );
  }
  if (missing.length) parts.push(`I couldn't find any mapped ${missing.map((g) => CATEGORY_NOUNS[g.category]).join(" or ")} here.`);
  const picks = found.map((g) => ({
    place: g.result[0],
    why: g.result[0].distanceMeters !== undefined ? `Nearest ${CATEGORY_LABELS[g.category].toLowerCase()} result` : "Top result",
  }));
  return { reply: parts.join(" "), picks };
}

const AI_NOTICES: Record<AiUnavailableError["reason"], string> = {
  no_key: "AI is switched off, so I'm using basic keyword search.",
  quota: "Mate's free AI quota is used up for now, so I'm using basic keyword search.",
  timeout: "The AI took too long, so I'm using basic keyword search.",
  error: "The AI is unavailable right now, so I'm using basic keyword search.",
  invalid_output: "The AI gave an unusable answer, so I'm using basic keyword search.",
};

/* ---------------- RUN (Plan → Execute → Narrate) ---------------- */

/** At most two model calls per message; every place shown comes from searchPlaces. */
export async function runAgent(req: ChatRequest): Promise<ChatResponse> {
  let aiNotice: string | undefined;
  let aiOk = aiEnabled();
  if (!aiOk) aiNotice = AI_NOTICES.no_key;

  // PLAN
  let p: Plan;
  try {
    p = (await plan(req)).plan;
  } catch (err) {
    if (!(err instanceof AiUnavailableError)) throw err;
    aiOk = false;
    aiNotice = AI_NOTICES[err.reason];
    p = { intent: "unsupported", categories: [], city: "none", reply: "" };
  }

  if (p.intent !== "search" || p.categories.length === 0) {
    const reply =
      p.reply ||
      `I can help you find ${CATEGORY_IDS.slice(0, 6).map((c) => CATEGORY_NOUNS[c]).join(", ")} and more. Try "nearest pharmacy" or pick a category below.`;
    return { reply, mode: aiOk ? "ai" : "basic", categories: [], picks: [], groups: [], aiNotice };
  }

  // EXECUTE (real searches only)
  const cityId = p.city !== "none" ? p.city : req.city;
  const near = p.city !== "none" && req.near && getCity(p.city) ? undefined : req.near;
  const results = await Promise.all(
    p.categories.map((category: CategoryId) => searchPlaces({ category, city: cityId, near, limit: PER_CATEGORY })),
  );
  const groups: ChatResponse["groups"] = results.map((r, i) => ({
    category: p.categories[i],
    result: r.places,
    notices: r.notices,
    source: r.source,
    dataDate: r.dataDate,
    originLabel: r.originLabel,
  }));
  const refs: Ref[] = groups.flatMap((g) => g.result).map((place, i) => ({ ref: `P${i + 1}`, place }));

  // NARRATE
  let narration = basicNarration(groups);
  if (aiOk) {
    try {
      narration = await narrateWithAi(req, groups, refs);
      if (narration.picks.length === 0) narration.picks = basicNarration(groups).picks;
    } catch (err) {
      if (!(err instanceof AiUnavailableError)) throw err;
      aiOk = false;
      aiNotice = AI_NOTICES[err.reason];
    }
  }

  return {
    reply: narration.reply,
    mode: aiOk ? "ai" : "basic",
    categories: p.categories,
    cityId: results[0]?.cityId,
    picks: narration.picks,
    groups,
    aiNotice,
  };
}
