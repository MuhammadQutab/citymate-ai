import { NextResponse } from "next/server";
import { CATEGORY_CONFIG, CATEGORY_GROUPS, CATEGORY_IDS } from "@/lib/places/categories";
import { CITIES } from "@/lib/places/cities";

export const dynamic = "force-static";

/**
 * GET /api/categories → the taxonomy and supported cities, so clients
 * (web or mobile) never hard-code categories.
 */
export function GET() {
  return NextResponse.json({
    groups: Object.entries(CATEGORY_GROUPS).map(([id, g]) => ({ id, ...g })),
    categories: CATEGORY_IDS.map((id) => {
      const c = CATEGORY_CONFIG[id];
      return {
        id,
        label: c.label,
        noun: c.noun,
        glyph: c.glyph,
        group: c.group,
        blurb: c.blurb,
        serviceProvider: Boolean(c.serviceProvider),
        alternatives: c.alternatives ?? [],
      };
    }),
    cities: CITIES.map(({ id, name, region, center, zoom }) => ({ id, name, region, center, zoom })),
  });
}
