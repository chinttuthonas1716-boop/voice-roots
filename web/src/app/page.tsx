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
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { registerUser, loginUser, loginWithGoogle, loginAsGuest, getCurrentUser, type UserProfile } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState<"hero" | "collective">("hero");
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
      title: "Save the roots,",
      subtitle: "preserve the voices.",
      body: "With every spoken story recorded under elder consent, an endangered language is shielded from cultural extinction.",
      tag: "DIALECT CONSERVATION",
    },
    {
      title: "Listen to the elders,",
      subtitle: "honor living memory.",
      body: "Oral traditions carry centuries of botanical, ecological, and spiritual wisdom that no written textbook contains.",
      tag: "SACRED KNOWLEDGE",
    },
    {
      title: "Rooted in sovereignty,",
      subtitle: "governed under OCAP®.",
      body: "Communities retain permanent ownership and control. AI output is only a transparent annotation layer over the master audio.",
      tag: "DATA SOVEREIGNTY",
    },
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

  return (
    <div className="min-h-screen pb-24 pt-20 overflow-x-hidden w-full">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-8 space-y-12 overflow-x-hidden w-full">
        {/* Interactive Scene Switcher Tabs (Reference: Image 1 Home vs Know More) */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 pb-2">
          <button
            type="button"
            onClick={() => setActiveStage("hero")}
            className={`relative pb-2 text-sm sm:text-base font-bold uppercase tracking-widest transition-all ${
              activeStage === "hero"
                ? "text-[#F5F3E9]"
                : "text-[#A6C48A]/60 hover:text-[#F5F3E9]"
            }`}
          >
            <span>Home</span>
            {activeStage === "hero" && (
              <motion.span
                layoutId="stage-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#E2B93B] rounded-full shadow-[0_0_10px_rgba(226,185,59,0.8)]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveStage("collective")}
            className={`relative pb-2 text-sm sm:text-base font-bold uppercase tracking-widest transition-all ${
              activeStage === "collective"
                ? "text-[#F5F3E9]"
                : "text-[#A6C48A]/60 hover:text-[#F5F3E9]"
            }`}
          >
            <span>Know More</span>
            {activeStage === "collective" && (
              <motion.span
                layoutId="stage-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#E2B93B] rounded-full shadow-[0_0_10px_rgba(226,185,59,0.8)]"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </button>
        </div>

        {/* Dual Cinematic Stage with Smooth Spring Transitions */}
        <div className="relative min-h-[440px] sm:min-h-[500px] overflow-hidden w-full">
          <AnimatePresence mode="wait">
            {activeStage === "hero" ? (
              /* =========================================================================
                 SCENE 1: ATMOSPHERIC HERO (Reference: Image 1 "forest.")
                 ========================================================================= */
              <motion.section
                key="stage-hero"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="relative text-center space-y-6 pt-4 sm:pt-10 px-4 max-w-4xl mx-auto overflow-hidden"
              >
                {/* Ambient Ethereal Glow & Mist Drift */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-[#A6C48A]/12 rounded-full blur-[110px] pointer-events-none -z-10 animate-mist-drift" />

                {/* Micro Tag (Reference: Image 1 tag line) */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102B20]/80 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] backdrop-blur-md shadow-sm max-w-full truncate"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="tracking-wide truncate">INDIGENOUS ORAL HERITAGE & AI PRESERVATION</span>
                </motion.div>

                {/* Iconic Lowercase Headline: voice roots. (Reference: Image 1 "forest.") */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-[#F5F3E9] font-sans select-none break-words"
                >
                  voice roots<span className="text-[#A6C48A] drop-shadow-[0_0_12px_rgba(166,196,138,0.6)]">.</span>
                </motion.h1>

                {/* Narrative Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-base sm:text-xl text-[#A6C48A]/95 max-w-2xl mx-auto font-light leading-relaxed"
                >
                  Voice Roots is a community-owned platform that roots oral languages in text with AI.
                  Preserving spoken stories across Gondi, Koya, Santhali, and Lambadi.
                </motion.p>

                {/* Action CTA to switch to Know More */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="pt-2 flex items-center justify-center gap-4"
                >
                  <button
                    type="button"
                    onClick={() => setActiveStage("collective")}
                    className="pill-btn-solid gap-2 group"
                  >
                    <span>Know More</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <Link
                    href="/record"
                    className="btn-glass rounded-full text-xs font-semibold px-6"
                  >
                    Start Recording
                  </Link>
                </motion.div>

                {/* Micro Badge Indicators (Reference: Image 1 bottom row) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-medium text-[#F5F3E9]/85"
                >
                  <div className="flex items-center gap-2 bg-[#102B20]/70 border border-[#A6C48A]/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                    <span className="font-bold text-[#A6C48A] border border-[#A6C48A]/40 rounded-full px-1.5 py-0.5 text-[10px]">
                      OCAP
                    </span>
                    <span className="tracking-wider uppercase text-[11px]">COMMUNITY SOVEREIGNTY</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#102B20]/70 border border-[#A6C48A]/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                    <ShieldCheck className="h-4 w-4 text-[#A6C48A]" />
                    <span className="tracking-wider uppercase text-[11px]">PRESERVE ROOTS</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#102B20]/70 border border-[#A6C48A]/25 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                    <TreePine className="h-4 w-4 text-[#A6C48A]" />
                    <span className="tracking-wider uppercase text-[11px]">IMMUTABLE AUDIO</span>
                  </div>
                </motion.div>

                <p className="text-xs text-[#A6C48A]/60 pt-4 font-light">
                  Stay focused on roots whenever, wherever · Copyright © 2026. All rights reserved.
                </p>
              </motion.section>
            ) : (
              /* =========================================================================
                 SCENE 2: FROSTED GLASS COLLECTIVE ACTION (Reference: Image 2 Split Layout)
                 ========================================================================= */
              <motion.section
                key="stage-collective"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Column: Signature Frosted Glass Panel (Reference: Image 2 Left Card) */}
                <div className="lg:col-span-6 w-full">
                  <div className="forest-glass-panel p-6 sm:p-8 relative overflow-hidden">
                    {/* Ambient inner sheen */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#A6C48A]/10 rounded-full blur-[70px] pointer-events-none" />

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1F5138]/60 border border-[#A6C48A]/30 text-sm shadow-sm">
                          🌲
                        </span>
                        <span className="font-extrabold text-xs tracking-wider text-[#F5F3E9] uppercase">
                          Voice Roots
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveStage("hero")}
                        className="text-xs text-[#A6C48A] hover:text-white flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Back to Hero</span>
                      </button>
                    </div>

                    {/* Classic Uppercase Serif Tracked Heading (Reference: Image 2) */}
                    <h2 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-wider text-[#F5F3E9] uppercase leading-tight mb-3">
                      Be a part of collective action.
                    </h2>

                    <p className="text-xs sm:text-sm text-[#A6C48A]/90 leading-relaxed mb-5 font-light">
                      With every voice recording, not only do we protect endangered mother tongues, but we ensure our elders' oral knowledge is sovereignly preserved for future generations.
                    </p>

                    {/* Notifications */}
                    {authMessage && (
                      <div className="mb-4 rounded-xl border border-[#A6C48A]/40 bg-[#1F5138]/50 p-3 text-xs text-[#F5F3E9] text-center backdrop-blur-md">
                        {authMessage}
                      </div>
                    )}
                    {authError && (
                      <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-900/30 p-3 text-xs text-rose-200 text-center backdrop-blur-md">
                        {authError}
                      </div>
                    )}

                    {currentUser ? (
                      /* Logged In View */
                      <div className="space-y-4 py-3 text-center">
                        <div className="rounded-2xl border border-[#A6C48A]/30 bg-[#163B2C]/40 p-4">
                          <p className="text-[11px] uppercase tracking-wider text-[#A6C48A]">Signed in as</p>
                          <h3 className="text-lg font-bold text-[#F5F3E9] mt-0.5">{currentUser.name}</h3>
                          <p className="text-xs text-[#A6C48A]/80">{currentUser.email}</p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="pill-btn-solid flex-1 !min-h-[42px] !text-xs"
                          >
                            Go to My Recordings
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push("/record")}
                            className="btn-glass rounded-full flex-1 !min-h-[42px] !text-xs font-semibold"
                          >
                            New Recording
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Auth Form View (Reference: Image 2 inputs & SIGN UP button) */
                      <div className="space-y-4">
                        {/* Mode Switcher: Sign Up vs Sign In */}
                        <div className="flex items-center gap-3 border-b border-[#A6C48A]/20 pb-2">
                          <button
                            type="button"
                            onClick={() => setAuthMode("signup")}
                            className={`text-xs font-bold tracking-widest uppercase pb-1 transition-all ${
                              authMode === "signup"
                                ? "text-[#F5F3E9] border-b-2 border-[#A6C48A]"
                                : "text-[#A6C48A]/60 hover:text-[#F5F3E9]"
                            }`}
                          >
                            Sign Up
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
                            Sign In
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
                                I agree to customary community data sovereignty and ethical archiving terms under OCAP®.
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

                        {/* Divider */}
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

                {/* Right Column: Hero Graphic & Serif Typography (Reference: Image 2 Right Side) */}
                <div className="lg:col-span-6 space-y-6 text-left px-2 sm:px-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102B20]/70 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] backdrop-blur-md">
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
                      className="space-y-4"
                    >
                      <h3 className="font-serif-display text-4xl sm:text-6xl font-extrabold tracking-wider text-[#F5F3E9] uppercase leading-tight">
                        {carouselSlides[carouselIndex].title}
                        <br />
                        <span className="text-[#A6C48A]">{carouselSlides[carouselIndex].subtitle}</span>
                      </h3>

                      <p className="text-base sm:text-lg text-[#F5F3E9]/80 font-light leading-relaxed max-w-lg">
                        {carouselSlides[carouselIndex].body}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Interactive Chevron Indicators (Reference: Image 2 `< < < <`) */}
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
                      GONDI · KOYA · SANTHALI · LAMBADI
                    </span>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="forest-glass-panel p-4">
                      <ShieldCheck className="h-5 w-5 text-[#A6C48A] mb-1.5" />
                      <h4 className="font-bold text-sm text-[#F5F3E9]">Elder Governed</h4>
                      <p className="text-xs text-[#A6C48A]/80 mt-0.5">Customary review and consent oversight.</p>
                    </div>
                    <div className="forest-glass-panel p-4">
                      <Sparkles className="h-5 w-5 text-[#A6C48A] mb-1.5" />
                      <h4 className="font-bold text-sm text-[#F5F3E9]">AI Annotation</h4>
                      <p className="text-xs text-[#A6C48A]/80 mt-0.5">IndicTrans2 transparent machine drafts.</p>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* 4 Frosted Action Cards */}
        <section aria-label="Main actions" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
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
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Honest AI & elder review</span>
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
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Explore 4 indigenous lexicons</span>
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
                Press Record or Upload above to save your first spoken story in Gondi, Koya, Santhali, or Lambadi.
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

        {/* Footer Statement (Reference: Image 1) */}
        <footer className="text-center text-xs text-[#A6C48A]/60 pt-8 pb-4 space-y-1">
          <p className="font-medium text-[#F5F3E9]/75">Stay rooted whenever, wherever.</p>
          <p>Voice Roots © 2026. Preserving oral heritage under OCAP® principles.</p>
        </footer>
      </main>
    </div>
  );
}
