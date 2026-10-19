"use client";

import { CITIES, type CityId } from "@/lib/places/cities";
import type { GeoState } from "./useGeolocation";

type Props = {
  cityId: CityId;
  onCityChange: (id: CityId) => void;
  geo: GeoState;
  onToggleLocation: () => void;
  id?: string;
};

/** Reusable city picker + opt-in "Near me" control with honest permission feedback. */
export function CityLocationBar({ cityId, onCityChange, geo, onToggleLocation, id = "city" }: Props) {
  return (
    <div>
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={id}>
          City
        </label>
        <select
          id={id}
          value={cityId}
          onChange={(e) => onCityChange(e.target.value as CityId)}
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-indigo-950/60 px-4 py-2 text-sm text-pearl-50"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onToggleLocation}
          aria-pressed={geo.status === "on"}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            geo.status === "on" ? "bg-mint-400 text-indigo-950" : "border border-mint-400/40 text-mint-300 hover:bg-mint-400/10"
          }`}
        >
          {geo.status === "locating" ? "Locating…" : geo.status === "on" ? "◉ Near me" : "◎ Near me"}
        </button>
      </div>
      {(geo.status === "denied" || geo.status === "unavailable") && (
        <p className="mt-2 text-xs text-coral-300" role="status">
          {geo.status === "denied"
            ? "Location permission was declined, so results are measured from the city centre."
            : "Your location isn't available, so results are measured from the city centre."}
        </p>
      )}
    </div>
  );
}
