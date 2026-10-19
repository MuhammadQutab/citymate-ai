"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Mate } from "@/components/mate/Mate";
import { ease } from "@/lib/motion";
import { ChapterHeading } from "./ChapterHeading";

/**
 * "Sara's first night" — an illustrative story (not a real person) that walks
 * visitors through what CityMate does, chapter by chapter, as they scroll.
 */
const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
} as const;

function Scene({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <motion.figure
      {...reveal}
      transition={{ duration: 0.8, ease, delay: 0.15 }}
      className="glass relative overflow-hidden rounded-panel p-5 sm:p-6"
      aria-label={label}
    >
      <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mint-400/10 blur-3xl" />
      <div className="relative">{children}</div>
      <figcaption className="relative mt-4 text-[10px] uppercase tracking-widest text-indigo-300">Illustration</figcaption>
    </motion.figure>
  );
}

function Chapter({
  n,
  ur,
  en,
  children,
  scene,
  flip,
}: {
  n: number;
  ur: string;
  en: string;
  children: React.ReactNode;
  scene: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="relative grid items-center gap-8 py-14 md:grid-cols-2 md:gap-14 md:py-20">
      {/* node on the story thread */}
      <span aria-hidden="true" className="absolute -left-6 top-20 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-mint-400 shadow-glow-mint md:block" />
      <div className={flip ? "md:order-2" : ""}>
        <ChapterHeading kicker={`Chapter ${n}`} ur={ur} en={en} />
        <motion.div {...reveal} transition={{ duration: 0.7, ease, delay: 0.1 }} className="mt-5 space-y-3 text-lg leading-relaxed text-indigo-200">
          {children}
        </motion.div>
      </div>
      <div className={flip ? "md:order-1" : ""}>{scene}</div>
    </section>
  );
}

const needs = [
  { g: "🏧", t: "Cash", ur: "پیسے" },
  { g: "💊", t: "Headache medicine", ur: "سر درد کی دوا" },
  { g: "🔧", t: "Someone to fix a tap", ur: "پلمبر" },
];

export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const thread = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-6xl px-4 sm:px-8 md:pl-14">
      {/* the glowing story thread */}
      <div aria-hidden="true" className="absolute bottom-0 left-8 top-0 hidden w-px bg-white/10 md:block">
        <motion.div style={{ scaleY: thread }} className="h-full w-full origin-top bg-gradient-to-b from-mint-400 via-coral-400 to-sunset" />
      </div>

      <Chapter
        n={1}
        ur="رات کے دس بجے، ایک نیا شہر"
        en="10 pm. A new city."
        scene={
          <Scene label="Sara's three needs">
            <p className="mb-4 text-sm text-indigo-200">Sara&apos;s list tonight</p>
            <ul className="space-y-3">
              {needs.map((n, i) => (
                <motion.li
                  key={n.t}
                  initial={{ opacity: 0, x: 30, rotate: 2 }}
                  whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease, delay: 0.3 + i * 0.18 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3"
                >
                  <span className="text-2xl" aria-hidden="true">
                    {n.g}
                  </span>
                  <span className="flex-1 font-semibold text-pearl-50">{n.t}</span>
                  <span lang="ur" className="text-sm text-coral-300">
                    {n.ur}
                  </span>
                </motion.li>
              ))}
            </ul>
          </Scene>
        }
      >
        <p>
          Sara has just moved to Rawalpindi for a new job. Her phone is on 12%, the shops are closing, and she doesn&apos;t
          know a single street yet.
        </p>
        <p>
          She needs three things: cash, something for a headache, and someone to fix the tap dripping in her new flat.
        </p>
      </Chapter>

      <Chapter
        n={2}
        flip
        ur="ایک سوال، تین ضرورتیں"
        en="One question. Three needs."
        scene={
          <Scene label="Sara asks Mate in Urdu">
            <div className="flex justify-end">
              <motion.p
                {...reveal}
                transition={{ delay: 0.3 }}
                lang="ur"
                dir="rtl"
                className="max-w-[85%] rounded-2xl rounded-br-md bg-mint-400 px-4 py-2 text-indigo-950"
              >
                مجھے پیسے، سر درد کی دوا اور پلمبر چاہیے
              </motion.p>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Mate variant="bust" state="thinking" className="h-12 w-12 shrink-0" />
              <div className="flex flex-wrap gap-2 pt-2">
                {["🏧 ATMs & Banks", "💊 Pharmacies", "🔧 Plumbers"].map((c, i) => (
                  <motion.span
                    key={c}
                    initial={{ opacity: 0, scale: 0.6 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.8 + i * 0.2 }}
                    className="rounded-full bg-coral-400 px-3 py-1.5 text-xs font-bold text-indigo-950"
                  >
                    {c}
                  </motion.span>
                ))}
              </div>
            </div>
          </Scene>
        }
      >
        <p>She types it the way she&apos;d say it, in Urdu. No menus, no hunting through categories.</p>
        <p>Mate understands that one sentence holds three separate needs, and searches for each of them.</p>
      </Chapter>

      <Chapter
        n={3}
        ur="صرف سچی معلومات"
        en="Only real places. Honestly."
        scene={
          <Scene label="Honest results with a labelled alternative">
            <ul className="space-y-2.5">
              {[
                { g: "🏧", t: "ATM", d: "≈ 350 m away (straight line)" },
                { g: "💊", t: "Pharmacy", d: "≈ 600 m away (straight line)" },
              ].map((r, i) => (
                <motion.li
                  key={r.t}
                  {...reveal}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-400/90" aria-hidden="true">
                    {r.g}
                  </span>
                  <span>
                    <span className="block font-semibold">{r.t}</span>
                    <span className="block text-xs text-mint-300">{r.d}</span>
                  </span>
                </motion.li>
              ))}
              <motion.li {...reveal} transition={{ delay: 0.7 }} className="rounded-2xl border border-dashed border-white/15 p-3 text-sm text-indigo-200">
                No plumbers are listed nearby.
              </motion.li>
              <motion.li {...reveal} transition={{ delay: 0.9 }} className="flex items-center gap-3 rounded-2xl border border-sunset/30 bg-sunset/[0.06] p-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sunset/80" aria-hidden="true">
                  🔩
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-sunset">Alternative · not a confirmed provider</span>
                  <span className="block font-semibold">Hardware shop that sells plumbing parts</span>
                </span>
              </motion.li>
            </ul>
          </Scene>
        }
      >
        <p>
          Mate shows real ATMs and pharmacies from OpenStreetMap, with honest straight-line distances.
        </p>
        <p>
          No plumbers are listed nearby, and Mate says so plainly. Instead it suggests hardware shops that sell parts,
          clearly labelled as alternatives. <span className="text-pearl-50">Nothing is ever invented.</span>
        </p>
      </Chapter>

      <Chapter
        n={4}
        flip
        ur="نیا شہر، اپنا سا لگنے لگا"
        en="And the new city starts to feel like home."
        scene={
          <Scene label="Sara's settling-in checklist">
            <p className="mb-3 text-sm font-semibold text-pearl-50">Settling-in checklist</p>
            <ul className="space-y-2">
              {["Find a grocery store", "Locate the nearest pharmacy", "Find a park for Sunday walks", "Find an electrician"].map((t, i) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <motion.span
                    initial={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileInView={{ backgroundColor: i < 3 ? "#3df2c2" : "rgba(255,255,255,0.05)" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.35 }}
                    className="grid h-5 w-5 place-items-center rounded-md border border-white/20 text-[11px] font-bold text-indigo-950"
                    aria-hidden="true"
                  >
                    {i < 3 ? "✓" : ""}
                  </motion.span>
                  <span className={i < 3 ? "text-indigo-300 line-through" : "text-pearl-50"}>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "75%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease, delay: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-mint-400 to-coral-400"
              />
            </div>
          </Scene>
        }
      >
        <p>
          By the weekend Sara has ticked off most of her settling-in checklist: groceries, a pharmacy, a park for Sunday
          walks.
        </p>
        <p>Mate remembers her progress on her own phone. No account, no sign-up.</p>
      </Chapter>
    </div>
  );
}
