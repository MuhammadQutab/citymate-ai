"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "@/lib/geo/distance";
import type { Place } from "@/lib/places/types";

const CityMap = dynamic(() => import("./CityMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-indigo-900" />,
});

/** Small, single-place map for the details page. */
export function PlaceMiniMap({ place, user }: { place: Place; user?: LatLng | null }) {
  return (
    <CityMap
      center={{ lat: place.lat, lon: place.lon }}
      zoom={16}
      places={[place]}
      selectedId={place.id}
      user={user}
      fit={!!user}
    />
  );
}
