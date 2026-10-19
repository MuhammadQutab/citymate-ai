import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { QuickAsk } from "@/components/chat/QuickAsk";
import { MotionProvider } from "@/components/ui/MotionProvider";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CityMate AI — Your City. Your Needs. Your AI Companion.",
    template: "%s · CityMate AI",
  },
  description:
    "A location-aware AI companion that helps travellers and newcomers discover real places and essential services in Pakistani cities, using open map data.",
  applicationName: "CityMate AI",
};

export const viewport: Viewport = {
  themeColor: "#14123a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          {children}
          <QuickAsk />
        </MotionProvider>
      </body>
    </html>
  );
}
