"use client";

import { unnamedLabel } from "@/lib/places/normalize";
import Link from "next/link";
import { motion } from "motion/react";
import { directionsLinks } from "@/lib/geo/directions";
import { formatStraightLine, type LatLng } from "@/lib/geo/distance";
import { CATEGORY_GLYPHS } from "@/lib/places/categories";
import type { PlaceWithDistance } from "@/lib/places/types";
import { ease } from "@/lib/motion";

type Props = {
  place: PlaceWithDistance;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  user?: LatLng | null;
};

export function PlaceCard({ place, index, selected, onSelect, user }: Props) {
  const links = directionsLinks(place, user ?? undefined);
  const from = user ? `?from=${user.lat.toFixed(4)},${user.lon.toFixed(4)}` : "";

  return (
    <motion.li
      data-id={place.id}
      layout="position"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease, delay: Math.min(index, 10) * 0.04 }}
    >
      <article
        className={`group rounded-2xl border p-4 transition-colors ${
          selected ? "border-mint-400/70 bg-mint-400/10 shadow-glow-mint" : "border-white/10 bg-white/[0.04] hover:border-white/25"
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect(place.id)}
          className="flex w-full items-start gap-3 text-left"
          aria-pressed={selected}
        >
          <span
            aria-hidden="true"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${selected ? "bg-mint-400" : "bg-coral-400/90"}`}
          >
            {CATEGORY_GLYPHS[place.category]}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-pearl-50">
              {place.name ?? <span className="italic text-indigo-200">{unnamedLabel(place.kind)}</span>}
            </span>
            <span className="block truncate text-xs text-indigo-200">
              {place.kind}
              {place.cuisine ? ` · ${place.cuisine}` : ""}
              {place.address ? ` · ${place.address}` : ""}
            </span>
            {place.distanceMeters !== undefined && (
              <span className="mt-1 block text-xs font-medium text-mint-300">{formatStraightLine(place.distanceMeters)}</span>
            )}
          </span>
        </button>
        <div className="mt-3 flex gap-2 pl-[3.25rem] text-xs font-semibold">
          <Link
            href={`/place/${place.id}${from}`}
            className="rounded-full bg-white/10 px-3 py-1.5 text-pearl-50 transition hover:bg-white/20"
          >
            Details
          </Link>
          <a
            href={links.google}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-3 py-1.5 text-indigo-200 transition hover:border-mint-400/60 hover:text-pearl-50"
          >
            Directions ↗
          </a>
        </div>
      </article>
    </motion.li>
  );
}
