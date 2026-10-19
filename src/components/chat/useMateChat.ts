"use client";

import { useCallback, useRef, useState } from "react";
import type { LatLng } from "@/lib/geo/distance";
import type { ChatResponse, Pick } from "@/lib/agent/types";
import { MAX_HISTORY, MAX_MESSAGE_CHARS } from "@/lib/agent/limits";
import type { CategoryId } from "@/lib/places/categories";

export type ChatMessage = {
  id: number;
  role: "user" | "mate";
  text: string;
  picks?: Pick[];
  aiNotice?: string;
  error?: boolean;
};

type Context = { city: string; near?: LatLng | null; lastCategories: CategoryId[] };

/** Client-side session: history lives only in this tab and is never stored server-side. */
export function useMateChat(onResult: (res: ChatResponse) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);
  const inflight = useRef<AbortController | null>(null);

  const send = useCallback(
    async (raw: string, ctx: Context) => {
      const text = raw.trim().slice(0, MAX_MESSAGE_CHARS);
      if (!text) return;
      const history = messages
        .filter((m) => !m.error)
        .slice(-MAX_HISTORY)
        .map((m) => ({ role: m.role, text: m.text.slice(0, MAX_MESSAGE_CHARS * 2) }));

      setMessages((ms) => [...ms, { id: nextId.current++, role: "user", text }]);
      setPending(true);
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
          }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.message ?? "Mate couldn't answer just now.");
        const data = body as ChatResponse;
        setMessages((ms) => [
          ...ms,
          { id: nextId.current++, role: "mate", text: data.reply, picks: data.picks, aiNotice: data.aiNotice },
        ]);
        onResult(data);
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setMessages((ms) => [
          ...ms,
          { id: nextId.current++, role: "mate", text: err instanceof Error ? err.message : "Something went wrong.", error: true },
        ]);
      } finally {
        if (inflight.current === ctrl) {
          inflight.current = null;
          setPending(false);
        }
      }
    },
    [messages, onResult],
  );

  return { messages, pending, send };
}
