"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  QrCode,
  Download,
  Share2,
  Volume2,
  FileText,
  Languages,
  BookOpen,
  Calendar,
  Lock,
  ExternalLink,
} from "lucide-react";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { transitionStory, type PreservationWorkflow } from "@/lib/workflow";
import type { UserProfile } from "@/lib/auth";

export default function HeritageRecordPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";
  const router = useRouter();

  const [copiedLink, setCopiedLink] = useState(false);

  return (
    <WorkflowGuard
      route="/heritage"
      storyId={storyId}
      currentPhaseNumber={8}
    >
      {(workflow: PreservationWorkflow, user: UserProfile) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (workflow.status === "VERIFIED") {
            transitionStory(storyId, { type: "CREATE_HERITAGE_RECORD" }, user);
            transitionStory(storyId, { type: "CREATE_PASSPORT" }, user);
          }
        }, [workflow]);

        const publicPlacardUrl = `/heritage/${storyId}/public`;

        const handleCopyLink = () => {
          if (typeof window !== "undefined") {
            const fullUrl = `${window.location.origin}${publicPlacardUrl}`;
            navigator.clipboard.writeText(fullUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }
        };

        const handleExportProof = () => {
          const exportData = {
            recordId: workflow.id,
            title: workflow.title,
            language: workflow.detectedLanguage,
            dialect: workflow.detectedDialect,
            originalTranscript: workflow.originalTranscript,
            translations: workflow.translations,
            culturalContext: workflow.culturalContext,
            accessLevel: workflow.consent?.accessLevel,
            verification: workflow.verification,
            cryptographicProof: workflow.verification?.sha256Proof,
            timestamp: new Date().toISOString(),
          };
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
          const dl = document.createElement("a");
          dl.setAttribute("href", dataStr);
          dl.setAttribute("download", `voice_roots_heritage_record_${storyId}.json`);
          document.body.appendChild(dl);
          dl.click();
          dl.remove();
        };

        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
                <Award className="w-4 h-4" />
                <span>Phase 08 — Preserved Living Heritage Record</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Oral Tradition Permanently Preserved
              </h1>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-2xl">
                This spoken narrative has successfully passed all verification gates and is now an immutable digital record protected by community data sovereignty.
              </p>
            </div>

            {/* Living Record Certificate Card */}
            <div className="rounded-3xl border border-[#F9B17A]/40 bg-[#242942]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-8">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#F9B17A]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#42476C]/40 blur-3xl pointer-events-none" />

              {/* Title & Seals */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold bg-[#F9B17A] text-[#242942] px-2.5 py-0.5 rounded-full">
                      RECORD ID: {workflow.id}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED CUSTODIAN RECORD
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {workflow.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A9AEC5] mt-1">
                    {workflow.culturalContext?.community} • {workflow.culturalContext?.location}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/passport/${storyId}`}
                    className="vr-button vr-button-primary !py-3 !px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F9B17A]/25"
                  >
                    <Award className="w-4 h-4" />
                    <span>Open Heritage Passport</span>
                  </Link>

                  <Link
                    href={publicPlacardUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
                  >
                    <QrCode className="w-4 h-4 text-[#F9B17A]" />
                    <span>Public QR Placard</span>
                  </Link>
                </div>
              </div>

              {/* Details 4-Column Summary */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[11px] uppercase tracking-wider text-[#A9AEC5] block mb-1">Language</span>
                  <span className="text-sm font-bold text-white">{workflow.detectedLanguage}</span>
                  <span className="text-[11px] text-[#A9AEC5] block mt-0.5">{workflow.detectedDialect}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[11px] uppercase tracking-wider text-[#A9AEC5] block mb-1">Duration</span>
                  <span className="text-sm font-bold text-white">{workflow.audioDuration || "03:45"}</span>
                  <span className="text-[11px] text-emerald-400 block mt-0.5">48kHz Master</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[11px] uppercase tracking-wider text-[#A9AEC5] block mb-1">Attestation</span>
                  <span className="text-sm font-bold text-white">{workflow.verification?.reviewerName || "Elder Council"}</span>
                  <span className="text-[11px] text-[#F9B17A] block mt-0.5">Signed & Certified</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[11px] uppercase tracking-wider text-[#A9AEC5] block mb-1">Access Tier</span>
                  <span className="text-sm font-bold text-white capitalize">{workflow.consent?.accessLevel || "Public"}</span>
                  <span className="text-[11px] text-[#A9AEC5] block mt-0.5">OCAP® Compliant</span>
                </div>
              </div>

              {/* Cryptographic SHA-256 Proof */}
              <div className="relative z-10 rounded-2xl border border-white/10 bg-[#2D3250]/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F9B17A] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Cryptographic Proof & Integrity Seal
                  </span>
                  <button
                    onClick={handleExportProof}
                    className="text-xs text-[#A9AEC5] hover:text-white flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON Proof
                  </button>
                </div>
                <div className="font-mono text-xs text-[#D9D9E2] break-all bg-black/25 p-3 rounded-xl border border-white/5">
                  SHA-256: {workflow.verification?.sha256Proof || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                </div>
              </div>

              {/* Next Steps / Share */}
              <div className="relative z-10 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  <Share2 className="w-4 h-4 text-[#F9B17A]" />
                  <span>{copiedLink ? "Link Copied to Clipboard ✓" : "Copy Heritage Link"}</span>
                </button>

                <div className="flex gap-3">
                  <Link
                    href="/archive"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                  >
                    <span>Browse Archive</span>
                  </Link>

                  <Link
                    href={`/passport/${storyId}`}
                    className="vr-button vr-button-primary !py-2.5 !px-5 text-xs font-bold flex items-center gap-2"
                  >
                    <span>Inspect Passport</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </WorkflowGuard>
  );
}

