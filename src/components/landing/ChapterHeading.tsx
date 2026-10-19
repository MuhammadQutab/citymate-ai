"use client";

import { motion } from "motion/react";
import type { Lang } from "@/content/landing";
import { ease } from "@/lib/motion";

/** Chapter title in the visitor's chosen language (Urdu renders in Nastaliq, right-to-left). */
export function ChapterHeading({
  kicker,
  title,
  lang,
  align = "start",
}: {
  kicker?: string;
  title: string;
  lang: Lang;
  align?: "start" | "center";
}) {
  const ur = lang === "ur";
  return (
    <motion.header
      key={lang}
      lang={lang}
      dir={ur ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      className={align === "center" ? "text-center" : "text-start"}
    >
      {kicker && (
        <p className={`text-mint-300 ${ur ? "text-base" : "text-xs font-bold uppercase tracking-[0.25em]"}`}>{kicker}</p>
      )}
      <h2
        className={
          ur
            ? "mt-1 text-3xl text-pearl-50 sm:text-5xl"
            : "mt-1 font-display text-3xl font-extrabold tracking-tight text-pearl-50 sm:text-5xl"
        }
      >
        {title}
      </h2>
    </motion.header>
  );
}
