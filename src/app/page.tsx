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
        region: c.region,
        places: places.length,
        named: places.filter((p) => p.name).length,
        note: "coverageNote" in c ? "Only lightly mapped so far. Help by adding places on OpenStreetMap." : undefined,
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
