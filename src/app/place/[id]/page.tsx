import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PlaceMiniMap } from "@/components/map/PlaceMiniMap";
import { directionsLinks } from "@/lib/geo/directions";
import { formatStraightLine, straightLineMeters, type LatLng } from "@/lib/geo/distance";
import { CATEGORY_GLYPHS, CATEGORY_LABELS } from "@/lib/places/categories";
import { getCity } from "@/lib/places/cities";
import { osmUrl, parsePlaceId } from "@/lib/places/normalize";
import { OverpassUnavailableError } from "@/lib/places/overpass";
import { getPlaceById, type PlaceLookup } from "@/lib/places/service";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function parseFrom(v: string | string[] | undefined): LatLng | null {
  if (typeof v !== "string") return null;
  const [lat, lon] = v.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
}

// Deduplicated per request: metadata and page share one lookup.
const lookup = cache(async (id: string): Promise<PlaceLookup | "unavailable" | null> => {
  try {
    return await getPlaceById(id);
  } catch (err) {
    if (err instanceof OverpassUnavailableError) return "unavailable";
    throw err;
  }
});

export async function generateMetadata({ params }: PageProps<"/place/[id]">): Promise<Metadata> {
  const { id } = await params;
  const found = parsePlaceId(id) ? await lookup(id) : null;
  return { title: found && found !== "unavailable" ? (found.place.name ?? found.place.kind) : "Place details" };
}

export default async function PlacePage({ params, searchParams }: PageProps<"/place/[id]">) {
  const { id } = await params;
  if (!parsePlaceId(id)) notFound();
  const found = await lookup(id);
  if (!found) notFound();

  const from = parseFrom((await searchParams).from);

  if (found === "unavailable") {
    return (
      <Shell>
        <article className="surface-pearl rounded-panel p-6 shadow-float sm:p-8" role="alert">
          <h1 className="font-display text-2xl font-bold">Place details are temporarily unavailable</h1>
          <p className="mt-2 text-pearl-500">
            This place isn&apos;t in our City Packs and OpenStreetMap&apos;s live servers are busy. Please try again shortly.
          </p>
          <BackLink />
        </article>
      </Shell>
    );
  }

  const { place, source, dataDate, cityId } = found;
  const city = cityId ? getCity(cityId) : undefined;
  const links = directionsLinks(place, from ?? undefined);
  const distance = from ? formatStraightLine(straightLineMeters(from, place)) : null;

  const facts: { label: string; value?: React.ReactNode }[] = [
    { label: "Address", value: place.address },
    {
      label: "Opening hours",
      value: place.openingHours && (
        <>
          <code className="text-sm">{place.openingHours}</code>
          <span className="block text-xs text-pearl-500">As listed on OpenStreetMap. Hours may be outdated.</span>
        </>
      ),
    },
    {
      label: "Phone",
      value: place.phone && (
        <a className="text-mint-ink underline underline-offset-2" href={`tel:${place.phone.replace(/[^\d+]/g, "")}`}>
          {place.phone}
        </a>
      ),
    },
    {
      label: "Website",
      value: place.website && (
        <a className="break-all text-mint-ink underline underline-offset-2" href={place.website} target="_blank" rel="noopener noreferrer nofollow">
          {place.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      ),
    },
    { label: "Cuisine", value: place.category === "food" || place.category === "cafe" ? place.cuisine : undefined },
    { label: "Wheelchair access", value: place.wheelchair },
  ];
  // Only show cuisine for food places; always show the other rows (with an honest "not listed").
  const rows = facts.filter((f) => f.label !== "Cuisine" || f.value);

  return (
    <Shell>
      <article className="surface-pearl overflow-hidden rounded-panel shadow-float">
        <div className="h-56 sm:h-72">
          <PlaceMiniMap place={place} user={from} />
        </div>
        <div className="p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-coral-ink">
            <span aria-hidden="true">{CATEGORY_GLYPHS[place.category]}</span>
            {CATEGORY_LABELS[place.category]} · {place.kind}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {place.name ?? <span className="italic text-pearl-500">Unnamed {place.kind.toLowerCase()}</span>}
          </h1>
          {place.localName && (
            <p className="mt-1 text-lg text-pearl-500" lang="ur" dir="rtl">
              {place.localName}
            </p>
          )}
          {place.brand && <p className="mt-1 text-sm text-pearl-500">Brand: {place.brand}</p>}
          {distance && <p className="mt-3 font-semibold text-mint-ink">{distance}</p>}
          {city && <p className="mt-1 text-sm text-pearl-500">{city.name}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={links.google}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-indigo-950 px-5 py-2.5 text-sm font-bold text-pearl-50 transition hover:bg-indigo-800"
            >
              Directions in Google Maps ↗
            </a>
            <a
              href={links.osm}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-indigo-950/20 px-5 py-2.5 text-sm font-semibold transition hover:border-indigo-950/50"
            >
              Directions in OpenStreetMap ↗
            </a>
          </div>

          <dl className="mt-8 divide-y divide-pearl-200 border-y border-pearl-200">
            {rows.map((f) => (
              <div key={f.label} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-semibold text-pearl-500">{f.label}</dt>
                <dd>{f.value ?? <span className="text-sm italic text-pearl-500">Not listed on OpenStreetMap</span>}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-xs leading-relaxed text-pearl-500">
            Source: {source === "citypack" ? "CityMate City Pack" : "live OpenStreetMap lookup"}, data as of{" "}
            {dateFmt.format(new Date(dataDate))}. © OpenStreetMap contributors (ODbL).
            {distance && " Distance is an approximate straight line, not a travel route."} Something wrong or missing?{" "}
            <a href={osmUrl(place.id) ?? "https://www.openstreetmap.org"} target="_blank" rel="noopener noreferrer" className="underline">
              View or improve it on OpenStreetMap
            </a>
            .
          </p>
          <BackLink />
        </div>
      </article>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
      <SiteFooter />
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/explore" className="mt-6 inline-block font-semibold text-mint-ink underline underline-offset-4">
      ← Back to explorer
    </Link>
  );
}
