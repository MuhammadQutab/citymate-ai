"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Mate } from "@/components/mate/Mate";

/** Friendly recovery screen for unexpected rendering errors. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <Mate state="unsure" className="h-40 w-32" />
      <h1 className="mt-4 font-display text-3xl font-bold">Something went sideways</h1>
      <p className="mt-2 text-indigo-200">Mate hit an unexpected snag on this page. Your checklist and settings are safe.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-mint-400 px-5 py-2.5 font-bold text-indigo-950 hover:bg-mint-300">
          Try again
        </button>
        <Link href="/" className="rounded-full border border-white/20 px-5 py-2.5 font-semibold hover:border-coral-400/70">
          Go home
        </Link>
      </div>
    </main>
  );
}
