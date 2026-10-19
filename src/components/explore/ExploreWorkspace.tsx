"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mate, type MateState } from "@/components/mate/Mate";
import type { MapPadding } from "@/components/map/CityMap";
import type { LatLng } from "@/lib/geo/distance";
import { CATEGORY_GLYPHS, CATEGORY_IDS, CATEGORY_LABELS, CATEGORY_NOUNS, type CategoryId } from "@/lib/places/categories";
import { CITIES, getCity, type CityId } from "@/lib/places/cities";
import type { SearchResult } from "@/lib/places/types";
import { PlaceCard } from "./PlaceCard";

const CityMap = dynamic(() => import("@/components/map/CityMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-indigo-900" />,
});

type LocationState =
  | { status: "off" }
  | { status: "locating" }
  | { status: "on"; coords: LatLng }
  | { status: "denied" | "unavailable" };

type Props = {
  initialCity: CityId;
  initialCategory: CategoryId | null;
  initialQuery: string;
  /** Categories matched from the query (beyond the first, which is preselected). */
  alsoMatched: CategoryId[];
  queryUnmatched: boolean;
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const DESKTOP_QUERY = "(min-width: 768px)";

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

type Response = { key: string; result?: SearchResult; error?: string };

export function ExploreWorkspace({ initialCity, initialCategory, initialQuery, alsoMatched, queryUnmatched }: Props) {
  const router = useRouter();
  const desktop = useIsDesktop();
  const [cityId, setCityId] = useState<CityId>(initialCity);
  const [category, setCategory] = useState<CategoryId | null>(initialCategory);
  const [location, setLocation] = useState<LocationState>({ status: "off" });
  const [response, setResponse] = useState<Response | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [retry, setRetry] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const city = getCity(cityId)!;
  const user = location.status === "on" ? location.coords : null;

  // Keep shareable state (never location) in the URL.
  useEffect(() => {
    const params = new URLSearchParams({ city: cityId });
    if (category) params.set("category", category);
    router.replace(`/explore?${params}`, { scroll: false });
  }, [cityId, category, router]);

  // The request is fully described by its query string. Near-me searches ignore the
  // selected city, so the city switching to match results never triggers a refetch.
  const requestQuery = useMemo(() => {
    if (!category) return null;
    const params = new URLSearchParams({ category, limit: "30" });
    if (user) {
      params.set("lat", user.lat.toFixed(4));
      params.set("lon", user.lon.toFixed(4));
    } else {
      params.set("city", cityId);
    }
    return params.toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cityId only matters without a location
  }, [category, user?.lat, user?.lon, user ? "" : cityId]);
  const requestKey = requestQuery && `${requestQuery}#${retry}`;

  useEffect(() => {
    if (!requestQuery || !requestKey) return;
    const ctrl = new AbortController();
    fetch(`/api/places?${requestQuery}`, { signal: ctrl.signal })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message ?? "Search failed. Please try again.");
        return body as SearchResult;
      })
      .then((data) => {
        setResponse({ key: requestKey, result: data });
        setSelectedId(null);
        if (data.cityId && CITIES.some((c) => c.id === data.cityId)) setCityId(data.cityId as CityId);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        setResponse({ key: requestKey, error: err instanceof Error ? err.message : "Search failed." });
      });
    return () => ctrl.abort();
  }, [requestQuery, requestKey]);

  const loading = requestKey !== null && response?.key !== requestKey;
  const error = !loading && response?.error ? response.error : null;
  // While a new search loads, keep showing the previous results (dimmed).
  const result = category && !error ? (response?.result ?? null) : null;

  const requestLocation = useCallback(() => {
    if (location.status === "on") {
      setLocation({ status: "off" });
      return;
    }
    if (!("geolocation" in navigator)) {
      setLocation({ status: "unavailable" });
      return;
    }
    setLocation({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ status: "on", coords: { lat: pos.coords.latitude, lon: pos.coords.longitude } }),
      (err) => setLocation({ status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" }),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 120_000 },
    );
  }, [location.status]);

  const selectPlace = useCallback((id: string) => {
    setSelectedId((cur) => (cur === id ? null : id));
    setSheetOpen(false);
  }, []);

  // Scroll the selected card into view when chosen from the map.
  useEffect(() => {
    if (!selectedId) return;
    const el = listRef.current?.querySelector(`[data-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const padding: MapPadding = desktop
    ? { topLeft: [440, 60], bottomRight: [60, 60] }
    : { topLeft: [30, 30], bottomRight: [30, 260] };

  const mateState: MateState = loading
    ? "thinking"
    : error
      ? "unsure"
      : result && result.places.length > 0
        ? "found"
        : result
          ? "unsure"
          : "idle";

  const places = useMemo(() => result?.places ?? [], [result]);

  const greeting = (() => {
    if (loading) return `Looking for ${category ? CATEGORY_NOUNS[category] : "places"}…`;
    if (error) return "I couldn't reach the map data just now.";
    if (result && category) {
      return result.places.length
        ? `Found ${result.places.length} ${CATEGORY_NOUNS[category]} nearest ${result.originLabel}.`
        : `I couldn't find any mapped ${CATEGORY_NOUNS[category]} here.`;
    }
    if (queryUnmatched) return "I couldn't match that to a category yet. Pick one below.";
    return "What do you need nearby?";
  })();

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Map stage */}
      <section aria-label="Map" className="absolute inset-0 md:inset-x-4 md:bottom-4 md:overflow-hidden md:rounded-panel md:border md:border-white/10">
        <CityMap
          center={city.center}
          zoom={city.zoom}
          places={places}
          selectedId={selectedId}
          onSelect={selectPlace}
          user={user}
          padding={padding}
        />
      </section>

      {/* Assistant panel: floating card on desktop, bottom sheet on mobile */}
      <motion.aside
        aria-label="CityMate assistant"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`glass absolute z-[500] flex flex-col overflow-hidden
          inset-x-0 bottom-0 rounded-t-panel transition-[max-height] duration-300
          ${sheetOpen ? "max-h-[78dvh]" : "max-h-[42dvh]"}
          md:inset-x-auto md:bottom-8 md:left-8 md:top-4 md:max-h-none md:w-[400px] md:rounded-panel`}
      >
        <button
          type="button"
          onClick={() => setSheetOpen((o) => !o)}
          className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-white/25 md:hidden"
          aria-label={sheetOpen ? "Collapse results" : "Expand results"}
          aria-expanded={sheetOpen}
        />

        <div className="flex flex-col gap-3 border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Mate variant="bust" state={mateState} className="h-12 w-12 shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display text-base font-bold leading-tight">Mate</h1>
              <p className="text-sm text-indigo-200" aria-live="polite">
                {greeting}
              </p>
            </div>
          </div>

          {initialQuery && (
            <p className="rounded-xl bg-white/5 px-3 py-2 text-xs text-indigo-200">
              You asked: <span className="text-pearl-50">&ldquo;{initialQuery}&rdquo;</span>
              {alsoMatched.length > 0 && (
                <>
                  <br />I also noticed you may need:{" "}
                  {alsoMatched.map((c, i) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className="font-semibold text-coral-300 underline-offset-2 hover:underline"
                    >
                      {CATEGORY_LABELS[c]}
                      {i < alsoMatched.length - 1 ? ", " : ""}
                    </button>
                  ))}
                </>
              )}
            </p>
          )}

          <div className="flex gap-2">
            <label className="sr-only" htmlFor="city">
              City
            </label>
            <select
              id="city"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value as CityId);
                setLocation({ status: "off" });
              }}
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
              onClick={requestLocation}
              aria-pressed={location.status === "on"}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                location.status === "on"
                  ? "bg-mint-400 text-indigo-950"
                  : "border border-mint-400/40 text-mint-300 hover:bg-mint-400/10"
              }`}
            >
              {location.status === "locating" ? "Locating…" : location.status === "on" ? "◉ Near me" : "◎ Near me"}
            </button>
          </div>
          {(location.status === "denied" || location.status === "unavailable") && (
            <p className="text-xs text-coral-300" role="status">
              {location.status === "denied"
                ? "Location permission was declined, so I'll search from the city centre instead."
                : "Your location isn't available right now, so I'll search from the city centre."}
            </p>
          )}

          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Categories">
            {CATEGORY_IDS.map((id) => (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setCategory(id)}
                  aria-pressed={id === category}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    id === category
                      ? "border-coral-400 bg-coral-400 text-indigo-950"
                      : "border-white/10 bg-white/5 text-indigo-200 hover:border-white/30 hover:text-pearl-50"
                  }`}
                >
                  <span aria-hidden="true">{CATEGORY_GLYPHS[id]}</span> {CATEGORY_LABELS[id]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {result?.notices.map((n) => (
            <p key={n} className="mb-3 rounded-xl border border-coral-400/30 bg-coral-400/10 px-3 py-2 text-xs text-coral-300">
              {n}
            </p>
          ))}
          {error && (
            <div className="rounded-xl border border-coral-400/30 bg-coral-400/10 p-3 text-sm text-coral-300" role="alert">
              {error}{" "}
              <button type="button" onClick={() => setRetry((r) => r + 1)} className="font-semibold underline">
                Try again
              </button>
            </div>
          )}
          {!category && !error && (
            <p className="text-sm text-indigo-200">Choose a category above to see real places on the map.</p>
          )}
          {loading && !result && (
            <ul className="space-y-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </ul>
          )}

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={`${category}-${result.originLabel}-${result.dataDate}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: loading ? 0.5 : 1 }}
                exit={{ opacity: 0 }}
              >
                <ul ref={listRef} className="space-y-3">
                  {result.places.map((p, i) => (
                    <PlaceCard key={p.id} place={p} index={i} selected={p.id === selectedId} onSelect={selectPlace} user={user} />
                  ))}
                </ul>
                <p className="mt-4 text-[11px] leading-relaxed text-indigo-300">
                  {result.source === "citypack" ? "City Pack" : "Live"} · OpenStreetMap data as of{" "}
                  {dateFmt.format(new Date(result.dataDate))}. Distances are approximate straight-line measurements from{" "}
                  {result.originLabel}, not travel routes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </div>
  );
}
