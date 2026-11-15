"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Mic,
  Languages,
  HardDrive,
  User,
  LogOut,
  ShieldCheck,
  BookOpen,
  Search,
  Menu,
  X,
  TreePine,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser, logoutUser, type UserProfile } from "@/lib/auth";
import { useAppLanguage } from "@/lib/languageContext";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { appLanguage, setAppLanguage, t } = useAppLanguage();

  useEffect(() => {
    setUser(getCurrentUser());
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/dictionary?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isReviewerOrAdmin = user?.role === "reviewer" || user?.role === "admin" || user?.verifiedElder;

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore Languages", icon: Languages },
    { href: "/record", label: "Record Voice", icon: Mic },
    { href: "/dictionary", label: "Dictionary", icon: BookOpen },
    { href: "/archive", label: "Digital Archives", icon: HardDrive },
    { href: "/dashboard", label: "My recordings", icon: Sparkles },
    { href: "/about", label: "About", icon: ShieldCheck },
    ...(isReviewerOrAdmin ? [{ href: "/reviewer", label: "Reviewer", icon: ShieldCheck }] : []),
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#A6C48A]/15 bg-[#102B20]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Brand with Leaf Icon (Reference: Screenshot 1) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 text-[#F5F3E9] hover:opacity-90 transition group">
              <span className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-[#1F5138]/60 border border-[#A6C48A]/30 text-base shadow-sm group-hover:scale-105 transition-transform" aria-hidden="true">
                🌱
              </span>
              <span className="font-bold text-base sm:text-lg tracking-wider text-[#F5F3E9] font-sans uppercase">
                VOICE ROOTS<span className="text-[#A6C48A]">.</span>
              </span>
            </Link>
          </div>

          {/* Mobile Right Navigation matching Screenshot 1 (Explore, About, Login + Hamburger) */}
          <div className="flex lg:hidden items-center gap-2.5 sm:gap-3">
            <Link
              href="/explore"
              className={`text-xs sm:text-sm font-medium transition ${
                pathname === "/explore" ? "text-[#F5F3E9] font-semibold" : "text-[#A6C48A]/90 hover:text-[#F5F3E9]"
              }`}
            >
              Explore
            </Link>
            <Link
              href="/about"
              className={`text-xs sm:text-sm font-medium transition ${
                pathname === "/about" ? "text-[#F5F3E9] font-semibold" : "text-[#A6C48A]/90 hover:text-[#F5F3E9]"
              }`}
            >
              About
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="text-xs sm:text-sm font-semibold text-[#A6C48A] hover:text-[#F5F3E9] transition"
              >
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <Link
                href="/login"
                className={`text-xs sm:text-sm font-medium transition ${
                  pathname === "/login" ? "text-[#F5F3E9] font-semibold" : "text-[#A6C48A]/90 hover:text-[#F5F3E9]"
                }`}
              >
                Login
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-[#163B2C]/50 border border-[#A6C48A]/25 text-[#F5F3E9] hover:bg-[#1F5138]/70 transition ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <div className="flex flex-col gap-1 w-4 justify-center items-center">
                  <span className="w-4 h-0.5 bg-[#F5F3E9] rounded-full" />
                  <span className="w-4 h-0.5 bg-[#F5F3E9] rounded-full" />
                </div>
              )}
            </button>
          </div>

          {/* Desktop Nav: Elegant minimal links (Reference: Image 1 Home, Know More, etc.) */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              const isKnowMore = href === "/login" && pathname === "/login";
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "text-[#F5F3E9]"
                      : "text-[#A6C48A]/80 hover:text-[#F5F3E9] hover:bg-[#163B2C]/40"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#A6C48A]" : "text-[#A6C48A]/70"}`} />
                  <span>{label}</span>

                  {/* Active Golden Line indicator (Reference: Image 1 "Know More" gold line) */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#E2B93B] rounded-full shadow-[0_0_8px_rgba(226,185,59,0.7)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Controls: Search, Language & Auth */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#A6C48A]/25 bg-[#163B2C]/40 text-[#F5F3E9] hover:bg-[#1F5138]/60 hover:text-[#A6C48A] transition"
              title="Search dictionary & recordings"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Language Switcher Toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-[#A6C48A]/20 bg-[#102B20]/60 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setAppLanguage("en")}
                className={`px-2 py-1 rounded-lg font-semibold transition ${
                  appLanguage === "en" ? "bg-[#A6C48A] text-[#102B20] shadow-sm" : "text-[#A6C48A]/70 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setAppLanguage("te")}
                className={`px-2 py-1 rounded-lg font-semibold transition ${
                  appLanguage === "te" ? "bg-[#A6C48A] text-[#102B20] shadow-sm" : "text-[#A6C48A]/70 hover:text-white"
                }`}
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setAppLanguage("hi")}
                className={`px-2 py-1 rounded-lg font-semibold transition ${
                  appLanguage === "hi" ? "bg-[#A6C48A] text-[#102B20] shadow-sm" : "text-[#A6C48A]/70 hover:text-white"
                }`}
              >
                हिन्दी
              </button>
            </div>

            <Link
              href="/reviewer"
              title="Elder & Reviewer Moderation Queue"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                pathname === "/reviewer"
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                  : "border-[#A6C48A]/30 bg-[#163B2C]/40 text-[#A6C48A] hover:bg-[#1F5138]/50"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Reviewer</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-sm font-medium text-[#A6C48A]">
                  {user.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#A6C48A]/25 bg-[#163B2C]/40 text-xs font-medium text-[#F5F3E9] hover:bg-[#1F5138]/60 transition"
                >
                  <LogOut className="h-3.5 w-3.5 text-[#A6C48A]" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#A6C48A]/35 bg-[#1F5138]/50 text-xs font-semibold text-[#F5F3E9] hover:bg-[#A6C48A] hover:text-[#102B20] transition-all shadow-sm"
              >
                <User className="h-3.5 w-3.5" />
                <span>Login / Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Quick Search Modal Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-lg forest-glass-panel p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-4 right-4 text-[#A6C48A] hover:text-white p-1"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-base font-bold text-[#F5F3E9] flex items-center gap-2 mb-3">
                <Search className="h-4 w-4 text-[#A6C48A]" />
                <span>Search Indigenous Lexicons & Audio</span>
              </h2>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Gondi, Koya, Santhali words..."
                    autoFocus
                    className="pill-input !pl-4"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[#A6C48A]/80">
                  <span>Press Enter to explore in Dictionary</span>
                  <button
                    type="submit"
                    className="pill-btn-solid !min-h-[36px] !px-4 !text-xs !bg-[#A6C48A] !text-[#102B20]"
                  >
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 top-16 z-30 border-b border-[#A6C48A]/20 bg-[#102B20]/95 backdrop-blur-2xl p-4 md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    pathname === href
                      ? "bg-[#1F5138] text-[#F5F3E9] border border-[#A6C48A]/30"
                      : "text-[#A6C48A] hover:bg-[#163B2C]/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}

              <div className="mt-3 pt-3 border-t border-[#A6C48A]/20 flex items-center justify-between px-2">
                <span className="text-xs text-[#A6C48A]/80">Language</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAppLanguage("en")}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      appLanguage === "en" ? "bg-[#A6C48A] text-[#102B20]" : "text-[#A6C48A]"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppLanguage("te")}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      appLanguage === "te" ? "bg-[#A6C48A] text-[#102B20]" : "text-[#A6C48A]"
                    }`}
                  >
                    TE
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppLanguage("hi")}
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      appLanguage === "hi" ? "bg-[#A6C48A] text-[#102B20]" : "text-[#A6C48A]"
                    }`}
                  >
                    HI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
