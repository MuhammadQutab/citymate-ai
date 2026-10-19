/**
 * CityMate soundscape — fully synthesized with the Web Audio API (no audio
 * files, nothing to license or download). Off until the user opts in.
 *
 * - Ambient "night city": a warm low drone, a soft filtered-noise traffic
 *   hum, and occasional distant pentatonic chimes.
 * - UI cues: tap, open (whoosh), send, found (rising mint chime), unsure.
 */
export type Cue = "tap" | "open" | "send" | "found" | "unsure";

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: GainNode | null = null;
  private fx: GainNode | null = null;
  private chimeTimer: ReturnType<typeof setTimeout> | null = null;
  enabled = false;

  private build() {
    if (this.ctx) return true;
    const Ctor =
      typeof window !== "undefined"
        ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
        : undefined;
    if (!Ctor) return false;
    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      master.connect(comp).connect(ctx.destination);

      // A short synthetic reverb gives everything a sense of open night air.
      const verb = ctx.createConvolver();
      verb.buffer = this.impulse(ctx, 2.6);
      const verbGain = ctx.createGain();
      verbGain.gain.value = 0.3;

      const ambient = ctx.createGain();
      ambient.gain.value = 0.55;
      ambient.connect(master);
      ambient.connect(verb);

      const fx = ctx.createGain();
      fx.gain.value = 0.9;
      fx.connect(master);
      fx.connect(verb);
      verb.connect(verbGain).connect(master);

      this.ctx = ctx;
      this.master = master;
      this.ambient = ambient;
      this.fx = fx;
      this.startAmbient();
      return true;
    } catch {
      this.ctx = null;
      return false;
    }
  }

  private impulse(ctx: AudioContext, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    return buf;
  }

  private startAmbient() {
    const ctx = this.ctx!;
    const out = this.ambient!;

    // Warm drone: two detuned voices through a slowly breathing low-pass.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.Q.value = 0.7;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05;
    for (const [freq, type, detune] of [
      [110, "sine", 0],
      [164.81, "triangle", 6],
      [220, "sine", -5],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(lp);
      o.start();
    }
    lp.connect(droneGain).connect(out);

    // Distant traffic: brown noise, band-limited and very quiet.
    const noiseLen = ctx.sampleRate * 4;
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < noiseLen; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      nd[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 300;
    bp.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.12;
    noise.connect(bp).connect(noiseGain).connect(out);
    noise.start();

    this.scheduleChime();
  }

  private scheduleChime() {
    this.chimeTimer = setTimeout(() => {
      if (this.enabled) this.bell(PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)] / 2, 0.035, 3, this.ambient!);
      this.scheduleChime();
    }, 7000 + Math.random() * 9000);
  }

  private bell(freq: number, level: number, decay: number, dest: AudioNode, when = 0) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + when;
    for (const [mult, amp] of [
      [1, 1],
      [2.01, 0.35],
      [3.02, 0.12],
    ]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq * mult;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level * amp, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay / mult);
      o.connect(g).connect(dest);
      o.start(t);
      o.stop(t + decay + 0.1);
    }
  }

  private whoosh() {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(400, t);
    f.frequency.exponentialRampToValueAtTime(2800, t + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(f).connect(g).connect(this.fx!);
    src.start(t);
  }

  async enable() {
    if (!this.build()) return false;
    await this.ctx!.resume().catch(() => {});
    this.enabled = true;
    const t = this.ctx!.currentTime;
    this.master!.gain.cancelScheduledValues(t);
    this.master!.gain.setTargetAtTime(0.7, t, 0.6);
    return true;
  }

  disable() {
    this.enabled = false;
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.25);
    stopSpeaking();
  }

  play(cue: Cue) {
    if (!this.enabled || !this.ctx) return;
    const fx = this.fx!;
    switch (cue) {
      case "tap":
        this.bell(1318.5, 0.05, 0.25, fx);
        break;
      case "send":
        this.bell(659.25, 0.07, 0.5, fx);
        this.bell(987.77, 0.05, 0.6, fx, 0.07);
        break;
      case "found":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.bell(f, 0.07, 1.4, fx, i * 0.09));
        break;
      case "unsure":
        this.bell(392, 0.07, 0.9, fx);
        this.bell(349.23, 0.06, 1.1, fx, 0.16);
        break;
      case "open":
        this.whoosh();
        break;
    }
  }
}

/* ---------- Voice (browser speech synthesis — free, on-device) ---------- */

export type SpeakLang = "en" | "ur";

export function voiceFor(lang: SpeakLang): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang === "ur" ? "ur" : "en";
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(lang === "ur" ? "ur-pk" : "en-gb")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    null
  );
}

/** Speak text aloud. Returns false when no suitable voice exists on this device. */
export function speak(text: string, lang: SpeakLang, onEnd?: () => void): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const voice = voiceFor(lang);
  if (lang === "ur" && !voice) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "ur" ? "ur-PK" : "en-GB";
  if (voice) u.voice = voice;
  u.rate = lang === "ur" ? 0.95 : 1;
  u.pitch = 1.05;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
