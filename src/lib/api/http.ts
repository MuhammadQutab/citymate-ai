import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORY_IDS } from "../places/categories";
import { CITIES } from "../places/cities";
import { OverpassUnavailableError } from "../places/overpass";
import { MAX_LIMIT } from "../places/service";
import { clientKey, createRateLimiter } from "../server/guards";

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
  if (!parsed.success) return { ok: false as const, error: badRequest(parsed.error) };
  const { category, city, lat, lon, limit, wide } = parsed.data;
  const near = lat !== undefined && lon !== undefined ? { lat, lon } : undefined;
  return { ok: true as const, query: { category, city, near, limit, wide: Boolean(wide) } };
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

/* ---------------- Abuse protection (best-effort; see src/lib/server/guards.ts) ---------------- */

/** Chat costs model quota: ~10 messages/minute per client after a burst of 8. */
const chatLimiter = createRateLimiter({ capacity: 8, refillPerSec: 1 / 6 });
/** Search is cheap (City Packs + CDN cache): ~1/second after a burst of 60. */
const searchLimiter = createRateLimiter({ capacity: 60, refillPerSec: 1 });

export function rateLimit(request: Request, kind: "chat" | "search"): NextResponse<ApiError> | null {
  const r = (kind === "chat" ? chatLimiter : searchLimiter).take(clientKey(request.headers));
  if (r.ok) return null;
  return NextResponse.json<ApiError>(
    {
      error: "rate_limited",
      message:
        kind === "chat"
          ? `Mate needs a short breather. Please try again in ${r.retryAfterSec} seconds.`
          : `Too many searches at once. Please try again in ${r.retryAfterSec} seconds.`,
    },
    { status: 429, headers: { "Retry-After": String(r.retryAfterSec), "Cache-Control": "no-store" } },
  );
}

/**
 * Browsers always send Origin on cross-site POSTs; reject those so other
 * websites can't spend our quota. Native mobile apps send no Origin and pass.
 */
export function rejectCrossOrigin(request: Request): NextResponse<ApiError> | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    if (host && new URL(origin).host === host) return null;
  } catch {
    /* malformed Origin → reject */
  }
  return NextResponse.json<ApiError>({ error: "forbidden_origin", message: "Requests from other websites are not allowed." }, { status: 403 });
}
