"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  Mic,
  Sparkles,
  User,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Search,
  Languages,
  MessageSquare,
  Cpu,
  Menu,
  X,
} from "lucide-react";
import { VoiceRootsLogo } from "@/components/ui/VoiceRootsLogo";
import { AppLanguageSelector } from "@/components/ui/AppLanguageSelector";
import { QRCodeModal } from "@/components/ui/QRCodeModal";
import { ResumeDraftBanner } from "@/components/ui/ResumeDraftBanner";
import { getCurrentUser, type UserProfile } from "@/lib/auth";
import { syncOfflineQueue, getOfflineQueue } from "@/lib/offlineSync";

const desktopLinks = [
  { href: "/", label: "Home", icon: Compass },
  { href: "/translate", label: "Everyday Conversations", icon: MessageSquare },
  { href: "/upload", label: "Audio Transcription & Translation", icon: Cpu },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/archive", label: "Archive", icon: BookOpen },
  { href: "/preserve", label: "Preserve", icon: Mic },
];

export function Navbar() {
  const pathname = usePathname();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    setPendingCount(getOfflineQueue().length);

    const handleOnline = async () => {
      setOnline(true);
      setSyncing(true);
      await syncOfflineQueue();
      setSyncing(false);
      setPendingCount(getOfflineQueue().length);
    };

    const handleOffline = () => {
      setOnline(false);
      setPendingCount(getOfflineQueue().length);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="desktop-nav !flex justify-between items-center w-full">
          {/* Brand — Zero Wrap Guarantee */}
          <VoiceRootsLogo />

          {/* Desktop Navigation Links */}
          <nav aria-label="Main navigation" className="desktop-nav-links hidden md:flex">
            {desktopLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`desktop-nav-link ${isActive ? "active text-white" : ""}`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#F9B17A]" : "text-[#A9AEC5]"}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Offline-First Telemetry Status Pill */}
            <div
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#242942] px-2.5 py-1 text-[11px] font-medium text-white"
              title={online ? "Connected & Synchronized" : "Working Offline — Drafts Saved Locally"}
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-3 w-3 text-[#F9B17A] animate-spin" />
                  <span className="text-[#F9B17A]">Syncing…</span>
                </>
              ) : online ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#879B87]" />
                  <span className="text-[#D9D9E2] font-medium">Synced</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-[#F9B17A]" />
                  <span className="text-[#F9B17A] font-medium">Offline ({pendingCount})</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              title="Scan QR Code on Phone"
            >
              <QrCode className="h-4 w-4 text-[#F9B17A]" />
              <span className="hidden lg:inline">QR Code</span>
            </button>

            <Link
              href="/search"
              className="inline-flex min-h-10 items-center justify-center h-10 w-10 rounded-full border border-white/12 bg-white/5 text-white hover:bg-white/10 transition"
              title="Search Oral Heritage"
            >
              <Search className="h-4 w-4 text-[#D9D9E2]" />
            </Link>

            <AppLanguageSelector />

            <Link
              href="/preserve"
              className="vr-button vr-button-primary !min-h-10 !py-1 !px-4 text-xs sm:text-sm font-bold whitespace-nowrap"
            >
              <Mic className="h-4 w-4 stroke-[2.2]" />
              <span className="hidden sm:inline">Preserve a Voice</span>
              <span className="sm:hidden">Preserve</span>
            </Link>

            <Link
              href="/profile"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition"
              title={user ? `Signed in as ${user.name}` : "Custodian Profile"}
            >
              {user ? (
                <>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F9B17A]/20 border border-[#F9B17A]/40 text-[10px] font-bold text-[#F9B17A]">
                    {user.avatarInitials}
                  </span>
                  <span className="hidden xl:inline max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-[#A9AEC5]" />
                  <span className="hidden md:inline">Profile</span>
                </>
              )}
            </Link>

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex min-h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white hover:bg-white/10 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-[#F9B17A]" /> : <Menu className="h-4 w-4 text-[#D9D9E2]" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/15 bg-[#1C1512]/95 p-4 shadow-2xl backdrop-blur-2xl space-y-2 animate-fade-in">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C4B5A5] px-3 py-1">
              Main Navigation
            </div>
            {desktopLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#4E9F76] text-[#0C0908] font-bold"
                      : "text-[#D9D9E2] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#0C0908]" : "text-[#F9B17A]"}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <QRCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <ResumeDraftBanner />
    </>
  );
}

export default Navbar;
