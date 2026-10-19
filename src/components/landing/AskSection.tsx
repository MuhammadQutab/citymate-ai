"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChatThread } from "@/components/chat/ChatThread";
import { useMateChat } from "@/components/chat/useMateChat";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { Mate } from "@/components/mate/Mate";
import { MAX_MESSAGE_CHARS } from "@/lib/agent/limits";
import { CITIES, type CityId } from "@/lib/places/cities";
import type { PlaceWithDistance } from "@/lib/places/types";
import { ASK_COPY } from "@/content/landing";
import { ChapterHeading } from "./ChapterHeading";

/** "Now it's your turn" — a live, bilingual conversation with Mate on the landing page. */
export function AskSection() {
  const router = useRouter();
  const { lang, setLang, soundOn } = useExperience();
  const [city, setCity] = useState<CityId>("islamabad");
  const [draft, setDraft] = useState("");
  const noop = useCallback(() => {}, []);
  const chat = useMateChat(noop);

  const ask = (text: string) => {
    if (!text.trim() || chat.pending) return;
    void chat.send(text, { city, lastCategories: [] });
    setDraft("");
  };
  const openPlace = (p: PlaceWithDistance) => router.push(`/place/${p.id}`);
  const ur = lang === "ur";
  const c = ASK_COPY[lang];

  return (
    <section id="ask" className="relative mx-auto w-full max-w-4xl scroll-mt-24 px-4 py-20 sm:px-8" aria-label="Ask Mate in English or Urdu">
      <ChapterHeading kicker={c.kicker} title={c.title} lang={lang} align="center" />
      <p lang={lang} dir={ur ? "rtl" : "ltr"} className="mx-auto mt-4 max-w-xl text-center text-indigo-200">
        {c.desc}
        {soundOn ? c.soundOn : c.soundHint}
      </p>

      <div className="glass mt-10 rounded-panel p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Mate variant="bust" state={chat.pending ? "thinking" : draft ? "listening" : "idle"} className="h-12 w-12" />
            <div role="tablist" aria-label="Language" className="flex rounded-full border border-white/15 p-0.5 text-sm font-semibold">
              {(["en", "ur"] as const).map((l) => (
                <button
                  key={l}
                  role="tab"
                  type="button"
                  aria-selected={lang === l}
                  onClick={() => setLang(l)}
                  lang={l}
                  className={`rounded-full px-4 py-1.5 transition ${lang === l ? "bg-coral-400 text-indigo-950" : "text-indigo-200"}`}
                  style={l === "ur" ? { lineHeight: 1.5 } : undefined}
                >
                  {l === "en" ? "English" : "اردو"}
                </button>
              ))}
            </div>
          </div>
          <label className="sr-only" htmlFor="ask-city">
            City
          </label>
          <select
            id="ask-city"
            value={city}
            onChange={(e) => setCity(e.target.value as CityId)}
            className="rounded-full border border-white/15 bg-indigo-950/60 px-4 py-2 text-sm"
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {ur ? c.nameUr : c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 max-h-[420px] min-h-[120px] overflow-y-auto">
          {chat.messages.length === 0 && (
            <ul className="flex flex-wrap gap-2" dir={ur ? "rtl" : "ltr"}>
              {c.prompts.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    lang={lang}
                    onClick={() => ask(q)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-indigo-200 transition hover:border-coral-400/60 hover:text-pearl-50"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ChatThread messages={chat.messages} pending={chat.pending} selectedId={null} onPick={openPlace} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
          className="mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-indigo-950/60 p-1.5 pl-5 focus-within:border-mint-400/60"
        >
          <label htmlFor="ask-input" className="sr-only">
            {c.label}
          </label>
          <input
            id="ask-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_MESSAGE_CHARS}
            dir="auto"
            lang={lang}
            placeholder={c.placeholder}
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2 text-pearl-50 placeholder:text-indigo-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || chat.pending}
            lang={lang}
            className="shrink-0 rounded-full bg-mint-400 px-5 py-2.5 text-sm font-bold text-indigo-950 transition hover:bg-mint-300 disabled:opacity-40"
          >
            {c.ask}
          </button>
        </form>
      </div>
    </section>
  );
}
