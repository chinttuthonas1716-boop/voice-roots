"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1: Request Token
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please enter a valid account email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password reset request failed.");
      }

      setSuccessMessage(data.message || "Reset token issued.");
      if (data.resetToken) {
        setToken(data.resetToken);
      }
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while requesting password reset.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token.trim()) {
      setErrorMessage("Please provide your reset token.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password update failed.");
      }

      setSuccessMessage("Password successfully updated! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071A13] text-[#F5F3E9] selection:bg-[#1F5138] selection:text-white pb-20 pt-16 sm:pt-20">
      <Navbar />

      {/* Atmospheric Forest Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1F5138]/40 via-transparent to-transparent" />

      <main className="relative z-10 mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-[#A6C48A] hover:text-[#F5F3E9] transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {/* Section Heading */}
        <div className="mb-6 text-left">
          <span className="inline-block px-2.5 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-[10px] uppercase font-bold tracking-widest text-[#DCE9D7] mb-2">
            Security & Recovery
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F3E9] mb-2">
            {step === 1 ? "Reset your password." : "Set new password."}
          </h1>
          <p className="text-sm text-[#A6C48A] leading-relaxed">
            {step === 1
              ? "Enter your account email to receive a secure recovery verification token."
              : "Enter your verification token and create a new secure password."}
          </p>
        </div>

        {/* Feedback Alerts */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-xs text-rose-200 flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl border border-[#A6C48A]/40 bg-[#1F5138]/70 p-3 text-xs text-[#DCE9D7] flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#A6C48A]" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warm Ivory Recovery Card */}
        <div className="bg-[#F5F3E9] text-[#102B20] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-[#A6C48A]/50">
          {step === 1 ? (
            /* Step 1: Request Form */
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] placeholder:text-[#477A50]/50 focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                  />
                  <Mail className="absolute right-3.5 top-3.5 h-4 w-4 text-[#477A50]/50 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#102B20] hover:bg-[#1F5138] text-[#F5F3E9] font-medium py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Issuing Recovery Token...</span>
                  </>
                ) : (
                  <span>Send Recovery Token</span>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Reset Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                  Verification Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter reset token"
                    required
                    className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] font-mono focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                  />
                  <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-[#477A50]/50 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 8 characters"
                    required
                    className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 pr-10 text-sm text-[#102B20] focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
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

              <div>
                <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#102B20] hover:bg-[#1F5138] text-[#F5F3E9] font-medium py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-[#477A50] hover:text-[#102B20] pt-2 transition"
              >
                Request a different token
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#A6C48A]/30 text-center text-xs text-[#102B20]/75">
            <span>Remember your password? </span>
            <Link
              href="/login"
              className="text-[#1F5138] hover:text-[#102B20] font-bold underline-offset-2 hover:underline transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
