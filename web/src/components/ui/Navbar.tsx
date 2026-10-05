import React from "react";
import Link from "next/link";
import { Mic, Search, Globe, Library, Sparkles, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-5xl h-14 rounded-full ios27-floating-bar flex items-center justify-between px-4 sm:px-6 transition-all duration-300">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-root-emerald/30 via-root-glow/20 to-ai-violet/30 border border-root-emerald/50 flex items-center justify-center text-leaf-mint shadow-emerald-glow group-hover:scale-105 transition-transform">
            🌱
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-text-primary text-sm sm:text-base flex items-center gap-1.5">
              Voice Roots
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-root-emerald/15 text-leaf-mint border border-root-emerald/30 font-semibold tracking-wider">
              iOS 27
            </span>
          </div>
        </Link>

        {/* Desktop Links (iOS Floating Glass Style) */}
        <div className="hidden md:flex items-center gap-1 text-xs font-medium text-text-secondary">
          <Link
            href="/explore"
            className="px-3 py-1.5 rounded-full hover:text-text-primary hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-root-glow" />
            <span>Languages</span>
          </Link>
          <Link
            href="/archive"
            className="px-3 py-1.5 rounded-full hover:text-text-primary hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Library className="w-3.5 h-3.5 text-earth-gold" />
            <span>Archive</span>
          </Link>
          <Link
            href="/search"
            className="px-3 py-1.5 rounded-full hover:text-text-primary hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-ai-cyan" />
            <span>Semantic Search</span>
          </Link>
          <Link
            href="/research"
            className="px-3 py-1.5 rounded-full hover:text-text-primary hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-ai-violet" />
            <span>Model Lab</span>
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/record"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full ios27-button-primary text-xs tracking-tight"
          >
            <Mic className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>Record Voice</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all hover:scale-105"
            title="Profile Dashboard"
          >
            <User className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
