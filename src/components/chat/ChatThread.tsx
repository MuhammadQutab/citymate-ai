"use client";

import { unnamedLabel } from "@/lib/places/normalize";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { speak, stopSpeaking } from "@/lib/sound/engine";
import { FEATURES } from "@/lib/features";
import { formatStraightLine } from "@/lib/geo/distance";
import type { PlaceWithDistance } from "@/lib/places/types";
import { CATEGORY_GLYPHS } from "@/lib/places/categories";
import { ease } from "@/lib/motion";
import type { ChatMessage } from "./useMateChat";

type Props = {
  messages: ChatMessage[];
  pending: boolean;
  selectedId: string | null;
  onPick: (place: PlaceWithDistance) => void;
};

export function ChatThread({ messages, pending, selectedId, onPick }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, pending]);

  if (messages.length === 0 && !pending) return null;

  return (
    <div className="mb-4 space-y-3" aria-live="polite" aria-label="Conversation with Mate">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease }}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            {m.role === "user" ? (
              <p
                lang={m.lang}
                dir="auto"
                className="max-w-[85%] rounded-2xl rounded-br-md bg-mint-400 px-3.5 py-2 text-sm font-medium text-indigo-950"
              >
                {m.text}
              </p>
            ) : (
              <div className="max-w-[92%] space-y-2">
                <div
                  className={`group relative rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.error ? "border border-coral-400/40 bg-coral-400/10 text-coral-300" : "bg-white/[0.07] text-pearl-50"
                  }`}
                >
                  <p lang={m.lang} dir={m.lang === "ur" ? "rtl" : "ltr"}>
                    {m.text}
                  </p>
                  {!m.error && FEATURES.sound && <ListenButton text={m.text} lang={m.lang} />}
                </div>
                {m.picks && m.picks.length > 0 && (
                  <ul className="space-y-1.5" aria-label="Mate's picks">
                    {m.picks.map(({ place, why, note }, i) => (
                      <motion.li
                        key={place.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08, duration: 0.3, ease }}
                      >
                        <button
                          type="button"
                          onClick={() => onPick(place)}
                          aria-pressed={selectedId === place.id}
                          className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2 text-left transition ${
                            selectedId === place.id
                              ? "border-mint-400/70 bg-mint-400/10"
                              : "border-coral-400/30 bg-coral-400/[0.06] hover:border-coral-400/70"
                          }`}
                        >
                          <span aria-hidden="true" className="text-base leading-6">
                            {CATEGORY_GLYPHS[place.category]}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-pearl-50">
                              {place.name ?? unnamedLabel(place.kind)}
                            </span>
                            {note && (
                              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-sunset">
                                {m.lang === "ur" ? "متبادل · تصدیق شدہ فراہم کنندہ نہیں" : "Alternative · not a confirmed provider"}
                              </span>
                            )}
                            <span lang={m.lang} dir="auto" className="block text-xs text-indigo-200">
                              {why}
                            </span>
                            {place.distanceMeters !== undefined && (
                              <span className="block text-[11px] text-mint-300">{formatStraightLine(place.distanceMeters)}</span>
                            )}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
                {m.aiNotice && <p className="px-1 text-[11px] text-indigo-300">{m.aiNotice}</p>}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      {pending && (
        <div className="flex items-center gap-1.5 px-2 py-1" aria-label="Mate is thinking">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-mint-400"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

/** Read a reply aloud with the device's voice (free, on-device). */
function ListenButton({ text, lang }: { text: string; lang: "en" | "ur" }) {
  const [state, setState] = useState<"idle" | "speaking" | "novoice">("idle");
  if (typeof window !== "undefined" && !("speechSynthesis" in window)) return null;
  return (
    <button
      type="button"
      onClick={() => {
        if (state === "speaking") {
          stopSpeaking();
          setState("idle");
          return;
        }
        const ok = speak(text, lang, () => setState("idle"));
        setState(ok ? "speaking" : "novoice");
      }}
      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-mint-300 hover:text-mint-400"
      aria-label={state === "speaking" ? "Stop reading" : "Read this reply aloud"}
    >
      <span aria-hidden="true">{state === "speaking" ? "■" : "🔊"}</span>
      {state === "speaking"
        ? "Stop"
        : state === "novoice"
          ? lang === "ur"
            ? "اس ڈیوائس پر اردو آواز دستیاب نہیں"
            : "No voice available"
          : lang === "ur"
            ? "سنیں"
            : "Listen"}
    </button>
  );
}
