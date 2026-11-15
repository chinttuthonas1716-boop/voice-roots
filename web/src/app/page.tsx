"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Upload,
  Languages,
  Play,
  Pause,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  TreePine,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Lock,
  Search,
  Menu,
  X,
  Volume2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { registerUser, loginUser, loginWithGoogle, loginAsGuest, getCurrentUser, type UserProfile } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState<"hero" | "collective">("hero");
  const [selectedDialect, setSelectedDialect] = useState<string>("Gondi");
  const [recentRecordings, setRecentRecordings] = useState<StoredVoiceRecord[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Collective Action / Auth Form state
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Carousel slide index for Right Column in Collective Action view
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = [
    {
      title: "Save the forest,",
      subtitle: "preserve the voices.",
      body: "Oral traditions carry botanical, ecological, and cultural memory. Shield unwritten dialects and ancestral knowledge across all language sources.",
      tag: "MULTI-LANGUAGE ARCHIVE",
    },
    {
      title: "Listen to the elders,",
      subtitle: "honor living memory.",
      body: "Voice Roots is not confined to a single language source — preserving endangered spoken stories across any dialect with elder verification.",
      tag: "CUSTOMARY KNOWLEDGE",
    },
    {
      title: "Rooted in sovereignty,",
      subtitle: "governed under OCAP®.",
      body: "Communities retain permanent ownership of their voice. The acoustic master recording is immutable and never commodified.",
      tag: "COMMUNITY SOVEREIGNTY",
    },
  ];

  // Multi-language sources and sample proverbs
  const languageSources = [
    { code: "gon", name: "Gondi", greeting: "Johar / Sewa", meaning: "Sacred forest greeting & elder reverence" },
    { code: "koy", name: "Koya", greeting: "Paye Maro", meaning: "Living harmony with rivers and trees" },
    { code: "sat", name: "Santhali", greeting: "Johar", meaning: "Ancestral salute to community and sky" },
    { code: "lmn", name: "Lambadi", greeting: "Ram Ram Bhaaya", meaning: "Nomadic oral kinship blessing" },
    { code: "kru", name: "Kurukh", greeting: "Gor Lagdan", meaning: "Oral heritage of the forest clans" },
    { code: "mun", name: "Mundari", greeting: "Dahar Johar", meaning: "Pathways of ancestral songs" },
  ];

  useEffect(() => {
    const all = getUserRecordings();
    setRecentRecordings(all.slice(0, 3));
    setCurrentUser(getCurrentUser());
  }, []);

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselSlides.length);
  };

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleTogglePlay = (record: StoredVoiceRecord) => {
    const src = record.audioUrl || `/audio/${record.audioFileName}`;

    if (playingId === record.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(src);
    audioRef.current.onended = () => setPlayingId(null);
    audioRef.current.onerror = () => setPlayingId(null);

    audioRef.current.play().then(() => {
      setPlayingId(record.id);
    }).catch((e) => {
      console.warn("Audio play blocked", e);
      setPlayingId(null);
    });
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Please fill in email and password.");
      return;
    }
    if (authMode === "signup" && !consent) {
      setAuthError("Please agree to OCAP® community data principles.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === "signup") {
        const user = registerUser({
          name: name.trim() || "Community Member",
          email: email.trim(),
          password,
          role: "contributor",
        });
        setCurrentUser(user);
        setAuthMessage(`Welcome to Voice Roots, ${user.name}!`);
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        const user = loginUser(email.trim(), password);
        setCurrentUser(user);
        setAuthMessage(`Welcome back, ${user.name}!`);
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch {
      setAuthError("Authentication failed. Please verify credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setAuthLoading(true);
    try {
      const user = loginWithGoogle();
      setCurrentUser(user);
      setAuthMessage("Signed in with Google.");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      setAuthError("Google sign-in unavailable in demo mode.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestAuth = () => {
    setAuthLoading(true);
    try {
      const guest = loginAsGuest();
      setCurrentUser(guest);
      setAuthMessage("Browsing as guest contributor.");
      setTimeout(() => router.push("/"), 800);
    } catch {
      setAuthError("Guest session failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const currentDialectInfo = languageSources.find((l) => l.name === selectedDialect) || languageSources[0];

  return (
    <div className="min-h-screen pb-24 pt-16 sm:pt-20 overflow-x-hidden w-full">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-10 sm:space-y-12">
        
        {/* =========================================================================
           CINEMATIC FULL-PANORAMIC FOREST STAGE (Reference: Image 1 & Image 2)
           ========================================================================= */}
        <section className="relative w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-[#A6C48A]/25 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] min-h-[580px] sm:min-h-[680px] flex flex-col justify-between">
          
          {/* Photographic Background Cross-Fade Layers */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              activeStage === "hero" ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ backgroundImage: "url('/images/misty_forest_hero.jpg')" }}
          />
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              activeStage === "collective" ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ backgroundImage: "url('/images/rainforest_canopy.jpg')" }}
          />

          {/* Moody Atmospheric Vignette & Sunlight Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#081610] via-[#102B20]/45 to-[#081610]/75 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-[#A6C48A]/10 rounded-full blur-[100px] pointer-events-none animate-mist-drift" />

          {/* Inner Stage Navbar (Reference: Image 1 Header Bar) */}
          <div className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5 border-b border-white/10 backdrop-blur-md bg-black/20">
            {/* Left: Hamburger & Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveStage(activeStage === "hero" ? "collective" : "hero")}
                className="text-[#F5F3E9] hover:text-[#A6C48A] transition p-1"
                aria-label="Toggle stage"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-bold text-lg tracking-tight text-[#F5F3E9] font-sans">
                forest<span className="text-[#A6C48A]">.</span>
                <span className="text-xs text-[#A6C48A]/75 font-normal ml-2 hidden sm:inline">
                  (Voice Roots)
                </span>
              </span>
            </div>

            {/* Right: Home, Know More, Search (Reference: Image 1 Navbar items) */}
            <div className="flex items-center gap-6 sm:gap-10">
              <button
                type="button"
                onClick={() => setActiveStage("hero")}
                className={`relative text-sm sm:text-base font-semibold transition ${
                  activeStage === "hero" ? "text-[#F5F3E9]" : "text-[#F5F3E9]/65 hover:text-[#F5F3E9]"
                }`}
              >
                <span>Home</span>
                {activeStage === "hero" && (
                  <motion.span
                    layoutId="inner-nav-gold"
                    className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#E2B93B] rounded-full shadow-[0_0_8px_rgba(226,185,59,0.8)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveStage("collective")}
                className={`relative text-sm sm:text-base font-semibold transition ${
                  activeStage === "collective" ? "text-[#F5F3E9]" : "text-[#F5F3E9]/65 hover:text-[#F5F3E9]"
                }`}
              >
                <span>Know More</span>
                {activeStage === "collective" && (
                  <motion.span
                    layoutId="inner-nav-gold"
                    className="absolute -bottom-2 left-0 right-0 h-[2.5px] bg-[#E2B93B] rounded-full shadow-[0_0_8px_rgba(226,185,59,0.8)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>

              <Link
                href="/dictionary"
                className="text-[#F5F3E9]/80 hover:text-white transition p-1"
                title="Search dictionary"
                aria-label="Search dictionary"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>

          {/* Dynamic Interactive Stage Body */}
          <div className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-10 py-8">
            <AnimatePresence mode="wait">
              {activeStage === "hero" ? (
                /* =========================================================================
                   STAGE 1: ENCHANTED SUNLIT FOREST HERO (Reference: Image 1 "forest.")
                   ========================================================================= */
                <motion.div
                  key="hero-stage"
                  initial={{ opacity: 0, x: -30, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-6 text-center max-w-4xl mx-auto py-6"
                >
                  {/* Micro Tag */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-[#A6C48A]/35 text-xs font-semibold text-[#A6C48A] backdrop-blur-md shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#E2B93B]" />
                    <span className="tracking-wide uppercase text-[11px]">
                      OPEN ORAL HERITAGE · NOT LIMITED TO A SINGLE LANGUAGE SOURCE
                    </span>
                  </motion.div>

                  {/* Iconic Lowercase Headline: forest. / voice roots. (Reference: Image 1) */}
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-[#F5F3E9] font-sans drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)] select-none"
                  >
                    forest<span className="text-[#A6C48A]">.</span>
                  </motion.h1>

                  {/* Subtitle Explaining Multi-Language Source Oral Archiving */}
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-base sm:text-xl text-[#F5F3E9]/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md"
                  >
                    Voice Roots roots oral languages in text with AI.
                    Preserving spoken stories, songs, and indigenous memories across all dialects and language sources.
                  </motion.p>

                  {/* Interactive Multi-Language Source Selector Chips */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto"
                  >
                    <span className="text-xs uppercase tracking-wider text-[#A6C48A] font-semibold mr-1">
                      Explore Sources:
                    </span>
                    {languageSources.map((lang) => (
                      <button
                        key={lang.name}
                        type="button"
                        onClick={() => setSelectedDialect(lang.name)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          selectedDialect === lang.name
                            ? "bg-[#E2B93B] text-black font-bold shadow-md"
                            : "bg-black/40 border border-[#A6C48A]/30 text-[#F5F3E9] hover:bg-[#1F5138]/60"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                    <Link
                      href="/registry"
                      className="px-2.5 py-1 rounded-full text-xs text-[#A6C48A] hover:text-white border border-[#A6C48A]/20 bg-black/20 transition"
                    >
                      + 43 More Tongues
                    </Link>
                  </motion.div>

                  {/* Dynamic Proverb Box from Selected Dialect */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#102B20]/80 border border-[#A6C48A]/30 text-xs text-[#F5F3E9] backdrop-blur-md">
                    <Volume2 className="h-4 w-4 text-[#A6C48A] shrink-0" />
                    <span className="font-bold text-[#E2B93B]">{currentDialectInfo.greeting}</span>
                    <span className="text-[#A6C48A]/80">— {currentDialectInfo.meaning} ({currentDialectInfo.name})</span>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveStage("collective")}
                      className="pill-btn-solid gap-2 group !bg-[#F5F3E9] !text-[#102B20] hover:!bg-[#A6C48A]"
                    >
                      <span>Know More</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <Link
                      href="/record"
                      className="min-h-[48px] px-6 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 text-sm font-semibold text-[#F5F3E9] backdrop-blur-md flex items-center gap-2 transition"
                    >
                      <Mic className="h-4 w-4 text-[#A6C48A]" />
                      <span>Record Spoken Voice</span>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                /* =========================================================================
                   STAGE 2: FROSTED GLASS COLLECTIVE ACTION (Reference: Image 2 Split Layout)
                   ========================================================================= */
                <motion.div
                  key="collective-stage"
                  initial={{ opacity: 0, x: 30, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto w-full py-4"
                >
                  {/* Left Column: Signature Curved Frosted Glass Panel (Reference: Image 2) */}
                  <div className="lg:col-span-6 w-full">
                    <div className="forest-glass-panel p-6 sm:p-8 relative overflow-hidden !rounded-l-2xl !rounded-r-[2.5rem]">
                      {/* Ambient Inner Sheen */}
                      <div className="absolute top-0 right-0 w-44 h-44 bg-[#A6C48A]/12 rounded-full blur-[60px] pointer-events-none" />

                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-[11px] tracking-wider text-[#A6C48A] uppercase">
                          COLLECTIVE ACTION
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveStage("hero")}
                          className="text-xs text-[#A6C48A] hover:text-white flex items-center gap-1 transition"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                          <span>Back to Hero</span>
                        </button>
                      </div>

                      {/* Uppercase Serif Tracked Heading (Reference: Image 2) */}
                      <h2 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-wider text-[#F5F3E9] uppercase leading-tight mb-2.5">
                        Be a part of collective action.
                      </h2>

                      {/* Narrative Subtitle */}
                      <p className="text-xs sm:text-sm text-[#A6C48A]/90 leading-relaxed mb-5 font-light">
                        With every voice recording, not only do we protect unwritten dialects, but we ensure our elders' oral knowledge across all language sources is sovereignly preserved for future generations.
                      </p>

                      {/* Feedback Notifications */}
                      {authMessage && (
                        <div className="mb-4 rounded-xl border border-[#A6C48A]/40 bg-[#1F5138]/50 p-2.5 text-xs text-[#F5F3E9] text-center backdrop-blur-md">
                          {authMessage}
                        </div>
                      )}
                      {authError && (
                        <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-900/30 p-2.5 text-xs text-rose-200 text-center backdrop-blur-md">
                          {authError}
                        </div>
                      )}

                      {currentUser ? (
                        <div className="space-y-4 py-2 text-center">
                          <div className="rounded-2xl border border-[#A6C48A]/30 bg-[#163B2C]/50 p-4">
                            <p className="text-[11px] uppercase tracking-wider text-[#A6C48A]">Signed in as</p>
                            <h3 className="text-base font-bold text-[#F5F3E9] mt-0.5">{currentUser.name}</h3>
                            <p className="text-xs text-[#A6C48A]/80">{currentUser.email}</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => router.push("/dashboard")}
                              className="pill-btn-solid flex-1 !min-h-[40px] !text-xs"
                            >
                              My recordings
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push("/record")}
                              className="btn-glass rounded-full flex-1 !min-h-[40px] !text-xs font-semibold"
                            >
                              Record Voice
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Mode Switcher */}
                          <div className="flex items-center gap-4 border-b border-[#A6C48A]/20 pb-2">
                            <button
                              type="button"
                              onClick={() => setAuthMode("signup")}
                              className={`text-xs font-bold tracking-widest uppercase pb-1 transition-all ${
                                authMode === "signup"
                                  ? "text-[#F5F3E9] border-b-2 border-[#A6C48A]"
                                  : "text-[#A6C48A]/60 hover:text-[#F5F3E9]"
                              }`}
                            >
                              SIGN UP
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuthMode("signin")}
                              className={`text-xs font-bold tracking-widest uppercase pb-1 transition-all ${
                                authMode === "signin"
                                  ? "text-[#F5F3E9] border-b-2 border-[#A6C48A]"
                                  : "text-[#A6C48A]/60 hover:text-[#F5F3E9]"
                              }`}
                            >
                              SIGN IN
                            </button>
                          </div>

                          <form onSubmit={handleAuthSubmit} className="space-y-3">
                            {authMode === "signup" && (
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]" />
                                <input
                                  type="text"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="Full Name"
                                  className="pill-input !py-2 !text-sm"
                                />
                              </div>
                            )}

                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]" />
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="pill-input !py-2 !text-sm"
                              />
                            </div>

                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]" />
                              <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="pill-input !py-2 !text-sm"
                              />
                            </div>

                            {authMode === "signup" && (
                              <div className="flex items-start gap-2 pt-0.5">
                                <input
                                  id="collective-consent"
                                  type="checkbox"
                                  checked={consent}
                                  onChange={(e) => setConsent(e.target.checked)}
                                  className="mt-0.5 h-3.5 w-3.5 rounded border-[#A6C48A]/40 bg-[#1F5138]/50 text-[#1F5138] focus:ring-[#A6C48A]"
                                />
                                <label htmlFor="collective-consent" className="text-[11px] text-[#A6C48A]/90 leading-tight">
                                  I agree to customary community data sovereignty and ethical archiving terms under OCAP® across all language sources.
                                </label>
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={authLoading}
                              className="pill-btn-solid w-full !min-h-[44px] !text-xs mt-1"
                            >
                              {authLoading ? "Processing..." : authMode === "signup" ? "SIGN UP" : "SIGN IN"}
                            </button>
                          </form>

                          {/* Social Divider */}
                          <div className="relative flex items-center justify-center pt-1">
                            <div className="w-full border-t border-[#A6C48A]/20" />
                            <span className="absolute bg-[#102B20] px-2 text-[10px] uppercase tracking-wider text-[#A6C48A]/75">
                              Or sign up with
                            </span>
                          </div>

                          {/* Social Buttons */}
                          <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={handleGoogleAuth}
                              className="inline-flex items-center justify-center gap-2 min-h-[40px] rounded-full border border-[#A6C48A]/30 bg-[#163B2C]/40 text-xs font-semibold text-[#F5F3E9] hover:bg-[#1F5138]/60 transition"
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  fill="#4285F4"
                                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.6-5.2 3.6-9.14z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.26C.46 8.2.01 10.04.01 12s.45 3.8 1.25 5.4l4.06-3.13z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.2 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.6l4.06 3.13c.94-2.83 3.58-4.96 6.68-4.96z"
                                />
                              </svg>
                              <span>Google</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleGuestAuth}
                              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] rounded-full border border-[#A6C48A]/30 bg-[#163B2C]/40 text-xs font-semibold text-[#F5F3E9] hover:bg-[#1F5138]/60 transition"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-[#A6C48A]" />
                              <span>Guest</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Canopy Scenery & Serif Title (Reference: Image 2 Right Side) */}
                  <div className="lg:col-span-6 space-y-6 text-left px-2 sm:px-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] backdrop-blur-md">
                      <TreePine className="h-4 w-4" />
                      <span>{carouselSlides[carouselIndex].tag}</span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={carouselIndex}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-3"
                      >
                        <h3 className="font-serif-display text-4xl sm:text-6xl font-extrabold tracking-wider text-[#F5F3E9] uppercase leading-tight drop-shadow-lg">
                          {carouselSlides[carouselIndex].title}
                          <br />
                          <span className="text-[#A6C48A]">{carouselSlides[carouselIndex].subtitle}</span>
                        </h3>

                        <p className="text-base sm:text-lg text-[#F5F3E9]/85 font-light leading-relaxed max-w-lg drop-shadow">
                          {carouselSlides[carouselIndex].body}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Interactive Animated Chevrons `< < < <` (Reference: Image 2) */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-[#A6C48A] text-xl font-bold tracking-widest select-none max-w-full">
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        title="Previous narrative"
                        aria-label="Previous narrative"
                        className="hover:text-white hover:scale-110 transition p-1"
                      >
                        ‹
                      </button>
                      <span className="animate-chevron-1">‹</span>
                      <span className="animate-chevron-2">‹</span>
                      <span className="animate-chevron-3">‹</span>
                      <span className="animate-chevron-4">‹</span>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        title="Next narrative"
                        aria-label="Next narrative"
                        className="hover:text-white hover:scale-110 transition p-1"
                      >
                        ›
                      </button>
                      <span className="text-[10px] sm:text-xs uppercase font-sans tracking-widest text-[#A6C48A] ml-2 block w-full sm:w-auto">
                        OPEN TO ALL UNWRITTEN & INDIGENOUS DIALECTS
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Indicators & Badges Bar (Reference: Image 1 Bottom Row) */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-10 py-4 border-t border-white/10 backdrop-blur-md bg-black/25 text-xs text-[#F5F3E9]/80">
            {/* Center / Left Tagline */}
            <div className="text-center sm:text-left">
              <span className="font-medium text-[#F5F3E9]">Stay rooted whenever, wherever</span>
              <span className="text-[#A6C48A]/60 block sm:inline sm:ml-2">
                · Voice Roots © 2026. Preserving oral heritage across all language sources.
              </span>
            </div>

            {/* Right Badges (Reference: Image 1 UK STATE GOVT., SAVE FOREST, LIVE GREEN) */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-1.5 bg-black/40 border border-[#A6C48A]/25 px-3 py-1 rounded-full backdrop-blur-md">
                <span className="font-bold text-[#E2B93B] border border-[#E2B93B]/40 rounded-full px-1 py-0.2 text-[9px]">
                  ALL
                </span>
                <span className="tracking-wider uppercase text-[10px] text-[#F5F3E9]">MULTI-LINGUAL</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 border border-[#A6C48A]/25 px-3 py-1 rounded-full backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-[#A6C48A]" />
                <span className="tracking-wider uppercase text-[10px] text-[#F5F3E9]">PRESERVE ROOTS</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 border border-[#A6C48A]/25 px-3 py-1 rounded-full backdrop-blur-md">
                <TreePine className="h-3.5 w-3.5 text-[#A6C48A]" />
                <span className="tracking-wider uppercase text-[10px] text-[#F5F3E9]">IMMUTABLE AUDIO</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Frosted Action Cards */}
        <section aria-label="Main actions" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/record"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1F5138] border border-[#A6C48A]/30 text-[#F5F3E9] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Record</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Capture live oral voice</span>
            </div>
          </Link>

          <Link
            href="/upload"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#163B2C] border border-[#A6C48A]/20 text-[#A6C48A] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Upload</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Add an archival audio file</span>
            </div>
          </Link>

          <Link
            href="/translate"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#163B2C] border border-[#A6C48A]/20 text-[#A6C48A] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <Languages className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Translate</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Cross-dialect & elder review</span>
            </div>
          </Link>

          <Link
            href="/dictionary"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#163B2C] border border-[#A6C48A]/20 text-[#A6C48A] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Dictionary</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Explore indigenous lexicons</span>
            </div>
          </Link>
        </section>

        {/* Your Recent Recordings Section */}
        <section aria-label="Recent recordings" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-[#F5F3E9] flex items-center gap-2">
              <TreePine className="h-5 w-5 text-[#A6C48A]" />
              <span>Your recent recordings</span>
            </h2>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#A6C48A] hover:text-[#F5F3E9] flex items-center gap-1.5 transition"
            >
              <span>My recordings</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentRecordings.length === 0 ? (
            <div className="forest-glass-panel p-8 sm:p-10 text-center space-y-3">
              <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-[#1F5138]/40 border border-[#A6C48A]/30 text-[#A6C48A] mx-auto text-xl">
                🌲
              </div>
              <p className="text-base text-[#F5F3E9] font-medium">No recordings saved in local session yet.</p>
              <p className="text-sm text-[#A6C48A]/80 max-w-md mx-auto">
                Press Record or Upload above to save your first spoken story across any indigenous dialect.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecordings.map((recording) => {
                const isPlaying = playingId === recording.id;
                return (
                  <div
                    key={recording.id}
                    className="forest-glass-panel p-4 sm:p-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-[#F5F3E9] truncate">
                        {recording.title}
                      </h3>
                      <p className="text-sm text-[#A6C48A]/80 mt-0.5">
                        {recording.language} · {recording.duration}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(recording)}
                        className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full border border-[#A6C48A]/30 bg-[#1F5138] text-sm font-semibold text-[#F5F3E9] hover:bg-[#A6C48A] hover:text-[#102B20] transition-all"
                        aria-label={isPlaying ? `Pause ${recording.title}` : `Play ${recording.title}`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            <span>Play</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/passport/${recording.id}`}
                        className="inline-flex items-center gap-1 min-h-[44px] px-3.5 rounded-full border border-[#A6C48A]/25 bg-white/5 text-sm font-medium text-[#A6C48A] hover:text-[#F5F3E9] hover:bg-white/10 transition"
                      >
                        <span>Passport</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
