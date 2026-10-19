"use client";

import { motion } from "motion/react";
import { useExperience } from "./ExperienceProvider";

export function SoundToggle({ className = "" }: { className?: string }) {
  const { soundOn, toggleSound } = useExperience();
  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        soundOn ? "border-mint-400/60 bg-mint-400/10 text-mint-300" : "border-white/15 text-indigo-200 hover:text-pearl-50"
      } ${className}`}
    >
      <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-[2px] rounded-full bg-current"
            animate={soundOn ? { height: ["30%", "100%", "45%", "80%", "30%"] } : { height: "30%" }}
            transition={soundOn ? { duration: 1.1, repeat: Infinity, delay: i * 0.15 } : { duration: 0.2 }}
          />
        ))}
      </span>
      {soundOn ? "Sound on" : "Sound off"}
    </button>
  );
}

export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useExperience();
  return (
    <div role="group" aria-label="Language" className={`flex rounded-full border border-white/15 p-0.5 text-xs font-semibold ${className}`}>
      {(["en", "ur"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          lang={l}
          className={`rounded-full px-2.5 py-1 transition ${lang === l ? "bg-coral-400 text-indigo-950" : "text-indigo-200 hover:text-pearl-50"}`}
          style={l === "ur" ? { lineHeight: 1.4 } : undefined}
        >
          {l === "en" ? "EN" : "اردو"}
        </button>
      ))}
    </div>
  );
}
