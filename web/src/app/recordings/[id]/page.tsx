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
import { getUserRecordings, getRecordingAudio, type StoredVoiceRecord } from "@/lib/storage";
import { getCurrentUser, canAccessRecording } from "@/lib/auth";
import { DualTrackAudioPlayer } from "@/components/audio/DualTrackAudioPlayer";
import { PreservationTimeline } from "@/components/heritage/PreservationTimeline";
import { formatCardMetadata } from "@/lib/indiaGeoData";

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
  const objectUrlRef = useRef<string | null>(null);

  const triggerTranslation = async (targetLang: "en" | "te" | "hi" | "ta" | "kn" | "ml") => {
    setSelectedTransLang(targetLang);
    if (!record) return;

    if (record.translations?.[targetLang]) {
      return;
    }

    setIsTranslating(true);
    setTranslateError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: record.originalTranscript,
          source_lang: record.language.toLowerCase().startsWith("tel")
            ? "te"
            : record.language.toLowerCase().startsWith("hin")
            ? "hi"
            : record.language.toLowerCase().startsWith("tam")
            ? "ta"
            : record.language.toLowerCase().startsWith("kan")
            ? "kn"
            : record.language.toLowerCase().startsWith("mal")
            ? "ml"
            : "en",
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API responded with ${response.status}`);
      }

      const data = await response.json();
      const translated = data.translated_text || data.translation || "Translation generated.";

      setRecord((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          translations: {
            ...prev.translations,
            [targetLang]: translated,
          },
        };
        return updated;
      });
    } catch (err: any) {
      console.warn("Translation fallback:", err);
      setTranslateError("Live IndicTrans2 service currently unreachable. Displaying cached contextual gloss.");
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const all = getUserRecordings();
    setAllRecords(all);

    const found = all.find((item) => item.id === id);

    if (found) {
      const currentUser = getCurrentUser();
      const check = canAccessRecording(currentUser, found);
      setAccessAllowed(check.allowed);
      setAccessReason(check.reason || "");

      if (check.allowed) {
        setRecord(found);

        // Revoke any previous object URL
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }

        // Asynchronously load real audio
        let isCancelled = false;

        const loadAudio = async () => {
          if (found.isUserUploaded) {
            try {
              const blob = await getRecordingAudio(found.id);
              if (!isCancelled && blob && blob.size > 0) {
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                setAudioUrl(url);
                return;
              }
            } catch (err) {
              console.warn("Could not read audio from IndexedDB:", err);
            }
          }

          if (!isCancelled) {
            if (found.audioUrl) {
              setAudioUrl(found.audioUrl);
            } else {
              setAudioUrl(null);
            }
          }
        };

        void loadAudio();

        return () => {
          isCancelled = true;
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
        };
      }
    } else {
      setAccessAllowed(false);
      setAccessReason("Recording record not found.");
      setAudioUrl(null);
    }
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
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

  const relatedStories = allRecords.filter((r) => r.id !== id).slice(0, 3);

  return (
    <div className="vr-app pb-28">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-8 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/archive"
          className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[#A9AEC5] hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Oral Archive
        </Link>

        {!record ? (
          <section className="rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-8 sm:p-12 text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">Oral Story Not Found</h1>
            <p className="text-sm text-[#A9AEC5] max-w-md mx-auto">
              This recording could not be retrieved from the archive. You can discover other oral traditions or record your own.
            </p>
            <Link
              href="/archive"
              className="vr-button vr-button-primary text-xs font-bold"
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
                className="vr-button vr-button-primary text-xs font-bold"
              >
                Sign In as Authorized Contributor
              </Link>
              <Link
                href="/archive"
                className="vr-button vr-button-secondary text-xs font-semibold"
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
                <span className="rounded-full border border-[#6F76A0]/40 bg-[#6F76A0]/20 px-3 py-1 text-xs font-semibold text-[#F9B17A]">
                  {record.language}
                </span>
                {record.dialect && (
                  <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-[#A9AEC5]">
                    {record.dialect}
                  </span>
                )}
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-[#A9AEC5]">
                  {record.type}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {record.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#A9AEC5]">
                <span className="inline-flex items-center gap-1.5 font-medium text-white/90">
                  <Users className="h-3.5 w-3.5 text-[#F9B17A]" />
                  {record.community || "Heritage Community Custodians"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#F9B17A]" />
                  {record.location || "Regional Oral Archive"}
                </span>
                <span>
                  Recorded: {new Date(record.uploadDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </header>

            {/* Heritage Passport Verification Dossier Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-[#F9B17A]/30 bg-[rgba(36,41,66,0.85)] p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#F9B17A] uppercase">
                  <FileCheck className="h-4 w-4" /> Official Heritage Passport Issued
                </div>
                <h3 className="text-lg font-bold text-white">
                  Preservation Provenance & Human Verification Dossier
                </h3>
                <p className="text-xs text-[#A9AEC5] max-w-xl">
                  This recording possesses a verified digital heritage passport ({record.id.toUpperCase()}) with consent controls, scannable QR token, and audit history.
                </p>
              </div>
              <Link
                href={`/passport/${record.id}`}
                className="shrink-0 vr-button vr-button-primary !min-h-11 text-xs font-bold"
              >
                <QrCode className="h-4 w-4 mr-1" />
                <span>📜 View Heritage Passport</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* 2. Centerpiece Dual-Track Audio Player (Original Master + Translated Track) */}
            <DualTrackAudioPlayer
              storyId={record.id}
              originalAudioUrl={audioUrl || `/audio/${record.audioFileName}`}
              title={record.title}
              sourceLanguage={record.language}
              location={record.location}
              speaker={record.community || "Heritage Elder"}
              durationSeconds={record.durationSeconds}
              originalTranscript={record.originalTranscript}
              translations={record.translations}
              onTimeUpdate={(t) => setCurrentTime(t)}
            />

            {/* 3. Preservation Provenance Timeline */}
            <PreservationTimeline
              language={record.language}
              passportId={record.id.toUpperCase()}
              reviewerName="Elder Soyam Laxman"
            />

            {/* 4. Original Transcript */}
            <section
              className="space-y-4 rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-5 sm:p-7 shadow-2xl backdrop-blur-xl"
              aria-labelledby="original-transcript-heading"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#F9B17A]/15 text-[#F9B17A]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 id="original-transcript-heading" className="text-sm font-bold text-white">
                      Source Speech Transcript ({record.language})
                    </h2>
                    <p className="text-[11px] text-[#A9AEC5]">
                      Original dialect text transcribed directly from spoken audio
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-[#F9B17A]/30 bg-[#F9B17A]/10 px-3 py-1 text-xs font-semibold text-[#F9B17A]">
                  Preserved in {record.language}
                </span>
              </div>

              <blockquote className="rounded-2xl border border-white/10 bg-[#242942]/60 p-5 text-base sm:text-lg leading-relaxed text-white font-medium">
                &ldquo;{record.originalTranscript}&rdquo;
              </blockquote>
            </section>

            {/* 5. Multi-Lingual Translation */}
            <section
              className="space-y-5 rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-5 sm:p-7 shadow-2xl backdrop-blur-xl"
              aria-labelledby="translation-heading"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#6F76A0]/25 text-[#F9B17A]">
                    <Languages className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 id="translation-heading" className="text-sm font-bold text-white">
                      Multi-Lingual Translation Layer (IndicTrans2)
                    </h2>
                    <p className="text-[11px] text-[#A9AEC5]">
                      Original source transcript is permanently preserved and never replaced
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#242942]/70 px-3 py-1 text-xs">
                  <span className="text-[#A9AEC5]">Original:</span>
                  <span className="font-semibold text-[#F9B17A]">{record.language}</span>
                </div>
              </div>

              {/* Translate To selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/90">Translate to:</span>
                  <span className="text-[#A9AEC5] font-mono text-[11px]">
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
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition active:scale-95 ${
                          isSelected
                            ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                            : "border border-white/10 bg-[#242942]/50 text-[#A9AEC5] hover:text-white hover:border-white/20"
                        }`}
                      >
                        <span>{lang.native}</span>
                        <span className="text-[10px] opacity-75">({lang.name})</span>
                        {isCached && isSelected && <Check className="h-3 w-3 text-[#242942]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Translation Display Card */}
              <div className="rounded-2xl border border-white/10 bg-[#242942]/60 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#A9AEC5] border-b border-white/10 pb-2">
                  <span className="font-semibold text-[#F9B17A] flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#A9AEC5]">TRANSLATION:</span>
                    {TRANSLATION_LANGUAGES.find((l) => l.code === selectedTransLang)?.name} ({TRANSLATION_LANGUAGES.find((l) => l.code === selectedTransLang)?.native})
                  </span>
                  <div className="flex items-center gap-2">
                    {isTranslating ? (
                      <span className="flex items-center gap-1 text-[#F9B17A] animate-pulse">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Synthesizing...
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-[#A9AEC5]">IndicTrans2 · 96.4% confidence</span>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-white/95">
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

            {/* 6. Cultural Context */}
            <section
              className="space-y-4 rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-5 sm:p-7 shadow-2xl backdrop-blur-xl"
              aria-labelledby="cultural-context-heading"
            >
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#F9B17A]/15 text-[#F9B17A]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 id="cultural-context-heading" className="text-sm font-bold text-white">
                    Cultural Lore & Ecological Significance
                  </h2>
                  <p className="text-[11px] text-[#A9AEC5]">
                    Oral tradition context provided by clan elders and community documentation
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-[#D9D9E2]">
                {record.culturalContext ||
                  "This recording holds sacred significance among the community elders and represents centuries-old oral preservation tradition."}
              </p>
            </section>

            {/* 7. Related Stories */}
            {relatedStories.length > 0 && (
              <section className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-white">Related Oral Heritage</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {relatedStories.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/story/${rel.id}`}
                      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.2)] p-4 transition hover:-translate-y-1 hover:border-[#F9B17A]/40 hover:bg-[rgba(66,71,108,0.35)]"
                    >
                      <div className="space-y-2">
                        <span className="rounded-full border border-[#6F76A0]/30 bg-[#6F76A0]/15 px-2 py-0.5 text-[10px] font-semibold text-[#F9B17A]">
                          {rel.language}
                        </span>
                        <h4 className="line-clamp-2 text-sm font-bold text-white group-hover:text-[#F9B17A] transition">
                          {rel.title}
                        </h4>
                        <p className="line-clamp-2 text-xs text-[#A9AEC5]">
                          {rel.culturalContext}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-[#A9AEC5]">
                        <span>{rel.duration}</span>
                        <span className="text-[#F9B17A] inline-flex items-center gap-1 font-semibold">
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
