"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Globe,
  Users,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { transitionStory, type PreservationWorkflow } from "@/lib/workflow";
import type { UserProfile } from "@/lib/auth";

type AccessLevel = "public" | "community" | "private" | "restricted";

export default function ConsentPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";
  const router = useRouter();

  const [consentPreserve, setConsentPreserve] = useState(true);
  const [consentTranscribe, setConsentTranscribe] = useState(true);
  const [consentTranslate, setConsentTranslate] = useState(true);
  const [consentAiAnalysis, setConsentAiAnalysis] = useState(true);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("public");
  const [contributorName, setContributorName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <WorkflowGuard
      route="/consent"
      storyId={storyId}
      currentPhaseNumber={6}
    >
      {(workflow: PreservationWorkflow, user: UserProfile) => {
        const handleConfirmConsent = () => {
          if (!consentPreserve) {
            setErrorMessage("Preservation consent is mandatory to store the oral memory.");
            return;
          }

          const result = transitionStory(
            storyId,
            {
              type: "CONFIRM_CONSENT",
              consent: {
                preserve: consentPreserve,
                transcribe: consentTranscribe,
                translate: consentTranslate,
                aiAnalysis: consentAiAnalysis,
                accessLevel,
                contributorName: contributorName || user.name,
              },
            },
            user
          );

          if (result.success) {
            router.push(`/verification/${storyId}`);
          } else {
            setErrorMessage(result.error || "Failed to confirm consent.");
          }
        };

        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Phase 06 — Community Sovereignty & Consent</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Traditional Knowledge Consent & Access Level
              </h1>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-2xl">
                In strict adherence to OCAP® principles (Ownership, Control, Access, Possession), indigenous contributors define exactly how their voices are preserved, heard, and shared.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Access Level Selector */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#F9B17A]" />
                Select Cultural Access Tier
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Public */}
                <div
                  onClick={() => setAccessLevel("public")}
                  className={`cursor-pointer rounded-2xl border p-4.5 transition ${
                    accessLevel === "public"
                      ? "border-[#F9B17A] bg-[#F9B17A]/10 text-white shadow-md shadow-[#F9B17A]/10"
                      : "border-white/10 bg-white/5 text-[#A9AEC5] hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      <Globe className="w-4 h-4 text-[#F9B17A]" /> Public Heritage
                    </span>
                    <input
                      type="radio"
                      checked={accessLevel === "public"}
                      onChange={() => setAccessLevel("public")}
                      className="accent-[#F9B17A]"
                    />
                  </div>
                  <p className="text-xs text-[#D9D9E2] leading-relaxed">
                    Open for global educational listening, research citation, and public museum placard QR displays.
                  </p>
                </div>

                {/* Community Only */}
                <div
                  onClick={() => setAccessLevel("community")}
                  className={`cursor-pointer rounded-2xl border p-4.5 transition ${
                    accessLevel === "community"
                      ? "border-[#F9B17A] bg-[#F9B17A]/10 text-white shadow-md shadow-[#F9B17A]/10"
                      : "border-white/10 bg-white/5 text-[#A9AEC5] hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      <Users className="w-4 h-4 text-[#F9B17A]" /> Community Circle Only
                    </span>
                    <input
                      type="radio"
                      checked={accessLevel === "community"}
                      onChange={() => setAccessLevel("community")}
                      className="accent-[#F9B17A]"
                    />
                  </div>
                  <p className="text-xs text-[#D9D9E2] leading-relaxed">
                    Accessible strictly to verified members and elders of {workflow.culturalContext?.community || "the local tribe"}.
                  </p>
                </div>

                {/* Private */}
                <div
                  onClick={() => setAccessLevel("private")}
                  className={`cursor-pointer rounded-2xl border p-4.5 transition ${
                    accessLevel === "private"
                      ? "border-[#F9B17A] bg-[#F9B17A]/10 text-white shadow-md shadow-[#F9B17A]/10"
                      : "border-white/10 bg-white/5 text-[#A9AEC5] hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      <Lock className="w-4 h-4 text-[#F9B17A]" /> Private Contributor
                    </span>
                    <input
                      type="radio"
                      checked={accessLevel === "private"}
                      onChange={() => setAccessLevel("private")}
                      className="accent-[#F9B17A]"
                    />
                  </div>
                  <p className="text-xs text-[#D9D9E2] leading-relaxed">
                    Visible exclusively to you and your verified heirs. Encrypted at rest.
                  </p>
                </div>

                {/* Restricted */}
                <div
                  onClick={() => setAccessLevel("restricted")}
                  className={`cursor-pointer rounded-2xl border p-4.5 transition ${
                    accessLevel === "restricted"
                      ? "border-[#F9B17A] bg-[#F9B17A]/10 text-white shadow-md shadow-[#F9B17A]/10"
                      : "border-white/10 bg-white/5 text-[#A9AEC5] hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                      <EyeOff className="w-4 h-4 text-[#F9B17A]" /> Sacred / Restricted
                    </span>
                    <input
                      type="radio"
                      checked={accessLevel === "restricted"}
                      onChange={() => setAccessLevel("restricted")}
                      className="accent-[#F9B17A]"
                    />
                  </div>
                  <p className="text-xs text-[#D9D9E2] leading-relaxed">
                    Subject to ritual seasonal playback permissions (e.g., harvest rites or funerary cycles).
                  </p>
                </div>
              </div>
            </div>

            {/* Granular Permissions Checkboxes */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#F9B17A]" />
                Preservation Authorizations
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPreserve}
                    onChange={(e) => setConsentPreserve(e.target.checked)}
                    className="mt-1 accent-[#F9B17A] h-4 w-4"
                  />
                  <div className="text-xs">
                    <strong className="text-white block">Oral Audio Preservation</strong>
                    <span className="text-[#A9AEC5]">
                      I authorize permanent archival storage of this 48kHz audio master in community custody.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentTranscribe}
                    onChange={(e) => setConsentTranscribe(e.target.checked)}
                    className="mt-1 accent-[#F9B17A] h-4 w-4"
                  />
                  <div className="text-xs">
                    <strong className="text-white block">Phonetic Transcription</strong>
                    <span className="text-[#A9AEC5]">
                      I authorize Whisper-Indic acoustic tokenization and script representation.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentTranslate}
                    onChange={(e) => setConsentTranslate(e.target.checked)}
                    className="mt-1 accent-[#F9B17A] h-4 w-4"
                  />
                  <div className="text-xs">
                    <strong className="text-white block">Cross-Language Translation</strong>
                    <span className="text-[#A9AEC5]">
                      I authorize translation into official Indian languages for cross-community comprehension.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAiAnalysis}
                    onChange={(e) => setConsentAiAnalysis(e.target.checked)}
                    className="mt-1 accent-[#F9B17A] h-4 w-4"
                  />
                  <div className="text-xs">
                    <strong className="text-white block">Cultural Context Extraction</strong>
                    <span className="text-[#A9AEC5]">
                      I authorize contextualization within Voice Roots knowledge base (zero unconsented AI training).
                    </span>
                  </div>
                </label>
              </div>

              {/* Contributor Signature */}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A9AEC5] mb-1.5">
                  Contributor Attestation Signature:
                </label>
                <input
                  type="text"
                  placeholder={user.name || "Enter your full name or community clan..."}
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full sm:w-1/2 rounded-xl border border-white/15 bg-[#2D3250] px-4 py-2.5 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10">
                <Link
                  href={`/cultural-context/${storyId}`}
                  className="text-xs text-[#A9AEC5] hover:text-white transition"
                >
                  ← Back to Cultural Context
                </Link>

                <button
                  onClick={handleConfirmConsent}
                  className="vr-button vr-button-primary !py-3 !px-8 text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F9B17A]/25"
                >
                  <span>Confirm Consent & Submit for Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </WorkflowGuard>
  );
}

