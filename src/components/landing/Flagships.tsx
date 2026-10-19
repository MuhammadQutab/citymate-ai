"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ease } from "@/lib/motion";

const FEATURES = [
  {
    href: "/explore",
    kicker: "AI City Assistant",
    title: "Ask in your own words",
    body: "“Need cash and dinner”, “my child has a fever”. Mate understands the need and shows real places on a live map.",
    glyph: "🧭",
    accent: "from-mint-400/25",
  },
  {
    href: "/services",
    kicker: "Home Services",
    title: "Describe the problem, not the trade",
    body: "Leaking tap, AC not cooling, fans to install. Mate finds the right kind of help and is honest when listings are missing.",
    glyph: "🔧",
    accent: "from-coral-400/25",
  },
  {
    href: "/new-resident",
    kicker: "New Resident Assistant",
    title: "Settle in, step by step",
    body: "A friendly welcome, the essentials near your new home, and a checklist that remembers your progress.",
    glyph: "🏡",
    accent: "from-sunset/25",
  },
];

export function Flagships() {
  return (
    <section aria-labelledby="flagships" className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8">
      <h2 id="flagships" className="sr-only">
        What CityMate can do
      </h2>
      <ul className="grid gap-5 md:grid-cols-3" style={{ perspective: 1000 }}>
        {FEATURES.map((f, i) => (
          <motion.li
            key={f.href}
            initial={{ opacity: 0, y: 30, rotateY: i === 0 ? 12 : i === 2 ? -12 : 0 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease, delay: i * 0.12 }}
          >
            <motion.div whileHover={{ y: -8, rotateX: 3 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="h-full">
              <Link
                href={f.href}
                className={`glass group flex h-full flex-col rounded-panel bg-gradient-to-br ${f.accent} to-transparent p-6 transition-colors hover:border-white/30`}
              >
                <span aria-hidden="true" className="text-4xl">
                  {f.glyph}
                </span>
                <span className="mt-4 text-xs font-bold uppercase tracking-widest text-mint-300">{f.kicker}</span>
                <span className="mt-1 font-display text-2xl font-bold text-pearl-50">{f.title}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-indigo-200">{f.body}</span>
                <span className="mt-5 font-semibold text-coral-300 transition-transform group-hover:translate-x-1">Open →</span>
              </Link>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
