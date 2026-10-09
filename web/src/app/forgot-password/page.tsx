"use client";

import React, { useState } from "react";
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
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Request reset token
  // Step 2: Reset password with token
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Step 1 Handler: Request Token
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
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

  // Step 2 Handler: Update Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token.trim()) {
      setErrorMessage("Please provide your reset token.");
      return;
    }
    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
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

      setSuccessMessage("Password successfully updated! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vr-app min-h-screen pb-20">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-12 sm:px-6">
        <div className="mb-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#A9AEC5] hover:text-[#F9B17A] transition mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Log In</span>
          </Link>
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 grid place-items-center text-[#F9B17A]">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {step === 1 ? "Reset Your Password" : "Set New Password"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#A9AEC5]">
            {step === 1
              ? "Enter your account email to receive a secure recovery verification code."
              : "Enter your verification code and choose a new secure password."}
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-white/12 bg-[rgba(36,41,66,0.85)] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-200 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="rounded-2xl border border-[#F9B17A]/40 bg-[#F9B17A]/10 p-3.5 text-xs text-[#F9B17A] flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: EMAIL ENTRY */
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D9D9E2] mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9AEC5]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya.sharma@gmail.com"
                    className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#A9AEC5]/50 focus:border-[#F9B17A] focus:outline-none focus:ring-1 focus:ring-[#F9B17A] transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="vr-button vr-button-primary w-full !min-h-11 font-bold text-sm shadow-lg shadow-[#F9B17A]/15 mt-2"
              >
                {isLoading ? (
                  <span>Generating Code...</span>
                ) : (
                  <>
                    <span>Continue to Reset</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-[#F9B17A] hover:underline"
                >
                  Already have a reset code? Click here &rarr;
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: TOKEN & NEW PASSWORD */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#D9D9E2] mb-1.5">
                  Recovery Token / Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9AEC5]" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your reset token here"
                    className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-[#A9AEC5]/50 focus:border-[#F9B17A] focus:outline-none focus:ring-1 focus:ring-[#F9B17A] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D9D9E2] mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9AEC5]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#A9AEC5]/50 focus:border-[#F9B17A] focus:outline-none focus:ring-1 focus:ring-[#F9B17A] transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A9AEC5] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D9D9E2] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A9AEC5]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#A9AEC5]/50 focus:border-[#F9B17A] focus:outline-none focus:ring-1 focus:ring-[#F9B17A] transition"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="vr-button vr-button-secondary !min-h-11 text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="vr-button vr-button-primary flex-1 !min-h-11 font-bold text-sm shadow-lg shadow-[#F9B17A]/15"
                >
                  {isLoading ? "Saving New Password..." : "Update Password"}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-white/10 pt-4 text-center text-xs text-[#A9AEC5]">
            Remember your credentials?{" "}
            <Link href="/login" className="font-semibold text-[#F9B17A] hover:underline">
              Sign In
            </Link>{" "}
            ·{" "}
            <Link href="/register" className="font-semibold text-[#F9B17A] hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

