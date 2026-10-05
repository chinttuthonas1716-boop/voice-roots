import React from "react";
import Link from "next/link";
import { Mic, Search, Globe, Library, Sparkles, User, Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-surface border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-root-green/30 to-leaf-green/20 border border-root-green/40 flex items-center justify-center text-leaf-green group-hover:scale-105 transition-transform">
            🌱
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight text-white flex items-center gap-1.5 text-base">
              Voice Roots
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-root-green/20 text-leaf-green border border-root-green/30">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-secondary-text">
          <Link href="/explore" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-leaf-green" />
            Explore
          </Link>
          <Link href="/archive" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Library className="w-4 h-4 text-earth" />
            Archive
          </Link>
          <Link href="/search" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-leaf-green" />
            Search
          </Link>
          <Link href="/research" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-ai-violet" />
            Model Lab
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/record"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-root-green/20 hover:bg-root-green/30 text-leaf-green border border-root-green/40 font-medium text-sm transition-all shadow-glow hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Record Voice</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-raised border border-white/10 flex items-center justify-center text-secondary-text hover:text-white transition-colors hover:border-white/20"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
