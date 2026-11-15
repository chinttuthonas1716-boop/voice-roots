"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { registerUserAsync, type UserRole } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleChoice, setRoleChoice] = useState<UserRole>("contributor");
  const [clanOrCommunity, setClanOrCommunity] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!consentAccepted) {
      setError("Please acknowledge the customary OCAP® data stewardship principles.");
      return;
    }

    setIsLoading(true);

    try {
      const newUser = await registerUserAsync({
        name: fullName.trim(),
        email: email.trim(),
        password,
        role: roleChoice,
        clanOrCommunity: clanOrCommunity.trim() || undefined,
      });

      if (roleChoice === "reviewer" || roleChoice === "admin") {
        setSuccessNotice(
          `Welcome, ${newUser.name}! Your account has been initialized as a Community Contributor. Your request for elevated ${roleChoice === "admin" ? "Administrator" : "Language Reviewer"} status is pending administrator verification.`
        );
      } else {
        setSuccessNotice(`Account created successfully! Welcome to Voice Roots, ${newUser.name}.`);
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please check your information and try again.");
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
        {/* Top Header Card with Canopy Leaves & Sunbeams (Reference: Image 2) */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative h-48 sm:h-52 w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#A6C48A]/25 shadow-2xl mb-6"
        >
          <Image
            src="/images/signup_forest_ref.jpg"
            alt="Lush Forest Foliage and Sunbeams"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A13] via-black/25 to-transparent" />
          
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-wider text-[#DCE9D7]">
            Global Heritage Collective
          </div>
        </motion.div>

        {/* Section Heading & Subtitle */}
        <div className="mb-6 text-left">
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F3E9] mb-2">
            Join the movement.
          </h1>
          <p className="text-sm text-[#A6C48A] leading-relaxed">
            Become part of a global community preserving linguistic heritage.
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
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl border border-[#A6C48A]/40 bg-[#1F5138]/70 p-3 text-xs text-[#DCE9D7] flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#A6C48A]" />
              <span>{successNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warm Ivory Sign Up Card (Reference: Images 2 & 3) */}
        <div className="bg-[#F5F3E9] text-[#102B20] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-[#A6C48A]/50">
          <h2 className="text-lg sm:text-xl font-bold text-[#102B20] mb-5 tracking-tight">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                Full name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] placeholder:text-[#477A50]/50 focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
                />
                <User className="absolute right-3.5 top-3.5 h-4 w-4 text-[#477A50]/50 pointer-events-none" />
              </div>
            </div>

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
                  placeholder="Your email address"
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
                  placeholder="Create a strong password (min 8 chars)"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                Confirm password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] placeholder:text-[#477A50]/50 focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
              />
            </div>

            {/* Account Purpose / Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                Account purpose
              </label>
              <select
                value={roleChoice}
                onChange={(e) => setRoleChoice(e.target.value as UserRole)}
                className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-3 text-sm text-[#102B20] focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
              >
                <option value="contributor">Community Contributor (Submit recordings & oral lore)</option>
                <option value="researcher">Researcher (Explore data & conduct linguistic research)</option>
                <option value="reviewer">Language Reviewer (Request Elder/Linguist review access)</option>
              </select>
              {roleChoice === "reviewer" && (
                <p className="mt-1 text-[11px] text-[#477A50] italic leading-tight">
                  Note: Language Reviewer privileges require customary community or academic verification. Your account will start with Contributor access until approved.
                </p>
              )}
            </div>

            {/* Clan / Community Affiliation (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-[#1F5138] uppercase tracking-wider mb-1.5">
                Community or Institution (Optional)
              </label>
              <input
                type="text"
                value={clanOrCommunity}
                onChange={(e) => setClanOrCommunity(e.target.value)}
                placeholder="e.g. Toda Buffalo Sanctuary, Gondi Koitur Circle"
                className="w-full rounded-xl bg-white/90 border border-[#A6C48A]/50 px-3.5 py-2.5 text-xs text-[#102B20] placeholder:text-[#477A50]/50 focus:outline-none focus:ring-2 focus:ring-[#1F5138] transition"
              />
            </div>

            {/* Customary OCAP Consent & Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#102B20]/85">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-[#A6C48A] text-[#1F5138] focus:ring-[#1F5138]"
                />
                <span className="leading-tight">
                  I agree to Voice Roots data stewardship terms and uphold customary OCAP® sovereignty (audio masters remain community property).
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#102B20] hover:bg-[#1F5138] text-[#F5F3E9] font-medium py-3.5 rounded-full transition shadow-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Link to Sign In */}
          <div className="mt-6 pt-5 border-t border-[#A6C48A]/30 text-center text-xs text-[#102B20]/75">
            <span>Already registered? </span>
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
