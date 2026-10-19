"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { FLAGSHIP_COPY } from "@/content/landing";
import { ease } from "@/lib/motion";

const FEATURES = [
  { href: "/explore", glyph: "🧭", accent: "from-mint-400/25" },
  { href: "/services", glyph: "🔧", accent: "from-coral-400/25" },
  { href: "/new-resident", glyph: "🏡", accent: "from-sunset/25" },
];

export function Flagships() {
  const { lang } = useExperience();
  const c = FLAGSHIP_COPY[lang];
  const ur = lang === "ur";
  return (
    <section aria-label="CityMate features" className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8">
      <ul className="grid gap-5 md:grid-cols-3" style={{ perspective: 1000 }}>
        {FEATURES.map((f, i) => {
          const item = c.items[i];
          return (
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
                  lang={lang}
                  dir={ur ? "rtl" : "ltr"}
                  className={`glass group flex h-full flex-col rounded-panel bg-gradient-to-br ${f.accent} to-transparent p-6 transition-colors hover:border-white/30`}
                >
                  <span aria-hidden="true" className="text-4xl">
                    {f.glyph}
                  </span>
                  <span className={`mt-4 text-mint-300 ${ur ? "text-sm" : "text-xs font-bold uppercase tracking-widest"}`}>{item.k}</span>
                  <span className={ur ? "mt-1 text-2xl text-pearl-50" : "mt-1 font-display text-2xl font-bold text-pearl-50"}>{item.t}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-indigo-200">{item.b}</span>
                  <span className="mt-5 font-semibold text-coral-300 transition-transform group-hover:translate-x-1">{c.open}</span>
                </Link>
              </motion.div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
