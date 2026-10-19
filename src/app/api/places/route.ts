import { NextResponse, type NextRequest } from "next/server";
import { cacheHeaders, errorResponse, parseSearchParams, rateLimit } from "@/lib/api/http";
import { searchPlaces } from "@/lib/places/service";

/**
 * GET /api/places?category=atm&city=islamabad[&lat=&lon=][&limit=30][&wide=1]
 * → SearchResult (see src/lib/places/types.ts)
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "search");
  if (limited) return limited;
  const parsed = parseSearchParams(request.nextUrl.searchParams);
  if (!parsed.ok) return parsed.error;
  try {
    const result = await searchPlaces(parsed.query);
    return NextResponse.json(result, { headers: cacheHeaders(result.source) });
  } catch (err) {
    return errorResponse(err, "places");
  }
}
