"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";
import { VoiceRootsLogo } from "@/components/ui/VoiceRootsLogo";
import { AppLanguageSelector } from "@/components/ui/AppLanguageSelector";
import { QRCodeModal } from "@/components/ui/QRCodeModal";
import { ResumeDraftBanner } from "@/components/ui/ResumeDraftBanner";
import { getCurrentUser, logoutUser, type UserProfile } from "@/lib/auth";
import { syncOfflineQueue, getOfflineQueue } from "@/lib/offlineSync";

const desktopLinks = [
  { href: "/", label: "Home", icon: Compass },
  { href: "/translate", label: "Conversations", icon: MessageSquare },
  { href: "/upload", label: "Transcribe", icon: Cpu },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/archive", label: "Archive", icon: BookOpen },
  { href: "/preserve", label: "Preserve", icon: Mic },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

    const handleAuthChange = (e: any) => {
      if (e && e.detail !== undefined) {
        setUser(e.detail);
      } else {
        setUser(getCurrentUser());
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("vr-auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("vr-auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    logoutUser();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="desktop-nav !flex justify-between items-center w-full">
          {/* Brand */}
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
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Offline-First Telemetry Status Pill */}
            <div
              className="hidden 2xl:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#242942] px-2.5 py-1 text-[11px] font-medium text-white"
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
              className="hidden xl:inline-flex min-h-[34px] h-[34px] items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              title="Scan QR Code on Phone"
            >
              <QrCode className="h-3.5 w-3.5 text-[#F9B17A]" />
              <span>QR Code</span>
            </button>

            <Link
              href="/search"
              className="hidden lg:inline-flex min-h-[34px] h-[34px] w-[34px] items-center justify-center rounded-full border border-white/12 bg-white/5 text-white hover:bg-white/10 transition"
              title="Search Oral Heritage"
            >
              <Search className="h-3.5 w-3.5 text-[#D9D9E2]" />
            </Link>

            <AppLanguageSelector />

            <Link
              href="/preserve"
              className="hidden sm:inline-flex vr-button vr-button-primary !min-h-[34px] !h-[34px] !py-0 !px-3 text-xs font-bold whitespace-nowrap"
            >
              <Mic className="h-3.5 w-3.5 stroke-[2.2]" />
              <span className="hidden xl:inline">Preserve a Voice</span>
              <span className="xl:hidden">Preserve</span>
            </Link>

            {/* AUTHENTICATION CONTROLS (LOG IN / SIGN UP OR USER PROFILE MENU) */}
            {user ? (
              /* Authenticated User Menu */
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="inline-flex min-h-[34px] h-[34px] items-center gap-1.5 sm:gap-2 rounded-full border border-[#F9B17A]/40 bg-[rgba(66,71,108,0.4)] pl-1.5 pr-2.5 py-0 text-xs font-semibold text-white hover:border-[#F9B17A] transition"
                  aria-label="User account menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F9B17A] text-[#242942] text-[11px] font-black shadow">
                    {user.avatarInitials}
                  </span>
                  <span className="hidden xl:inline max-w-[100px] truncate text-left font-medium">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-[#A9AEC5] transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/15 bg-[#1C1512]/98 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in text-xs">
                    {/* User Profile Header */}
                    <div className="p-3 border-b border-white/10 mb-1 rounded-xl bg-white/5">
                      <div className="font-bold text-white truncate text-sm">{user.name}</div>
                      <div className="text-[11px] text-[#A9AEC5] truncate mt-0.5">{user.email}</div>
                      <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#F9B17A]/20 border border-[#F9B17A]/40 text-[#F9B17A]">
                        {user.roleTitle || user.role}
                      </span>
                    </div>

                    {/* Nav Links */}
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[#D9D9E2] hover:bg-white/10 hover:text-white transition"
                    >
                      <User className="h-4 w-4 text-[#F9B17A]" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[#D9D9E2] hover:bg-white/10 hover:text-white transition"
                    >
                      <BookOpen className="h-4 w-4 text-[#F9B17A]" />
                      <span>My Heritage / My Recordings</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[#D9D9E2] hover:bg-white/10 hover:text-white transition"
                    >
                      <Settings className="h-4 w-4 text-[#A9AEC5]" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="my-1 border-t border-white/10" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-red-300 hover:bg-red-500/15 hover:text-red-200 transition text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated: Prominently Visible Log In & Sign Up buttons */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="inline-flex min-h-[34px] h-[34px] items-center gap-1.5 rounded-full border border-[#F9B17A] bg-[#F9B17A] px-3.5 py-1 text-xs font-bold text-[#242942] hover:bg-[#F9B17A]/85 transition whitespace-nowrap shadow-md"
                  title="Sign in to your account"
                >
                  <LogIn className="h-3.5 w-3.5 text-[#242942]" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex min-h-[34px] h-[34px] items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20 transition shadow-sm whitespace-nowrap"
                  title="Create a free account"
                >
                  <UserPlus className="h-3.5 w-3.5 text-white" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex min-h-[34px] h-[34px] w-[34px] items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4 text-[#F9B17A]" />
              ) : (
                <Menu className="h-4 w-4 text-[#D9D9E2]" />
              )}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl border border-white/15 bg-[#1C1512]/98 p-4 shadow-2xl backdrop-blur-2xl space-y-3 animate-fade-in">
            {/* Mobile Auth Header */}
            {user ? (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F9B17A] text-[#242942] text-xs font-black">
                      {user.avatarInitials}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[150px]">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-[#A9AEC5] truncate max-w-[150px]">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 rounded-lg text-red-300 hover:bg-red-500/15"
                    title="Log Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-white/5 py-1.5 text-center text-[#D9D9E2] hover:text-white"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-white/5 py-1.5 text-center text-[#D9D9E2] hover:text-white"
                  >
                    Heritage
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-white/5 py-1.5 text-center text-[#D9D9E2] hover:text-white"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#F9B17A]">
                  Account Access
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 py-2.5 text-xs font-semibold text-white"
                  >
                    <LogIn className="h-3.5 w-3.5 text-[#F9B17A]" />
                    <span>Log In</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#F9B17A]/40 bg-[#F9B17A]/20 py-2.5 text-xs font-bold text-[#F9B17A]"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="text-[10px] font-mono uppercase tracking-wider text-[#C4B5A5] px-1">
              Main Navigation
            </div>
            <div className="space-y-1">
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
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  pathname === "/search"
                    ? "bg-[#4E9F76] text-[#0C0908] font-bold"
                    : "text-[#D9D9E2] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Search className={`h-4 w-4 ${pathname === "/search" ? "text-[#0C0908]" : "text-[#F9B17A]"}`} />
                <span>Search Oral Heritage</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <QRCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <ResumeDraftBanner />
    </>
  );
}

export default Navbar;
