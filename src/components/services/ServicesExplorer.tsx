"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CityLocationBar } from "@/components/location/CityLocationBar";
import { useGeolocation } from "@/components/location/useGeolocation";
import { Mate, type MateState } from "@/components/mate/Mate";
import { ResultGroups, type ResultGroup } from "@/components/places/ResultGroups";
import type { LatLng } from "@/lib/geo/distance";
import { MAX_MESSAGE_CHARS } from "@/lib/agent/limits";
import type { ChatResponse } from "@/lib/agent/types";
import { CATEGORY_CONFIG, CATEGORY_GROUPS, categoriesInGroup, type CategoryId } from "@/lib/places/categories";
import type { CityId } from "@/lib/places/cities";
import type { ServiceSearchResult } from "@/lib/places/service";
import { ease } from "@/lib/motion";

const EXAMPLES = [
  "My kitchen tap is leaking",
  "AC has stopped cooling",
  "Need ceiling fans installed",
  "Deep clean my new flat",
];

type View = { kind: "idle" } | { kind: "loading"; label: string } | { kind: "error"; message: string } | { kind: "done"; reply?: string; groups: ResultGroup[]; aiNotice?: string };

async function fetchCategory(category: CategoryId, city: CityId, near: LatLng | null, wide = false): Promise<ResultGroup[]> {
  const params = new URLSearchParams({ category, limit: "12" });
  if (near) {
    params.set("lat", near.lat.toFixed(4));
    params.set("lon", near.lon.toFixed(4));
  } else params.set("city", city);
  if (wide) params.set("wide", "1");
  const res = await fetch(`/api/services?${params}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body?.message ?? "Search failed.");
  const r = body as ServiceSearchResult;
  return [
    { category: r.category, places: r.places, notices: r.notices, originLabel: r.originLabel, dataDate: r.dataDate, source: r.source },
    ...r.alternatives.map((a) => ({
      category: a.category,
      places: a.result.places,
      notices: [],
      originLabel: a.result.originLabel,
      dataDate: a.result.dataDate,
      source: a.result.source,
      alternativeFor: r.category,
      note: a.note,
    })),
  ];
}

async function fetchProblem(message: string, city: CityId, near: LatLng | null) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, city, near: near ? { lat: +near.lat.toFixed(4), lon: +near.lon.toFixed(4) } : undefined }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.message ?? "Mate couldn't answer just now.");
  const r = body as ChatResponse;
  const groups: ResultGroup[] = r.groups.map((g) => ({
    category: g.category,
    places: g.result,
    notices: g.notices,
    originLabel: g.originLabel,
    dataDate: g.dataDate,
    source: g.source,
    alternativeFor: g.alternativeFor,
    note: g.note,
  }));
  return { reply: r.reply, groups, aiNotice: r.aiNotice };
}

export function ServicesExplorer({ initialCity, initialCategory }: { initialCity: CityId; initialCategory: CategoryId | null }) {
  const [cityId, setCityId] = useState<CityId>(initialCity);
  const geo = useGeolocation();
  const [problem, setProblem] = useState("");
  const [active, setActive] = useState<CategoryId | null>(initialCategory);
  const [view, setView] = useState<View>(
    initialCategory ? { kind: "loading", label: `Finding ${CATEGORY_CONFIG[initialCategory].noun}…` } : { kind: "idle" },
  );
  const [wider, setWider] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastRun = useRef<() => void>(() => {});

  const scrollToResults = () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  function runCategory(category: CategoryId, city = cityId, near = geo.coords) {
    setActive(category);
    setView({ kind: "loading", label: `Finding ${CATEGORY_CONFIG[category].noun}…` });
    lastRun.current = () => runCategory(category);
    fetchCategory(category, city, near)
      .then((groups) => setView({ kind: "done", groups }))
      .catch((e: Error) => setView({ kind: "error", message: e.message }));
    scrollToResults();
  }

  function runProblem(text: string, city = cityId, near = geo.coords) {
    const msg = text.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!msg) return;
    setActive(null);
    setView({ kind: "loading", label: "Mate is working out what you need…" });
    lastRun.current = () => runProblem(msg);
    fetchProblem(msg, city, near)
      .then((r) => setView({ kind: "done", ...r }))
      .catch((e: Error) => setView({ kind: "error", message: e.message }));
    scrollToResults();
  }

  function widerSearch(category: CategoryId) {
    setWider(true);
    fetchCategory(category, cityId, geo.coords, true)
      .then((groups) => setView({ kind: "done", groups }))
      .catch((e: Error) => setView({ kind: "error", message: e.message }))
      .finally(() => setWider(false));
  }

  // Deep link: /services?category=plumber
  const ran = useRef(false);
  useEffect(() => {
    if (!initialCategory || ran.current) return;
    ran.current = true;
    fetchCategory(initialCategory, initialCity, null)
      .then((groups) => setView({ kind: "done", groups }))
      .catch((e: Error) => setView({ kind: "error", message: e.message }));
  }, [initialCategory, initialCity]);

  const mateState: MateState =
    view.kind === "loading" ? "thinking" : view.kind === "error" ? "unsure" : view.kind === "done" ? (view.groups.some((g) => g.places.length && !g.alternativeFor) ? "found" : "unsure") : problem ? "listening" : "idle";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
      {/* Problem-based search */}
      <section className="glass relative overflow-hidden rounded-panel p-5 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Mate state={mateState} className="mx-auto h-36 w-28 shrink-0 md:mx-0 md:h-44 md:w-36" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-mint-300">Problem-based search</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tell Mate what&apos;s wrong at home.
            </h1>
            <p className="mt-2 text-indigo-200">
              Describe it in your own words. Mate works out which kind of help you need and shows what&apos;s listed nearby.
            </p>
            <form
              className="mt-5 flex items-center gap-2 rounded-full border border-white/15 bg-indigo-950/60 p-1.5 pl-5 focus-within:border-mint-400/60"
              onSubmit={(e) => {
                e.preventDefault();
                runProblem(problem);
              }}
            >
              <label htmlFor="problem" className="sr-only">
                Describe your problem
              </label>
              <input
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                maxLength={MAX_MESSAGE_CHARS}
                placeholder="e.g. My geyser isn't heating water"
                className="min-w-0 flex-1 bg-transparent py-2 text-pearl-50 placeholder:text-indigo-300 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!problem.trim() || view.kind === "loading"}
                className="shrink-0 rounded-full bg-mint-400 px-5 py-2.5 text-sm font-bold text-indigo-950 transition hover:bg-mint-300 disabled:opacity-40"
              >
                Find help
              </button>
            </form>
            <ul className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    onClick={() => {
                      setProblem(ex);
                      runProblem(ex);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-indigo-200 transition hover:border-coral-400/60 hover:text-pearl-50"
                  >
                    “{ex}”
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-5 max-w-md">
              <CityLocationBar
                id="services-city"
                cityId={cityId}
                onCityChange={(c) => {
                  setCityId(c);
                  geo.reset();
                  if (view.kind === "done" && active) runCategory(active, c, null);
                }}
                geo={geo.state}
                onToggleLocation={geo.toggle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category cards */}
      {(["home_services", "home_shopping"] as const).map((group) => (
        <section key={group} className="mt-12" aria-labelledby={`h-${group}`}>
          <h2 id={`h-${group}`} className="font-display text-2xl font-bold">
            {CATEGORY_GROUPS[group].label}
          </h2>
          <p className="text-sm text-indigo-300">{CATEGORY_GROUPS[group].blurb}</p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoriesInGroup(group).map((id, i) => {
              const c = CATEGORY_CONFIG[id];
              const on = active === id;
              return (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 20, rotateX: -12 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                  style={{ perspective: 800 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => runCategory(id)}
                    aria-pressed={on}
                    whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`group relative flex h-full w-full flex-col items-start gap-2 overflow-hidden rounded-2xl border p-4 text-left transition-colors ${
                      on ? "border-coral-400 bg-coral-400/15 shadow-glow-coral" : "border-white/10 bg-white/[0.04] hover:border-mint-400/50"
                    }`}
                  >
                    <span aria-hidden="true" className="text-3xl transition-transform duration-300 group-hover:scale-110">
                      {c.glyph}
                    </span>
                    <span className="font-display text-base font-bold text-pearl-50">{c.label}</span>
                    <span className="text-xs leading-snug text-indigo-200">{c.blurb}</span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-mint-400/10 blur-2xl transition-opacity group-hover:opacity-100"
                    />
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Results */}
      <div ref={resultsRef} className="scroll-mt-24 pt-12" aria-live="polite">
        {view.kind === "loading" && (
          <div className="flex items-center gap-3 text-indigo-200">
            <span className="h-3 w-3 animate-ping rounded-full bg-mint-400" /> {view.label}
          </div>
        )}
        {view.kind === "error" && (
          <div role="alert" className="rounded-2xl border border-coral-400/30 bg-coral-400/10 p-4 text-sm text-coral-300">
            {view.message}{" "}
            <button type="button" onClick={() => lastRun.current()} className="font-semibold underline">
              Try again
            </button>
          </div>
        )}
        {view.kind === "done" && (
          <>
            {view.reply && (
              <div className="mb-8 flex items-start gap-3">
                <Mate variant="bust" state={mateState} className="h-12 w-12 shrink-0" />
                <div>
                  <p className="rounded-2xl rounded-tl-md bg-white/[0.07] px-4 py-3 text-pearl-50">{view.reply}</p>
                  {view.aiNotice && <p className="mt-1 text-[11px] text-indigo-300">{view.aiNotice}</p>}
                </div>
              </div>
            )}
            {view.groups.length === 0 ? (
              <p className="text-indigo-200">Pick a service above, or describe the problem in a bit more detail.</p>
            ) : (
              <ResultGroups groups={view.groups} user={geo.coords} onWiderSearch={widerSearch} widerLoading={wider} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
