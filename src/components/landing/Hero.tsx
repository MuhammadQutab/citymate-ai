"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mate, type MateState } from "@/components/mate/Mate";
import { CATEGORY_LABELS, type CategoryId } from "@/lib/places/categories";
import { ease, fadeUp, stagger } from "@/lib/motion";

const quick: CategoryId[] = ["food", "atm", "pharmacy", "mosque", "hotel", "transport"];

const headline = ["Your", "City.", "Your", "Needs.", "Your", "AI", "Companion."];

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const mateState: MateState = query.trim() ? "listening" : focused ? "listening" : "idle";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  }

  return (
    <section className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
      <motion.div variants={stagger(0.12)} initial="hidden" animate="show" className="max-w-2xl">
        <motion.p
          variants={fadeUp}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-mint-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-mint-400" /> Piloting in Islamabad, Rawalpindi & Kotli
        </motion.p>

        <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          {headline.map((word, i) => (
            <motion.span
              key={i}
              className={`mr-[0.25em] inline-block ${word === "Companion." ? "text-coral-400" : ""}`}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.07 }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg text-indigo-200">
          Ask Mate for what you need, from a late-night pharmacy to the nearest ATM or a good place to eat. Results come
          from real OpenStreetMap data, shown on a live map.
        </motion.p>

        <motion.form variants={fadeUp} onSubmit={submit} className="glass mt-8 flex items-center gap-2 rounded-full p-2 pl-5">
          <label htmlFor="hero-q" className="sr-only">
            Ask CityMate
          </label>
          <input
            id="hero-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="I just landed in Islamabad and need cash and dinner…"
            className="min-w-0 flex-1 bg-transparent py-2 text-base text-pearl-50 placeholder:text-indigo-300 focus:outline-none"
            maxLength={300}
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-mint-400 px-5 py-3 text-sm font-bold text-indigo-950 transition hover:bg-mint-300 hover:shadow-glow-mint"
          >
            Ask Mate
          </button>
        </motion.form>

        <motion.ul variants={fadeUp} className="mt-5 flex flex-wrap gap-2" aria-label="Quick explore">
          {quick.map((id) => (
            <li key={id}>
              <Link
                href={`/explore?category=${id}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-200 transition hover:border-coral-400/60 hover:text-pearl-50"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-coral-400" />
                {CATEGORY_LABELS[id]}
              </Link>
            </li>
          ))}
        </motion.ul>

        <motion.div variants={fadeUp} className="mt-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 font-semibold text-mint-300 underline-offset-4 hover:underline"
          >
            Open the city explorer <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.5 }}
        className="relative mx-auto w-full max-w-xs sm:max-w-sm"
      >
        <div className="absolute inset-x-8 bottom-6 top-16 rounded-full bg-coral-400/25 blur-3xl" aria-hidden="true" />
        <Mate state={mateState} className="relative w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]" />
        <motion.div
          className="glass absolute -left-4 top-10 rounded-2xl px-4 py-3 text-sm sm:-left-10"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease, delay: 1.1 }}
        >
          <p className="font-semibold text-pearl-50">Hi, I&apos;m Mate 👋</p>
          <p className="text-indigo-200">Where are we exploring?</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
