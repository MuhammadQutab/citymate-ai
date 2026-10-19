import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { NewResidentAssistant } from "@/components/resident/NewResidentAssistant";

export const metadata: Metadata = {
  title: "New Resident Assistant",
  description: "Just moved? Find essential services near your new home and track your settling-in checklist.",
};

export default function NewResidentPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 pt-4">
        <NewResidentAssistant />
      </main>
      <SiteFooter />
    </div>
  );
}
