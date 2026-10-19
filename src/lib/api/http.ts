import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORY_IDS } from "../places/categories";
import { CITIES } from "../places/cities";
import { OverpassUnavailableError } from "../places/overpass";
import { MAX_LIMIT } from "../places/service";

/**
 * Shared HTTP contract for web and future mobile clients.
 * Errors always look like: { error: <code>, message: <human text>, issues?: string[] }.
 */
export type ApiError = { error: string; message: string; issues?: string[] };

const cityIds = CITIES.map((c) => c.id) as [string, ...string[]];

export const SearchParamsSchema = z
  .object({
    category: z.enum(CATEGORY_IDS),
    city: z.enum(cityIds).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lon: z.coerce.number().min(-180).max(180).optional(),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
    wide: z.enum(["1", "true"]).optional(),
  })
  .refine((q) => (q.lat === undefined) === (q.lon === undefined), { message: "lat and lon must be provided together" });

export function parseSearchParams(params: URLSearchParams) {
  const parsed = SearchParamsSchema.safeParse(Object.fromEntries(params));
  if (!parsed.success) return { error: badRequest(parsed.error) } as const;
  const { category, city, lat, lon, limit, wide } = parsed.data;
  const near = lat !== undefined && lon !== undefined ? { lat, lon } : undefined;
  return { query: { category, city, near, limit, wide: Boolean(wide) } } as const;
}

export function badRequest(err: z.ZodError) {
  return NextResponse.json<ApiError>(
    {
      error: "invalid_request",
      message: "Some request parameters are invalid.",
      issues: err.issues.map((i) => `${i.path.join(".") || "query"}: ${i.message}`),
    },
    { status: 400 },
  );
}

export function errorResponse(err: unknown, scope: string) {
  if (err instanceof OverpassUnavailableError) {
    console.warn(`[${scope}] overpass unavailable`, err.attempts);
    return NextResponse.json<ApiError>(
      {
        error: "data_source_unavailable",
        message: "OpenStreetMap's live search servers are busy right now. Please try again shortly, or pick a supported city.",
      },
      { status: 503, headers: { "Retry-After": "30" } },
    );
  }
  console.error(`[${scope}] failed`, err);
  return NextResponse.json<ApiError>({ error: "internal_error", message: "Something went wrong. Please try again." }, { status: 500 });
}

/** Pack results are static snapshots; live results are cached for a shorter time. */
export function cacheHeaders(source: "citypack" | "overpass") {
  const maxAge = source === "citypack" ? 86_400 : 3_600;
  return { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` };
}
