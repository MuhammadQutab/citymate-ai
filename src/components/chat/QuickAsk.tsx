"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { Mate } from "@/components/mate/Mate";
import { MAX_MESSAGE_CHARS } from "@/lib/agent/limits";
import { CITIES, type CityId } from "@/lib/places/cities";
import type { PlaceWithDistance } from "@/lib/places/types";
import { ChatThread } from "./ChatThread";
import { useMateChat } from "./useMateChat";

const COPY = {
  en: {
    title: "Ask Mate",
    sub: "Quick answers about everyday places",
    hi: "Hi! Ask me anything like:",
    placeholder: "Type your question…",
    ask: "Ask",
    open: "Ask Mate",
    close: "Close",
    quick: ["Nearest pharmacy", "My tap is leaking", "ATM nearby", "Somewhere for kids to play"],
  },
  ur: {
    title: "میٹ سے پوچھیں",
    sub: "روزمرہ کی جگہوں کے بارے میں فوری جواب",
    hi: "السلام علیکم! آپ ایسے پوچھ سکتے ہیں:",
    placeholder: "اپنا سوال لکھیں…",
    ask: "پوچھیں",
    open: "میٹ سے پوچھیں",
    close: "بند کریں",
    quick: ["قریب ترین فارمیسی", "نلکا لیک ہو رہا ہے", "قریب اے ٹی ایم", "بچوں کے کھیلنے کی جگہ"],
  },
} as const;

/** Floating "Ask Mate" chatbot for quick questions on every page (Explore has its own chat). */
export function QuickAsk() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [city, setCity] = useState<CityId>("islamabad");
  const noop = useCallback(() => {}, []);
  const chat = useMateChat(noop);
  const { lang, play } = useExperience();
  const t = COPY[lang];

  if (pathname?.startsWith("/explore")) return null;

  const ask = (text: string) => {
    if (!text.trim() || chat.pending) return;
    void chat.send(text, { city, lastCategories: [] });
    setDraft("");
  };
  const openPlace = (p: PlaceWithDistance) => {
    setOpen(false);
    router.push(`/place/${p.id}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Ask Mate"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="glass flex max-h-[min(70dvh,560px)] w-[min(92vw,380px)] origin-bottom-right flex-col overflow-hidden rounded-panel"
          >
            <header className="flex items-center gap-3 border-b border-white/10 p-4">
              <Mate variant="bust" state={chat.pending ? "thinking" : draft ? "listening" : "idle"} className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 lang={lang} className="font-display font-bold">{t.title}</h2>
                <p lang={lang} className="text-xs text-indigo-200">{t.sub}</p>
              </div>
              <label className="sr-only" htmlFor="qa-city">
                City
              </label>
              <select
                id="qa-city"
                value={city}
                onChange={(e) => setCity(e.target.value as CityId)}
                className="rounded-full border border-white/15 bg-indigo-950/60 px-2 py-1 text-xs"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === "ur" ? c.nameUr : c.name}
                  </option>
                ))}
              </select>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {chat.messages.length === 0 && (
                <div>
                  <p lang={lang} className="text-sm text-indigo-200">{t.hi}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {t.quick.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          onClick={() => ask(q)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-indigo-200 hover:border-coral-400/60 hover:text-pearl-50"
                        >
                          {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ChatThread messages={chat.messages} pending={chat.pending} selectedId={null} onPick={openPlace} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="flex gap-2 border-t border-white/10 p-3"
            >
              <label htmlFor="qa-input" className="sr-only">
                Your question
              </label>
              <input
                id="qa-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={MAX_MESSAGE_CHARS}
                placeholder={t.placeholder}
                dir="auto"
                lang={lang}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full border border-white/15 bg-indigo-950/60 px-4 py-2 text-sm placeholder:text-indigo-300 focus:border-mint-400/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || chat.pending}
                className="rounded-full bg-mint-400 px-4 text-sm font-bold text-indigo-950 disabled:opacity-40"
              >
                <span lang={lang}>{t.ask}</span>
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          if (!open) play("open");
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={open ? "Close Ask Mate" : "Open Ask Mate chat"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2 rounded-full bg-coral-400 p-1.5 font-bold text-indigo-950 shadow-glow-coral sm:py-2 sm:pe-4 sm:ps-2"
      >
        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-indigo-950">
          <Mate variant="bust" state={open ? "listening" : "idle"} className="h-10 w-10" />
        </span>
        <span lang={lang} className="hidden sm:inline">
          {open ? t.close : t.open}
        </span>
      </motion.button>
    </div>
  );
}
