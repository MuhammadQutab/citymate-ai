import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = { title: "Place details" };

export default async function PlacePage({ params }: PageProps<"/place/[id]">) {
  const { id } = await params;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
        <article className="surface-pearl rounded-panel p-6 shadow-float sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-coral-ink">Place</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Place details</h1>
          <p className="mt-3 text-pearl-500">
            Verified place lookups are added in Phase 2. Requested ID:{" "}
            <code className="rounded bg-pearl-100 px-1.5 py-0.5 text-sm">{decodeURIComponent(id).slice(0, 80)}</code>
          </p>
          <Link href="/explore" className="mt-6 inline-block font-semibold text-mint-ink underline underline-offset-4">
            ← Back to explorer
          </Link>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
