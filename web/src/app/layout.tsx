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
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-[#2D3250] text-white antialiased selection:bg-[#F9B17A]/30 selection:text-white">
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
