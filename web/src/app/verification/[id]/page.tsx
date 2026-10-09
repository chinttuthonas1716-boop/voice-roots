"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  User,
  Volume2,
  FileText,
  Languages,
  BookOpen,
  Lock,
  Award,
} from "lucide-react";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { transitionStory, type PreservationWorkflow } from "@/lib/workflow";
import type { UserProfile } from "@/lib/auth";

export default function VerificationPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";
  const router = useRouter();

  const [reviewerNotes, setReviewerNotes] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  return (
    <WorkflowGuard
      route="/verification"
      storyId={storyId}
      currentPhaseNumber={7}
    >
      {(workflow: PreservationWorkflow, user: UserProfile) => {
        const isAlreadyVerified =
          workflow.status === "VERIFIED" ||
          workflow.status === "HERITAGE_RECORD" ||
          workflow.status === "PASSPORT_CREATED" ||
          workflow.status === "PUBLISHED";

        const handleApprove = () => {
          const result = transitionStory(
            storyId,
            {
              type: "APPROVE_VERIFICATION",
              reviewerId: user.id,
              reviewerName: user.name,
              reviewerRole: user.roleTitle || "Elder Custodian",
              notes: reviewerNotes || "Verified authentic spoken oral tradition with community consent.",
              sha256Proof: `sha256_${Date.now()}_e3b0c44298fc1c149afbf4c8996fb92427ae41e4`,
            },
            user
          );

          if (result.success) {
            setActionFeedback("Attestation recorded! Advancing to permanent Heritage Record.");
            setTimeout(() => {
              router.push(`/heritage/${storyId}`);
            }, 900);
          }
        };

        const handleRequestChanges = () => {
          const result = transitionStory(
            storyId,
            {
              type: "REQUEST_CHANGES",
              reviewerId: user.id,
              notes: reviewerNotes || "Please clarify the seasonal harvest terms in transcript.",
            },
            user
          );

          if (result.success) {
            router.push(`/transcript/${storyId}`);
          }
        };

        const handleReject = () => {
          const result = transitionStory(
            storyId,
            {
              type: "REJECT",
              reviewerId: user.id,
              reason: reviewerNotes || "Record rejected due to lack of authentic community attribution.",
            },
            user
          );

          if (result.success) {
            router.push(`/story/${storyId}`);
          }
        };

        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Phase 07 — Elder Review & Cryptographic Provenance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Human Verification & Peer Attestation
              </h1>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-2xl">
                A verified oral record requires human community sign-off. Peer elders audit the acoustic master, transcript accuracy, and cultural governance before issuing a Heritage Passport.
              </p>
            </div>

            {actionFeedback && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* Dossier Review Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Comprehensive Narrative Audit */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Audio Master */}
                <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F9B17A] flex items-center gap-2">
                      <Volume2 className="w-4 h-4" /> 01 Audio Master Audit
                    </span>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold">
                      Lossless PCM
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{workflow.title}</div>
                  <audio
                    src={workflow.audioUrl || "/audio/harvest_song.wav"}
                    controls
                    className="w-full h-8"
                  />
                </div>

                {/* 2. Transcript & Translation */}
                <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F9B17A] flex items-center gap-2">
                      <FileText className="w-4 h-4" /> 02 Phonemic Script & Translation
                    </span>
                    <span className="text-xs text-[#D9D9E2] bg-white/10 px-2.5 py-0.5 rounded-full font-semibold">
                      {workflow.detectedLanguage || "Telugu"}
                    </span>
                  </div>
                  <p className="text-sm text-white font-serif leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5">
                    &ldquo;{workflow.originalTranscript}&rdquo;
                  </p>
                  {workflow.translations && (
                    <div className="pt-2">
                      <span className="text-[11px] text-[#A9AEC5] block mb-1">
                        Primary Translation:
                      </span>
                      <p className="text-xs text-[#D9D9E2] leading-relaxed">
                        {Object.values(workflow.translations)[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Cultural Context & Consent */}
                <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F9B17A] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> 03 Ethnographic Context & OCAP
                    </span>
                    <span className="text-xs text-[#F9B17A] bg-[#F9B17A]/15 px-2.5 py-0.5 rounded-full font-semibold">
                      Access: {workflow.consent?.accessLevel?.toUpperCase() || "PUBLIC"}
                    </span>
                  </div>
                  <p className="text-xs text-[#D9D9E2] leading-relaxed">
                    {workflow.culturalContext?.background}
                  </p>
                  <div className="text-[11px] text-[#A9AEC5] flex gap-4 pt-1">
                    <span>Community: {workflow.culturalContext?.community}</span>
                    <span>Region: {workflow.culturalContext?.location}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Custodian Action Panel */}
              <div className="space-y-6">
                <div className="rounded-3xl border border-[#F9B17A]/30 bg-[#242942]/95 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#F9B17A]" />
                      Reviewer Decision
                    </h2>
                    <p className="text-xs text-[#A9AEC5] mt-1">
                      Attesting Custodian: <strong className="text-white">{user.name}</strong> ({user.roleTitle})
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A9AEC5] mb-1.5">
                      Attestation Notes / Verification Seal:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Oral pronunciation and ritual lineage verified with elders."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-[#2D3250] p-3 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={handleApprove}
                      className="w-full vr-button vr-button-primary !py-3 !px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F9B17A]/25"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isAlreadyVerified ? "Re-Approve & View Record" : "Approve & Certify Heritage"}</span>
                    </button>

                    <button
                      onClick={handleRequestChanges}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Request Changes (Revert to Review)</span>
                    </button>

                    <button
                      onClick={handleReject}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-500/15 transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Oral Submission</span>
                    </button>
                  </div>

                  {isAlreadyVerified && (
                    <div className="pt-3 border-t border-white/10 text-center">
                      <Link
                        href={`/heritage/${storyId}`}
                        className="text-xs font-bold text-[#F9B17A] hover:underline flex items-center justify-center gap-1"
                      >
                        <span>View Permanent Heritage Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </WorkflowGuard>
  );
}

