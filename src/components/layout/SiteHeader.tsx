"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/brand/Logo";
import { LangToggle, SoundToggle } from "@/components/experience/Toggles";

export const NAV = [
  { href: "/explore", label: "City Explorer", short: "Explore" },
  { href: "/services", label: "Home Services", short: "Services" },
  { href: "/new-resident", label: "New Resident", short: "Settle in" },
  { href: "/about", label: "About & Data", short: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-[1000] mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
      <Link href="/" aria-label="CityMate AI home" onClick={() => setOpen(false)}>
        <Logo />
      </Link>

      <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                active ? "text-pearl-50" : "text-indigo-200 hover:bg-white/5 hover:text-pearl-50"
              }`}
            >
              {active && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/10" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-2 lg:flex">
        <LangToggle />
        <SoundToggle />
      </div>

      <button
        type="button"
        className="grid h-10 w-10 place-items-center rounded-full border border-white/15 lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Main"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass absolute inset-x-4 top-full rounded-panel p-2 lg:hidden"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`block rounded-xl px-4 py-3 font-medium ${pathname === item.href ? "bg-white/10 text-pearl-50" : "text-indigo-200"}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center justify-between gap-2 border-t border-white/10 px-2 pb-1 pt-3">
              <LangToggle />
              <SoundToggle />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
