"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { Mate } from "@/components/mate/Mate";
import { CITIES_COPY, CLOSING_COPY, HOW_COPY, PROMISE_COPY } from "@/content/landing";
import { ease } from "@/lib/motion";
import { ChapterHeading } from "./ChapterHeading";

export type CityStat = { id: string; name: string; nameUr: string; places: number; thin: boolean };

const card = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
} as const;

/** Language attributes for a block in the chosen language. */
const langProps = (lang: "en" | "ur") => ({ lang, dir: lang === "ur" ? ("rtl" as const) : ("ltr" as const) });

export function CitiesSection({ cities }: { cities: CityStat[] }) {
  const { lang } = useExperience();
  const c = CITIES_COPY[lang];
  const ur = lang === "ur";
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8" aria-label={c.title}>
      <ChapterHeading kicker={c.kicker} title={c.title} lang={lang} align="center" />
      <ul className="mt-12 grid gap-5 md:grid-cols-3" style={{ perspective: 1000 }}>
        {cities.map((city, i) => {
          const name = ur ? city.nameUr : city.name;
          return (
            <motion.li key={city.id} {...card} transition={{ duration: 0.7, ease, delay: i * 0.12 }}>
              <motion.div whileHover={{ y: -6, rotateX: 4 }} className="h-full">
                <Link
                  href={`/explore?city=${city.id}`}
                  {...langProps(lang)}
                  className="glass group flex h-full flex-col rounded-panel p-6 transition-colors hover:border-white/30"
                >
                  <span className={ur ? "text-3xl" : "font-display text-2xl font-bold"}>{name}</span>
                  <span className="text-sm text-indigo-300">{c.regions[city.id]}</span>
                  <span className="mt-5 font-display text-4xl font-extrabold text-mint-300" dir="ltr">
                    {city.places.toLocaleString("en-GB")}
                  </span>
                  <span className="text-sm text-indigo-200">{c.places}</span>
                  {city.thin && <span className="mt-3 rounded-xl bg-coral-400/10 px-3 py-2 text-xs text-coral-300">{c.note}</span>}
                  <span className="mt-auto pt-5 font-semibold text-coral-300 transition-transform group-hover:translate-x-1">
                    {c.explore(name)}
                  </span>
                </Link>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

const STEP_GLYPHS = ["👂", "🧭", "💬"];

export function HowItWorks() {
  const { lang } = useExperience();
  const c = HOW_COPY[lang];
  const ur = lang === "ur";
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8" aria-label={c.title}>
      <ChapterHeading kicker={c.kicker} title={c.title} lang={lang} align="center" />
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {c.steps.map((s, i) => (
          <motion.li
            key={s.t}
            {...card}
            {...langProps(lang)}
            transition={{ duration: 0.6, ease, delay: i * 0.15 }}
            className="glass relative rounded-panel p-6"
          >
            <span className="absolute end-5 top-4 font-display text-5xl font-extrabold text-white/5">{i + 1}</span>
            <span className="text-3xl" aria-hidden="true">
              {STEP_GLYPHS[i]}
            </span>
            <h3 className={ur ? "mt-2 text-2xl" : "mt-3 font-display text-xl font-bold"}>{s.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-indigo-200">{s.b}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

export function PromiseSection() {
  const { lang } = useExperience();
  const c = PROMISE_COPY[lang];
  const ur = lang === "ur";
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8" aria-label={c.title}>
      <ChapterHeading kicker={c.kicker} title={c.title} lang={lang} align="center" />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {c.items.map((p, i) => (
          <motion.li
            key={p.t}
            {...card}
            {...langProps(lang)}
            transition={{ duration: 0.6, ease, delay: i * 0.1 }}
            className="rounded-panel border border-white/10 bg-white/[0.03] p-6"
          >
            <h3 className={ur ? "text-xl text-mint-300" : "font-display text-lg font-bold text-mint-300"}>{p.t}</h3>
            <p className="mt-1 text-sm text-indigo-200">{p.b}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

export function ClosingSection() {
  const { lang } = useExperience();
  const c = CLOSING_COPY[lang];
  const ur = lang === "ur";
  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-8" aria-label={c.title}>
      <motion.div {...card} {...langProps(lang)} transition={{ duration: 0.8, ease }} className="glass relative overflow-hidden rounded-panel p-8 text-center sm:p-12">
        <div aria-hidden="true" className="absolute inset-x-0 -bottom-24 mx-auto h-48 w-2/3 rounded-full bg-coral-400/25 blur-3xl" />
        <Mate state="found" className="relative mx-auto h-40 w-32" />
        <h2 className={`relative mt-4 ${ur ? "text-3xl sm:text-5xl" : "font-display text-3xl font-extrabold sm:text-5xl"}`}>{c.title}</h2>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/explore" className="rounded-full bg-mint-400 px-6 py-3 font-bold text-indigo-950 transition hover:bg-mint-300 hover:shadow-glow-mint">
            {c.explorer}
          </Link>
          <Link href="/new-resident" className="rounded-full border border-white/20 px-6 py-3 font-semibold transition hover:border-coral-400/70">
            {c.moved}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
