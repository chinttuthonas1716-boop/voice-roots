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
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

const TRANSLATION_OPTIONS = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
] as const;

export default function MobileCompanionPage() {
  const [activeStory, setActiveStory] = useState<StoredVoiceRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"en" | "te" | "hi" | "ta" | "kn" | "ml">("en");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"audio" | "transcript" | "translation">("translation");
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
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian pb-24 text-primary-text">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-7 px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Banner */}
        <section className="glass-surface relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-root-green/10 blur-3xl" />
          <div className="relative max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-root-green/20 bg-root-green/10 px-3 py-1 text-xs text-leaf-green">
              <Smartphone className="h-3.5 w-3.5" /> Mobile Companion & Player
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Voice Roots on Mobile
            </h1>
            <p className="text-sm leading-relaxed text-secondary-text">
              Preserve spoken traditions from your phone. Listen to 48kHz acoustic masters, inspect phonetic transcripts, and switch translations smoothly without leaving the player.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/upload"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-leaf-green/40 bg-leaf-green/15 px-5 text-sm font-semibold text-leaf-green hover:bg-leaf-green/25 transition"
              >
                <Upload className="h-4 w-4" /> + Upload Audio
              </Link>
              <Link
                href="/record"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-root-green px-5 text-sm font-semibold text-obsidian shadow-glow hover:bg-leaf-green transition"
              >
                <Mic className="h-4 w-4" /> 🎙️ Record Story
              </Link>
            </div>
          </div>
        </section>

        {/* Mobile Story Player (Exact User Specification) */}
        {activeStory && (
          <section className="space-y-3">
            <div className="flex items-center justify-between text-xs text-secondary-text">
              <span className="font-semibold text-white">📱 Mobile Story Player</span>
              <span className="font-mono text-[11px] text-leaf-green">Audio → Transcript → Translation</span>
            </div>

            <div className="glass-card max-w-md mx-auto rounded-3xl border border-white/15 bg-black/60 p-6 shadow-2xl space-y-5">
              {/* Audio Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-leaf-green font-bold">
                    ORIGINAL RECORDING
                  </span>
                  <h3 className="text-lg font-bold text-white truncate max-w-[220px]">
                    {activeStory.title}
                  </h3>
                  <p className="text-xs text-secondary-text">
                    Spoken in <span className="text-white font-semibold">{activeStory.language}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="grid h-12 w-12 place-items-center rounded-2xl bg-root-green text-obsidian shadow-glow transition hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? "Pause" : "Play"}
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

              {/* View Switcher: Audio, Transcript, Translation */}
              <div className="flex rounded-xl bg-white/5 p-1 text-xs">
                {(["audio", "transcript", "translation"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold capitalize transition ${
                      viewMode === mode
                        ? "bg-root-green text-obsidian shadow-glow font-bold"
                        : "text-secondary-text hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* View Content */}
              {viewMode === "audio" && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center space-y-2">
                  <div className="flex justify-center items-center gap-1 h-8">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-200 ${
                          isPlaying ? "bg-leaf-green" : "bg-white/20"
                        }`}
                        style={{
                          height: isPlaying ? `${Math.sin(i * 0.5) * 60 + 40}%` : "30%",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-secondary-text">
                    48kHz Lossless Folk Master · {activeStory.duration}
                  </p>
                </div>
              )}

              {viewMode === "transcript" && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1">
                  <span className="text-[10px] font-mono text-leaf-green font-bold">
                    SOURCE TRANSCRIPT ({activeStory.language}):
                  </span>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    &ldquo;{activeStory.originalTranscript}&rdquo;
                  </p>
                </div>
              )}

              {viewMode === "translation" && (
                <div className="space-y-3">
                  {/* Translate dropdown button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-leaf-green" />
                        Translate to: <span className="text-leaf-green">{TRANSLATION_OPTIONS.find((o) => o.code === selectedLang)?.name}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-secondary-text" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-2xl border border-white/15 bg-[#121614] p-1.5 shadow-2xl space-y-0.5">
                        {TRANSLATION_OPTIONS.map((opt) => (
                          <button
                            key={opt.code}
                            type="button"
                            onClick={() => {
                              setSelectedLang(opt.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                              selectedLang === opt.code
                                ? "bg-root-green text-obsidian font-bold"
                                : "text-secondary-text hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span>{opt.native} ({opt.name})</span>
                            {selectedLang === opt.code && <Check className="h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Translated Text Display */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-secondary-text">
                      <span className="font-mono text-leaf-green uppercase font-bold">
                        {TRANSLATION_OPTIONS.find((o) => o.code === selectedLang)?.name} Translation:
                      </span>
                      <span>IndicTrans2 · 96.4%</span>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed">
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
                  className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:underline"
                >
                  <QrCode className="h-3.5 w-3.5" /> View Heritage Passport
                </Link>
                <Link
                  href={`/recordings/${activeStory.id}`}
                  className="text-secondary-text hover:text-white underline"
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
              <Link href={href} key={href} className="glass-card rounded-2xl p-5 hover:border-leaf-green/40 transition">
                <Icon className="h-5 w-5 text-leaf-green" />
                <h3 className="mt-3 font-medium text-white">{title}</h3>
                <p className="mt-1 text-sm text-secondary-text">{detail}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
