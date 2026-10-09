"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LogIn,
  Home,
  Compass,
  BookOpen,
  Search,
  FileText,
  Volume2,
  Mic,
  Cpu,
  Languages,
  Edit3,
  Globe2,
  Brain,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Award,
  QrCode,
  Sparkles,
  WifiOff,
  Wifi,
  RefreshCw,
  Lock,
  ArrowRight,
  ArrowDown,
  Layers,
  Presentation,
  Printer,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Server,
  Database,
  Cloud,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

interface StepNode {
  step: string;
  num: number;
  title: string;
  category: "DISCOVER" | "CAPTURE" | "UNDERSTAND" | "PROTECT" | "VERIFY" | "PRESERVE" | "SHARE" | "ASSIST" | "RESILIENCE";
  description: string;
  demoUrl?: string;
  icon: React.ElementType;
}

const FLOW_STEPS: StepNode[] = [
  { step: "01", num: 1, title: "LOGIN / REGISTER", category: "DISCOVER", description: "Authenticate as community elder, linguist, contributor, or guest listener.", demoUrl: "/login", icon: LogIn },
  { step: "02", num: 2, title: "HOME", category: "DISCOVER", description: "Cinematic portal, featured oral traditions, and live pipeline walkthrough.", demoUrl: "/", icon: Home },
  { step: "03", num: 3, title: "EXPLORE", category: "DISCOVER", description: "Interactive map of tribal and regional dialects across India.", demoUrl: "/explore", icon: Compass },
  { step: "04", num: 4, title: "ARCHIVE", category: "DISCOVER", description: "Curated oral heritage repository filterable by dialect and theme.", demoUrl: "/archive", icon: BookOpen },
  { step: "05", num: 5, title: "SEARCH", category: "DISCOVER", description: "Semantic search across titles, spoken transcripts, and elder notes.", demoUrl: "/search", icon: Search },
  { step: "06", num: 6, title: "STORY DETAILS", category: "DISCOVER", description: "In-depth folklore dossier with elder attribution and cultural context.", demoUrl: "/recordings/vr-106", icon: FileText },
  { step: "07", num: 7, title: "LISTEN TO ORIGINAL RECORDING", category: "DISCOVER", description: "Lossless uncompressed audio playback with real-time waveform scrubber.", demoUrl: "/recordings/vr-106", icon: Volume2 },
  { step: "08", num: 8, title: "RECORD / UPLOAD", category: "CAPTURE", description: "Capture voice via microphone or ingest audio files (WAV, MP3, M4A, OGG).", demoUrl: "/record", icon: Mic },
  { step: "09", num: 9, title: "AUDIO PROCESSING", category: "CAPTURE", description: "Acoustic spectrum extraction, noise reduction, and pitch intonation parsing.", demoUrl: "/upload", icon: Cpu },
  { step: "10", num: 10, title: "LANGUAGE DETECTION", category: "UNDERSTAND", description: "Automatic identification of 12+ Indic languages and regional varieties.", demoUrl: "/upload", icon: Languages },
  { step: "11", num: 11, title: "AI TRANSCRIPTION", category: "UNDERSTAND", description: "Whisper-Indic speech-to-text generating phonetic scripts.", demoUrl: "/upload", icon: Cpu },
  { step: "12", num: 12, title: "TRANSCRIPT REVIEW / EDIT", category: "UNDERSTAND", description: "Community custodian review and inline correction of archaic phrases.", demoUrl: "/record", icon: Edit3 },
  { step: "13", num: 13, title: "AI TRANSLATION", category: "UNDERSTAND", description: "IndicTrans2 bilingual translation across 6 target languages.", demoUrl: "/translate", icon: Globe2 },
  { step: "14", num: 14, title: "CULTURAL CONTEXT", category: "UNDERSTAND", description: "AI synthesis of ethnobotanical, historical, and ritual significance.", demoUrl: "/record", icon: Brain },
  { step: "15", num: 15, title: "CONSENT & ACCESS CONTROL", category: "PROTECT", description: "Ethical rights management (Public, Community-Only, Private, Restricted).", demoUrl: "/record", icon: ShieldCheck },
  { step: "16", num: 16, title: "HUMAN REVIEW", category: "VERIFY", description: "Linguist and community elder verification of AI accuracy.", demoUrl: "/dashboard", icon: UserCheck },
  { step: "17", num: 17, title: "VERIFICATION", category: "VERIFY", description: "Provenance seal awarded to validated oral recordings.", demoUrl: "/passport/vr-106", icon: CheckCircle2 },
  { step: "18", num: 18, title: "HERITAGE RECORD", category: "PRESERVE", description: "Structured immutable record assigned a unique UUID.", demoUrl: "/passport/vr-106", icon: Award },
  { step: "19", num: 19, title: "HERITAGE PASSPORT", category: "PRESERVE", description: "Cryptographic preservation certificate with byte-level SHA-256 seal.", demoUrl: "/passport/vr-106", icon: Award },
  { step: "20", num: 20, title: "QR / PUBLIC HERITAGE PAGE", category: "SHARE", description: "Dynamic mobile QR code linking to permanent public preservation dossier.", demoUrl: "/links", icon: QrCode },
  { step: "21", num: 21, title: "VOICE ROOTS AI", category: "ASSIST", description: "Floating conversational assistant answering folklore and context queries.", demoUrl: "/", icon: Sparkles },
  { step: "22", num: 22, title: "OFFLINE SAVE", category: "RESILIENCE", description: "Field capture caching to IndexedDB with zero internet connection.", demoUrl: "/app", icon: WifiOff },
  { step: "23", num: 23, title: "RECONNECT", category: "RESILIENCE", description: "Automatic network reconnection detection via browser events.", demoUrl: "/links", icon: Wifi },
  { step: "24", num: 24, title: "SYNC", category: "RESILIENCE", description: "Idempotent background sync queue committing pending recordings.", demoUrl: "/dashboard", icon: RefreshCw },
  { step: "25", num: 25, title: "PRESERVED ORAL HERITAGE", category: "PRESERVE", description: "Permanent, immutable, accessible oral wisdom safeguarded for generations.", demoUrl: "/archive", icon: Lock },
];

const CATEGORY_COLORS: Record<StepNode["category"], { border: string; bg: string; text: string }> = {
  DISCOVER: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-300" },
  CAPTURE: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-300" },
  UNDERSTAND: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-300" },
  PROTECT: { border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-300" },
  VERIFY: { border: "border-teal-500/30", bg: "bg-teal-500/10", text: "text-teal-300" },
  PRESERVE: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-300" },
  SHARE: { border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-300" },
  ASSIST: { border: "border-indigo-500/30", bg: "bg-indigo-500/10", text: "text-indigo-300" },
  RESILIENCE: { border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-300" },
};

export default function MasterProjectFlowPage() {
  const [viewMode, setViewMode] = useState<"diagram" | "slides">("diagram");
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedStep, setSelectedStep] = useState<StepNode | null>(FLOW_STEPS[0]);

  const totalSlides = 6;

  const handleNextSlide = () => setActiveSlide((prev) => (prev + 1) % totalSlides);
  const handlePrevSlide = () => setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <div className="min-h-screen bg-[#0C0908] text-[#F7F3EE] selection:bg-[#E58A4E]/30 selection:text-white print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Ambient Radial Heritage Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 print:hidden"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 75% 55% at 50% -20%, rgba(229,138,78,0.18), transparent 75%), radial-gradient(ellipse 55% 45% at 85% 25%, rgba(212,163,115,0.12), transparent 70%), radial-gradient(ellipse 45% 45% at 15% 75%, rgba(78,159,118,0.12), transparent 70%)",
        }}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-24 sm:px-6 sm:pt-28 lg:px-8 space-y-8 print:p-0 print:pt-4">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6 print:border-black">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E58A4E]/40 bg-[#E58A4E]/10 px-3 py-1 text-xs font-bold text-[#E58A4E] print:border-black print:text-black">
              <Layers className="h-3.5 w-3.5" />
              OFFICIAL SYSTEM ARCHITECTURE
            </div>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black text-[#F7F3EE] print:text-black">
              Voice Roots — Master Project Flow
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#C4B5A5] print:text-gray-700">
              Pre-defined 25-step execution sequence for Website and Mobile App.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border border-white/10 bg-[#1C1512] p-1">
              <button
                onClick={() => setViewMode("diagram")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "diagram"
                    ? "bg-[#E58A4E] text-[#0C0908] shadow-sm"
                    : "text-[#C4B5A5] hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Flow Diagram
              </button>
              <button
                onClick={() => setViewMode("slides")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "slides"
                    ? "bg-[#E58A4E] text-[#0C0908] shadow-sm"
                    : "text-[#C4B5A5] hover:text-white"
                }`}
              >
                <Presentation className="h-3.5 w-3.5" /> Presentation Slide Deck
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* VIEW MODE 1: PRESENTATION SLIDE DECK                    */}
        {/* ======================================================== */}
        {viewMode === "slides" && (
          <div className="space-y-6">
            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between print:hidden">
              <span className="text-xs font-mono text-[#C4B5A5]">
                Slide {activeSlide + 1} of {totalSlides}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSlide}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                  title="Previous Slide"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-[#E58A4E] text-[#0C0908] font-bold hover:bg-[#ED9C66] transition"
                  title="Next Slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Slide 1: Cover & Mission */}
            {activeSlide === 0 && (
              <div className="aspect-[16/9] min-h-[460px] rounded-3xl border border-white/12 bg-gradient-to-br from-[#1C1512] via-[#241A16] to-[#1C1512] p-8 sm:p-12 shadow-2xl flex flex-col justify-between print:border-black print:bg-white">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E58A4E]/30 bg-[#E58A4E]/10 px-4 py-1 text-xs font-bold text-[#E58A4E]">
                    CAPSTONE PRESENTATION SLIDE • SLIDE 01
                  </div>
                  <h2 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                    VOICE ROOTS
                  </h2>
                  <p className="text-lg sm:text-2xl font-bold text-[#E58A4E]">
                    “Voice → Transcribe → Translate → Understand → Preserve”
                  </p>
                  <p className="text-sm sm:text-base text-[#C4B5A5] max-w-2xl leading-relaxed">
                    Rooting Endangered Oral Languages in Text with Artificial Intelligence. Decentralized oral memory, IndicTrans2 bilingual translation, and tamper-evident cryptographic provenance.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono text-[#C4B5A5]">
                  <span>Pre-defined Project Flow: 25 Sequential Steps</span>
                  <span>Website + Mobile Companion App</span>
                </div>
              </div>
            )}

            {/* Slide 2: Unified Architecture */}
            {activeSlide === 1 && (
              <div className="aspect-[16/9] min-h-[460px] rounded-3xl border border-white/12 bg-gradient-to-br from-[#1C1512] via-[#241A16] to-[#1C1512] p-8 sm:p-12 shadow-2xl flex flex-col justify-between print:border-black print:bg-white">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E58A4E]">
                    SYSTEM ARCHITECTURE • SLIDE 02
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    One Unified Backend — Two Tailored Interfaces
                  </h2>
                  <p className="text-xs sm:text-sm text-[#C4B5A5]">
                    The website and app are two interfaces to the same preservation platform, sharing authentication, APIs, AI pipeline, and cryptographic data.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-center">
                      <div className="grid h-10 w-10 mx-auto place-items-center rounded-xl bg-[#E58A4E]/20 text-[#E58A4E]">
                        <Globe2 className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Website Frontend</h3>
                      <p className="text-xs text-[#C4B5A5]">Full-featured studio, archive explorer, linguist review dashboard, and passport verification.</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-center">
                      <div className="grid h-10 w-10 mx-auto place-items-center rounded-xl bg-[#4E9F76]/20 text-[#4E9F76]">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white">Mobile Companion</h3>
                      <p className="text-xs text-[#C4B5A5]">Field capture-first device with offline caching, local audio buffer, and quick QR access.</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-center">
                      <div className="grid h-10 w-10 mx-auto place-items-center rounded-xl bg-[#D4A373]/20 text-[#D4A373]">
                        <Server className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white">FastAPI + AI Engine</h3>
                      <p className="text-xs text-[#C4B5A5]">Whisper-Indic ASR, IndicTrans2 multilingual translation, and SHA-256 seal issuer.</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 text-xs text-[#C4B5A5]">
                  Principle: Same core journey, same backend, same data, same preservation rules.
                </div>
              </div>
            )}

            {/* Slide 3: 25-Step Pipeline Overview */}
            {activeSlide === 2 && (
              <div className="aspect-[16/9] min-h-[460px] rounded-3xl border border-white/12 bg-gradient-to-br from-[#1C1512] via-[#241A16] to-[#1C1512] p-6 sm:p-10 shadow-2xl flex flex-col justify-between print:border-black print:bg-white overflow-hidden">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E58A4E]">
                    PIPELINE BLUEPRINT • SLIDE 03
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    The 25-Step Pre-Defined Pipeline Sequence
                  </h2>
                  <p className="text-xs text-[#C4B5A5]">
                    Sequential user journey from initial discovery to immutable long-term preservation.
                  </p>

                  <div className="grid grid-cols-5 gap-2 pt-2 text-[10px] font-mono">
                    {FLOW_STEPS.map((s) => (
                      <div key={s.step} className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-center">
                        <span className="text-[#E58A4E] font-bold block">{s.step}</span>
                        <span className="truncate block text-slate-300">{s.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-2 text-[11px] font-mono text-[#E58A4E] text-center">
                  Discover → Capture → Understand → Protect → Verify → Preserve → Share → Resilience
                </div>
              </div>
            )}

            {/* Slide 4: 8 Core Stages */}
            {activeSlide === 3 && (
              <div className="aspect-[16/9] min-h-[460px] rounded-3xl border border-white/12 bg-gradient-to-br from-[#1C1512] via-[#241A16] to-[#1C1512] p-6 sm:p-10 shadow-2xl flex flex-col justify-between print:border-black print:bg-white">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E58A4E]">
                    PILLAR ARCHITECTURE • SLIDE 04
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    The 8 Core Architectural Stages
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                    {[
                      { num: "1", title: "User Access", desc: "Login → Register → Profile" },
                      { num: "2", title: "Discover Heritage", desc: "Home → Explore → Archive → Search" },
                      { num: "3", title: "Capture a Voice", desc: "Record / Upload → Audio" },
                      { num: "4", title: "AI Understanding", desc: "Detect → Transcribe → Translate" },
                      { num: "5", title: "Cultural Context", desc: "Ethnobotany & Clan Ritual Lore" },
                      { num: "6", title: "Protect & Verify", desc: "Consent Tiers → Human Review" },
                      { num: "7", title: "Preserve & Share", desc: "Heritage Passport → QR Code" },
                      { num: "8", title: "Resilience", desc: "Offline Caching → Background Sync" },
                    ].map((st) => (
                      <div key={st.num} className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-1">
                        <span className="text-[10px] font-bold text-[#E58A4E]">Stage {st.num}</span>
                        <div className="font-bold text-white">{st.title}</div>
                        <div className="text-[10px] text-[#C4B5A5]">{st.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-2 text-xs text-[#C4B5A5]">
                  Voice Roots preserves the spoken word as the primary artifact; AI adds accessibility.
                </div>
              </div>
            )}

            {/* Slide 5: Field Capture & Offline Resilience */}
            {activeSlide === 4 && (
              <div className="aspect-[16/9] min-h-[460px] rounded-3xl border border-white/12 bg-gradient-to-br from-[#1C1512] via-[#241A16] to-[#1C1512] p-8 sm:p-12 shadow-2xl flex flex-col justify-between print:border-black print:bg-white">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4E9F76]">
                    FIELD RESILIENCE • SLIDE 05
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    Field Capture & Offline-First Sync
                  </h2>
                  <p className="text-xs sm:text-sm text-[#C4B5A5]">
                    Designed for field researchers and tribal elders recording oral folklore in remote areas with zero cell coverage.
                  </p>

                  <div className="grid grid-cols-4 gap-3 pt-4 text-center">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                      <WifiOff className="h-6 w-6 mx-auto text-rose-400" />
                      <div className="text-xs font-bold text-white">Offline Capture</div>
                      <div className="text-[10px] text-[#C4B5A5]">Audio stored in IndexedDB blob cache</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                      <Lock className="h-6 w-6 mx-auto text-[#E58A4E]" />
                      <div className="text-xs font-bold text-white">Draft Protected</div>
                      <div className="text-[10px] text-[#C4B5A5]">Survives browser reloads and reboots</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                      <Wifi className="h-6 w-6 mx-auto text-teal-400" />
                      <div className="text-xs font-bold text-white">Network Reconnect</div>
                      <div className="text-[10px] text-[#C4B5A5]">Event-driven automatic detection</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
                      <RefreshCw className="h-6 w-6 mx-auto text-emerald-400" />
                      <div className="text-xs font-bold text-white">Idempotent Sync</div>
                      <div className="text-[10px] text-[#C4B5A5]">De-duplicated cloud transmission</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 text-xs text-[#C4B5A5]">
                  Status Telemetry Pill in Navbar provides real-time state: Offline (Queued) → Syncing… → Synced.
                </div>
              </div>
            )}

            {/* Slide 6: Cryptographic Heritage Passport */}
            {activeSlide === 5 && (
              <div className="aspect-[16/9] min-h-[460px] rounded-3xl border border-white/12 bg-gradient-to-br from-[#1C1512] via-[#241A16] to-[#1C1512] p-8 sm:p-12 shadow-2xl flex flex-col justify-between print:border-black print:bg-white">
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E58A4E]">
                    PROVENANCE VERIFICATION • SLIDE 06
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">
                    Liquid Glass Heritage Passport & QR Code
                  </h2>
                  <p className="text-xs sm:text-sm text-[#C4B5A5]">
                    Cryptographically binds oral audio bytes with elder attribution, clan origin, and IndicTrans2 multilingual transcripts.
                  </p>

                  <div className="grid grid-cols-3 gap-4 pt-3">
                    <div className="rounded-2xl border border-[#E58A4E]/30 bg-[#E58A4E]/10 p-4 space-y-1.5">
                      <ShieldCheck className="h-6 w-6 text-[#E58A4E]" />
                      <div className="text-xs font-bold text-white">SHA-256 Provenance Seal</div>
                      <div className="text-[10px] text-[#C4B5A5]">Byte-level immutability ensures recording cannot be altered or fabricated.</div>
                    </div>
                    <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 space-y-1.5">
                      <Award className="h-6 w-6 text-teal-400" />
                      <div className="text-xs font-bold text-white">Linguist Verification Badge</div>
                      <div className="text-[10px] text-[#C4B5A5]">Human-verified flag distinguishes authentic oral traditions from AI drafts.</div>
                    </div>
                    <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-1.5">
                      <QrCode className="h-6 w-6 text-purple-400" />
                      <div className="text-xs font-bold text-white">Universal QR Access</div>
                      <div className="text-[10px] text-[#C4B5A5]">Instant mobile streaming on any smartphone via high-res QR code.</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 text-xs text-[#C4B5A5]">
                  Live Sample: <Link href="/passport/vr-106" className="text-[#E58A4E] underline">/passport/vr-106</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW MODE 2: INTERACTIVE 25-STEP FLOW DIAGRAM           */}
        {/* ======================================================== */}
        {viewMode === "diagram" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 25-Step Sequential Timeline (8 Cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E58A4E]">
                  25-Step Sequential Pipeline
                </span>
                <span className="text-xs font-mono text-[#C4B5A5]">
                  Click any step to inspect
                </span>
              </div>

              <div className="space-y-2">
                {FLOW_STEPS.map((stepNode, idx) => {
                  const Icon = stepNode.icon;
                  const isSelected = selectedStep?.step === stepNode.step;
                  const colors = CATEGORY_COLORS[stepNode.category];

                  return (
                    <div key={stepNode.step} className="relative">
                      {/* Interactive Step Card */}
                      <div
                        onClick={() => setSelectedStep(stepNode)}
                        className={`group relative flex items-center justify-between rounded-2xl border p-3.5 sm:p-4 backdrop-blur-xl transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#E58A4E] bg-[#1C1512] shadow-[0_0_24px_rgba(229,138,78,0.25)] scale-[1.01]"
                            : "border-white/10 bg-[#1C1512]/60 hover:border-white/25 hover:bg-[#1C1512]/90"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-xs font-mono font-bold ${
                              isSelected
                                ? "bg-[#E58A4E] text-[#0C0908] border-[#E58A4E]"
                                : "bg-white/5 border-white/10 text-slate-300"
                            }`}
                          >
                            {stepNode.step}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-sm font-bold truncate transition ${
                                  isSelected ? "text-[#E58A4E]" : "text-white group-hover:text-[#E58A4E]"
                                }`}
                              >
                                {stepNode.title}
                              </h3>
                              <span
                                className={`hidden sm:inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${colors.border} ${colors.bg} ${colors.text}`}
                              >
                                {stepNode.category}
                              </span>
                            </div>
                            <p className="text-xs text-[#C4B5A5] truncate max-w-md">
                              {stepNode.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-[#E58A4E]" : "text-[#C4B5A5]"}`} />
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </div>
                      </div>

                      {/* Connector Arrow (unless last) */}
                      {idx < FLOW_STEPS.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowDown className="h-3 w-3 text-white/20" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Inspector & Demo Launcher Panel (4 Cols Sticky) */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              {selectedStep ? (
                <div className="rounded-3xl border border-white/15 bg-[#1C1512]/95 p-6 shadow-2xl backdrop-blur-2xl space-y-5">
                  <div className="space-y-2 border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#E58A4E]">
                        STEP {selectedStep.step} / 25
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          CATEGORY_COLORS[selectedStep.category].border
                        } ${CATEGORY_COLORS[selectedStep.category].bg} ${
                          CATEGORY_COLORS[selectedStep.category].text
                        }`}
                      >
                        {selectedStep.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white">
                      {selectedStep.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#C4B5A5] leading-relaxed">
                    {selectedStep.description}
                  </p>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#E58A4E]" />
                      Preservation Principle:
                    </div>
                    <p className="text-[#C4B5A5] text-[11px] leading-relaxed">
                      {selectedStep.num <= 7
                        ? "Preserving authentic oral access by allowing listeners to discover community lore without distortion."
                        : selectedStep.num <= 14
                        ? "Capturing spoken voices losslessly and providing multi-lingual text bridges with IndicTrans2."
                        : selectedStep.num <= 20
                        ? "Protecting indigenous ownership through ethical consent tiers and cryptographic verification seals."
                        : "Ensuring zero data loss in the field through local IndexedDB caching and idempotent cloud sync."}
                    </p>
                  </div>

                  {selectedStep.demoUrl && (
                    <Link
                      href={selectedStep.demoUrl}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#E58A4E] hover:bg-[#ED9C66] text-xs font-bold text-[#0C0908] shadow-md transition active:scale-95"
                    >
                      Test Step in Live App <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ) : null}

              {/* Quick Summary Card */}
              <div className="rounded-3xl border border-white/10 bg-[#1C1512]/60 p-5 space-y-2 text-xs">
                <div className="font-bold text-white">One-Line Project Tagline:</div>
                <div className="font-serif italic text-xs text-[#E58A4E]">
                  &ldquo;Voice → Transcribe → Translate → Understand → Preserve.&rdquo;
                </div>
                <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[11px] text-[#C4B5A5]">
                  <span>Total Pipeline Stages: 25</span>
                  <Link href="/links" className="text-[#E58A4E] hover:underline">
                    All Links Hub →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
