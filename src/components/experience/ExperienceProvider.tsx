"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useLocalStore } from "@/components/ui/useLocalStore";
import { FEATURES } from "@/lib/features";
import { SoundEngine, speak as speakText, stopSpeaking, type Cue, type SpeakLang } from "@/lib/sound/engine";

export type Lang = "en" | "ur";

type Experience = {
  lang: Lang;
  setLang: (l: Lang) => void;
  soundOn: boolean;
  toggleSound: () => void;
  play: (cue: Cue) => void;
  /** Speak a reply aloud (only when sound is on). Returns false if no voice for that language. */
  speak: (text: string, lang: SpeakLang) => boolean;
  stop: () => void;
};

const Ctx = createContext<Experience | null>(null);

/** App-wide language (EN/اردو) and opt-in sound. Language persists per device; sound is off each visit. */
export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useLocalStore<Lang>("citymate.lang", "en");
  const [soundOn, setSoundOn] = useState(false);
  const engine = useRef<SoundEngine | null>(null);

  const toggleSound = useCallback(() => {
    engine.current ??= new SoundEngine();
    if (engine.current.enabled) {
      engine.current.disable();
      setSoundOn(false);
    } else {
      void engine.current.enable().then((ok) => {
        setSoundOn(ok);
        if (ok) engine.current?.play("found");
      });
    }
  }, []);

  const play = useCallback((cue: Cue) => {
    if (FEATURES.sound) engine.current?.play(cue);
  }, []);
  const speak = useCallback(
    (text: string, l: SpeakLang) => (FEATURES.sound && engine.current?.enabled ? speakText(text, l) : false),
    [],
  );

  const value = useMemo(
    () => ({ lang, setLang, soundOn, toggleSound, play, speak, stop: stopSpeaking }),
    [lang, setLang, soundOn, toggleSound, play, speak],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExperience(): Experience {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useExperience must be used inside ExperienceProvider");
  return ctx;
}
