"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Sparkles,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  Globe,
  Radio,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  // Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [community, setCommunity] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "contributor" | "researcher" | "moderator"
  >("contributor");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDemoFill = (
    role: "contributor" | "researcher" | "moderator",
    demoEmail: string
  ) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword("VoiceRoots2026!");
    setLoginMethod("email");
    setErrorMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Simulate successful login / account creation
      const token = "mock_jwt_token_" + Math.random().toString(36).substring(7);
      if (typeof window !== "undefined") {
        localStorage.setItem("voice_roots_token", token);
        localStorage.setItem(
          "voice_roots_user",
          JSON.stringify({
            name: fullName || (email ? email.split("@")[0] : "Community Speaker"),
            email: email || phone,
            role: selectedRole,
            community: community || "Tribal Heritage Circle",
          })
        );
      }
      setSuccessMessage(
        isSignUp
          ? "Account created successfully! Redirecting to archive..."
          : "Signed in successfully! Redirecting to your dashboard..."
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-20 relative overflow-hidden">
      <Navbar />

      {/* Ambient Netflix Red backlight gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-netflix-red/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cultural-gold/5 blur-[100px] rounded-full pointer-events-none" />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto relative z-10">
        {/* Card Container */}
        <div className="ios27-glass p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-netflix-red via-netflix-red-hover to-netflix-red-dark border border-netflix-red/50 mx-auto flex items-center justify-center text-white shadow-netflix-glow font-bold text-lg">
              N
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isSignUp ? "Join Voice Roots" : "Welcome Back"}
            </h1>
            <p className="text-xs sm:text-sm text-netflix-gray max-w-sm mx-auto leading-relaxed">
              {isSignUp
                ? "Create an archive account to record, transcribe, and preserve oral languages."
                : "Sign in to access your recorded voices, verified transcripts, and model evaluations."}
            </p>
          </div>

          {/* Mode Switcher (Sign In vs Sign Up) */}
          <div className="p-1 rounded-full bg-white/5 border border-white/10 flex items-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !isSignUp
                  ? "bg-netflix-red text-white shadow-netflix-glow"
                  : "text-netflix-gray hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSignUp
                  ? "bg-netflix-red text-white shadow-netflix-glow"
                  : "text-netflix-gray hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Login Presets */}
          {!isSignUp && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-netflix-gray uppercase tracking-wider block">
                Quick 1-Click Demo Logins:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill("contributor", "elder@voiceroots.org")}
                  className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white font-medium transition-all text-center truncate hover:border-netflix-red/50"
                  title="Elder Speaker / Contributor"
                >
                  👴 Elder
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill("researcher", "linguist@voiceroots.org")}
                  className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white font-medium transition-all text-center truncate hover:border-netflix-red/50"
                  title="Linguist Researcher"
                >
                  🔬 Researcher
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill("moderator", "admin@voiceroots.org")}
                  className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white font-medium transition-all text-center truncate hover:border-netflix-red/50"
                  title="Archive Moderator"
                >
                  🛡️ Moderator
                </button>
              </div>
            </div>
          )}

          {/* Auth Method Toggle: Email vs Phone OTP */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-netflix-gray">Authentication Method:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all ${
                  loginMethod === "email"
                    ? "bg-white/15 text-white font-semibold"
                    : "text-netflix-gray hover:text-white"
                }`}
              >
                <Mail className="w-3 h-3" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition-all ${
                  loginMethod === "phone"
                    ? "bg-white/15 text-white font-semibold"
                    : "text-netflix-gray hover:text-white"
                }`}
              >
                <Phone className="w-3 h-3" />
                <span>Phone OTP</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (if sign up) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-netflix-gray">
                  Full Name / Clan Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-netflix-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar (Pardhan Gond Clan)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-netflix-muted focus:outline-none focus:border-netflix-red/60 focus:ring-1 focus:ring-netflix-red/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email or Phone Input */}
            {loginMethod === "email" ? (
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-netflix-gray">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-netflix-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@voiceroots.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-netflix-muted focus:outline-none focus:border-netflix-red/60 focus:ring-1 focus:ring-netflix-red/30 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-netflix-gray">
                  Mobile Number (India & Regional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-netflix-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-netflix-muted focus:outline-none focus:border-netflix-red/60 focus:ring-1 focus:ring-netflix-red/30 transition-all"
                  />
                </div>
                <span className="text-[10px] text-netflix-gray">
                  We'll send a 6-digit verification code to your phone.
                </span>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-netflix-gray">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to registered email/phone.")}
                    className="text-[11px] text-netflix-red hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-netflix-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-netflix-muted focus:outline-none focus:border-netflix-red/60 focus:ring-1 focus:ring-netflix-red/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-netflix-gray hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-mono uppercase text-netflix-gray block">
                Primary Participation Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "contributor", label: "Speaker / Contributor" },
                  { id: "researcher", label: "Linguist Researcher" },
                  { id: "moderator", label: "Clan Moderator" },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id as any)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center border ${
                      selectedRole === role.id
                        ? "bg-netflix-red/20 border-netflix-red text-white shadow-netflix-glow"
                        : "bg-white/5 border-white/10 text-netflix-gray hover:text-white"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Community / Village (if sign up) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-netflix-gray">
                  Language & Community Affiliation (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-netflix-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Koya Community, Godavari Agency Valley"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-netflix-muted focus:outline-none focus:border-netflix-red/60 focus:ring-1 focus:ring-netflix-red/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-netflix-red rounded w-3.5 h-3.5"
              />
              <label
                htmlFor="remember"
                className="text-xs text-netflix-gray cursor-pointer select-none"
              >
                Keep me signed in on this trusted device
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-netflix-red/15 border border-netflix-red/30 text-netflix-red text-xs">
                {errorMessage}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full ios27-button-primary text-xs font-bold shadow-netflix-glow transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <span>
                {isLoading
                  ? "Authenticating..."
                  : isSignUp
                  ? "Create Archive Account"
                  : "Sign In to Voice Roots"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Ethical Disclaimer */}
          <div className="pt-4 border-t border-white/10 text-center space-y-1">
            <span className="text-[11px] font-mono text-netflix-gray block">
              🛡️ Indigenous Ethical Data Sovereignty
            </span>
            <p className="text-[10px] text-netflix-muted leading-relaxed">
              Recordings are preserved in accordance with community elder consent. You retain full copyright and can revoke access to your voice recordings at any time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
