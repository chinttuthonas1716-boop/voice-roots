"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Globe,
  Music,
  Languages,
  Upload,
  Smartphone,
  Share2,
  Mic,
  Play,
} from "lucide-react";
import { ShareModal } from "../ui/ShareModal";

export function JioHotstarNavbar() {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f1014]/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: JioHotstar Styled Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0063e5] via-[#007cf0] to-[#00d8f6] flex items-center justify-center text-white font-extrabold shadow-[0_0_20px_rgba(0,124,240,0.6)] group-hover:scale-105 transition-transform">
                <span className="font-mono text-base">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white tracking-wider flex items-center gap-1.5 leading-none">
                  VOICE ROOTS
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0063e5] text-white font-bold tracking-normal">
                    HOTSTAR
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Digital Oral Cinema</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/archive"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              >
                Oral Lore
              </Link>
              <Link
                href="/explore"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
              >
                24 Languages
              </Link>
              <Link
                href="/translate"
                className="px-3 py-1.5 rounded-lg text-[#00d8f6] bg-[#0063e5]/15 border border-[#0063e5]/30 hover:bg-[#0063e5]/30 transition-all flex items-center gap-1.5"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Day-to-Day Translate</span>
              </Link>
              <Link
                href="/upload"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Upload Audio</span>
              </Link>
              <Link
                href="/app"
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-[#f5c518]"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone Fitness App</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Search Oral Lore"
            >
              <Search className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Share Voice Roots"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Link
              href="/record"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0063e5] to-[#00d8f6] hover:brightness-110 text-white font-bold text-xs shadow-[0_0_20px_rgba(0,124,240,0.45)] transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="w-3.5 h-3.5 fill-current" />
              <span>Record Voice</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Voice Roots — Digital Oral Language Archive"
        url={typeof window !== "undefined" ? window.location.href : "https://dee-arabia-gathered-drove.trycloudflare.com"}
      />
    </>
  );
}
