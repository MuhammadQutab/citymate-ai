"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { Mate, type MateState } from "@/components/mate/Mate";
import { HERO_COPY } from "@/content/landing";
import { CATEGORY_CONFIG, CATEGORY_LABELS, CATEGORY_URDU, type CategoryId } from "@/lib/places/categories";
import { ease, fadeUp, stagger } from "@/lib/motion";

const quick: CategoryId[] = ["food", "atm", "pharmacy", "plumber", "electrician", "grocery"];
const hrefFor = (id: CategoryId) =>
  CATEGORY_CONFIG[id].group === "home_services" ? `/services?category=${id}` : `/explore?category=${id}`;

export function Hero() {
  const router = useRouter();
  const { lang } = useExperience();
  const c = HERO_COPY[lang];
  const ur = lang === "ur";
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const mateState: MateState = query.trim() || focused ? "listening" : "idle";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  }

  return (
    <section className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div key={lang} variants={stagger(0.12)} initial="hidden" animate="show" className="max-w-2xl" lang={lang} dir={ur ? "rtl" : "ltr"}>
        <motion.p
          variants={fadeUp}
          className={`mb-5 inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-400/10 px-3 py-1 text-mint-300 ${
            ur ? "text-sm" : "text-xs font-semibold uppercase tracking-widest"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-mint-400" /> {c.badge}
        </motion.p>

        {/* The one intentionally bilingual line: the tagline in the other language. */}
        <motion.p
          variants={fadeUp}
          lang={c.taglineLang}
          dir={c.taglineLang === "ur" ? "rtl" : "ltr"}
          className={`mb-2 text-coral-300 ${c.taglineLang === "ur" ? "text-left text-2xl sm:text-3xl" : "text-right font-display text-lg font-semibold sm:text-xl"}`}
        >
          {c.tagline}
        </motion.p>
        <h1
          className={
            ur
              ? "text-4xl leading-[1.75] sm:text-6xl"
              : "font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          }
        >
          {c.headline.map((word, i) => (
            <motion.span
              key={i}
              className={`me-[0.25em] inline-block ${word === c.accent ? "text-coral-400" : ""}`}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.07 }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-indigo-200">
          {c.sub}
        </motion.p>

        <motion.form variants={fadeUp} onSubmit={submit} className="glass mt-8 flex items-center gap-2 rounded-full p-2 ps-5">
          <label htmlFor="hero-q" className="sr-only">
            {c.label}
          </label>
          <input
            id="hero-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={c.placeholder}
            dir="auto"
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-pearl-50 placeholder:text-indigo-300 focus:outline-none"
            maxLength={300}
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-mint-400 px-4 py-3 text-sm font-bold text-indigo-950 transition hover:bg-mint-300 hover:shadow-glow-mint sm:px-5"
          >
            {c.ask}
          </button>
        </motion.form>

        <motion.ul variants={fadeUp} className="mt-5 flex flex-wrap gap-2" aria-label={c.quickLabel}>
          {quick.map((id) => (
            <li key={id}>
              <Link
                href={hrefFor(id)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-200 transition hover:border-coral-400/60 hover:text-pearl-50"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-coral-400" />
                {ur ? CATEGORY_URDU[id].label : CATEGORY_LABELS[id]}
              </Link>
            </li>
          ))}
        </motion.ul>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href="#story" className="group inline-flex items-center gap-2 font-semibold text-pearl-50">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition group-hover:border-coral-400">
              <motion.span aria-hidden="true" animate={{ y: [0, 3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
                ↓
              </motion.span>
            </span>
            {c.story}
          </a>
          <Link href="/explore" className="font-semibold text-mint-300 underline-offset-4 hover:underline">
            {c.explorer}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.5 }}
        className="relative mx-auto w-full max-w-[240px] sm:max-w-sm"
      >
        <div className="absolute inset-x-8 bottom-6 top-16 rounded-full bg-coral-400/25 blur-3xl" aria-hidden="true" />
        <Mate state={mateState} className="relative w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]" />
        <motion.div
          key={lang}
          lang={lang}
          dir={ur ? "rtl" : "ltr"}
          className="glass absolute -left-6 top-6 rounded-2xl px-4 py-3 text-sm sm:-left-10 sm:top-10"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease, delay: 1.1 }}
        >
          <p className="font-semibold text-pearl-50">{c.hi}</p>
          <p className="text-indigo-200">{c.where}</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
