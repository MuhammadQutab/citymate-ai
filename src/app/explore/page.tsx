import type { Metadata } from "next";
import { ExploreWorkspace } from "@/components/explore/ExploreWorkspace";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isCategoryId } from "@/lib/places/categories";
import { DEFAULT_CITY, isCityId } from "@/lib/places/cities";
import { matchIntent } from "@/lib/places/intent";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const { q, category, city } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 500) : "";
  // Instant, free first guess so the map fills while Mate thinks.
  const intent = query ? matchIntent(query) : null;

  const initialCategory = isCategoryId(category) ? category : (intent?.categories[0] ?? null);
  const initialCity = isCityId(city) ? city : (intent?.cityId ?? DEFAULT_CITY);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <ExploreWorkspace initialCity={initialCity} initialCategory={initialCategory} initialQuery={query} />
    </div>
  );
}
