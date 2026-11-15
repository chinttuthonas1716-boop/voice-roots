"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MailCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Send,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [token, setToken] = useState(urlToken);
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (urlToken) {
      handleAutoVerify(urlToken);
    }
  }, [urlToken]);

  const handleAutoVerify = async (tokenToVerify: string) => {
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Email verification failed.");
      }
      setIsVerified(true);
      setSuccessMessage(data.message || "Your email address has been verified!");
    } catch (err: any) {
      setErrorMessage(err.message || "Verification token is invalid or has expired.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage("Please enter a verification token.");
      return;
    }
    handleAutoVerify(token);
  };

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setIsRequesting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not generate verification link.");
      }
      setSuccessMessage("Verification link generated. Check token below:");
      if (data.token) {
        setToken(data.token);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Request failed.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071A13] text-[#F5F3E9] selection:bg-[#1F5138] selection:text-white pb-20 pt-16 sm:pt-20">
      <Navbar />

      {/* Forest Light Shaft Glow */}
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
            Account Integrity
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F3E9] mb-2">
            Verify your email.
          </h1>
          <p className="text-sm text-[#A6C48A] leading-relaxed">
            Confirm your identity to activate your oral preservation contributor passport.
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

        {/* Warm Ivory Form Card */}
        <div className="bg-[#F5F3E9] text-[#102B20] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-[#A6C48A]/50">
          {isVerified ? (
            /* Verified State */
            <div className="text-center py-4 space-y-4">
              <div className="h-14 w-14 rounded-full bg-[#1F5138]/10 text-[#1F5138] flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-[#1F5138]" />
              </div>
              <h2 className="text-xl font-bold text-[#102B20]">Email Verified!</h2>
              <p className="text-xs text-[#477A50] leading-relaxed">
                Your account is active. You can now contribute high-fidelity oral recordings and access the heritage archives.
              </p>
              <Link
                href="/login"
                className="w-full bg-[#102B20] hover:bg-[#1F5138] text-[#F5F3E9] font-medium py-3 rounded-full transition shadow-md flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* Verification / Token Form */
            <div className="space-y-6">
              <form onSubmit={handleManualVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                    Verification Token
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter email verification code"
                    className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] font-mono focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-[#102B20] hover:bg-[#1F5138] text-[#F5F3E9] font-medium py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <MailCheck className="h-4 w-4" />
                      <span>Confirm Verification</span>
                    </>
                  )}
                </button>
              </form>

              {/* Request New Token */}
              <div className="pt-4 border-t border-[#A6C48A]/30">
                <p className="text-xs font-semibold text-[#1F5138] mb-2 uppercase tracking-wider">
                  Need a verification code?
                </p>
                <form onSubmit={handleRequestToken} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your account email"
                    className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-2.5 text-xs text-[#102B20] focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                  />
                  <button
                    type="submit"
                    disabled={isRequesting}
                    className="w-full border border-[#102B20]/30 text-[#102B20] hover:bg-black/5 font-medium py-2 rounded-full text-xs transition flex items-center justify-center gap-1.5"
                  >
                    {isRequesting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    <span>Send Verification Code</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071A13] flex items-center justify-center text-[#A6C48A] gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading verification portal...</span>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
