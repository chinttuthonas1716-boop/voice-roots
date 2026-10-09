"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  X,
  User,
} from "lucide-react";
import {
  getCurrentUser,
  loginUser,
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  requestPasswordReset,
  DEMO_USERS,
  type UserProfile,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & modal states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // 1. Email/Password Sign-In Handler
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. elder@voiceroots.org).");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }
    if (password.length < 4) {
      setErrorMessage("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Call backend auth API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const user = loginUser(cleanEmail, password);
        setCurrentUser(user);
        setStatusMessage(`Welcome back, ${user.name}!`);
        setTimeout(() => router.push("/home"), 700);
      } else {
        // Fallback for demo credentials
        const user = loginUser(cleanEmail, password);
        setCurrentUser(user);
        setStatusMessage(`Welcome back, ${user.name}!`);
        setTimeout(() => router.push("/home"), 700);
      }
    } catch {
      // Offline / fallback login
      const user = loginUser(cleanEmail, password);
      setCurrentUser(user);
      setStatusMessage(`Welcome back, ${user.name}!`);
      setTimeout(() => router.push("/home"), 700);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google" }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const user = loginWithGoogle();
        setCurrentUser(user);
        setStatusMessage("Authenticated via Google. Welcome to Voice Roots!");
        setTimeout(() => router.push("/home"), 700);
      } else {
        const user = loginWithGoogle();
        setCurrentUser(user);
        setStatusMessage("Authenticated via Google. Welcome to Voice Roots!");
        setTimeout(() => router.push("/home"), 700);
      }
    } catch {
      const user = loginWithGoogle();
      setCurrentUser(user);
      setStatusMessage("Authenticated via Google. Welcome to Voice Roots!");
      setTimeout(() => router.push("/home"), 700);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Quick Role Selection (Demo convenience)
  const handleSelectDemoUser = (user: UserProfile) => {
    setEmail(user.email);
    setPassword("voiceroots2026");
    setErrorMessage(null);
  };

  // 4. Guest Login Handler
  const handleGuestSignIn = () => {
    setIsLoading(true);
    const guest = loginAsGuest();
    setCurrentUser(guest);
    setStatusMessage("Signed in as Guest Explorer.");
    setTimeout(() => router.push("/home"), 600);
    setIsLoading(false);
  };

  // 5. Logout Handler
  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setStatusMessage("Signed out successfully.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // 6. Forgot Password Handler
  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      return;
    }
    requestPasswordReset(resetEmail);
    setResetSent(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 selection:bg-[#F9B17A]/30 selection:text-white"
      style={{
        backgroundColor: "#2D3250",
        backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(66, 71, 108, 0.45), transparent 75%)",
      }}
    >
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-98"
          style={{ whiteSpace: "nowrap" }}
          aria-label="Voice Roots home"
        >
          <span
            className="grid h-10 w-10 place-items-center rounded-2xl text-xl shadow-lg border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderColor: "rgba(255, 255, 255, 0.14)",
            }}
          >
            🌿
          </span>
          <span
            className="text-2xl font-bold tracking-[0.04em] text-white"
            style={{ whiteSpace: "nowrap" }}
          >
            VOICE ROOTS
          </span>
        </Link>
        <p
          className="text-xs sm:text-sm font-medium tracking-wide"
          style={{ color: "#A9AEC5", whiteSpace: "nowrap" }}
        >
          Oral heritage, kept in community hands
        </p>
      </div>

      {/* Main Login Card */}
      <div
        className="w-full max-w-[460px] p-6 sm:p-10 transition-all duration-300"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.07)",
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderWidth: "1px",
          borderStyle: "solid",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "28px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* If already authenticated */}
        {currentUser ? (
          <div className="space-y-6 text-center py-2">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#42476C] border border-white/10 text-2xl font-bold text-[#F9B17A] shadow-lg">
              {currentUser.avatarInitials}
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-[#F9B17A]/15 text-[#F9B17A] border border-[#F9B17A]/30">
                {currentUser.roleTitle || "Active Custodian"}
              </span>
              <h2 className="text-2xl font-bold text-white pt-1">
                {currentUser.name}
              </h2>
              <p className="text-xs text-[#A9AEC5]">{currentUser.email}</p>
            </div>

            <div className="rounded-2xl p-4 bg-[#242942]/60 border border-white/10 text-left space-y-2 text-xs text-[#D9D9E2]">
              <div className="flex justify-between">
                <span className="text-[#A9AEC5]">Community:</span>
                <span className="font-semibold text-white">{currentUser.clanOrCommunity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A9AEC5]">Contributions:</span>
                <span className="font-semibold text-[#F9B17A]">{currentUser.contributionsCount} Preserved</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold transition-all active:scale-98 shadow-md"
                style={{
                  backgroundColor: "#F9B17A",
                  color: "#242942",
                  height: "54px",
                }}
              >
                <span>Continue to Home</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl font-medium text-xs text-[#A9AEC5] hover:text-white transition py-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign in with a different account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Sign In Form */
          <div className="space-y-6">
            {/* Card Header */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-white leading-tight">
                Welcome back
              </h1>
              <p className="text-sm font-normal" style={{ color: "#A9AEC5" }}>
                Continue preserving voices.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl p-3.5 text-xs border"
                style={{
                  backgroundColor: "rgba(224, 90, 111, 0.12)",
                  borderColor: "rgba(224, 90, 111, 0.28)",
                  color: "#FFB4BE",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Status Message Alert */}
            {statusMessage && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-2xl p-3.5 text-xs border"
                style={{
                  backgroundColor: "rgba(249, 177, 122, 0.12)",
                  borderColor: "rgba(249, 177, 122, 0.30)",
                  color: "#F9B17A",
                }}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{statusMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-medium tracking-wide"
                  style={{ color: "#D9D9E2" }}
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elder@voiceroots.org"
                    autoComplete="email"
                    required
                    className="w-full px-4 text-sm font-medium transition-all outline-none"
                    style={{
                      backgroundColor: "#42476C",
                      borderColor: "rgba(255, 255, 255, 0.10)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      color: "#FFFFFF",
                      height: "54px",
                      borderRadius: "14px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#F9B17A";
                      e.target.style.boxShadow = "0 0 0 3px rgba(249, 177, 122, 0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.10)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium tracking-wide"
                  style={{ color: "#D9D9E2" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-4 pr-12 text-sm font-medium transition-all outline-none"
                    style={{
                      backgroundColor: "#42476C",
                      borderColor: "rgba(255, 255, 255, 0.10)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      color: "#FFFFFF",
                      height: "54px",
                      borderRadius: "14px",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#F9B17A";
                      e.target.style.boxShadow = "0 0 0 3px rgba(249, 177, 122, 0.12)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.10)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 transition-colors"
                    style={{ color: "#A9AEC5" }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border border-white/20 bg-[#42476C] text-[#F9B17A] focus:ring-0 focus:ring-offset-0 h-4 w-4 accent-[#F9B17A]"
                  />
                  <span style={{ color: "#D9D9E2" }}>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSent(false);
                    setShowForgotModal(true);
                  }}
                  className="font-medium hover:underline transition-colors focus:outline-none"
                  style={{ color: "#F9B17A" }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center font-bold text-sm tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-md"
                style={{
                  backgroundColor: "#F9B17A",
                  color: "#242942",
                  height: "54px",
                  borderRadius: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F6A875";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#F9B17A";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[#242942] border-t-transparent animate-spin" />
                    <span>Signing in…</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: "rgba(255, 255, 255, 0.12)" }}
                />
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className="px-3 text-xs"
                  style={{
                    backgroundColor: "#2D3250",
                    color: "#A9AEC5",
                  }}
                >
                  or
                </span>
              </div>
            </div>

            {/* Continue with Google (Glass Button) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                borderWidth: "1px",
                borderStyle: "solid",
                height: "52px",
                borderRadius: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.10)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.22)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#FFFFFF" opacity="0.9" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#FFFFFF" opacity="0.8" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FFFFFF" opacity="0.7" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#FFFFFF" opacity="0.9" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Custodians */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: "#A9AEC5" }}>
                Quick Demo Accounts (1-Click)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { name: "Elder Laxman", email: "soyam.laxman@voiceroots.org" },
                  { name: "Dr. Ananya", email: "ananya.sen@indiclinguistics.edu" },
                  { name: "K. Ramesh", email: "kovvasi.ramesh@community.org" },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword("voiceroots2026");
                      setErrorMessage(null);
                    }}
                    className="py-1.5 px-2 rounded-xl text-[11px] font-medium transition truncate text-center"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.10)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                      color: "#D9D9E2",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#F9B17A";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.10)";
                      e.currentTarget.style.color = "#D9D9E2";
                    }}
                  >
                    {demo.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Don't have an account? Create an account */}
            <div className="text-center pt-2 text-xs" style={{ color: "#A9AEC5" }}>
              <span>Don&apos;t have an account? </span>
              <Link
                href="/register"
                className="font-bold hover:underline transition-colors ml-1"
                style={{ color: "#F9B17A" }}
              >
                Create an account
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Guest Explorer Link */}
      {!currentUser && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleGuestSignIn}
            className="text-xs font-medium transition-colors hover:underline"
            style={{ color: "#A9AEC5" }}
          >
            Or browse publicly as a <span style={{ color: "#F9B17A" }}>Guest Explorer →</span>
          </button>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.70)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="w-full max-w-md p-6 sm:p-8 space-y-5"
            style={{
              backgroundColor: "#242942",
              borderColor: "rgba(255, 255, 255, 0.14)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderRadius: "24px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Reset Password</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-[#A9AEC5] hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {resetSent ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#F9B17A]/15 text-[#F9B17A] border border-[#F9B17A]/30">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">Reset Instructions Sent</h4>
                <p className="text-xs text-[#A9AEC5] leading-relaxed">
                  We have dispatched a verification link to <span className="text-white font-semibold">{resetEmail}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-3 rounded-xl font-bold text-xs"
                  style={{ backgroundColor: "#F9B17A", color: "#242942" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendReset} className="space-y-4">
                <p className="text-xs text-[#A9AEC5]">
                  Enter your registered Voice Roots custodian email to receive reset instructions.
                </p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="elder@voiceroots.org"
                  required
                  className="w-full px-4 text-xs text-white outline-none rounded-xl"
                  style={{
                    backgroundColor: "#42476C",
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    height: "48px",
                  }}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A9AEC5] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: "#F9B17A", color: "#242942" }}
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
