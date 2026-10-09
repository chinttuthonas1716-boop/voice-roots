"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  QrCode,
  Languages,
  BookOpen,
  Volume2,
  FileCheck,
  Share2,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  Check,
  Copy,
} from "lucide-react";
import { HeritageRecord, VerificationStatus } from "@/lib/passport";

interface HeritagePassportCardProps {
  record: HeritageRecord;
  interactive?: boolean;
}

export function HeritagePassportCard({ record: initialRecord, interactive = true }: HeritagePassportCardProps) {
  const [record, setRecord] = useState<HeritageRecord>(initialRecord);
  const [activeTab, setActiveTab] = useState<"front" | "audio" | "transcript" | "translations">("front");
  const [activeTransLang, setActiveTransLang] = useState<"en" | "te" | "hi" | "ta" | "kn" | "ml">("en");
  const [copied, setCopied] = useState(false);

  const cycleVerification = () => {
    if (!interactive) return;
    const flow: VerificationStatus[] = [
      "AI_PROCESSED",
      "HUMAN_REVIEWED",
      "COMMUNITY_VERIFIED",
    ];
    const currentIndex = flow.indexOf(record.verificationStatus);
    const nextStatus = flow[(currentIndex + 1) % flow.length];
    setRecord((prev) => ({
      ...prev,
      verificationStatus: nextStatus,
    }));
  };

  const copyPassportLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/passport/${record.storyId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl rounded-[32px] border-2 border-heritage-gold/40 bg-gradient-to-b from-royal-indigo/95 via-[#140E0C]/95 to-obsidian/95 p-6 sm:p-10 shadow-2xl backdrop-blur-3xl text-warm-ivory relative overflow-hidden">
      {/* Guilloche Border Accent Glow */}
      <div className="pointer-events-none absolute inset-0 border border-heritage-gold/20 rounded-[30px] m-1" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-heritage-gold/10 blur-[80px]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-heritage-teal/10 blur-[80px]" />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-heritage-gold/20 border border-heritage-gold/40 text-heritage-gold shadow-gold-glow">
            <span className="text-xl">📜</span>
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-heritage-gold uppercase">
              Voice Roots International Registry
            </span>
            <h3 className="text-2xl font-black tracking-wider text-warm-ivory">
              HERITAGE PASSPORT
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-mono text-base font-black tracking-widest text-heritage-gold">
              {record.recordId}
            </span>
            <p className="text-[10px] font-mono text-soft-lavender">ISO-OACP Preserved · 2026</p>
          </div>

          <button
            type="button"
            onClick={copyPassportLink}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-soft-lavender hover:text-warm-ivory hover:bg-white/10 transition"
            title="Copy passport URL"
          >
            {copied ? <Check className="h-4 w-4 text-heritage-teal" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 py-3 overflow-x-auto scrollbar-none">
        {[
          { id: "front", label: "Front Document" },
          { id: "audio", label: "Acoustic Master" },
          { id: "transcript", label: "Verified Transcript" },
          { id: "translations", label: "Multi-Lingual" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`min-h-8 rounded-full px-4 text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-heritage-gold text-[#0C0908] shadow-gold-glow"
                : "text-soft-lavender hover:text-warm-ivory hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: FRONT DOCUMENT */}
      {activeTab === "front" && (
        <div className="space-y-6 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {/* Scannable QR Code */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-5 text-center space-y-3">
              <div className="rounded-xl bg-white p-2.5 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={record.qrCodeUrl}
                  alt="Passport QR Code"
                  className="h-36 w-36 object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-heritage-teal font-bold">
                  <QrCode className="h-3 w-3" /> SCANNABLE AUDIT TOKEN
                </span>
                <p className="text-[10px] text-soft-lavender font-mono truncate max-w-[160px]">
                  {record.qrToken}
                </p>
              </div>
            </div>

            {/* Cultural Metadata */}
            <div className="sm:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase text-soft-lavender">
                  Oral Tradition / Cultural Artifact
                </span>
                <h4 className="text-2xl font-bold text-warm-ivory">
                  {record.title}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-soft-lavender">Original Spoken Language</span>
                  <p className="font-bold text-warm-ivory flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5 text-heritage-teal" /> {record.originalLanguage}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-soft-lavender">Regional Dialect</span>
                  <p className="font-bold text-warm-ivory">{record.dialect || "Adilabad River Variety"}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-soft-lavender">Community Custodians</span>
                  <p className="font-bold text-warm-ivory">{record.community}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-soft-lavender">Geographic Locus</span>
                  <p className="font-bold text-warm-ivory">{record.region}</p>
                </div>
              </div>

              {/* Verification Status Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-heritage-gold/30 bg-heritage-gold/10 p-3.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-heritage-gold" />
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-heritage-gold uppercase">
                      Provenance Certification
                    </span>
                    <span className="text-xs font-bold text-warm-ivory">
                      {record.verificationStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {interactive && (
                  <button
                    type="button"
                    onClick={cycleVerification}
                    className="rounded-full border border-heritage-gold/40 bg-heritage-gold/20 px-3 py-1 text-[11px] font-bold text-heritage-gold hover:bg-heritage-gold/30 transition"
                  >
                    Cycle Status ↻
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACOUSTIC MASTER */}
      {activeTab === "audio" && (
        <div className="space-y-4 pt-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-warm-ivory flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-heritage-teal" /> 48kHz Acoustic Master Recording
              </span>
              <span className="font-mono text-soft-lavender">{record.audioDuration} · WAV/Lossless</span>
            </div>
            <audio src={record.audioUrl} controls className="w-full" />
            <p className="text-xs text-soft-lavender">
              Preserved with byte-level immutability. Original acoustic resonance is kept as the authentic cultural master.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED TRANSCRIPT */}
      {activeTab === "transcript" && (
        <div className="space-y-4 pt-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="font-bold text-warm-ivory">Source Speech Transcript ({record.originalLanguage})</span>
              <span className="font-mono text-[10px] text-heritage-teal font-bold">NEVER REPLACED</span>
            </div>
            <blockquote className="text-base sm:text-lg text-warm-ivory/95 leading-relaxed font-medium italic">
              &ldquo;{record.transcript}&rdquo;
            </blockquote>
          </div>
        </div>
      )}

      {/* TAB 4: TRANSLATIONS */}
      {activeTab === "translations" && (
        <div className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            {[
              { code: "en", label: "English" },
              { code: "te", label: "Telugu (తెలుగు)" },
              { code: "hi", label: "Hindi (हिन्दी)" },
              { code: "ta", label: "Tamil (தமிழ்)" },
              { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
              { code: "ml", label: "Malayalam (മലയാളം)" },
            ].map((t) => (
              <button
                key={t.code}
                type="button"
                onClick={() => setActiveTransLang(t.code as any)}
                className={`min-h-8 rounded-full px-3.5 text-xs font-bold transition ${
                  activeTransLang === t.code
                    ? "bg-heritage-teal text-[#0C0908] shadow-teal-glow font-bold"
                    : "border border-white/10 text-soft-lavender hover:text-warm-ivory"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-soft-lavender">
              <span className="font-semibold text-heritage-teal">IndicTrans2 Neural Layer:</span>
              <span>96.4% Context Match</span>
            </div>
            <p className="text-sm sm:text-base text-warm-ivory/90 leading-relaxed">
              {record.translations[activeTransLang] || record.translations.en || "Translation ready."}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Link
            href={`/passport/${record.storyId}`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 font-bold text-warm-ivory hover:bg-white/10 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Full Passport URL
          </Link>
          <Link
            href={`/recordings/${record.storyId}`}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 font-bold text-warm-ivory hover:bg-white/10 transition"
          >
            Story Dossier
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-heritage-gold/30 bg-heritage-gold/10 px-4 font-bold text-heritage-gold hover:bg-heritage-gold/20 transition"
          >
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
