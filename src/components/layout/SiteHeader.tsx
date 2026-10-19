import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const nav = [
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "About & Data" },
];

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
      <Link href="/" aria-label="CityMate AI home">
        <Logo />
      </Link>
      <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-2 text-sm font-medium text-indigo-200 transition-colors hover:bg-white/5 hover:text-pearl-50"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
