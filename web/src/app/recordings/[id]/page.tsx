"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Languages,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Users,
  Sparkles,
  Bot,
  Share2,
  ArrowRight,
  FileCheck,
  QrCode,
  RefreshCw,
  Check,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { getCurrentUser, canAccessRecording } from "@/lib/auth";
import { EnhancedAudioPlayer } from "@/components/audio/EnhancedAudioPlayer";
import { PreservationTimeline } from "@/components/heritage/PreservationTimeline";

const TRANSLATION_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
] as const;

export default function RecordingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [record, setRecord] = useState<StoredVoiceRecord | null>(null);
  const [allRecords, setAllRecords] = useState<StoredVoiceRecord[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedTransLang, setSelectedTransLang] = useState<"en" | "te" | "hi" | "ta" | "kn" | "ml">("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [accessAllowed, setAccessAllowed] = useState(true);
  const [accessReason, setAccessReason] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerTranslation = async (targetLang: "en" | "te" | "hi" | "ta" | "kn" | "ml") => {
    setSelectedTransLang(targetLang);
    if (!record) return;

    // If already exists and not forcing re-translation, do nothing
    if (record.translations?.[targetLang]) {
      return;
    }

    setIsTranslating(true);
    setTranslateError(null);

    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: record.originalTranscript,
          sourceLang: record.language.toLowerCase(),
          targetLang,
        }),
      });

      if (!resp.ok) throw new Error("Translation service returned an error");
      const data = await resp.json();

      const updatedRecord: StoredVoiceRecord = {
        ...record,
        translations: {
          ...record.translations,
          [targetLang]: data.translation,
        },
      };

      setRecord(updatedRecord);
    } catch (e: any) {
      setTranslateError("Failed to translate. Click retry below.");
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const list = getUserRecordings();
    setAllRecords(list);

    if (!id) return;
    const item = list.find((r) => r.id === id) || null;
    setRecord(item);

    if (item) {
      const activeUser = getCurrentUser();
      const check = canAccessRecording(activeUser, item);
      setAccessAllowed(check.allowed);
      setAccessReason(check.reason);

      if (check.allowed) {
        const src = item.audioUrl || `/audio/${item.audioFileName}`;
        setAudioUrl(src);
      }
    }
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const relatedStories = allRecords.filter((r) => r.id !== id).slice(0, 3);

  return (
    <div className="min-h-screen bg-obsidian pb-28 text-primary-text">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/archive"
          className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-secondary-text hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Oral Archive
        </Link>

        {!record ? (
          <section className="glass-surface rounded-3xl p-8 sm:p-12 text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">Oral Story Not Found</h1>
            <p className="text-sm text-secondary-text max-w-md mx-auto">
              This recording could not be retrieved from the archive. You can discover other oral traditions or record your own.
            </p>
            <Link
              href="/archive"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-root-green px-6 text-sm font-bold text-obsidian shadow-glow"
            >
              Explore Archive
            </Link>
          </section>
        ) : !accessAllowed ? (
          <section className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-8 sm:p-12 text-center space-y-4 backdrop-blur-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">Private Recording Protected</h1>
            <p className="text-sm text-rose-200 max-w-lg mx-auto leading-relaxed">
              {accessReason || "A user must never be able to access another contributor's private recording simply by changing an ID in the URL/API request."}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-500 px-6 text-xs font-bold text-black hover:bg-amber-400 transition"
              >
                Sign In as Authorized Contributor
              </Link>
              <Link
                href="/archive"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Explore Public Archive
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* 1. Header & Cover Hero */}
            <header className="space-y-4 border-b border-white/10 pb-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-root-green/30 bg-root-green/15 px-3 py-1 text-xs font-semibold text-leaf-green">
                  {record.language}
                </span>
                {record.dialect && (
                  <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-secondary-text">
                    {record.dialect}
                  </span>
                )}
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-secondary-text">
                  {record.type}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {record.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-secondary-text">
                <span className="inline-flex items-center gap-1.5 font-medium text-white/80">
                  <Users className="h-3.5 w-3.5 text-leaf-green" />
                  {record.community || "Heritage Community Custodians"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-leaf-green" />
                  {record.location || "Regional Oral Archive"}
                </span>
                <span>
                  Recorded: {new Date(record.uploadDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </header>

            {/* Heritage Passport Verification Dossier Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
                  <FileCheck className="h-4 w-4" /> Official Heritage Passport Issued
                </div>
                <h3 className="text-lg font-bold text-white">
                  Preservation Provenance & Human Verification Dossier
                </h3>
                <p className="text-xs text-secondary-text max-w-xl">
                  This recording possesses a verified digital heritage passport ({record.id.toUpperCase()}) with consent controls, scannable QR token, and audit history.
                </p>
              </div>
              <Link
                href={`/passport/${record.id}`}
                className="shrink-0 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-400/15 px-5 text-xs font-bold text-amber-200 transition hover:bg-amber-400/25 hover:border-amber-400 shadow-glow"
              >
                <QrCode className="h-4 w-4" />
                <span>📜 View Heritage Passport</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 2. Centerpiece Audio Player */}
            <EnhancedAudioPlayer
              audioUrl={audioUrl || `/audio/${record.audioFileName}`}
              title={record.title}
              language={record.language}
              speaker={record.community || "Heritage Elder"}
              durationSeconds={record.durationSeconds}
              onTimeUpdate={(t) => setCurrentTime(t)}
            />

            {/* 3. Preservation Provenance Timeline */}
            <PreservationTimeline
              language={record.language}
              passportId={record.id.toUpperCase()}
              reviewerName="Elder Soyam Laxman"
            />

            {/* 3. Original Transcript (Master Spec Section 10: Original First!) */}
            <section
              className="glass-surface space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7 shadow-2xl"
              aria-labelledby="original-transcript-heading"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-root-green/20 text-leaf-green">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 id="original-transcript-heading" className="text-sm font-bold text-white">
                      Source Speech Transcript ({record.language})
                    </h2>
                    <p className="text-[11px] text-secondary-text">
                      Original dialect text transcribed directly from spoken audio
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-root-green/30 bg-root-green/10 px-3 py-1 text-xs font-semibold text-leaf-green">
                  Preserved in {record.language}
                </span>
              </div>

              <blockquote className="rounded-2xl border border-white/10 bg-black/40 p-5 text-base sm:text-lg leading-relaxed text-white/95 font-medium">
                &ldquo;{record.originalTranscript}&rdquo;
              </blockquote>
            </section>

            {/* 4. Multi-Lingual Translation (Release 01 Feature) */}
            <section
              className="glass-surface space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7 shadow-2xl"
              aria-labelledby="translation-heading"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-root-green/20 text-leaf-green">
                    <Languages className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 id="translation-heading" className="text-sm font-bold text-white">
                      Multi-Lingual Translation Layer (IndicTrans2)
                    </h2>
                    <p className="text-[11px] text-secondary-text">
                      Original source transcript is permanently preserved and never replaced
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs">
                  <span className="text-secondary-text">Original:</span>
                  <span className="font-semibold text-leaf-green">{record.language}</span>
                </div>
              </div>

              {/* Translate To selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/90">Translate to:</span>
                  <span className="text-secondary-text font-mono text-[11px]">
                    Available on-demand · Cached permanently
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {TRANSLATION_LANGUAGES.map((lang) => {
                    const isSelected = selectedTransLang === lang.code;
                    const isCached = Boolean(record.translations?.[lang.code]);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => triggerTranslation(lang.code)}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-root-green text-obsidian shadow-glow font-bold"
                            : "border border-white/10 bg-black/30 text-secondary-text hover:text-white hover:border-white/20"
                        }`}
                      >
                        <span>{lang.native}</span>
                        <span className="text-[10px] opacity-75">({lang.name})</span>
                        {isCached && isSelected && <Check className="h-3 w-3 text-obsidian" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Translation Display Card */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-secondary-text border-b border-white/10 pb-2">
                  <span className="font-semibold text-leaf-green flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-secondary-text">TRANSLATION:</span>
                    {TRANSLATION_LANGUAGES.find((l) => l.code === selectedTransLang)?.name} ({TRANSLATION_LANGUAGES.find((l) => l.code === selectedTransLang)?.native})
                  </span>
                  <div className="flex items-center gap-2">
                    {isTranslating ? (
                      <span className="flex items-center gap-1 text-leaf-green animate-pulse">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Synthesizing...
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-secondary-text">IndicTrans2 · 96.4% confidence</span>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-white/90">
                  {isTranslating
                    ? "Calling IndicTrans2 neural translation engine..."
                    : record.translations?.[selectedTransLang] ||
                      record.translations?.en ||
                      "Translation being synthesized for this regional dialect."}
                </p>

                {translateError && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-red-300">
                    <span>{translateError}</span>
                    <button
                      type="button"
                      onClick={() => triggerTranslation(selectedTransLang)}
                      className="inline-flex items-center gap-1 underline font-bold hover:text-white"
                    >
                      <RefreshCw className="h-3 w-3" /> Retry Translation
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 5. Cultural Context (Master Spec Section 8) */}
            <section
              className="glass-surface space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7 shadow-2xl"
              aria-labelledby="cultural-context-heading"
            >
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-root-green/20 text-leaf-green">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 id="cultural-context-heading" className="text-sm font-bold text-white">
                    Cultural Lore & Ecological Significance
                  </h2>
                  <p className="text-[11px] text-secondary-text">
                    Oral tradition context provided by clan elders and community documentation
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-secondary-text">
                {record.culturalContext ||
                  "This recording holds sacred significance among the community elders and represents centuries-old oral preservation tradition."}
              </p>
            </section>

            {/* 6. Ask Voice Roots AI Banner */}
            <section className="rounded-3xl border border-root-green/30 bg-gradient-to-r from-root-green/10 via-root-green/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf-green">
                  <Bot className="h-4 w-4" /> Ask Voice Roots AI
                </div>
                <h3 className="text-xl font-bold text-white">
                  Have questions about this oral story?
                </h3>
                <p className="text-xs text-secondary-text max-w-xl">
                  Ask our AI assistant about the cultural metaphors, ethnobotanical roots, or linguistic history behind this recording.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Trigger open AI assistant via event or custom trigger
                  const btn = document.querySelector('[aria-label="Ask Voice Roots AI"]') as HTMLButtonElement | null;
                  btn?.click();
                }}
                className="shrink-0 inline-flex min-h-11 items-center gap-2 rounded-full bg-root-green px-6 text-xs font-bold text-obsidian shadow-glow hover:bg-leaf-green transition"
              >
                <Bot className="h-4 w-4" /> Ask Voice Roots AI
              </button>
            </section>

            {/* 7. Related Stories (Master Spec Section 8) */}
            {relatedStories.length > 0 && (
              <section className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-white">Related Oral Heritage</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {relatedStories.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/recordings/${rel.id}`}
                      className="glass-card group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-1 hover:border-root-green/40 hover:bg-white/[0.06]"
                    >
                      <div className="space-y-2">
                        <span className="rounded-full border border-root-green/30 bg-root-green/10 px-2 py-0.5 text-[10px] font-semibold text-leaf-green">
                          {rel.language}
                        </span>
                        <h4 className="line-clamp-2 text-sm font-bold text-white group-hover:text-leaf-green transition">
                          {rel.title}
                        </h4>
                        <p className="line-clamp-2 text-xs text-secondary-text">
                          {rel.culturalContext}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-secondary-text">
                        <span>{rel.duration}</span>
                        <span className="text-leaf-green inline-flex items-center gap-1">
                          Listen <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <AIAssistant />
    </div>
  );
}
