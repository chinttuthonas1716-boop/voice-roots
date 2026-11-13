"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Sparkles, ShieldCheck, ChevronRight, TreePine } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import {
  getCurrentUser,
  loginUser,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  registerUser,
  type UserProfile,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = loginWithGoogle();
      setCurrentUser(user);
      setMessage("Signed in with Google.");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      setError("Unable to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    if (mode === "signup" && !consent) {
      setError("Please agree to the customary data stewardship principles.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const user = registerUser({
          name: name.trim() || "Community Member",
          email: email.trim(),
          password,
          role: "contributor",
        });
        setCurrentUser(user);
        setMessage(`Account created! Welcome, ${user.name}.`);
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        const user = loginUser(email.trim(), password);
        setCurrentUser(user);
        setMessage(`Welcome back, ${user.name}!`);
        setTimeout(() => router.push("/dashboard"), 800);
      }
    } catch {
      setError(mode === "signup" ? "Unable to register. Please try again." : "Unable to sign in. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    setIsLoading(true);
    setError(null);
    try {
      const guest = loginAsGuest();
      setCurrentUser(guest);
      setMessage("Browsing as guest.");
      setTimeout(() => router.push("/"), 800);
    } catch {
      setError("Unable to start guest session.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setMessage("Signed out successfully.");
  };

  return (
    <div className="min-h-screen pb-20 pt-20">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-12">
        {/* Split Screen Master Layout (Reference: Image 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Frosted Glass Sign In / Sign Up Panel */}
          <div className="lg:col-span-6 w-full">
            <div className="forest-glass-panel p-6 sm:p-10 relative overflow-hidden">
              {/* Soft ambient inner glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#A6C48A]/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Logo / Header Branding */}
              <div className="flex items-center gap-2 mb-4">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#1F5138]/60 border border-[#A6C48A]/30 text-sm shadow-sm">
                  🌲
                </span>
                <span className="font-extrabold text-sm tracking-tight text-[#F5F3E9] uppercase">
                  Voice Roots
                </span>
              </div>

              {/* Serif Tracked Heading (Reference: Image 2) */}
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-wider text-[#F5F3E9] uppercase leading-tight mb-3">
                Be a part of collective action.
              </h1>

              {/* Descriptive narrative body */}
              <p className="text-xs sm:text-sm text-[#A6C48A]/90 leading-relaxed mb-6 font-light">
                With every recording and elder verification, we preserve endangered dialects, honor indigenous elders, and root oral knowledge in community-owned archives.
              </p>

              {/* Feedback Notifications */}
              {message && (
                <div className="mb-5 rounded-2xl border border-[#A6C48A]/40 bg-[#1F5138]/50 p-3.5 text-sm text-[#F5F3E9] text-center backdrop-blur-md">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-5 rounded-2xl border border-rose-500/40 bg-rose-900/30 p-3.5 text-sm text-rose-200 text-center backdrop-blur-md">
                  {error}
                </div>
              )}

              {currentUser ? (
                /* Logged In View */
                <div className="space-y-5 text-center py-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#A6C48A]">Signed in as</p>
                    <h2 className="text-xl font-bold text-[#F5F3E9] mt-1">{currentUser.name}</h2>
                    <p className="text-sm text-[#A6C48A]/80">{currentUser.email}</p>
                  </div>

                  <div className="pt-2 space-y-3">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="pill-btn-solid w-full"
                    >
                      Go to My recordings
                    </button>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="btn-glass w-full rounded-full"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              ) : (
                /* Auth Form View */
                <div className="space-y-6">
                  {/* Mode Tabs: SIGN IN vs SIGN UP */}
                  <div className="flex items-center gap-3 border-b border-[#A6C48A]/20 pb-3">
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className={`text-sm font-bold tracking-widest uppercase pb-1 transition-all ${
                        mode === "signin"
                          ? "text-[#F5F3E9] border-b-2 border-[#A6C48A]"
                          : "text-[#A6C48A]/60 hover:text-[#F5F3E9]"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className={`text-sm font-bold tracking-widest uppercase pb-1 transition-all ${
                        mode === "signup"
                          ? "text-[#F5F3E9] border-b-2 border-[#A6C48A]"
                          : "text-[#A6C48A]/60 hover:text-[#F5F3E9]"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]" />
                        <input
                          id="signup-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="pill-input"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="pill-input"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]" />
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="pill-input"
                      />
                    </div>

                    {mode === "signup" && (
                      <div className="flex items-start gap-3 pt-1">
                        <input
                          id="consent-checkbox"
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-[#A6C48A]/40 bg-[#1F5138]/50 text-[#1F5138] focus:ring-[#A6C48A]"
                        />
                        <label htmlFor="consent-checkbox" className="text-xs text-[#A6C48A]/90 leading-tight">
                          I agree to customary community data sovereignty and ethical archiving terms under OCAP®.
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="pill-btn-solid w-full mt-2"
                    >
                      {isLoading ? "Processing..." : mode === "signup" ? "Sign Up" : "Sign In"}
                    </button>
                  </form>

                  {/* Social Login Divider (Reference: Image 2) */}
                  <div className="relative flex items-center justify-center pt-2">
                    <div className="w-full border-t border-[#A6C48A]/20" />
                    <span className="absolute bg-[#102B20] px-3 text-[11px] uppercase tracking-wider text-[#A6C48A]/75">
                      Or sign up with
                    </span>
                  </div>

                  {/* Social Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full border border-[#A6C48A]/30 bg-[#163B2C]/40 text-xs font-semibold text-[#F5F3E9] hover:bg-[#1F5138]/60 transition"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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
                      onClick={handleGuestSignIn}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full border border-[#A6C48A]/30 bg-[#163B2C]/40 text-xs font-semibold text-[#F5F3E9] hover:bg-[#1F5138]/60 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#A6C48A]" />
                      <span>Guest Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hero Graphic & Serif Typography (Reference: Image 2) */}
          <div className="lg:col-span-6 space-y-6 text-left px-2 sm:px-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102B20]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] backdrop-blur-md">
              <TreePine className="h-4 w-4" />
              <span>COMMUNITY ROOTED ARCHIVING</span>
            </div>

            <h2 className="font-serif-display text-4xl sm:text-6xl font-extrabold tracking-wider text-[#F5F3E9] uppercase leading-tight">
              Save the roots,
              <br />
              <span className="text-[#A6C48A]">preserve the voices.</span>
            </h2>

            <p className="text-base sm:text-lg text-[#F5F3E9]/80 font-light leading-relaxed max-w-lg">
              Indigenous oral traditions carry centuries of botanical, ecological, and cultural knowledge. Join community elders in archiving spoken languages before they fade.
            </p>

            {/* Chevron Indicators (Reference: Image 2 `< < < <`) */}
            <div className="flex items-center gap-3 pt-2 text-[#A6C48A]/70 text-lg font-bold tracking-widest select-none">
              <span>‹</span>
              <span>‹</span>
              <span>‹</span>
              <span>‹</span>
              <span className="text-xs uppercase font-sans tracking-widest text-[#A6C48A] ml-2">
                GONDI · KOYA · SANTHALI · LAMBADI
              </span>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="forest-glass-panel p-4">
                <ShieldCheck className="h-5 w-5 text-[#A6C48A] mb-1.5" />
                <h3 className="font-bold text-sm text-[#F5F3E9]">Elder Governed</h3>
                <p className="text-xs text-[#A6C48A]/80 mt-0.5">Customary review and consent oversight.</p>
              </div>
              <div className="forest-glass-panel p-4">
                <Sparkles className="h-5 w-5 text-[#A6C48A] mb-1.5" />
                <h3 className="font-bold text-sm text-[#F5F3E9]">AI Annotation</h3>
                <p className="text-xs text-[#A6C48A]/80 mt-0.5">IndicTrans2 transparent machine drafts.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
