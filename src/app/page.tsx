import { CityBackdrop } from "@/components/brand/CityBackdrop";
import { Hero } from "@/components/landing/Hero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <CityBackdrop />
      <SiteHeader />
      <main className="relative flex flex-1 flex-col">
        <Hero />
      </main>
      <SiteFooter />
    </div>
  );
}
