"use client";

import { motion } from "motion/react";
import { ease } from "@/lib/motion";

/** Bilingual chapter title: Urdu (Nastaliq) first, English beneath. */
export function ChapterHeading({
  kicker,
  ur,
  en,
  align = "left",
}: {
  kicker?: string;
  ur: string;
  en: string;
  align?: "left" | "center";
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className={align === "center" ? "text-center" : ""}
    >
      {kicker && <p className="text-xs font-bold uppercase tracking-[0.25em] text-mint-300">{kicker}</p>}
      <p lang="ur" dir="rtl" className={`mt-2 text-3xl text-coral-300 sm:text-4xl ${align === "center" ? "text-center" : "text-left"}`}>
        {ur}
      </p>
      <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-pearl-50 sm:text-5xl">{en}</h2>
    </motion.header>
  );
}
