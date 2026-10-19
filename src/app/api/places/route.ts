import { NextResponse, type NextRequest } from "next/server";
import { cacheHeaders, errorResponse, parseSearchParams } from "@/lib/api/http";
import { searchPlaces } from "@/lib/places/service";

/**
 * GET /api/places?category=atm&city=islamabad[&lat=&lon=][&limit=30][&wide=1]
 * → SearchResult (see src/lib/places/types.ts)
 */
export async function GET(request: NextRequest) {
  const parsed = parseSearchParams(request.nextUrl.searchParams);
  if ("error" in parsed) return parsed.error;
  try {
    const result = await searchPlaces(parsed.query);
    return NextResponse.json(result, { headers: cacheHeaders(result.source) });
  } catch (err) {
    return errorResponse(err, "places");
  }
}
