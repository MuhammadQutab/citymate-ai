import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MateGallery } from "@/components/mate/MateGallery";

export const metadata: Metadata = { title: "About & Data" };

const sections = [
  {
    title: "What CityMate is",
    body: "CityMate AI helps travellers, visitors and newcomers find useful places and essential services in unfamiliar cities. It is a non-commercial prototype, piloting in Islamabad, Rawalpindi and Kotli (Azad Jammu & Kashmir).",
  },
  {
    title: "Where the data comes from",
    body: "Place data comes from OpenStreetMap, collected by volunteer contributors. Islamabad, Rawalpindi and Kotli use prepared City Pack snapshots. Other areas are searched live through the public Overpass API. Map tiles come from the OpenStreetMap Foundation. Coverage varies a lot: Islamabad is well mapped, while Kotli has only a handful of places. Opening hours and phone numbers are listed for only around 5% of places.",
  },
  {
    title: "How the AI is used",
    body: "Mate, our AI companion, works out what you're asking for and explains the results. Every place it mentions comes from our own data lookup, never from the AI's imagination. If details are unknown, Mate says so. Category browsing works without the AI.",
  },
  {
    title: "Distances and directions",
    body: "Distances are approximate straight-line distances calculated from coordinates, not walking or driving routes. For turn-by-turn directions, CityMate links you to an external map app.",
  },
  {
    title: "Your privacy",
    body: "Your location is used only after you tap “Near me” and allow it. It is rounded to roughly 10 m before reaching our server, is never placed in a shareable link, and is not stored. Outside our City Packs, a further-rounded location (about 100 m) is sent to public Overpass servers to search nearby. CityMate has no accounts. Chat messages are sent to Google's Gemini API to produce replies.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          About CityMate <span className="text-mint-400">& our data</span>
        </h1>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {sections.map((s) => (
            <section key={s.title} className="glass rounded-panel p-6">
              <h2 className="font-display text-xl font-bold text-pearl-50">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-indigo-200">{s.body}</p>
            </section>
          ))}
        </div>

        <section className="mt-14" aria-labelledby="meet-mate">
          <h2 id="meet-mate" className="font-display text-2xl font-bold">
            Meet Mate
          </h2>
          <p className="mt-1 text-indigo-200">An original CityMate character. Here are Mate&apos;s moods.</p>
          <MateGallery />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
