"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Globe,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
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
  const [preferredLanguage, setPreferredLanguage] = useState("Telugu (తెలుగు)");
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
      errs.email = "Email is required.";
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
      errs.consent = "You must agree to community oral consent guidelines.";
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
          name,
          email,
          password,
          role,
          region,
          community,
          preferredLanguage,
        }),
      });

      const data = await res.json();

      if (data.user) {
        saveActiveUser(data.user);
      } else {
        registerUser({
          name,
          email,
          password,
          role,
          clanOrCommunity: community || "Community Oral Circle",
          languages: [preferredLanguage, "English"],
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setApiError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vr-app flex flex-col justify-between min-h-screen">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Narrative */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="eyebrow">
              COMMUNITY STEWARDSHIP PROTOCOL
            </span>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Join <span className="text-[#F9B17A]">Voice Roots</span>
              </h1>
              <p className="text-sm sm:text-base text-[#D9D9E2] leading-relaxed font-light">
                Help preserve endangered oral traditions, generational chants,
                and ancestral languages with cryptographic provenance and
                community sovereignty.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[rgba(66,71,108,0.3)] border border-white/10 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 flex items-center justify-center shrink-0 text-[#F9B17A]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    OCAP Indigenous Sovereignty
                  </h4>
                  <p className="text-[11px] text-[#A9AEC5] leading-normal">
                    Ownership, Control, Access, and Possession remain permanently with elders and local custodians.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[rgba(66,71,108,0.3)] border border-white/10 backdrop-blur-md">
                <div className="w-9 h-9 rounded-xl bg-[#6F76A0]/20 border border-[#6F76A0]/40 flex items-center justify-center shrink-0 text-[#F9B17A]">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Multilingual Indic AI
                  </h4>
                  <p className="text-[11px] text-[#A9AEC5] leading-normal">
                    IndicTrans2 bidirectional translation preserving nuances of Gondi, Koya, Lambadi, and Telugu.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-[#A9AEC5]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#F9B17A] font-medium hover:underline"
              >
                Sign in to your archive
              </Link>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-[28px] border border-white/12 bg-[rgba(66,71,108,0.35)] backdrop-blur-2xl shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Create Custodian Account
                </h2>
                <p className="text-xs text-[#A9AEC5] mt-1">
                  Enter your details to register as a storyteller, linguist, or listener.
                </p>
              </div>

              {apiError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                  {apiError}
                </div>
              )}

              {isSuccess && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Account created successfully! Redirecting to home...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#D9D9E2]">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Koya"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#42476C]/75 text-white text-xs outline-none focus:border-[#F9B17A]"
                    />
                    {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#D9D9E2]">Email Address *</label>
                    <input
                      type="email"
                      placeholder="name@community.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#42476C]/75 text-white text-xs outline-none focus:border-[#F9B17A]"
                    />
                    {errors.email && <p className="text-[11px] text-red-400">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#D9D9E2]">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-xl border border-white/10 bg-[#42476C]/75 text-white text-xs outline-none focus:border-[#F9B17A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-[#A9AEC5] hover:text-white"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-red-400">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#D9D9E2]">Confirm Password *</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#42476C]/75 text-white text-xs outline-none focus:border-[#F9B17A]"
                    />
                    {errors.confirmPassword && <p className="text-[11px] text-red-400">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Cultural Context Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-medium text-[#D9D9E2] block mb-1.5">
                      Preferred Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full h-12 bg-[#42476C]/75 border border-white/10 text-white rounded-xl px-4 text-xs outline-none focus:border-[#F9B17A]"
                    >
                      <option value="Telugu (తెలుగు)">Telugu (తెలుగు)</option>
                      <option value="Gondi (గోండీ)">Gondi (గోండీ)</option>
                      <option value="Koya (కోయ)">Koya (కోయ)</option>
                      <option value="Lambadi (లంబాడీ)">Lambadi (లంబాడీ)</option>
                      <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                      <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                      <option value="Kannada (ಕನ್ನಡ)">Kannada (ಕನ್ನಡ)</option>
                      <option value="Malayalam (മലയാളം)">Malayalam (മലയാളം)</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#D9D9E2] block mb-1.5">
                      Custodian Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full h-12 bg-[#42476C]/75 border border-white/10 text-white rounded-xl px-4 text-xs outline-none focus:border-[#F9B17A]"
                    >
                      <option value="contributor">Oral Storyteller / Contributor</option>
                      <option value="listener">Cultural Heritage Listener</option>
                      <option value="reviewer">Community Elder / Reviewer</option>
                      <option value="admin">Archive Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#D9D9E2]">Region / Homeland</label>
                    <input
                      type="text"
                      placeholder="e.g. Bastar / Adilabad"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#42476C]/75 text-white text-xs outline-none focus:border-[#F9B17A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#D9D9E2]">Clan or Community</label>
                    <input
                      type="text"
                      placeholder="e.g. Koitur Clan Circle"
                      value={community}
                      onChange={(e) => setCommunity(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#42476C]/75 text-white text-xs outline-none focus:border-[#F9B17A]"
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded bg-white/10 border-white/20 text-[#F9B17A] focus:ring-[#F9B17A]/40"
                    />
                    <span className="text-xs text-[#A9AEC5] group-hover:text-white transition-colors leading-relaxed">
                      I agree to the{" "}
                      <span className="text-[#F9B17A] font-medium">
                        OCAP Indigenous Data Sovereignty
                      </span>{" "}
                      guidelines and certify my contributions honor ancestral consent.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-xs text-red-400 mt-1">{errors.consent}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="vr-button vr-button-primary flex-1 !min-h-12 text-sm font-bold"
                  >
                    <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  <Link href="/login" className="sm:w-auto">
                    <button
                      type="button"
                      className="vr-button vr-button-secondary w-full sm:w-auto !min-h-12 text-sm font-semibold"
                    >
                      Sign In Instead
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-white/8 text-center text-xs text-[#A9AEC5]">
        Voice Roots Cultural Preservation Engine • OCAP Data Sovereignty Compliant
      </footer>
    </div>
  );
}
