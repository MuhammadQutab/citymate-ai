"use client";

import { useCallback, useRef, useState } from "react";
import { useExperience, type Lang } from "@/components/experience/ExperienceProvider";
import type { LatLng } from "@/lib/geo/distance";
import type { ChatResponse, Pick } from "@/lib/agent/types";
import { MAX_HISTORY, MAX_MESSAGE_CHARS } from "@/lib/agent/limits";
import type { CategoryId } from "@/lib/places/categories";

export type ChatMessage = {
  id: number;
  role: "user" | "mate";
  text: string;
  lang: Lang;
  picks?: Pick[];
  aiNotice?: string;
  error?: boolean;
};

type Context = { city: string; near?: LatLng | null; lastCategories: CategoryId[] };

const isUrdu = (s: string) => /[؀-ۿ]/.test(s);

/**
 * Client-side session: history lives only in this tab, never server-side.
 * Plays sound cues and reads Mate's replies aloud when the user has sound on.
 */
export function useMateChat(onResult: (res: ChatResponse) => void) {
  const { lang: uiLang, play, speak } = useExperience();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);
  const inflight = useRef<AbortController | null>(null);

  const send = useCallback(
    async (raw: string, ctx: Context) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!text) return;
      // Typing in Urdu script always gets an Urdu answer; otherwise follow the UI language.
      const lang: Lang = isUrdu(text) ? "ur" : uiLang;
      const history = messages
        .filter((m) => !m.error)
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_MESSAGE_CHARS * 2) }));

      setMessages((ms) => [...ms, { id: nextId.current++, role: "user", text, lang }]);
      setPending(true);
      play("send");
      inflight.current?.abort();
      const ctrl = new AbortController();
      inflight.current = ctrl;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            message: text,
            history,
            city: ctx.city,
            near: ctx.near ? { lat: +ctx.near.lat.toFixed(4), lon: +ctx.near.lon.toFixed(4) } : undefined,
            lastCategories: ctx.lastCategories.slice(0, 3),
            lang,
          }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message ?? "Mate couldn't answer just now.");
        const data = body as ChatResponse;
        setMessages((ms) => [
          ...ms,
          { id: nextId.current++, role: "mate", text: data.reply, lang: data.lang, picks: data.picks, aiNotice: data.aiNotice },
        ]);
        play(data.picks.length > 0 ? "found" : data.categories.length > 0 ? "unsure" : "tap");
        speak(data.reply, data.lang);
        onResult(data);
      } catch (err) {
        if (ctrl.signal.aborted) return;
        play("unsure");
        setMessages((ms) => [
          ...ms,
          { id: nextId.current++, role: "mate", text: err instanceof Error ? err.message : "Something went wrong.", lang: "en", error: true },
        ]);
      } finally {
        if (inflight.current === ctrl) {
          inflight.current = null;
          setPending(false);
        }
      }
    },
    [messages, onResult, uiLang, play, speak],
  );

  return { messages, pending, send };
}
