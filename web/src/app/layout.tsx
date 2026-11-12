import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { LanguageProvider } from "@/lib/languageContext";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { PageTransition } from "@/components/transitions/PageTransition";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Voice Roots — Oral Heritage Platform",
  description:
    "Preserve original oral recordings with source transcripts, reviewed translations, and cultural context.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F59E0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden bg-[#080A12] text-[#F8FAFC] antialiased">
        {/* Soft static blurred color blobs behind glass */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#F59E0B]/12 blur-[120px]" />
          <div className="absolute -right-32 top-1/2 h-[420px] w-[420px] rounded-full bg-[#14B8A6]/10 blur-[120px]" />
        </div>
        <LanguageProvider>
          {/* Universal DEMO DATA & OCAP Governance Disclaimer Banner */}
          <div className="relative z-50 bg-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 text-center text-xs text-amber-200/90 flex flex-wrap items-center justify-center gap-2">
            <span className="font-bold uppercase tracking-wider bg-amber-500/30 border border-amber-400/40 px-1.5 py-0.5 rounded text-[10px] text-amber-200">
              DEMO DATA / ACADEMIC PILOT
            </span>
            <span>
              All recordings, transcripts, and lexicons are designated as evaluation data pending formal IRB ethics clearance and bilateral community council agreements.
            </span>
            <Link href="/about" className="underline hover:text-white font-medium ml-1 text-amber-300">
              OCAP® Governance Charter &rarr;
            </Link>
          </div>

          <div className="min-h-screen flex flex-col pb-20 md:pb-0">
            <PageTransition className="flex-1 w-full">
              {children}
            </PageTransition>
            <MobileBottomNav />
            <ServiceWorkerRegister />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
