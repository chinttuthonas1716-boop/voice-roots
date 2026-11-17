import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Manrope, DM_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/languageContext";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { AINavigationBot } from "@/components/ai/AINavigationBot";
import { PageTransition } from "@/components/transitions/PageTransition";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dmsans",
  display: "swap",
});

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
      <body className={`min-h-screen overflow-x-hidden bg-[#0B1E16] text-[#F5F3E9] antialiased misty-forest-atmosphere ${cormorant.variable} ${manrope.variable} ${dmSans.variable} font-sans`}>
        {/* Soft ambient misty emerald forest light rays behind glass */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute left-1/4 -top-40 h-[520px] w-[520px] rounded-full bg-[#A6C48A]/10 blur-[140px]" />
          <div className="absolute -left-32 top-1/3 h-[480px] w-[480px] rounded-full bg-[#1F5138]/25 blur-[130px]" />
          <div className="absolute -right-32 top-1/2 h-[520px] w-[520px] rounded-full bg-[#163B2C]/30 blur-[140px]" />
        </div>
        <LanguageProvider>
          <div className="min-h-screen flex flex-col pb-20 md:pb-0 relative">
            <PageTransition className="flex-1 w-full">
              {children}
            </PageTransition>
            
            {/* Subtle OCAP Governance & Academic Pilot Disclaimer Footer Note */}
            <div className="relative z-30 py-2 px-4 text-center text-[11px] text-[#A6C48A]/60 bg-[#0B1E16]/80 border-t border-[#A6C48A]/10 flex flex-wrap items-center justify-center gap-2">
              <span className="font-semibold uppercase tracking-wider text-[#A6C48A] bg-[#163B2C] px-1.5 py-0.5 rounded text-[10px]">
                OCAP® PILOT
              </span>
              <span>
                Evaluation archive governed under customary data sovereignty across all language sources.
              </span>
              <Link href="/about" className="underline hover:text-white font-medium text-[#A6C48A]">
                Charter &rarr;
              </Link>
            </div>

            <AINavigationBot />
            <MobileBottomNav />
            <ServiceWorkerRegister />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
