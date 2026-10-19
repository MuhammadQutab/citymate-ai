"use client";

import Link from "next/link";
import { useExperience } from "@/components/experience/ExperienceProvider";
import { FOOTER_COPY } from "@/content/landing";

export function SiteFooter() {
  const { lang } = useExperience();
  const c = FOOTER_COPY[lang];
  return (
    <footer
      lang={lang}
      dir={lang === "ur" ? "rtl" : "ltr"}
      className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-8 text-xs text-indigo-300 sm:px-8 lg:pb-8"
    >
      <div className="flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {c.data}{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline decoration-indigo-400 underline-offset-2 hover:text-pearl-50"
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.osm}
          </a>
          {c.rest}
        </p>
        <p>
          {c.proto}{" "}
          <Link href="/about" className="underline decoration-indigo-400 underline-offset-2 hover:text-pearl-50">
            {c.how}
          </Link>
        </p>
      </div>
    </footer>
  );
}
