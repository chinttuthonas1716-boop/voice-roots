import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/languageContext";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { PageTransition } from "@/components/transitions/PageTransition";

export const metadata: Metadata = {
  title: "Voice Roots — Oral Heritage Platform",
  description:
    "Preserve original oral recordings with source transcripts, reviewed translations, and cultural context.",
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
          <div className="min-h-screen flex flex-col pb-20 md:pb-0">
            <PageTransition className="flex-1 w-full">
              {children}
            </PageTransition>
            <MobileBottomNav />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
