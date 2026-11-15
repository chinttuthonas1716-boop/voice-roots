"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import {
  getCurrentUser,
  loginUserAsync,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  type UserProfile,
  type UserRole,
  DEMO_USERS,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const getRedirectPathForRole = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "reviewer":
        return "/reviewer";
      case "researcher":
        return "/explore";
      default:
        return "/dashboard";
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const user = await loginUserAsync(email.trim(), password, rememberMe);
      setCurrentUser(user);
      setMessage(`Welcome back, ${user.name}!`);
      const target = getRedirectPathForRole(user.role);
      setTimeout(() => router.push(target), 700);
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSelect = async (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    // Standard test passwords corresponding to seed accounts
    const passwords: Record<string, string> = {
      "admin@voiceroots.org": "Admin@123",
      "soyam.laxman@voiceroots.org": "Elder@123",
      "ananya.sen@indiclinguistics.edu": "Linguist@123",
      "priya.sharma@gmail.com": "Priya@123",
    };
    const pwd = passwords[demoEmail] || "VoiceRoots@2026";
    setPassword(pwd);
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginUserAsync(demoEmail, pwd, true);
      setCurrentUser(user);
      setMessage(`Signed in as ${user.name} (${user.roleTitle}).`);
      const target = getRedirectPathForRole(user.role);
      setTimeout(() => router.push(target), 600);
    } catch (err: any) {
      setError(err?.message || "Quick sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setMessage("Signed out successfully.");
  };

  return (
    <div className="min-h-screen bg-[#071A13] text-[#F5F3E9] selection:bg-[#1F5138] selection:text-white pb-20 pt-16 sm:pt-20">
      <Navbar />

      {/* Atmospheric Forest Background & Light Shaft Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1F5138]/40 via-transparent to-transparent" />

      <main className="relative z-10 mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-10">
        {/* Top Header Card with Forest Photography (Reference: Image 1) */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative h-48 sm:h-52 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#A6C48A]/25 shadow-2xl mb-6"
        >
          <Image
            src="/images/login_forest_ref.jpg"
            alt="Misty Sunlit Forest Canopy"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A13] via-black/25 to-transparent" />
          
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-wider text-[#DCE9D7]">
            Sanctuary Archive
          </div>
        </motion.div>

        {/* Section Heading & Subtitle */}
        <div className="mb-6 text-left">
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F3E9] mb-2">
            Welcome back.
          </h1>
          <p className="text-sm text-[#A6C48A] leading-relaxed">
            Continue preserving the voices and stories of humanity.
          </p>
        </div>

        {/* Feedback Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-xs text-rose-200 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl border border-[#A6C48A]/40 bg-[#1F5138]/60 p-3 text-xs text-[#DCE9D7] flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#A6C48A]" />
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {currentUser ? (
          /* Active Session View */
          <div className="bg-[#F5F3E9] text-[#102B20] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#A6C48A]/40 text-center">
            <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#477A50] mb-1">
              Active Verified Session
            </span>
            <h2 className="text-2xl font-bold text-[#102B20]">{currentUser.name}</h2>
            <p className="text-xs text-[#477A50] mb-1">{currentUser.email}</p>
            <span className="inline-block bg-[#1F5138]/10 text-[#1F5138] text-xs font-semibold px-3 py-1 rounded-full my-3">
              {currentUser.roleTitle}
            </span>

            <div className="space-y-3 pt-3">
              <button
                type="button"
                onClick={() => router.push(getRedirectPathForRole(currentUser.role))}
                className="w-full bg-[#102B20] hover:bg-[#1F5138] text-[#F5F3E9] font-medium py-3 rounded-full transition flex items-center justify-center gap-2 shadow-md"
              >
                <span>Go to Authorized Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full border border-[#102B20]/20 text-[#102B20] hover:bg-black/5 font-medium py-2.5 rounded-full text-xs transition"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          /* Warm Ivory Sign In Card (Reference: Image 1) */
          <div className="bg-[#F5F3E9] text-[#102B20] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-[#A6C48A]/50">
            <h2 className="text-lg sm:text-xl font-bold text-[#102B20] mb-5 tracking-tight">
              Sign in to your account
            </h2>

            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] placeholder:text-[#477A50]/50 focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                  />
                  <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-[#477A50]/50 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 pr-10 text-sm text-[#102B20] placeholder:text-[#477A50]/50 focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#477A50]/60 hover:text-[#102B20] transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#102B20]/80 hover:text-[#102B20]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[#A6C48A] text-[#1F5138] focus:ring-[#1F5138]"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[#1F5138] hover:text-[#102B20] font-medium underline-offset-2 hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#102B20] hover:bg-[#1F5138] text-[#F5F3E9] font-medium py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Link to Registration */}
            <div className="mt-6 pt-5 border-t border-[#A6C48A]/30 text-center text-xs text-[#102B20]/75">
              <span>New to Voice Roots? </span>
              <Link
                href="/signup"
                className="text-[#1F5138] hover:text-[#102B20] font-bold underline-offset-2 hover:underline transition"
              >
                Create an account
              </Link>
            </div>
          </div>
        )}

        {/* Quick Demo Switcher Section for Evaluation & Testing */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-[11px] uppercase tracking-wider text-[#A6C48A] mb-3">
            Evaluation & Role Switcher
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {DEMO_USERS.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickDemoSelect(u.email, u.role)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:border-[#A6C48A]/40 hover:bg-white/10 transition"
              >
                <p className="font-semibold text-xs text-[#F5F3E9] truncate">{u.name}</p>
                <p className="text-[10px] text-[#A6C48A] uppercase tracking-wider truncate">
                  {u.roleTitle.split(" ")[0]} ({u.role})
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
