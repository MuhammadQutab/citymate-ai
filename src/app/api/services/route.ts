import { NextResponse, type NextRequest } from "next/server";
import { cacheHeaders, errorResponse, parseSearchParams } from "@/lib/api/http";
import { searchWithAlternatives } from "@/lib/places/service";

/**
 * GET /api/services?category=plumber&city=islamabad[&lat=&lon=][&limit=20][&wide=1]
 * → ServiceSearchResult: SearchResult + { category, alternatives[] }.
 * Alternatives are related categories (e.g. hardware shops) and are NOT service providers.
 */
export async function GET(request: NextRequest) {
  const parsed = parseSearchParams(request.nextUrl.searchParams);
  if ("error" in parsed) return parsed.error;
  try {
    const result = await searchWithAlternatives(parsed.query);
    return NextResponse.json(result, { headers: cacheHeaders(result.source) });
  } catch (err) {
    return errorResponse(err, "services");
  }
}
