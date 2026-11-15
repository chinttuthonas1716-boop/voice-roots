"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Globe,
  Trees,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { registerUser, saveActiveUser, type UserRole } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState("Gondi");
  const [region, setRegion] = useState("");
  const [community, setCommunity] = useState("");
  const [role, setRole] = useState<UserRole>("contributor");
  const [consentGiven, setConsentGiven] = useState(true);

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    if (!consentGiven) {
      errs.consent = "You must agree to OCAP® Indigenous Data Sovereignty guidelines.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          region: region.trim(),
          community: community.trim(),
          preferredLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          saveActiveUser(data.user);
        }
      } else {
        // Fallback to client-side auth store if server returns non-200
        registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          clanOrCommunity: community.trim() || "Oral Heritage Community",
          languages: [preferredLanguage, "English"],
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch {
      // Local storage fallback for offline / self-contained workflow
      try {
        registerUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          clanOrCommunity: community.trim() || "Oral Heritage Community",
          languages: [preferredLanguage, "English"],
        });
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 900);
      } catch (localErr: any) {
        setApiError(localErr?.message || "Registration failed. Please check credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden w-full text-[#F5F3E9] bg-[#071A13]">
      {/* Cinematic Rainforest Background Layer */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-opacity duration-1000 z-0"
        style={{ backgroundImage: "url('/images/rainforest_canopy.jpg')" }}
      />
      {/* Dark Forest Atmospheric Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#071A13]/90 via-[#102B20]/80 to-[#071A13]/95 z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(166,196,138,0.12)_0%,transparent_50%)] pointer-events-none z-0" />

      <Navbar />

      <main className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Left Column: Forest Heritage Context (Reference: Image 3 Left Side) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102B20]/80 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] backdrop-blur-md">
              <Trees className="w-3.5 h-3.5 text-[#A6C48A]" />
              <span className="tracking-wider uppercase text-[11px]">COMMUNITY STEWARDSHIP</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F3E9] leading-tight">
                Be a Part of <br />
                <span className="text-[#A6C48A]">Collective Action.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#DCE9D7]/85 leading-relaxed font-light">
                Preserve oral languages, songs, and indigenous memories across all dialects and language sources with cryptographic audio integrity and community sovereignty.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#102B20]/60 border border-[#A6C48A]/20 backdrop-blur-md">
                <Shield className="w-5 h-5 text-[#A6C48A] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold text-[#F5F3E9]">OCAP® Principles</h2>
                  <p className="text-[11px] text-[#DCE9D7]/75">Ownership, Control, Access, and Possession remain with indigenous speakers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#102B20]/60 border border-[#A6C48A]/20 backdrop-blur-md">
                <Globe className="w-5 h-5 text-[#A6C48A] shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold text-[#F5F3E9]">Universal Oral Registry</h2>
                  <p className="text-[11px] text-[#DCE9D7]/75">Not limited to any single language source; supporting open low-resource tongues.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-[#DCE9D7]/60">
              Already have an account?{" "}
              <Link href="/login" className="text-[#A6C48A] hover:underline font-semibold">
                Sign in here
              </Link>
            </div>
          </div>

          {/* Right Column: Frosted Glass Registration Card (Reference: Image 3 Translucent Card) */}
          <div className="lg:col-span-7 w-full">
            <div className="forest-glass-panel p-6 sm:p-8 relative overflow-hidden rounded-3xl border border-[#A6C48A]/30 bg-[#102B20]/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(7,26,19,0.7)]">
              {/* Header inside Card */}
              <div className="flex items-center justify-between pb-4 border-b border-[#A6C48A]/15 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3E9] tracking-tight">Create Account</h2>
                  <p className="text-xs text-[#DCE9D7]/75">Join as an oral storyteller, reviewer, or listener</p>
                </div>
                <div className="flex bg-[#071A13]/60 p-1 rounded-xl border border-[#A6C48A]/20 text-xs">
                  <Link
                    href="/login"
                    className="px-3 py-1 rounded-lg text-[#DCE9D7]/70 hover:text-white transition"
                  >
                    Login
                  </Link>
                  <span className="px-3 py-1 rounded-lg bg-[#1F5138] text-[#F5F3E9] font-semibold">
                    Sign Up
                  </span>
                </div>
              </div>

              {/* Status Alerts */}
              {apiError && (
                <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-500/40 flex items-center gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {isSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-900/40 border border-emerald-500/40 flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Account created successfully! Redirecting to dashboard...</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#DCE9D7]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]/70 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Suman Kumra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] focus:ring-1 focus:ring-[#A6C48A] transition"
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#DCE9D7]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]/70 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="storyteller@voiceroots.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] focus:ring-1 focus:ring-[#A6C48A] transition"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-400">{errors.email}</p>}
                </div>

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#DCE9D7]">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]/70 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] focus:ring-1 focus:ring-[#A6C48A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6C48A]/70 hover:text-white p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-red-400">{errors.password}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#DCE9D7]">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]/70 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] focus:ring-1 focus:ring-[#A6C48A] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6C48A]/70 hover:text-white p-1"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[11px] text-red-400">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Oral Language & Role Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#DCE9D7]">Primary Oral Language</label>
                    <input
                      type="text"
                      placeholder="e.g. Gondi / Koya / Santhali"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] focus:ring-1 focus:ring-[#A6C48A] transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#DCE9D7]">Preservation Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/80 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs focus:outline-none focus:border-[#A6C48A] transition"
                    >
                      <option value="contributor">Oral Storyteller / Contributor</option>
                      <option value="listener">Cultural Heritage Listener</option>
                      <option value="reviewer">Community Elder / Reviewer</option>
                      <option value="admin">Archive Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Region & Clan Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#DCE9D7]">Region / Homeland</label>
                    <input
                      type="text"
                      placeholder="e.g. Adilabad / Utnoor"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] focus:ring-1 focus:ring-[#A6C48A] transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#DCE9D7]">Clan or Community</label>
                    <input
                      type="text"
                      placeholder="e.g. Koitur Clan Circle"
                      value={community}
                      onChange={(e) => setCommunity(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] focus:ring-1 focus:ring-[#A6C48A] transition"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded bg-[#071A13] border-[#A6C48A]/40 text-[#1F5138] focus:ring-[#A6C48A]"
                    />
                    <span className="text-xs text-[#DCE9D7]/85 group-hover:text-white transition-colors leading-relaxed">
                      I agree to the <span className="text-[#A6C48A] font-semibold">OCAP® Indigenous Data Sovereignty</span> principles and certify my contributions honor community oral consent.
                    </span>
                  </label>
                  {errors.consent && <p className="text-[11px] text-red-400 mt-1">{errors.consent}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] font-bold text-sm border border-[#A6C48A]/40 shadow-lg shadow-[#102B20]/60 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-5 border-t border-[#A6C48A]/15 text-center text-xs text-[#DCE9D7]/65 backdrop-blur-md bg-black/20">
        Voice Roots • Cultural Heritage Preservation Engine • OCAP® Data Sovereignty Compliant
      </footer>
    </div>
  );
}
