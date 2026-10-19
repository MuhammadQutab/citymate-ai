import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Mate } from "@/components/mate/Mate";
import { CATEGORY_IDS, CATEGORY_LABELS, isCategoryId } from "@/lib/places/categories";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const { q, category } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 300) : "";
  const activeCategory = isCategoryId(category) ? category : null;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <main className="relative flex-1 px-4 pb-4 sm:px-8">
        {/* Map stage — React-Leaflet map lands here in Phase 2 */}
        <section
          aria-label="Map"
          className="absolute inset-x-4 bottom-4 top-0 grid place-items-center overflow-hidden rounded-panel border border-white/10 bg-indigo-900 sm:inset-x-8"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(169_166_214/0.15)_1px,transparent_1px),linear-gradient(90deg,rgb(169_166_214/0.15)_1px,transparent_1px)] [background-size:48px_48px]"
          />
          <p className="relative max-w-xs text-center text-sm text-indigo-200">
            The live OpenStreetMap view arrives in Phase 2.
          </p>
        </section>

        {/* Floating AI panel (desktop) / bottom sheet (mobile) */}
        <aside
          aria-label="CityMate assistant"
          className="glass absolute inset-x-6 bottom-6 flex max-h-[55%] flex-col gap-4 rounded-panel p-5 sm:inset-x-auto sm:left-12 sm:top-6 sm:bottom-auto sm:w-96 sm:max-h-none"
        >
          <div className="flex items-center gap-3">
            <Mate variant="bust" state={query ? "thinking" : "idle"} className="h-14 w-14 shrink-0" />
            <div>
              <h1 className="font-display text-lg font-bold">Mate</h1>
              <p className="text-sm text-indigo-200">
                {query ? <>You asked: &ldquo;{query}&rdquo;</> : "What do you need nearby?"}
              </p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Categories">
            {CATEGORY_IDS.map((id) => (
              <li key={id}>
                <span
                  className={`inline-block rounded-full border px-3 py-1.5 text-xs ${
                    id === activeCategory
                      ? "border-coral-400 bg-coral-400 font-semibold text-indigo-950"
                      : "border-white/10 bg-white/5 text-indigo-200"
                  }`}
                >
                  {CATEGORY_LABELS[id]}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-indigo-300">Search, results and chat are wired up in Phases 2–3.</p>
        </aside>
      </main>
    </div>
  );
}
