import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 text-xs text-indigo-300 sm:px-8">
      <div className="flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Map data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline decoration-indigo-400 underline-offset-2 hover:text-pearl-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap contributors
          </a>
          , available under the ODbL. City illustrations are decorative, not real locations.
        </p>
        <p>
          Non-commercial prototype ·{" "}
          <Link href="/about" className="underline decoration-indigo-400 underline-offset-2 hover:text-pearl-50">
            How CityMate uses data
          </Link>
        </p>
      </div>
    </footer>
  );
}
