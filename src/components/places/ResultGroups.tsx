"use client";

import { motion } from "motion/react";
import type { LatLng } from "@/lib/geo/distance";
import { CATEGORY_CONFIG, CATEGORY_LABELS, type CategoryId } from "@/lib/places/categories";
import type { PlaceWithDistance } from "@/lib/places/types";
import { ServiceResultCard } from "./ServiceResultCard";

export type ResultGroup = {
  category: CategoryId;
  places: PlaceWithDistance[];
  notices: string[];
  originLabel: string;
  dataDate: string;
  source: "citypack" | "overpass";
  alternativeFor?: CategoryId;
  note?: string;
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Renders primary results and clearly-separated alternatives, with honest empty states. */
export function ResultGroups({
  groups,
  user,
  onWiderSearch,
  widerLoading,
}: {
  groups: ResultGroup[];
  user?: LatLng | null;
  onWiderSearch?: (category: CategoryId) => void;
  widerLoading?: boolean;
}) {
  return (
    <div className="space-y-8">
      {groups.map((g, gi) => {
        const cfg = CATEGORY_CONFIG[g.category];
        return (
          <motion.section
            key={`${g.category}-${g.alternativeFor ?? "main"}-${gi}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: gi * 0.08 }}
            aria-labelledby={`grp-${gi}`}
          >
            <header className="mb-3">
              {g.alternativeFor ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-sunset">
                    Alternative for {CATEGORY_LABELS[g.alternativeFor]} · not a confirmed provider
                  </p>
                  <h3 id={`grp-${gi}`} className="font-display text-xl font-bold">
                    {cfg.glyph} {cfg.label}
                  </h3>
                  <p className="mt-1 text-sm text-indigo-200">{g.note}</p>
                </>
              ) : (
                <>
                  <h3 id={`grp-${gi}`} className="font-display text-xl font-bold">
                    {cfg.glyph} {cfg.label}
                  </h3>
                  <p className="text-xs text-indigo-300">
                    {g.places.length} found · measured from {g.originLabel}
                  </p>
                </>
              )}
            </header>

            {g.notices.map((n) => (
              <p key={n} className="mb-3 rounded-xl border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-xs text-coral-300">
                {n}
              </p>
            ))}

            {g.places.length > 0 ? (
              <ul className="grid gap-3 md:grid-cols-2">
                {g.places.map((p, i) => (
                  <ServiceResultCard key={p.id} place={p} index={i} user={user} alternative={Boolean(g.alternativeFor)} />
                ))}
              </ul>
            ) : (
              !g.alternativeFor && (
                <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-indigo-200">
                  <p>
                    No {cfg.noun} found in the available OpenStreetMap data. Local {cfg.noun} very likely exist but aren&apos;t
                    listed online yet. Asking neighbours, your landlord or a nearby hardware shop is often the fastest route.
                  </p>
                  {onWiderSearch && (
                    <button
                      type="button"
                      onClick={() => onWiderSearch(g.category)}
                      disabled={widerLoading}
                      className="mt-3 rounded-full border border-mint-400/40 px-4 py-2 text-xs font-semibold text-mint-300 transition hover:bg-mint-400/10 disabled:opacity-50"
                    >
                      {widerLoading ? "Searching a wider area…" : "Search a wider area (live, up to 15 km)"}
                    </button>
                  )}
                </div>
              )
            )}
            {!g.alternativeFor && (
              <p className="mt-3 text-[11px] text-indigo-300">
                {g.source === "citypack" ? "City Pack" : "Live"} · OpenStreetMap data as of {dateFmt.format(new Date(g.dataDate))}.
                Distances are approximate straight lines. CityMate does not verify providers.
              </p>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
