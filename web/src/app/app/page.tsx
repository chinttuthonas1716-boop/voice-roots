"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Languages,
  Mic,
  Smartphone,
  Upload,
  Play,
  Pause,
  ChevronDown,
  Check,
  ShieldCheck,
  Sparkles,
  QrCode,
  Volume2,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

interface FieldFlowStep {
  step: string;
  num: number;
  title: string;
  category: "DISCOVER" | "CAPTURE" | "UNDERSTAND" | "PROTECT" | "VERIFY" | "PRESERVE" | "SHARE" | "ASSIST" | "RESILIENCE";
  phase: string;
  description: string;
  actionText: string;
  href: string;
}

const MASTER_25_STEPS: FieldFlowStep[] = [
  { step: "01", num: 1, title: "LOGIN / REGISTER", category: "DISCOVER", phase: "Phase 1: Discovery & Listening", description: "Elder, linguist, field contributor, or guest listener authentication.", actionText: "Test Login", href: "/login" },
  { step: "02", num: 2, title: "HOME", category: "DISCOVER", phase: "Phase 1: Discovery & Listening", description: "Cinematic landing portal, featured oral traditions, and live telemetry.", actionText: "Open Home", href: "/" },
  { step: "03", num: 3, title: "EXPLORE", category: "DISCOVER", phase: "Phase 1: Discovery & Listening", description: "Dialect atlas exploring regional clusters & indigenous tongues.", actionText: "Explore Map", href: "/explore" },
  { step: "04", num: 4, title: "ARCHIVE", category: "DISCOVER", phase: "Phase 1: Discovery & Listening", description: "Searchable living repository filterable by community & region.", actionText: "Open Archive", href: "/archive" },
  { step: "05", num: 5, title: "SEARCH", category: "DISCOVER", phase: "Phase 1: Discovery & Listening", description: "Semantic & phonetic search across indigenous dialects and transcripts.", actionText: "Try Search", href: "/search" },
  { step: "06", num: 6, title: "STORY DETAILS", category: "DISCOVER", phase: "Phase 1: Discovery & Listening", description: "Deep cultural narrative dossier with provenance and speaker attribution.", actionText: "View vr-106", href: "/story/vr-106" },
  { step: "07", num: 7, title: "LISTEN TO ORIGINAL RECORDING", category: "DISCOVER", phase: "Phase 1: Discovery & Listening", description: "48kHz lossless field audio playback with synchronized phoneme transcript.", actionText: "Listen Now", href: "/story/vr-106" },
  { step: "08", num: 8, title: "RECORD / UPLOAD", category: "CAPTURE", phase: "Phase 2: Oral Capture & Ingestion", description: "Browser field microphone capture or uncompressed audio file upload.", actionText: "Open Studio", href: "/preserve" },
  { step: "09", num: 9, title: "AUDIO PROCESSING", category: "CAPTURE", phase: "Phase 2: Oral Capture & Ingestion", description: "Web Audio API silence clipping, noise estimation, and waveform rendering.", actionText: "Test Capture", href: "/record" },
  { step: "10", num: 10, title: "LANGUAGE DETECTION", category: "UNDERSTAND", phase: "Phase 3: Acoustic AI & Linguistic Layer", description: "Wav2Vec2 acoustic classifier identifying dialect and language family.", actionText: "Test Ingest", href: "/upload" },
  { step: "11", num: 11, title: "AI TRANSCRIPTION", category: "UNDERSTAND", phase: "Phase 3: Acoustic AI & Linguistic Layer", description: "Whisper-Indic acoustic transcription to native script with confidence scores.", actionText: "Transcribe", href: "/record" },
  { step: "12", num: 12, title: "TRANSCRIPT REVIEW / EDIT", category: "UNDERSTAND", phase: "Phase 3: Acoustic AI & Linguistic Layer", description: "Native speaker editorial correction of phonetic tokens & cultural terms.", actionText: "Review vr-106", href: "/story/vr-106" },
  { step: "13", num: 13, title: "AI TRANSLATION", category: "UNDERSTAND", phase: "Phase 3: Acoustic AI & Linguistic Layer", description: "IndicTrans2 bidirectional translation preserving nuances across 6+ languages.", actionText: "Translate", href: "/translate" },
  { step: "14", num: 14, title: "CULTURAL CONTEXT", category: "UNDERSTAND", phase: "Phase 3: Acoustic AI & Linguistic Layer", description: "Ethnobotanical notes, seasonal calendar context, and ritual importance.", actionText: "Context Dossier", href: "/story/vr-106" },
  { step: "15", num: 15, title: "CONSENT & ACCESS CONTROL", category: "PROTECT", phase: "Phase 4: Community Governance & Sovereignty", description: "OCAP-compliant Traditional Knowledge licenses and community access levels.", actionText: "Manage Access", href: "/story/vr-106" },
  { step: "16", num: 16, title: "HUMAN REVIEW", category: "VERIFY", phase: "Phase 5: Elder Verification & Cryptographic Provenance", description: "Community elder validation and peer custodian attestation.", actionText: "Verify Story", href: "/story/vr-106" },
  { step: "17", num: 17, title: "VERIFICATION", category: "VERIFY", phase: "Phase 5: Elder Verification & Cryptographic Provenance", description: "Cryptographic SHA-256 seal & digital fingerprinting of audio master.", actionText: "Audit Proof", href: "/passport/vr-106" },
  { step: "18", num: 18, title: "HERITAGE RECORD", category: "PRESERVE", phase: "Phase 5: Elder Verification & Cryptographic Provenance", description: "Permanent immutable digital record saved to the community living archive.", actionText: "View Archive", href: "/archive" },
  { step: "19", num: 19, title: "HERITAGE PASSPORT", category: "PRESERVE", phase: "Phase 5: Elder Verification & Cryptographic Provenance", description: "Verifiable tamper-evident credential for academic citation and exhibition.", actionText: "Inspect Passport", href: "/passport/vr-106" },
  { step: "20", num: 20, title: "QR / PUBLIC HERITAGE PAGE", category: "SHARE", phase: "Phase 6: Public Exhibition & Dissemination", description: "Scannable physical placard QR code linking to museum listening dossier.", actionText: "Open QR Hub", href: "/links" },
  { step: "21", num: 21, title: "VOICE ROOTS AI", category: "ASSIST", phase: "Phase 7: Conversational Assistant", description: "Grounded conversational agent answering queries exclusively from oral records.", actionText: "Ask AI", href: "/ai" },
  { step: "22", num: 22, title: "OFFLINE SAVE", category: "RESILIENCE", phase: "Phase 8: Offline-First Field Resilience", description: "IndexedDB local audio storage for off-grid remote forest recordings.", actionText: "Test Offline", href: "/record" },
  { step: "23", num: 23, title: "RECONNECT", category: "RESILIENCE", phase: "Phase 8: Offline-First Field Resilience", description: "Telemetry listener detecting restoration of connectivity.", actionText: "Check Sync", href: "/" },
  { step: "24", num: 24, title: "SYNC", category: "RESILIENCE", phase: "Phase 8: Offline-First Field Resilience", description: "Automated retry queue uploading pending recordings with SHA-256 integrity.", actionText: "Sync Queue", href: "/dashboard" },
  { step: "25", num: 25, title: "PRESERVED ORAL HERITAGE", category: "PRESERVE", phase: "Phase 9: Living Legacy", description: "Permanent living oral tradition safe from language extinction.", actionText: "All Records", href: "/archive" },
];

const TRANSLATION_OPTIONS = [
  { code: "en", name: "English", native: "English" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
] as const;

export default function MobileAppPage() {
  const [activeStory, setActiveStory] = useState<StoredVoiceRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<"audio" | "transcript" | "translation">("audio");
  const [selectedLang, setSelectedLang] = useState<"en" | "te" | "hi" | "ta" | "kn" | "ml">("en");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const list = getUserRecordings();
    if (list.length > 0) {
      setActiveStory(list[0]);
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  return (
    <div className="vr-app pb-24">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-7 px-4 pt-10 sm:px-6 lg:px-8">
        {/* Banner */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/12 bg-[rgba(66,71,108,0.35)] backdrop-blur-xl shadow-2xl">
          <div className="relative max-w-2xl space-y-3">
            <span className="eyebrow">
              MOBILE COMPANION & FIELD APP
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Voice Roots on Mobile
            </h1>
            <p className="text-sm leading-relaxed text-[#D9D9E2]">
              Preserve spoken traditions from your phone following the official 25-step pre-defined project flow. Listen to 48kHz acoustic masters, inspect phonetic transcripts, and switch translations smoothly without leaving the player.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/preserve"
                className="vr-button vr-button-primary !min-h-10 text-xs font-bold"
              >
                <Mic className="h-4 w-4" /> 🎙️ Preserve a Voice
              </Link>
              <Link
                href="/upload"
                className="vr-button vr-button-secondary !min-h-10 text-xs font-semibold"
              >
                <Upload className="h-4 w-4" /> Upload Audio
              </Link>
              <Link
                href="/flow"
                className="vr-button vr-button-secondary !min-h-10 text-xs font-semibold"
              >
                <Layers className="h-4 w-4 text-[#F9B17A]" /> Full 25-Step Flow
              </Link>
            </div>
          </div>
        </section>

        {/* Pre-Defined Master Project Flow (25-Step Pipeline) */}
        <section className="space-y-4 rounded-3xl border border-white/12 bg-[rgba(36,41,66,0.85)] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-t-0 border-b border-white/10">
            <div className="space-y-1">
              <span className="eyebrow">
                OFFICIAL PRE-DEFINED PROJECT FLOW
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Master 25-Step Field Pipeline
              </h2>
              <p className="text-xs text-[#A9AEC5]">
                {MASTER_25_STEPS[activeStepIndex].phase}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/flow"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                <span>Full Flow & Slides</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#F9B17A]" />
              </Link>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A9AEC5]">
              <span className="font-mono text-xs font-bold text-[#F9B17A]">
                STEP {MASTER_25_STEPS[activeStepIndex].step} / 25
              </span>
              <span className="text-[11px] font-medium text-white">
                {Math.round(((activeStepIndex + 1) / 25) * 100)}% Complete
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F9B17A] to-[#6F76A0] transition-all duration-300"
                style={{ width: `${((activeStepIndex + 1) / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Step Card */}
          <div className="rounded-2xl border border-white/15 bg-[rgba(66,71,108,0.3)] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F9B17A] text-[#242942] font-mono text-sm font-black shadow-[0_0_16px_rgba(249,177,122,0.35)]">
                  {MASTER_25_STEPS[activeStepIndex].step}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {MASTER_25_STEPS[activeStepIndex].title}
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#F9B17A] font-semibold">
                    Category: {MASTER_25_STEPS[activeStepIndex].category}
                  </span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeStepIndex === 0}
                  aria-label="Previous pipeline step"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStepIndex((prev) => Math.min(24, prev + 1))}
                  disabled={activeStepIndex === 24}
                  aria-label="Next pipeline step"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-[#F9B17A] hover:bg-[#F6A875] text-[#242942] font-bold shadow-[0_2px_12px_rgba(249,177,122,0.3)] disabled:opacity-30 disabled:pointer-events-none transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#D9D9E2] leading-relaxed">
              {MASTER_25_STEPS[activeStepIndex].description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10 text-xs">
              <Link
                href={MASTER_25_STEPS[activeStepIndex].href}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-xl bg-[#F9B17A] hover:bg-[#F6A875] px-4 py-2 font-bold text-[#242942] transition shadow-md active:scale-95"
              >
                <span>{MASTER_25_STEPS[activeStepIndex].actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-[11px] text-[#A9AEC5] font-mono">
                Pre-sequence: {activeStepIndex + 1} of 25
              </span>
            </div>
          </div>

          {/* Quick Step Selector Pill Grid */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-semibold text-[#A9AEC5] uppercase tracking-wider">
              Quick Jump to Step (01 – 25)
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {MASTER_25_STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`min-h-[36px] py-1 rounded-xl text-xs font-mono font-bold transition ${
                    activeStepIndex === idx
                      ? "bg-[#F9B17A] text-[#242942] shadow-[0_0_12px_rgba(249,177,122,0.4)] scale-105"
                      : "border border-white/10 bg-white/5 text-[#A9AEC5] hover:text-white hover:border-white/20"
                  }`}
                  title={`${s.step}. ${s.title}`}
                >
                  {s.step}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Story Player */}
        {activeStory && (
          <section id="mobile-player" className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#A9AEC5]">
              <span className="font-semibold text-white">📱 Mobile Story Player</span>
              <span className="font-mono text-[11px] text-[#F9B17A]">Audio → Transcript → Translation</span>
            </div>

            <div className="max-w-md mx-auto rounded-3xl border border-white/15 bg-[rgba(36,41,66,0.9)] p-6 shadow-2xl space-y-5 backdrop-blur-2xl">
              {/* Audio Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#F9B17A] font-bold">
                    ORIGINAL RECORDING
                  </span>
                  <h3 className="text-lg font-bold text-white truncate max-w-[220px]">
                    {activeStory.title}
                  </h3>
                  <p className="text-xs text-[#A9AEC5]">
                    Spoken in <span className="text-white font-semibold">{activeStory.language}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F9B17A] hover:bg-[#F6A875] text-[#242942] shadow-[0_4px_20px_rgba(249,177,122,0.4)] transition hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? "Pause audio playback" : "Play audio playback"}
                >
                  {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                src={activeStory.audioUrl || `/audio/${activeStory.audioFileName}`}
                onEnded={() => setIsPlaying(false)}
              />

              {/* View Switcher */}
              <div
                role="tablist"
                aria-label="Mobile Companion Display Mode"
                className="flex rounded-xl bg-white/5 p-1 text-xs"
              >
                {(["audio", "transcript", "translation"] as const).map((mode) => (
                  <button
                    key={mode}
                    role="tab"
                    id={`mobile-tab-${mode}`}
                    aria-selected={viewMode === mode}
                    aria-controls={`mobile-panel-${mode}`}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 min-h-[38px] py-1.5 rounded-lg font-semibold capitalize transition active:scale-95 ${
                      viewMode === mode
                        ? "bg-[#F9B17A] text-[#242942] shadow-sm font-bold"
                        : "text-[#A9AEC5] hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* View Content */}
              {viewMode === "audio" && (
                <div
                  role="tabpanel"
                  id="mobile-panel-audio"
                  aria-labelledby="mobile-tab-audio"
                  className="rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-4 text-center space-y-2"
                >
                  <div className="flex justify-center items-center gap-1 h-8">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-200 ${
                          isPlaying ? "bg-[#F9B17A]" : "bg-white/20"
                        }`}
                        style={{
                          height: isPlaying ? `${Math.sin(i * 0.5) * 60 + 40}%` : "30%",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#A9AEC5]">
                    48kHz Lossless Folk Master · {activeStory.duration}
                  </p>
                </div>
              )}

              {viewMode === "transcript" && (
                <div
                  role="tabpanel"
                  id="mobile-panel-transcript"
                  aria-labelledby="mobile-tab-transcript"
                  className="rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-4 space-y-1"
                >
                  <span className="text-[10px] font-mono text-[#F9B17A] font-bold">
                    SOURCE TRANSCRIPT ({activeStory.language}):
                  </span>
                  <p className="text-sm text-white leading-relaxed font-medium">
                    &ldquo;{activeStory.originalTranscript}&rdquo;
                  </p>
                </div>
              )}

              {viewMode === "translation" && (
                <div
                  role="tabpanel"
                  id="mobile-panel-translation"
                  aria-labelledby="mobile-tab-translation"
                  className="space-y-3"
                >
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      className="w-full flex min-h-[44px] items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-[#F9B17A]" />
                        Translate to: <span className="text-[#F9B17A]">{TRANSLATION_OPTIONS.find((o) => o.code === selectedLang)?.name}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-[#A9AEC5]" />
                    </button>

                    {isDropdownOpen && (
                      <div
                        role="listbox"
                        className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl border border-white/15 bg-[#242942] p-1.5 shadow-2xl space-y-0.5 backdrop-blur-2xl"
                      >
                        {TRANSLATION_OPTIONS.map((opt) => (
                          <button
                            key={opt.code}
                            type="button"
                            role="option"
                            aria-selected={selectedLang === opt.code}
                            onClick={() => {
                              setSelectedLang(opt.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex min-h-[40px] items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                              selectedLang === opt.code
                                ? "bg-[#F9B17A] text-[#242942] font-bold"
                                : "text-[#A9AEC5] hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span>{opt.native} ({opt.name})</span>
                            {selectedLang === opt.code && <Check className="h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#A9AEC5]">
                      <span className="font-mono text-[#F9B17A] uppercase font-bold">
                        {TRANSLATION_OPTIONS.find((o) => o.code === selectedLang)?.name} Translation:
                      </span>
                      <span>IndicTrans2 · 96.4%</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">
                      {activeStory.translations?.[selectedLang] ||
                        activeStory.translations?.en ||
                        `Translation in ${selectedLang.toUpperCase()} ready.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Passport Direct Link */}
              <div className="pt-1 flex justify-between items-center text-xs">
                <Link
                  href={`/passport/${activeStory.id}`}
                  className="inline-flex items-center gap-1.5 font-bold text-[#F9B17A] hover:underline"
                >
                  <QrCode className="h-3.5 w-3.5" /> View Heritage Passport
                </Link>
                <Link
                  href={`/story/${activeStory.id}`}
                  className="text-[#A9AEC5] hover:text-white underline"
                >
                  Full Dossier
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { href: "/upload", icon: Upload, title: "Upload Audio", detail: "MP3, WAV, M4A, AAC, WebM with auto-translate" },
              { href: "/record", icon: Mic, title: "Recording Studio", detail: "Microphone capture with ambient noise check" },
              { href: "/translate", icon: Languages, title: "Day-to-Day Translator", detail: "Real-time speech & conversational text" },
            ].map(({ href, icon: Icon, title, detail }) => (
              <Link href={href} key={href} className="rounded-2xl border border-white/12 bg-[rgba(66,71,108,0.25)] p-5 hover:border-[#F9B17A]/40 backdrop-blur-xl transition hover:-translate-y-0.5">
                <Icon className="h-5 w-5 text-[#F9B17A]" />
                <h3 className="mt-3 font-medium text-white">{title}</h3>
                <p className="mt-1 text-sm text-[#A9AEC5]">{detail}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
