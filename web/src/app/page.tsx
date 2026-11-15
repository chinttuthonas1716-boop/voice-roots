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
  ArrowUpRight,
  Activity,
  Archive,
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
  Globe,
  Radio,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { LanguageDiscoveryArchitecture } from "@/components/ui/LanguageDiscoveryArchitecture";
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

  // Multi-language sources and sample proverbs across global low-resource tongues
  const languageSources = [
    { code: "gon", name: "Gondi", greeting: "Johar / Sewa", meaning: "Sacred forest greeting & elder reverence (Central India)" },
    { code: "koy", name: "Koya", greeting: "Paye Maro", meaning: "Living harmony with rivers and trees (Godavari Basin)" },
    { code: "que", name: "Quechua", greeting: "Allillanchu", meaning: "Living in harmony with Pachamama (Andes / South America)" },
    { code: "mri", name: "Māori", greeting: "Kia Ora", meaning: "Living breath and spiritual well-being (Aotearoa / Oceania)" },
    { code: "sat", name: "Santhali", greeting: "Johar", meaning: "Ancestral salute to community and sky (Eastern India)" },
    { code: "yor", name: "Yoruba", greeting: "Báwo ni", meaning: "Kinship greetings and vital life force (West Africa)" },
    { code: "nhe", name: "Nahuatl", greeting: "Niltze", meaning: "Sacred flower-and-song salutation (Central Mexico)" },
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
                   STAGE 1: LUXURY NATURE EDITORIAL HERO (Reference: Phone Mockup & Image 1)
                   ========================================================================= */
                <motion.div
                  key="hero-stage"
                  initial={{ opacity: 0, x: -30, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-5 text-left max-w-4xl mx-auto py-2 sm:py-4"
                >
                  {/* Sunlit Photographic Forest Card Window (Reference: Screenshot 1) */}
                  <div className="relative w-full h-48 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden border border-[#A6C48A]/30 shadow-2xl group">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: "url('/images/forest_sunlight_canopy.jpg')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C2118]/80 via-transparent to-black/30" />
                    
                    {/* Micro Pill Badge in bottom-left (Reference: chatbotspace pill in Screenshot 1) */}
                    <div className="absolute bottom-3 left-3 sm:left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-xs text-[#F5F3E9] backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A6C48A] animate-pulse" />
                      <span className="font-medium text-[11px] tracking-wide text-[#F5F3E9]">
                        chatbotspace
                      </span>
                    </div>

                    <div className="absolute top-3 right-4 hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/50 border border-white/15 text-[10px] text-[#F5F3E9]/80 backdrop-blur-sm">
                      <span>48 kHz Master Acoustic</span>
                    </div>
                  </div>

                  {/* Kicker Category Tag (Reference: Screenshot 1 PRESERVING HUMANITY'S LINGUISTIC HERITAGE) */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="inline-block"
                  >
                    <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#A6C48A] uppercase font-sans">
                      PRESERVING HUMANITY’S LINGUISTIC HERITAGE
                    </span>
                  </motion.div>

                  {/* Iconic Editorial Headline: Every Voice Holds a Heritage. */}
                  <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F3E9] font-serif font-serif-display drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)] select-none leading-tight"
                  >
                    Every Voice Holds <br className="sm:hidden" />
                    a <span className="text-[#A6C48A] italic">Heritage.</span>
                  </motion.h1>

                  {/* Subtitle Explaining Multi-Language Source Oral Archiving */}
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-sm sm:text-base lg:text-lg text-[#F5F3E9]/90 max-w-2xl font-light leading-relaxed drop-shadow-md"
                  >
                    Discover, document and preserve the world’s oral languages through artificial intelligence and community knowledge.
                  </motion.p>

                  {/* Primary & Secondary Action CTAs (Reference: Screenshot 1 Buttons) */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Start Recording ↗ (Pill with diagonal arrow) */}
                    <Link
                      href="/record"
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-[#DCE9D7] text-[#071A13] font-bold text-sm tracking-wide hover:bg-[#A6C48A] transition-all duration-200 shadow-lg shadow-black/40 group active:scale-95"
                    >
                      <span>Start Recording</span>
                      <ArrowUpRight className="h-4 w-4 text-[#071A13] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>

                    {/* Explore Languages (Translucent Outline Pill) */}
                    <Link
                      href="/explore"
                      className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-full border border-[#A6C48A]/40 bg-[#102B20]/70 hover:bg-[#1F5138]/70 text-[#F5F3E9] font-semibold text-sm transition-all duration-200 backdrop-blur-md active:scale-95"
                    >
                      <Languages className="h-4 w-4 text-[#A6C48A]" />
                      <span>Explore Languages</span>
                    </Link>

                    {/* Know More (Stage Switcher) */}
                    <button
                      type="button"
                      onClick={() => setActiveStage("collective")}
                      className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#A6C48A] backdrop-blur-md transition"
                    >
                      <span>Know More</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#E2B93B]" />
                    </button>
                  </div>

                  {/* Interactive Multi-Language Source Selector Chips */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto"
                  >
                    <span className="text-xs uppercase tracking-wider text-[#A6C48A] font-semibold mr-1">
                      Oral Sources:
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
                      href="/explore"
                      className="px-2.5 py-1 rounded-full text-xs text-[#A6C48A] hover:text-white border border-[#A6C48A]/20 bg-black/20 transition"
                    >
                      + Global Catalog
                    </Link>
                  </motion.div>

                  {/* Dynamic Proverb Box from Selected Dialect */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#102B20]/80 border border-[#A6C48A]/30 text-xs text-[#F5F3E9] backdrop-blur-md">
                    <Volume2 className="h-4 w-4 text-[#A6C48A] shrink-0" />
                    <span className="font-bold text-[#E2B93B]">{currentDialectInfo.greeting}</span>
                    <span className="text-[#A6C48A]/80">— {currentDialectInfo.meaning} ({currentDialectInfo.name})</span>
                  </div>

                  {/* The 3-Feature Pillar Strip (Reference: Phone Mockup Bottom Row) */}
                  <div className="pt-4 border-t border-[#A6C48A]/20 grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto w-full">
                    {/* Pillar 1: Record / Capture voices */}
                    <Link
                      href="/record"
                      className="flex flex-col items-center p-3 rounded-2xl bg-[#102B20]/50 hover:bg-[#163B2C]/70 border border-[#A6C48A]/20 hover:border-[#A6C48A]/40 transition-all group"
                    >
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-[#A6C48A] group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xs sm:text-sm text-[#F5F3E9] mt-1.5">Record</span>
                      <span className="text-[10px] sm:text-xs text-[#A6C48A]/75">Capture voices</span>
                    </Link>

                    {/* Pillar 2: Discover / Explore languages */}
                    <Link
                      href="/explore"
                      className="flex flex-col items-center p-3 rounded-2xl bg-[#102B20]/50 hover:bg-[#163B2C]/70 border border-[#A6C48A]/20 hover:border-[#A6C48A]/40 transition-all group"
                    >
                      <Languages className="h-5 w-5 sm:h-6 sm:w-6 text-[#A6C48A] group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xs sm:text-sm text-[#F5F3E9] mt-1.5">Discover</span>
                      <span className="text-[10px] sm:text-xs text-[#A6C48A]/75">Explore languages</span>
                    </Link>

                    {/* Pillar 3: Preserve / Protect heritage */}
                    <Link
                      href="/archive"
                      className="flex flex-col items-center p-3 rounded-2xl bg-[#102B20]/50 hover:bg-[#163B2C]/70 border border-[#A6C48A]/20 hover:border-[#A6C48A]/40 transition-all group"
                    >
                      <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-[#A6C48A] group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-xs sm:text-sm text-[#F5F3E9] mt-1.5">Preserve</span>
                      <span className="text-[10px] sm:text-xs text-[#A6C48A]/75">Protect heritage</span>
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

        {/* =========================================================================
           SECTION 3: LANGUAGE DISCOVERY ARCHITECTURE (Reference: Screenshot 2)
           ========================================================================= */}
        <LanguageDiscoveryArchitecture />

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

        {/* =========================================================================
           SECTION 2: NATURE MAGAZINE EDITORIAL INTERFACE (Reference: Image 3 NATURA)
           ========================================================================= */}
        <section aria-label="Archival Journal" className="forest-glass-panel p-6 sm:p-10 relative overflow-hidden">
          {/* Ambient Sheen & Background Botanical Texture */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#A6C48A]/10 rounded-full blur-[90px] pointer-events-none" />
          
          {/* Top Journal Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#A6C48A]/20 text-xs text-[#A6C48A]">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-[0.2em] uppercase text-[#F5F3E9]">NATURA ORAL ARCHIVES</span>
              <span className="hidden sm:inline text-[#A6C48A]/50">·</span>
              <span className="hidden sm:inline">DISCOVER THE LIVING BEAUTY OF SPEECH</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider">
              <span>VOL. 24 / ORAL HERITAGE</span>
              <Link href="/archive" className="hover:text-white transition flex items-center gap-1 font-semibold text-[#E2B93B]">
                <span>View Full Index</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Split Magazine Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
            {/* Left Featured Card (Reference: Natura Left Monstera Leaf Card) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#102B20]/80 border border-[#A6C48A]/30 backdrop-blur-md flex flex-col sm:flex-row gap-5 items-center">
                <div className="relative w-full sm:w-44 h-44 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/natura_editorial.jpg')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-[#A6C48A] uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Botanical Lore
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-[#A6C48A] uppercase">
                    FEATURED ORAL TRADITION
                  </span>
                  <h3 className="font-serif font-serif-display text-xl sm:text-2xl font-bold text-[#F5F3E9] leading-snug">
                    Kurumba Forest Songs & Mountain Flora
                  </h3>
                  <p className="text-xs text-[#F5F3E9]/80 font-light leading-relaxed line-clamp-3">
                    Ancient unwritten Nilgiri dialect preserving 400+ medicinal plant names and honey-gathering oral songs governed under OCAP® customary rights.
                  </p>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#A6C48A] hover:text-white transition pt-1"
                  >
                    <span>Listen & Read Story</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bottom Curated Picks Pill (Reference: Natura Bottom Pill) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#163B2C]/50 border border-[#A6C48A]/25 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1F5138] text-[#A6C48A] shrink-0">
                    <TreePine className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#F5F3E9]">
                      Curated Archival Picks
                    </span>
                    <span className="block text-[10px] text-[#A6C48A]/80">
                      Handpicked oral stories from verified community elders.
                    </span>
                  </div>
                </div>

                <Link
                  href="/explore"
                  className="px-4 py-1.5 rounded-full border border-[#A6C48A]/40 bg-[#102B20]/60 hover:bg-[#1F5138] text-xs font-semibold text-[#F5F3E9] transition"
                >
                  Explore Now
                </Link>
              </div>
            </div>

            {/* Right Editorial Headline & Philosophy (Reference: Natura Right Nature Inspires) */}
            <div className="lg:col-span-6 space-y-5 px-2 sm:px-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A6C48A] uppercase tracking-widest">
                <Sparkles className="h-4 w-4 text-[#E2B93B]" />
                <span>IMMUTABLE ORAL SOVEREIGNTY</span>
              </div>

              <h2 className="font-serif font-serif-display text-4xl sm:text-6xl font-bold text-[#F5F3E9] leading-tight">
                Heritage
                <br />
                <span className="text-[#A6C48A] italic">Inspires.</span>
              </h2>

              <p className="text-base sm:text-lg text-[#F5F3E9]/85 font-light leading-relaxed max-w-lg">
                Slow down. Take a breath. Every elder voice carries centuries of botanical wisdom, kinship, and the unwritten memory of the living earth.
              </p>

              {/* Numbered Pagination & Exploration Indicator (Reference: Natura 01, 02, 03) */}
              <div className="flex items-center justify-between pt-4 border-t border-[#A6C48A]/20">
                <div className="flex items-center gap-4 text-xs font-mono text-[#A6C48A]">
                  <span className="font-bold text-[#F5F3E9] border-b-2 border-[#E2B93B] pb-0.5">01</span>
                  <span>02</span>
                  <span>03</span>
                  <span className="text-[11px] font-sans text-[#A6C48A]/70 uppercase tracking-wider ml-2 hidden sm:inline">
                    · Acoustic Archive
                  </span>
                </div>

                <Link
                  href="/record"
                  className="grid h-11 w-11 place-items-center rounded-full bg-[#1F5138] hover:bg-[#A6C48A] text-[#F5F3E9] hover:text-[#102B20] transition-all shadow-md group"
                  aria-label="Contribute oral story"
                  title="Contribute oral story"
                >
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
           SECTION 3: WARM IVORY BOTANICAL EDITORIAL ENVIRONMENT (Reference: Image 4)
           ========================================================================= */}
        <section
          aria-label="Botanical Editorial"
          className="rounded-[2.5rem] bg-[#F5F3E9] text-[#203329] p-6 sm:p-12 border border-[#DCE9D7] shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Leaf Shadow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#A6C48A]/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Editorial Kicker */}
          <div className="flex items-center justify-between pb-6 border-b border-[#203329]/15">
            <span className="text-xs font-bold tracking-[0.2em] text-[#1F5138] uppercase font-display">
              COMMUNITY STEWARDSHIP & LIVING CULTURES
            </span>
            <span className="text-xs font-medium text-[#496354] hidden sm:inline">
              OCAP® Custodianship Standards
            </span>
          </div>

          {/* Body Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-serif font-serif-display text-3xl sm:text-5xl font-bold text-[#102B20] leading-tight">
                Reconnect with Living Heritage.
              </h2>

              <p className="text-base sm:text-lg text-[#203329]/90 font-light leading-relaxed max-w-xl">
                Oral languages are living ecosystems. When an elder speaks, an entire continuum of ecological memory, traditional botanical healing, and ancestral song is preserved. Voice Roots provides customary protection so these voices remain sovereign forever.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#1F5138] text-[#F5F3E9] font-bold text-sm tracking-wide hover:bg-[#102B20] transition-all shadow-md active:scale-95"
                >
                  <span>Explore Oral Collections</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Audio Listen Pill */}
                <button
                  type="button"
                  onClick={() => {
                    const sampleAudio = new Audio("/audio/sample_voice.wav");
                    sampleAudio.play().catch(() => {});
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[#1F5138]/30 bg-white/70 hover:bg-white text-xs font-semibold text-[#1F5138] transition shadow-sm"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Listen to introduction (2:15 min)</span>
                </button>
              </div>
            </div>

            {/* Right Metric Pills & Visual Cards (Reference: Image 4 Right Column) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-white/80 border border-[#DCE9D7] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#DCE9D7] text-[#1F5138] font-bold">
                    🌿
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#102B20]">Oral Tongues & Dialects</span>
                    <span className="block text-xs text-[#496354]">Open across all language families</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#1F5138] font-mono">120+</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-[#DCE9D7] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#DCE9D7] text-[#1F5138] font-bold">
                    🪷
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#102B20]">Botanical Lexicons</span>
                    <span className="block text-xs text-[#496354]">Customary ecological terms</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#1F5138] font-mono">80+</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-[#DCE9D7] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#DCE9D7] text-[#1F5138] font-bold">
                    📖
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#102B20]">Elder Community Councils</span>
                    <span className="block text-xs text-[#496354]">Verified OCAP® stewardship</span>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#1F5138] font-mono">45+</span>
              </div>
            </div>
          </div>
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
