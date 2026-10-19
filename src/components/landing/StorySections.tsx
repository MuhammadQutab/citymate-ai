"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Mate } from "@/components/mate/Mate";
import { ease } from "@/lib/motion";
import { ChapterHeading } from "./ChapterHeading";

export type CityStat = { id: string; name: string; nameUr: string; region: string; places: number; named: number; note?: string };

const card = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
} as const;

export function CitiesSection({ cities }: { cities: CityStat[] }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8" aria-label="Supported cities">
      <ChapterHeading kicker="Where Mate lives" ur="تین شہر، ایک ساتھی" en="Three cities. One companion." align="center" />
      <ul className="mt-12 grid gap-5 md:grid-cols-3" style={{ perspective: 1000 }}>
        {cities.map((c, i) => (
          <motion.li key={c.id} {...card} transition={{ duration: 0.7, ease, delay: i * 0.12 }}>
            <motion.div whileHover={{ y: -6, rotateX: 4 }} className="h-full">
              <Link href={`/explore?city=${c.id}`} className="glass group flex h-full flex-col rounded-panel p-6 transition-colors hover:border-white/30">
                <span lang="ur" className="text-2xl text-coral-300">
                  {c.nameUr}
                </span>
                <span className="font-display text-2xl font-bold">{c.name}</span>
                <span className="text-sm text-indigo-300">{c.region}</span>
                <span className="mt-5 font-display text-4xl font-extrabold text-mint-300">{c.places.toLocaleString("en-GB")}</span>
                <span className="text-sm text-indigo-200">real places mapped on OpenStreetMap</span>
                {c.note && <span className="mt-3 rounded-xl bg-coral-400/10 px-3 py-2 text-xs text-coral-300">{c.note}</span>}
                <span className="mt-auto pt-5 font-semibold text-coral-300 transition-transform group-hover:translate-x-1">Explore {c.name} →</span>
              </Link>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

const STEPS = [
  { ur: "سمجھنا", en: "Understand", body: "Mate reads your need, even described as a problem, in English or Urdu.", g: "👂" },
  { ur: "ڈھونڈنا", en: "Search", body: "Our server searches real OpenStreetMap data. The AI never invents places.", g: "🧭" },
  { ur: "بتانا", en: "Explain", body: "Mate explains what it found, and what's missing, in your language.", g: "💬" },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8" aria-label="How it works">
      <ChapterHeading kicker="How it works" ur="سمجھنا، ڈھونڈنا، بتانا" en="Understand. Search. Explain." align="center" />
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.li key={s.en} {...card} transition={{ duration: 0.6, ease, delay: i * 0.15 }} className="glass relative rounded-panel p-6">
            <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-white/5">{i + 1}</span>
            <span className="text-3xl" aria-hidden="true">
              {s.g}
            </span>
            <p lang="ur" className="mt-3 text-xl text-coral-300">
              {s.ur}
            </p>
            <h3 className="font-display text-xl font-bold">{s.en}</h3>
            <p className="mt-2 text-sm leading-relaxed text-indigo-200">{s.body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

const PROMISES = [
  { ur: "کوئی جگہ گھڑی نہیں جاتی", en: "Nothing is invented", body: "Every place comes from OpenStreetMap. No fake names, numbers, ratings or prices." },
  { ur: "کمی ہو تو صاف بتانا", en: "Honest about gaps", body: "If data is missing, Mate says so, and labels alternatives as alternatives." },
  { ur: "آپ کا مقام، آپ کی مرضی", en: "Your location, your choice", body: "Location is used only when you allow it, and is never stored." },
  { ur: "مفت اور کھلا ڈیٹا", en: "Free and open", body: "No account and no fees. Open data, credited to its volunteer mappers." },
];

export function PromiseSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-8" aria-label="Our promise">
      <ChapterHeading kicker="Our promise" ur="ہمارا وعدہ" en="A guide you can trust to be honest" align="center" />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
        {PROMISES.map((p, i) => (
          <motion.li key={p.en} {...card} transition={{ duration: 0.6, ease, delay: i * 0.1 }} className="rounded-panel border border-white/10 bg-white/[0.03] p-6">
            <p lang="ur" dir="rtl" className="text-xl text-mint-300">
              {p.ur}
            </p>
            <h3 className="font-display text-lg font-bold">{p.en}</h3>
            <p className="mt-1 text-sm text-indigo-200">{p.body}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

export function ClosingSection() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-8" aria-label="Get started">
      <motion.div {...card} transition={{ duration: 0.8, ease }} className="glass relative overflow-hidden rounded-panel p-8 text-center sm:p-12">
        <div aria-hidden="true" className="absolute inset-x-0 -bottom-24 mx-auto h-48 w-2/3 rounded-full bg-coral-400/25 blur-3xl" />
        <Mate state="found" className="relative mx-auto h-40 w-32" />
        <p lang="ur" className="relative mt-4 text-3xl text-coral-300 sm:text-4xl">
          آج ہی اپنا شہر دریافت کریں
        </p>
        <h2 className="relative font-display text-3xl font-extrabold sm:text-5xl">Start exploring your city tonight.</h2>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/explore" className="rounded-full bg-mint-400 px-6 py-3 font-bold text-indigo-950 transition hover:bg-mint-300 hover:shadow-glow-mint">
            Open the City Explorer
          </Link>
          <Link href="/new-resident" className="rounded-full border border-white/20 px-6 py-3 font-semibold transition hover:border-coral-400/70">
            I&apos;ve just moved here
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
