"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed state (device-only, no account). Safe during SSR
 * and when storage is blocked: falls back to the default value.
 */
const EVENT = "citymate-local-store";
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    /* storage blocked */
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function useLocalStore<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    (cb) => {
      const on = (e: Event) => (e instanceof StorageEvent ? e.key === key : (e as CustomEvent).detail === key) && cb();
      window.addEventListener("storage", on);
      window.addEventListener(EVENT, on);
      return () => {
        window.removeEventListener("storage", on);
        window.removeEventListener(EVENT, on);
      };
    },
    () => read(key, fallback),
    () => fallback,
  );

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        cache.set(key, { raw: JSON.stringify(resolved), value: resolved });
      }
      window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    },
    [key, fallback],
  );

  return [value, set] as const;
}
