import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ServicesExplorer } from "@/components/services/ServicesExplorer";
import { isCategoryId } from "@/lib/places/categories";
import { DEFAULT_CITY, isCityId } from "@/lib/places/cities";

export const metadata: Metadata = {
  title: "Home Services",
  description: "Describe a household problem and find plumbers, electricians, AC technicians and more listed nearby.",
};

export default async function ServicesPage({ searchParams }: PageProps<"/services">) {
  const { category, city } = await searchParams;
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 pt-4">
        <ServicesExplorer
          initialCity={isCityId(city) ? city : DEFAULT_CITY}
          initialCategory={isCategoryId(category) ? category : null}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
