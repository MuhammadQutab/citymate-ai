"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { Mate } from "@/components/mate/Mate";
import { useLocalStore } from "@/components/ui/useLocalStore";
import { CATEGORY_CONFIG, type CategoryId } from "@/lib/places/categories";
import { CITIES, getCity, isCityId } from "@/lib/places/cities";
import { DEFAULT_TASKS, EMPTY_PROFILE, RESIDENT_SECTIONS, SERVICE_PAGE_GROUPS, type ResidentProfile } from "@/lib/resident/checklist";
import { ease } from "@/lib/motion";

const STORE_KEY = "citymate.resident.v1";

function hrefFor(category: CategoryId, city: string) {
  const base = SERVICE_PAGE_GROUPS.has(CATEGORY_CONFIG[category].group) ? "/services" : "/explore";
  return `${base}?category=${category}&city=${city}`;
}

export function NewResidentAssistant() {
  const [profile, setProfile] = useLocalStore<ResidentProfile>(STORE_KEY, EMPTY_PROFILE);
  const { play } = useExperience();
  const [newTask, setNewTask] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const city = isCityId(profile.city) ? profile.city : "islamabad";
  const cityName = getCity(city)!.name;

  const tasks = [...DEFAULT_TASKS, ...profile.custom];
  const doneCount = tasks.filter((t) => profile.done[t.id]).length;
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const update = (patch: Partial<ResidentProfile>) => setProfile((p) => ({ ...EMPTY_PROFILE, ...p, ...patch }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
      {/* Welcome */}
      <section className="glass relative overflow-hidden rounded-panel p-6 sm:p-10">
        <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral-400/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 md:flex-row">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, ease }}>
            <Mate state={pct === 100 ? "found" : "idle"} className="h-48 w-36" />
          </motion.div>
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-bold uppercase tracking-widest text-coral-300"
            >
              New Resident Assistant
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease }}
              className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-5xl"
            >
              Welcome to your new city!
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 max-w-xl text-indigo-200">
              I&apos;m Mate, your local companion. Tell me where you&apos;ve moved and we&apos;ll get you settled, one essential at a
              time.
            </motion.p>

            <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block text-xs font-semibold text-indigo-200">My city</span>
                <select
                  value={city}
                  onChange={(e) => update({ city: e.target.value })}
                  className="w-full rounded-full border border-white/15 bg-indigo-950/60 px-4 py-2.5 text-pearl-50"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-xs font-semibold text-indigo-200">Neighbourhood or area (optional)</span>
                <input
                  value={profile.area}
                  onChange={(e) => update({ area: e.target.value.slice(0, 60) })}
                  placeholder="e.g. G-11, Satellite Town"
                  className="w-full rounded-full border border-white/15 bg-indigo-950/60 px-4 py-2.5 text-pearl-50 placeholder:text-indigo-300"
                />
              </label>
            </div>
            <p className="mt-2 text-[11px] text-indigo-300">
              Your area is a note for you only. Results are measured from the city centre, or from your location if you tap
              &ldquo;Near me&rdquo; on a results page.
            </p>
          </div>
        </div>
      </section>

      {/* Category sections */}
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {RESIDENT_SECTIONS.map((s, si) => (
          <motion.section
            key={s.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease, delay: si * 0.1 }}
            className="glass rounded-panel p-5"
            aria-labelledby={`sec-${s.id}`}
          >
            <h2 id={`sec-${s.id}`} className="font-display text-xl font-bold">
              {s.title}
            </h2>
            <p className="text-sm text-indigo-300">{s.blurb}</p>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {s.categories.map((id) => (
                <li key={id}>
                  <Link
                    href={hrefFor(id, city)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-pearl-50 transition hover:-translate-y-0.5 hover:border-mint-400/50"
                  >
                    <span aria-hidden="true">{CATEGORY_CONFIG[id].glyph}</span>
                    <span className="truncate">{CATEGORY_CONFIG[id].label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </div>

      {/* Checklist */}
      <section className="mt-12 rounded-panel surface-pearl p-5 shadow-float sm:p-8" aria-labelledby="checklist-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="checklist-h" className="font-display text-2xl font-bold">
              Settling-in checklist
            </h2>
            <p className="text-sm text-pearl-500">
              {cityName}
              {profile.area ? ` · ${profile.area}` : ""} · saved on this device only, no account needed
            </p>
          </div>
          <p className="font-display text-3xl font-extrabold text-mint-ink" aria-live="polite">
            {doneCount}/{tasks.length}
          </p>
        </div>

        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-pearl-200"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist progress"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-mint-500 to-coral-400"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <AnimatePresence>
          {pct === 100 && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 font-semibold text-mint-ink"
            >
              🎉 You&apos;re all set in {cityName}. Welcome home!
            </motion.p>
          )}
        </AnimatePresence>

        <ul className="mt-6 divide-y divide-pearl-200">
          <AnimatePresence initial={false}>
            {tasks.map((t) => {
              const done = Boolean(profile.done[t.id]);
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 py-3"
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    aria-label={t.label}
                    onClick={() => {
                      const next = { ...profile.done, [t.id]: !done };
                      const allDone = tasks.every((x) => next[x.id]);
                      play(!done ? (allDone ? "found" : "tap") : "unsure");
                      update({ done: next });
                    }}
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 transition ${
                      done ? "border-mint-ink bg-mint-ink text-pearl-50" : "border-pearl-200 bg-white hover:border-mint-ink"
                    }`}
                  >
                    <motion.svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                      <motion.path
                        d="M3 8.5l3 3 7-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        initial={false}
                        animate={{ pathLength: done ? 1 : 0 }}
                        transition={{ duration: 0.25 }}
                      />
                    </motion.svg>
                  </button>
                  <span className={`flex-1 text-sm sm:text-base ${done ? "text-pearl-500 line-through" : ""}`}>
                    {t.category && <span aria-hidden="true">{CATEGORY_CONFIG[t.category].glyph} </span>}
                    {t.label}
                  </span>
                  {t.category && !done && (
                    <Link
                      href={hrefFor(t.category, city)}
                      className="shrink-0 rounded-full bg-indigo-950 px-3 py-1.5 text-xs font-semibold text-pearl-50 transition hover:bg-indigo-800"
                    >
                      Find →
                    </Link>
                  )}
                  {t.custom && (
                    <button
                      type="button"
                      onClick={() => update({ custom: profile.custom.filter((c) => c.id !== t.id) })}
                      className="shrink-0 text-xs text-pearl-500 underline"
                      aria-label={`Remove task: ${t.label}`}
                    >
                      Remove
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const label = newTask.trim().slice(0, 100);
            if (!label) return;
            update({ custom: [...profile.custom, { id: `custom-${Date.now()}`, label, custom: true }] });
            setNewTask("");
          }}
        >
          <label htmlFor="new-task" className="sr-only">
            Add your own task
          </label>
          <input
            id="new-task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add your own task, e.g. Register for gas connection"
            className="min-w-0 flex-1 rounded-full border border-pearl-200 bg-white px-4 py-2 text-sm"
          />
          <button type="submit" className="rounded-full bg-mint-ink px-4 py-2 text-sm font-bold text-pearl-50 hover:opacity-90">
            Add
          </button>
        </form>

        <div className="mt-4 text-right text-xs">
          {confirmReset ? (
            <span>
              Clear all progress?{" "}
              <button type="button" className="font-semibold text-coral-ink underline" onClick={() => (setProfile(EMPTY_PROFILE), setConfirmReset(false))}>
                Yes, reset
              </button>{" "}
              <button type="button" className="underline" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" className="text-pearl-500 underline" onClick={() => setConfirmReset(true)}>
              Reset checklist
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
