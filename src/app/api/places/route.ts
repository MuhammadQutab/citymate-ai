import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CATEGORY_IDS } from "@/lib/places/categories";
import { CITIES } from "@/lib/places/cities";
import { OverpassUnavailableError } from "@/lib/places/overpass";
import { MAX_LIMIT, searchPlaces } from "@/lib/places/service";

const cityIds = CITIES.map((c) => c.id) as [string, ...string[]];

const QuerySchema = z
  .object({
    category: z.enum(CATEGORY_IDS),
    city: z.enum(cityIds).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lon: z.coerce.number().min(-180).max(180).optional(),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
  })
  .refine((q) => (q.lat === undefined) === (q.lon === undefined), { message: "lat and lon must be provided together" });

export async function GET(request: NextRequest) {
  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues.map((i) => `${i.path.join(".") || "query"}: ${i.message}`) },
      { status: 400 },
    );
  }
  const { category, city, lat, lon, limit } = parsed.data;
  const near = lat !== undefined && lon !== undefined ? { lat, lon } : undefined;

  try {
    const result = await searchPlaces({ category, city, near, limit });
    // City Pack responses are static snapshots; live results are cached shorter.
    const maxAge = result.source === "citypack" ? 86_400 : 3_600;
    return NextResponse.json(result, {
      headers: { "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` },
    });
  } catch (err) {
    if (err instanceof OverpassUnavailableError) {
      console.warn("[places] overpass unavailable", err.attempts);
      return NextResponse.json(
        {
          error: "data_source_unavailable",
          message: "OpenStreetMap's live search servers are busy right now. Please try again shortly, or pick a supported city.",
        },
        { status: 503, headers: { "Retry-After": "30" } },
      );
    }
    console.error("[places] search failed", err);
    return NextResponse.json({ error: "internal_error", message: "Something went wrong while searching." }, { status: 500 });
  }
}
