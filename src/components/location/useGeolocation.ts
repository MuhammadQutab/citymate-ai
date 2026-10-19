"use client";

import { useCallback, useState } from "react";
import type { LatLng } from "@/lib/geo/distance";

export type GeoState =
  | { status: "off" }
  | { status: "locating" }
  | { status: "on"; coords: LatLng }
  | { status: "denied" | "unavailable" };

/** Explicit, opt-in browser location. Nothing is requested until `toggle()` is called. */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "off" });

  const toggle = useCallback(() => {
    if (state.status === "on") return setState({ status: "off" });
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return setState({ status: "unavailable" });
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: "on", coords: { lat: pos.coords.latitude, lon: pos.coords.longitude } }),
      (err) => setState({ status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 120_000 },
    );
  }, [state.status]);

  return { state, coords: state.status === "on" ? state.coords : null, toggle, reset: () => setState({ status: "off" }) };
}
