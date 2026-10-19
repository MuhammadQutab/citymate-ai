import type { Metadata } from "next";
import { ExploreWorkspace } from "@/components/explore/ExploreWorkspace";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isCategoryId } from "@/lib/places/categories";
import { DEFAULT_CITY, isCityId } from "@/lib/places/cities";
import { matchIntent } from "@/lib/places/intent";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const { q, category, city } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 300) : "";
  const intent = query ? matchIntent(query) : null;

  const initialCategory = isCategoryId(category) ? category : (intent?.categories[0] ?? null);
  const initialCity = isCityId(city) ? city : (intent?.cityId ?? DEFAULT_CITY);
  const alsoMatched = intent?.categories.filter((c) => c !== initialCategory) ?? [];

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <ExploreWorkspace
        initialCity={initialCity}
        initialCategory={initialCategory}
        initialQuery={query}
        alsoMatched={alsoMatched}
        queryUnmatched={!!intent && intent.categories.length === 0}
      />
    </div>
  );
}
