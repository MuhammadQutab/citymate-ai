"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { directionsLinks } from "@/lib/geo/directions";
import { formatStraightLine, type LatLng } from "@/lib/geo/distance";
import { CATEGORY_GLYPHS } from "@/lib/places/categories";
import type { PlaceWithDistance } from "@/lib/places/types";
import { ease } from "@/lib/motion";

/** Result card with an explicit "what we know / don't know" completeness row. */
export function ServiceResultCard({
  place,
  index = 0,
  user,
  alternative,
}: {
  place: PlaceWithDistance;
  index?: number;
  user?: LatLng | null;
  alternative?: boolean;
}) {
  const links = directionsLinks(place, user ?? undefined);
  const from = user ? `?from=${user.lat.toFixed(4)},${user.lon.toFixed(4)}` : "";
  const facts = [
    { label: "Phone", ok: Boolean(place.phone) },
    { label: "Address", ok: Boolean(place.address) },
    { label: "Hours", ok: Boolean(place.openingHours) },
  ];

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease, delay: Math.min(index, 8) * 0.05 }}
      className={`rounded-2xl border p-4 ${alternative ? "border-sunset/30 bg-sunset/[0.05]" : "border-white/10 bg-white/[0.04]"}`}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${alternative ? "bg-sunset/80" : "bg-coral-400/90"}`}>
          {CATEGORY_GLYPHS[place.category]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-pearl-50">
            {place.name ?? <span className="italic text-indigo-200">Unnamed {place.kind.toLowerCase()}</span>}
          </p>
          <p className="truncate text-xs text-indigo-200">
            {place.kind}
            {place.address ? ` · ${place.address}` : ""}
          </p>
          {place.distanceMeters !== undefined && (
            <p className="mt-0.5 text-xs font-medium text-mint-300">{formatStraightLine(place.distanceMeters)}</p>
          )}
          {place.phone && (
            <a href={`tel:${place.phone.replace(/[^\d+]/g, "")}`} className="mt-1 inline-block text-sm font-semibold text-mint-300 underline underline-offset-2">
              {place.phone}
            </a>
          )}
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Information listed on OpenStreetMap">
            {facts.map((f) => (
              <li
                key={f.label}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${f.ok ? "bg-mint-400/15 text-mint-300" : "bg-white/5 text-indigo-300"}`}
              >
                {f.ok ? "✓" : "–"} {f.label} {f.ok ? "listed" : "not listed"}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-3 flex gap-2 pl-[3.25rem] text-xs font-semibold">
        <Link href={`/place/${place.id}${from}`} className="rounded-full bg-white/10 px-3 py-1.5 text-pearl-50 transition hover:bg-white/20">
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
    </motion.li>
  );
}
