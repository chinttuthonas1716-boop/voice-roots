"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Languages,
  MapPin,
  Users,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  QrCode,
  Lock,
  Globe,
  Award,
  Stamp,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { createHeritageRecordFromStored, type HeritageRecord, type VerificationStatus } from "@/lib/passport";

export default function HeritagePassportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "vr-106";

  const [customRecord, setCustomRecord] = useState<HeritageRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"front" | "audio" | "transcript" | "translations" | "provenance">("front");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("COMMUNITY_VERIFIED");
  const [selectedTransLang, setSelectedTransLang] = useState<"en" | "te" | "hi" | "ta" | "kn" | "ml">("en");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    const all = getUserRecordings();
    const stored = all.find((item) => item.id === id) || all[0];
    if (stored) {
      const passportRecord = createHeritageRecordFromStored(stored);
      setCustomRecord(passportRecord);
      setVerificationStatus(passportRecord.verificationStatus);
    }
  }, [id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const promoteVerification = () => {
    if (verificationStatus === "AI_PROCESSED") {
      setVerificationStatus("HUMAN_REVIEWED");
    } else if (verificationStatus === "HUMAN_REVIEWED") {
      setVerificationStatus("COMMUNITY_VERIFIED");
    } else {
      setVerificationStatus("AI_PROCESSED");
    }
  };

  return (
    <WorkflowGuard route="/passport" storyId={id} currentPhaseNumber={8}>
      {(workflow, user) => {
        const record = customRecord || createHeritageRecordFromStored({
          id: workflow.id,
          title: workflow.title,
          language: workflow.detectedLanguage || "Telugu",
          dialect: workflow.detectedDialect,
          duration: workflow.audioDuration || "03:45",
          durationSeconds: workflow.audioDurationSeconds || 225,
          type: "Spoken Oral Heritage",
          community: workflow.culturalContext?.community || "Living Heritage Circle",
          location: workflow.culturalContext?.location || "Deccan Region",
          culturalContext: workflow.culturalContext?.background || "",
          audioUrl: workflow.audioUrl || "/audio/harvest_song.wav",
          audioFileName: workflow.audioFileName || `${workflow.id}.wav`,
          audioFileSize: workflow.audioFileSize || 2048500,
          audioMimeType: "audio/wav",
          uploadDate: workflow.createdAt || new Date().toISOString(),
          sourceType: workflow.sourceType || "field_recording",
          originalTranscript: workflow.originalTranscript || "",
          translations: (workflow.translations || {}) as Record<"en" | "te" | "hi" | "ta" | "kn" | "ml", string>,
        });

        return (
          <div className="vr-app pb-28 print:bg-white print:text-black">
            <div className="print:hidden">
              <Navbar />
            </div>

      <main className="mx-auto max-w-4xl space-y-8 px-4 pt-10 sm:px-6 lg:px-8">
        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href={`/story/${record.storyId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A9AEC5] hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Story Details
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <Download className="h-3.5 w-3.5" /> Download / Print Passport
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#F9B17A]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Link Copied" : "Share Passport"}
            </button>
          </div>
        </div>

        {/* Passport Header Title */}
        <div className="text-center space-y-2 print:hidden">
          <span className="eyebrow">
            VERIFIED DIGITAL PROVENANCE RECORD · STEP 19 / 26
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Official Heritage Passport
          </h1>
          <p className="text-xs text-[#A9AEC5] max-w-md mx-auto">
            A consent-aware, community-verified digital artifact certifying the provenance, acoustic authenticity, and linguistic rights of this oral tradition.
          </p>
        </div>

        {/* ==================================================== */}
        {/* THE LIQUID GLASS HERITAGE PASSPORT DOCUMENT */}
        {/* ==================================================== */}
        <article className="relative overflow-hidden rounded-[2.5rem] border-2 border-[#F9B17A]/40 bg-[rgba(36,41,66,0.95)] p-6 sm:p-10 shadow-2xl print:border-black print:bg-white print:p-6 print:shadow-none backdrop-blur-2xl">
          {/* Subtle Decorative Rings */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[12px] border-[#F9B17A]/10 blur-sm print:hidden" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full border-[8px] border-[#6F76A0]/10 blur-sm print:hidden" />

          {/* Top Passport Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F9B17A]/20 pb-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#F9B17A] to-[#6F76A0] p-0.5 shadow-lg">
                <div className="grid h-full w-full place-items-center rounded-[14px] bg-[#242942]">
                  <Stamp className="h-6 w-6 text-[#F9B17A]" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#F9B17A] uppercase">
                  Voice Roots Registry · South Asia
                </p>
                <h2 className="text-xl font-black tracking-wider text-white print:text-black">
                  HERITAGE PASSPORT
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-sm font-black tracking-widest text-[#F9B17A]">
                {record.recordId}
              </span>
              <p className="text-[10px] font-mono text-[#A9AEC5]">
                ISO-OCAP Verified · 2026
              </p>
            </div>
          </div>

          {/* Passport Dossier Tabs */}
          <div
            role="tablist"
            aria-label="Passport Dossier Sections"
            className="flex items-center gap-2 border-b border-white/10 py-3 overflow-x-auto scrollbar-none print:hidden"
          >
            {[
              { id: "front", label: "Front Document" },
              { id: "audio", label: "Acoustic Master" },
              { id: "transcript", label: "Verified Transcript" },
              { id: "translations", label: "Translations" },
              { id: "provenance", label: "Provenance & Audit" },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`passport-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`passport-panel-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[44px] rounded-full px-4 text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#F9B17A] text-[#242942] shadow-sm"
                    : "text-[#A9AEC5] hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: FRONT DOCUMENT VIEW */}
          {activeTab === "front" && (
            <div
              role="tabpanel"
              id="passport-panel-front"
              aria-labelledby="passport-tab-front"
              className="space-y-6 pt-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                {/* QR Code & Digital Stamp Card */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#1e2238] p-5 text-center space-y-3">
                  <div className="rounded-xl bg-white p-2 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={record.qrCodeUrl}
                      alt="Passport QR Code for cryptographic verification"
                      className="h-36 w-36 object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#F9B17A] font-bold">
                      <QrCode className="h-3 w-3" /> SCANNABLE AUDIT TOKEN
                    </span>
                    <p className="text-[10px] text-[#A9AEC5] font-mono">
                      {record.qrToken}
                    </p>
                  </div>
                </div>

                {/* Main Cultural Metadata Ledger */}
                <div className="sm:col-span-2 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-[#A9AEC5]">
                      Oral Tradition / Cultural Artifact
                    </span>
                    <h3 className="text-2xl font-bold text-white print:text-black">
                      {record.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-b border-white/10 py-4">
                    <div>
                      <span className="text-[#A9AEC5] block text-[10px] uppercase font-mono">
                        Original Language & Dialect
                      </span>
                      <span className="font-bold text-white print:text-black text-sm">
                        {record.originalLanguage}
                      </span>
                      <p className="text-[11px] text-[#F9B17A] font-medium">{record.dialect}</p>
                    </div>

                    <div>
                      <span className="text-[#A9AEC5] block text-[10px] uppercase font-mono">
                        Preserved Community / Clan
                      </span>
                      <span className="font-bold text-white print:text-black text-sm">
                        {record.community}
                      </span>
                      <p className="text-[11px] text-[#A9AEC5]">{record.region}</p>
                    </div>

                    <div>
                      <span className="text-[#A9AEC5] block text-[10px] uppercase font-mono">
                        Contributor / Custodian
                      </span>
                      <span className="font-bold text-white print:text-black">
                        {record.contributorName}
                      </span>
                      <span className="block text-[10px] text-[#F9B17A] font-medium">
                        ✓ Consent Authenticated
                      </span>
                    </div>

                    <div>
                      <span className="text-[#A9AEC5] block text-[10px] uppercase font-mono">
                        Access Protocol & License
                      </span>
                      <span className="font-bold text-white print:text-black capitalize">
                        {record.accessLevel} Access
                      </span>
                      <span className="block text-[10px] text-[#A9AEC5]">
                        Traditional Knowledge Care Commons
                      </span>
                    </div>
                  </div>

                  {/* Verification Status Banner with Interactive Review Button */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-[#A9AEC5] uppercase">
                        Current Provenance Status:
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            verificationStatus === "COMMUNITY_VERIFIED"
                              ? "bg-[#F9B17A]/20 text-[#F9B17A] border border-[#F9B17A]/40"
                              : verificationStatus === "HUMAN_REVIEWED"
                              ? "bg-[#6F76A0]/25 text-[#D9D9E2] border border-[#6F76A0]/40"
                              : "bg-white/10 text-[#A9AEC5] border border-white/20"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {verificationStatus === "COMMUNITY_VERIFIED"
                            ? "Community Verified ✓"
                            : verificationStatus === "HUMAN_REVIEWED"
                            ? "Human Reviewed"
                            : "AI Processed"}
                        </span>
                        <span className="text-[11px] text-[#A9AEC5]">
                          by {record.verifiedBy}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={promoteVerification}
                      className="print:hidden rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10 active:scale-95 transition"
                      title="Click to test status transitions (AI -> Human -> Community)"
                    >
                      Cycle Review Step ↻
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACOUSTIC MASTER */}
          {activeTab === "audio" && (
            <div
              role="tabpanel"
              id="passport-panel-audio"
              aria-labelledby="passport-tab-audio"
              className="space-y-5 pt-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Original Acoustic Recording</h3>
                <span className="font-mono text-xs text-[#F9B17A] font-semibold">
                  {record.audioFormat} · {record.audioDuration}
                </span>
              </div>

              <audio ref={audioRef} src={record.audioUrl} preload="metadata" />

              <div className="rounded-2xl border border-white/10 bg-[#1e2238] p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause master acoustic recording" : "Play master acoustic recording"}
                    className="grid h-12 w-12 place-items-center rounded-xl bg-[#F9B17A] text-[#242942] font-bold shadow-md hover:bg-[#F6A875] active:scale-95 transition"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-white">{record.title}</p>
                    <p className="text-xs text-[#A9AEC5]">Master Acoustic Stream · Lossless 48kHz Preserved</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED TRANSCRIPT */}
          {activeTab === "transcript" && (
            <div
              role="tabpanel"
              id="passport-panel-transcript"
              aria-labelledby="passport-tab-transcript"
              className="space-y-4 pt-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  Source Dialect Transcript ({record.originalLanguage})
                </h3>
                <span className="text-xs text-[#F9B17A] font-semibold">
                  ✓ Verified Version {record.transcriptVersion}.0
                </span>
              </div>
              <blockquote className="rounded-2xl border border-white/10 bg-[#1e2238] p-5 text-lg leading-relaxed text-white font-medium">
                &ldquo;{record.transcript}&rdquo;
              </blockquote>
            </div>
          )}

          {/* TAB 4: TRANSLATIONS */}
          {activeTab === "translations" && (
            <div
              role="tabpanel"
              id="passport-panel-translations"
              aria-labelledby="passport-tab-translations"
              className="space-y-4 pt-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white">IndicTrans2 Translations</h3>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Translation Language">
                  {(["en", "te", "hi", "ta", "kn", "ml"] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      role="radio"
                      aria-checked={selectedTransLang === code}
                      aria-label={`Select language ${code.toUpperCase()}`}
                      onClick={() => setSelectedTransLang(code)}
                      className={`min-h-[40px] rounded-full px-3.5 text-xs font-semibold uppercase active:scale-95 transition ${
                        selectedTransLang === code
                          ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                          : "border border-white/10 text-[#A9AEC5] hover:text-white"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1e2238] p-5">
                <p className="text-sm leading-relaxed text-white/90">
                  {record.translations[selectedTransLang] || record.translations.en}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: PROVENANCE & AUDIT TRAIL */}
          {activeTab === "provenance" && (
            <div
              role="tabpanel"
              id="passport-panel-provenance"
              aria-labelledby="passport-tab-provenance"
              className="space-y-4 pt-6"
            >
              <h3 className="text-base font-bold text-white">Provenance Ledger & Audit Trail</h3>
              <div className="space-y-3">
                {record.auditTrail.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-[#1e2238] p-4 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#F9B17A]">{item.status}</span>
                      <span className="text-[#A9AEC5] font-mono">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-semibold text-white">Actor: {item.actor}</p>
                    <p className="text-[#A9AEC5]">{item.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passport Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-[#A9AEC5] font-mono">
            <span>ISSUED BY: Voice Roots Autonomous Heritage Authority</span>
            <span>SECURE PROVENANCE ID: {record.recordId}</span>
          </div>
        </article>

        {/* Action Button: View Public Story */}
        <div className="flex justify-center print:hidden">
          <Link
            href={`/story/${record.storyId}`}
            className="vr-button vr-button-primary !min-h-12 px-8 text-sm font-bold"
          >
            Open Live Public Story Record →
          </Link>
        </div>
      </main>

      <div className="print:hidden">
        <AIAssistant />
      </div>
    </div>
        );
      }}
    </WorkflowGuard>
  );
}
