"use client";

import React from "react";
import {
  Mic,
  Languages,
  FileText,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Clock,
  Award,
} from "lucide-react";

export interface TimelineStage {
  id: string;
  title: string;
  subtitle: string;
  timestamp?: string;
  status: "completed" | "active" | "pending";
  icon: React.ComponentType<{ className?: string }>;
  detail?: string;
}

interface PreservationTimelineProps {
  language?: string;
  confidence?: string;
  reviewerName?: string;
  passportId?: string;
  currentStageIndex?: number;
}

export function PreservationTimeline({
  language = "Telugu (తెలుగు)",
  confidence = "98.4%",
  reviewerName = "Elder Soyam Laxman",
  passportId = "VR-2026-0001",
  currentStageIndex = 6,
}: PreservationTimelineProps) {
  const stages: TimelineStage[] = [
    {
      id: "recorded",
      title: "Audio Captured",
      subtitle: "Lossless 48kHz acoustic master recorded with speaker consent.",
      status: currentStageIndex >= 0 ? "completed" : "pending",
      icon: Mic,
      detail: "Lossless WAV • Speaker Consent Signed",
    },
    {
      id: "detected",
      title: "Language Detected",
      subtitle: `Acoustic model identified spoken tongue as ${language}.`,
      status: currentStageIndex >= 1 ? "completed" : "pending",
      icon: Languages,
      detail: `${language} • Regional Dialect`,
    },
    {
      id: "transcribed",
      title: "Phoneme Transcribed",
      subtitle: `Original spoken words converted to native script with ${confidence} confidence.`,
      status: currentStageIndex >= 2 ? "completed" : "pending",
      icon: FileText,
      detail: `Whisper-Indic • Confidence ${confidence}`,
    },
    {
      id: "translated",
      title: "Multi-Tongue Translated",
      subtitle: "Spoken wisdom translated across 13+ regional & indigenous tongues without altering original.",
      status: currentStageIndex >= 3 ? "completed" : "pending",
      icon: Sparkles,
      detail: "Multi-Language Preserved • Original Intact",
    },
    {
      id: "reviewed",
      title: "Human Elder Reviewed",
      subtitle: `Verified by certified community custodian ${reviewerName}.`,
      status: currentStageIndex >= 4 ? "completed" : "pending",
      icon: Award,
      detail: `Verified by ${reviewerName} ✓`,
    },
    {
      id: "preserved",
      title: "Cryptographically Preserved",
      subtitle: "Immutable SHA-256 provenance hash & AES-256-GCM encrypted backup committed.",
      status: currentStageIndex >= 5 ? "completed" : "pending",
      icon: ShieldCheck,
      detail: "OCAP Sovereignty • SHA-256 Provenance Chain",
    },
    {
      id: "passport",
      title: "Heritage Passport Issued",
      subtitle: `Official Digital Heritage Passport created with scannable QR certificate.`,
      status: currentStageIndex >= 6 ? "completed" : "pending",
      icon: QrCode,
      detail: `ID: ${passportId} • Camera Scannable QR`,
    },
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-2xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5" /> Preservation Provenance Timeline
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">
            Ethical Voice Preservation Journey
          </h3>
          <p className="text-xs text-slate-400">
            A clear audit trail of what happened to this voice recording from oral capture to global passport.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Human Verified Record
          </span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-teal-400 before:to-violet-500">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = stage.status === "completed";

          return (
            <div key={stage.id} className="relative group">
              {/* Timeline Pin Indicator */}
              <div
                className={`absolute -left-[30px] sm:-left-[35px] top-1 grid h-7 w-7 place-items-center rounded-full border text-xs transition ${
                  isDone
                    ? "border-amber-400 bg-amber-400 text-black shadow-amber-glow font-bold"
                    : "border-white/20 bg-[#080A12] text-slate-500"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span>{idx + 1}</span>}
              </div>

              {/* Stage Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-amber-500/40 hover:bg-white/[0.05]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-amber-400 shrink-0" />
                    <h4 className="text-sm font-bold text-white">{stage.title}</h4>
                  </div>
                  {stage.detail && (
                    <span className="text-[10px] font-mono text-teal-300 rounded-md border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 self-start sm:self-auto">
                      {stage.detail}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
