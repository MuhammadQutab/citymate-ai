import { CityBackdrop } from "@/components/brand/CityBackdrop";
import { AskSection } from "@/components/landing/AskSection";
import { Flagships } from "@/components/landing/Flagships";
import { Hero } from "@/components/landing/Hero";
import { Story } from "@/components/landing/Story";
import { CitiesSection, ClosingSection, HowItWorks, PromiseSection, type CityStat } from "@/components/landing/StorySections";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CITIES } from "@/lib/places/cities";
import { loadCityPack } from "@/lib/places/providers/citypack";

/** Real coverage numbers from the City Packs, computed at build time. */
async function cityStats(): Promise<CityStat[]> {
  return Promise.all(
    CITIES.map(async (c) => {
      const pack = await loadCityPack(c.id);
      const places = pack?.places ?? [];
      return {
        id: c.id,
        name: c.name,
        nameUr: c.nameUr,
        places: places.length,
        thin: "coverageNote" in c,
      };
    }),
  );
}

export default async function Home() {
  const stats = await cityStats();
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <div className="relative flex min-h-dvh flex-col">
        <CityBackdrop />
        <SiteHeader />
        <main className="relative flex flex-1 flex-col">
          <Hero />
        </main>
      </div>
      <div id="story" className="relative scroll-mt-10">
        <Story />
      </div>
      <AskSection />
      <HowItWorks />
      <Flagships />
      <CitiesSection cities={stats} />
      <PromiseSection />
      <ClosingSection />
      <SiteFooter />
    </div>
  );
}
