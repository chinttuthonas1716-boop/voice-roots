"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mic,
  Upload,
  BookOpen,
  Sparkles,
  Compass,
  User,
  Menu,
  X,
  Languages,
} from "lucide-react";
import { GlassButton } from "./GlassButton";
import { AppLanguageSelector } from "@/components/ui/AppLanguageSelector";

export const GlassNavbar: React.FC = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Archive", href: "/archive", icon: BookOpen },
    { label: "Record", href: "/record", icon: Mic },
    { label: "Upload", href: "/upload", icon: Upload },
    { label: "Translate", href: "/translate", icon: Languages },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#0C0908]/90 backdrop-blur-xl border-b border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.6)] py-3"
          : "bg-transparent border-b border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 group select-none outline-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#E58A4E] via-[#C46F38] to-[#A65625] flex items-center justify-center shadow-[0_0_20px_rgba(229,138,78,0.35)] border border-[#E58A4E]/50 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-[#F7F3EE] group-hover:text-[#E58A4E] transition-colors">
                  VOICE ROOTS
                </span>
                <span className="hidden sm:inline-block text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-[#E58A4E]/15 text-[#E58A4E] border border-[#E58A4E]/30 uppercase font-semibold">
                  Heritage AI
                </span>
              </div>
              <p className="text-[10px] text-[#C4B5A5] tracking-wider uppercase font-medium">
                Indigenous Oral Archive
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 backdrop-blur-md">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.12] text-[#F7F3EE] shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-white/15"
                      : "text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#E58A4E]" : "text-[#C4B5A5]/70"
                    }`}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector, AI Trigger, Login */}
          <div className="hidden sm:flex items-center gap-3">
            <AppLanguageSelector />

            <Link href="/login">
              <GlassButton
                variant={pathname === "/login" ? "primary" : "secondary"}
                size="sm"
                leftIcon={<User className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Sign In
              </GlassButton>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <AppLanguageSelector />
            <GlassButton
              variant="icon"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="w-10 h-10 min-w-[40px] min-h-[40px]"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#F7F3EE]" />
              ) : (
                <Menu className="w-5 h-5 text-[#F7F3EE]" />
              )}
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-white/12 bg-[#0C0908]/98 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#E58A4E]/15 text-[#E58A4E] border border-[#E58A4E]/30"
                    : "text-[#C4B5A5] hover:bg-white/[0.06] hover:text-[#F7F3EE]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#E58A4E]" : "text-[#C4B5A5]/70"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-white/10">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#E58A4E] text-[#0C0908] font-bold text-sm shadow-[0_4px_16px_rgba(229,138,78,0.35)]"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Join</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

