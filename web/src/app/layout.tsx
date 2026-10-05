import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Roots — Rooting Oral Languages in Text with AI",
  description: "Preserve Voices. Grow Languages. Transform spoken indigenous and oral traditions into structured, searchable digital archives with open AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian text-primary-text min-h-screen selection:bg-root-green/30 selection:text-leaf-green">
        {children}
      </body>
    </html>
  );
}
