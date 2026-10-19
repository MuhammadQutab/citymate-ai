import Link from "next/link";
import { Mate } from "@/components/mate/Mate";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <Mate state="unsure" className="h-40 w-32" />
      <h1 className="mt-4 font-display text-3xl font-bold">This street isn&apos;t on our map</h1>
      <p className="mt-2 text-indigo-200">The page or place you&apos;re looking for doesn&apos;t exist, or isn&apos;t one we can verify.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/explore" className="rounded-full bg-mint-400 px-5 py-2.5 font-bold text-indigo-950 hover:bg-mint-300">
          Open the explorer
        </Link>
        <Link href="/" className="rounded-full border border-white/20 px-5 py-2.5 font-semibold hover:border-coral-400/70">
          Go home
        </Link>
      </div>
    </main>
  );
}
