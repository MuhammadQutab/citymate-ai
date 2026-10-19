import { NextResponse, type NextRequest } from "next/server";
import { cacheHeaders, errorResponse, parseSearchParams, rateLimit } from "@/lib/api/http";
import { searchWithAlternatives } from "@/lib/places/service";

/**
 * GET /api/services?category=plumber&city=islamabad[&lat=&lon=][&limit=20][&wide=1]
 * → ServiceSearchResult: SearchResult + { category, alternatives[] }.
 * Alternatives are related categories (e.g. hardware shops) and are NOT service providers.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(request, "search");
  if (limited) return limited;
  const parsed = parseSearchParams(request.nextUrl.searchParams);
  if (!parsed.ok) return parsed.error;
  try {
    const result = await searchWithAlternatives(parsed.query);
    return NextResponse.json(result, { headers: cacheHeaders(result.source) });
  } catch (err) {
    return errorResponse(err, "services");
  }
}
