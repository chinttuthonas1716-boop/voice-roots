"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mic, Search, Globe, Library, Sparkles, User, Share2, Languages, Smartphone } from "lucide-react";
import { ShareModal } from "./ShareModal";

export function Navbar() {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-5xl h-14 rounded-full ios27-floating-bar flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-netflix-red via-netflix-red-hover to-netflix-red-dark border border-netflix-red/60 flex items-center justify-center text-white shadow-netflix-glow group-hover:scale-105 transition-transform font-bold text-sm">
              N
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-sm sm:text-base flex items-center gap-1.5">
                Voice Roots
              </span>
            </div>
          </Link>

          {/* Desktop Links (iOS Floating Glass Style with Netflix Aesthetic) */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-netflix-light">
            <Link
              href="/explore"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-netflix-red" />
              <span>Languages</span>
            </Link>
            <Link
              href="/archive"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Library className="w-3.5 h-3.5 text-cultural-gold" />
              <span>Archive</span>
            </Link>
            <Link
              href="/search"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-netflix-red" />
              <span>Semantic Search</span>
            </Link>
            <Link
              href="/translate"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5 text-netflix-red" />
              <span>Translate</span>
            </Link>
            <Link
              href="/app"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-cultural-gold" />
              <span>Mobile App</span>
            </Link>
            <Link
              href="/research"
              className="px-3 py-1.5 rounded-full hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cultural-gold" />
              <span>Model Lab</span>
            </Link>
          </div>

          {/* Right CTA & Sharing */}
          <div className="flex items-center gap-2">
            {/* Share to Friends Button */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-netflix-red hover:text-white text-netflix-light border border-white/10 text-xs font-medium transition-all hover:scale-105"
              title="Share Voice Roots with Friends"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <Link
              href="/record"
              className="flex items-center gap-2 px-4 py-1.5 rounded-full ios27-button-primary text-xs tracking-tight shadow-netflix-glow"
            >
              <Mic className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
              <span>Record Voice</span>
            </Link>

            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-netflix-light hover:text-white text-xs font-medium transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/dashboard"
              className="sm:hidden w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-netflix-gray hover:text-white transition-all hover:scale-105"
              title="Profile Dashboard"
            >
              <User className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Share Modal Dialog */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  );
}
