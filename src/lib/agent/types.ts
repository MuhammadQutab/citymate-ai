import { z } from "zod";
import { CATEGORY_IDS, type CategoryId } from "../places/categories";
import { CITIES } from "../places/cities";
import type { PlaceWithDistance, SearchResult } from "../places/types";

import { MAX_HISTORY, MAX_MESSAGE_CHARS } from "./limits";

const cityIds = CITIES.map((c) => c.id) as [string, ...string[]];

export const ChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
  history: z
    .array(z.object({ role: z.enum(["user", "mate"]), text: z.string().max(MAX_MESSAGE_CHARS * 2) }))
    .max(MAX_HISTORY)
    .default([]),
  city: z.enum(cityIds).optional(),
  near: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }).optional(),
  lastCategories: z.array(z.enum(CATEGORY_IDS)).max(3).default([]),
  /** Reply language; auto-detected from the message when omitted. */
  lang: z.enum(["en", "ur"]).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/** A recommended place. `note` is set when it's an alternative, not a provider of what was asked. */
export type Pick = { place: PlaceWithDistance; why: string; note?: string };

export type ChatResponse = {
  reply: string;
  lang: "en" | "ur";
  /** "ai" = Gemini narrated; "basic" = deterministic fallback (AI off/unavailable). */
  mode: "ai" | "basic";
  categories: CategoryId[];
  cityId?: string;
  picks: Pick[];
  groups: {
    category: CategoryId;
    result: Pick["place"][];
    notices: string[];
    source: SearchResult["source"];
    dataDate: string;
    originLabel: string;
    /** Set when this group is an alternative suggestion for another category. */
    alternativeFor?: CategoryId;
    note?: string;
  }[];
  /** Shown when the AI could not be used. */
  aiNotice?: string;
};
