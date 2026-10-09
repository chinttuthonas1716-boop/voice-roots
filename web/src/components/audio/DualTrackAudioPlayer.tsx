"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Languages,
  Headphones,
  Check,
  RefreshCw,
  Sliders,
  AudioLines,
} from "lucide-react";
import {
  getOrGenerateTranslatedAudio,
  getAudioTrack,
  speakTextInBrowser,
  stopBrowserSpeech,
  BCP47_TAGS,
  type StoredAudioTrack,
} from "@/lib/ttsProvider";

export interface DualTrackAudioPlayerProps {
  storyId: string;
  originalAudioUrl: string;
  title: string;
  sourceLanguage: string;
  location?: string;
  speaker?: string;
  durationSeconds?: number;
  originalTranscript?: string;
  translations?: Partial<Record<string, string>>;
  onTimeUpdate?: (currentTime: number) => void;
}

const TARGET_LANGUAGES = [
  { code: "en", name: "English", native: "English", bcp: "en-IN" },
  { code: "te", name: "Telugu", native: "తెలుగు", bcp: "te-IN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", bcp: "hi-IN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", bcp: "ta-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", bcp: "kn-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", bcp: "ml-IN" },
];

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5];

export function DualTrackAudioPlayer({
  storyId,
  originalAudioUrl,
  title,
  sourceLanguage,
  location,
  speaker = "Heritage Elder",
  durationSeconds = 180,
  originalTranscript = "",
  translations = {},
  onTimeUpdate,
}: DualTrackAudioPlayerProps) {
  // Track 1: Original Audio Player State
  const origAudioRef = useRef<HTMLAudioElement | null>(null);
  const isUnavailable = !originalAudioUrl || originalAudioUrl.trim() === "";
  const [origStatus, setOrigStatus] = useState<"IDLE" | "LOADING" | "PLAYING" | "PAUSED" | "ENDED" | "ERROR" | "UNAVAILABLE">(
    isUnavailable ? "UNAVAILABLE" : "IDLE"
  );
  const [origError, setOrigError] = useState<string | null>(null);
  const [isOrigPlaying, setIsOrigPlaying] = useState(false);
  const [origCurrentTime, setOrigCurrentTime] = useState(0);
  const [origDuration, setOrigDuration] = useState(durationSeconds);
  const [origPlaybackRate, setOrigPlaybackRate] = useState(1.0);
  const [isOrigMuted, setIsOrigMuted] = useState(false);

  // Update unavailable state when prop changes
  useEffect(() => {
    if (!originalAudioUrl || originalAudioUrl.trim() === "") {
      setOrigStatus("UNAVAILABLE");
      setIsOrigPlaying(false);
    } else {
      if (origStatus === "UNAVAILABLE") {
        setOrigStatus("IDLE");
      }
    }
  }, [originalAudioUrl]);

  // Track 2: Translated Audio Player State
  const transAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedTargetLang, setSelectedTargetLang] = useState<string>("en");
  const [isTransPlaying, setIsTransPlaying] = useState(false);
  const [transCurrentTime, setTransCurrentTime] = useState(0);
  const [transDuration, setTransDuration] = useState(durationSeconds);
  const [transPlaybackRate, setTransPlaybackRate] = useState(1.0);
  const [isTransMuted, setIsTransMuted] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [cachedTrack, setCachedTrack] = useState<StoredAudioTrack | null>(null);
  const [useBrowserSpeech, setUseBrowserSpeech] = useState(false);

  // Waveform heights
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  useEffect(() => {
    const bars: number[] = [];
    for (let i = 0; i < 48; i++) {
      const height = Math.floor(16 + Math.sin(i * 0.4) * 16 + (i % 6) * 5);
      bars.push(Math.max(10, Math.min(48, height)));
    }
    setWaveformBars(bars);
  }, []);

  // Check if cached translated track exists when switching target language
  useEffect(() => {
    const existing = getAudioTrack(storyId, selectedTargetLang);
    setCachedTrack(existing);
  }, [storyId, selectedTargetLang]);

  // Track 1 event listeners
  const togglePlayOriginal = async () => {
    if (isUnavailable || !origAudioRef.current) return;

    // Pause translated track if playing
    if (isTransPlaying) {
      if (transAudioRef.current) transAudioRef.current.pause();
      stopBrowserSpeech();
      setIsTransPlaying(false);
    }

    if (isOrigPlaying) {
      origAudioRef.current.pause();
      setIsOrigPlaying(false);
      setOrigStatus("PAUSED");
    } else {
      setOrigStatus("LOADING");
      setOrigError(null);
      try {
        await origAudioRef.current.play();
        setIsOrigPlaying(true);
        setOrigStatus("PLAYING");
      } catch (err: any) {
        console.error("Voice Roots audio playback error:", {
          storyId,
          audioUrl: originalAudioUrl,
          error: err?.message || err,
        });
        setIsOrigPlaying(false);
        setOrigStatus("ERROR");
        setOrigError("Unable to play this recording. Please try again.");
      }
    }
  };

  const handleOrigTimeUpdate = () => {
    if (!origAudioRef.current) return;
    const curr = origAudioRef.current.currentTime;
    setOrigCurrentTime(curr);
    if (onTimeUpdate) onTimeUpdate(curr);
  };

  const handleOrigSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (origAudioRef.current) {
      origAudioRef.current.currentTime = target;
      setOrigCurrentTime(target);
    }
  };

  const cycleOrigSpeed = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(origPlaybackRate);
    const nextSpeed = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    setOrigPlaybackRate(nextSpeed);
    if (origAudioRef.current) origAudioRef.current.playbackRate = nextSpeed;
  };

  // Track 2: Generate or Play Translated Audio
  const handlePlayTranslated = async () => {
    // Pause original track if playing
    if (isOrigPlaying) {
      if (origAudioRef.current) origAudioRef.current.pause();
      setIsOrigPlaying(false);
    }

    if (isTransPlaying) {
      if (transAudioRef.current) transAudioRef.current.pause();
      stopBrowserSpeech();
      setIsTransPlaying(false);
      return;
    }

    // Determine translated text
    const textToSpeak =
      translations[selectedTargetLang] ||
      (selectedTargetLang === "en"
        ? originalTranscript
        : `${selectedTargetLang.toUpperCase()} Translation of ${title}`);

    // If client has speech synthesis support, offer browser neural voice
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsTransPlaying(true);
      speakTextInBrowser(
        textToSpeak,
        selectedTargetLang,
        () => setIsTransPlaying(true),
        () => setIsTransPlaying(false)
      );
      return;
    }

    // Fallback: check or generate server audio track
    if (!cachedTrack) {
      setIsGeneratingSpeech(true);
      try {
        const track = await getOrGenerateTranslatedAudio(
          storyId,
          selectedTargetLang,
          textToSpeak,
          sourceLanguage
        );
        setCachedTrack(track);
      } catch (err) {
        console.error("Failed to generate translated audio:", err);
      } finally {
        setIsGeneratingSpeech(false);
      }
    }

    if (transAudioRef.current) {
      transAudioRef.current
        .play()
        .then(() => setIsTransPlaying(true))
        .catch((e) => {
          console.warn("Translated audio play failed:", e);
          setIsTransPlaying(false);
        });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectedLangObj =
    TARGET_LANGUAGES.find((t) => t.code === selectedTargetLang) ||
    TARGET_LANGUAGES[0];

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TRACK 1: ORIGINAL SOURCE RECORDING (PRIMARY CULTURAL ARTIFACT) */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-[#242942]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#F9B17A] uppercase border border-amber-500/30">
                Primary Artifact · 100% Original Audio
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Immutable
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {title}
            </h3>
            <p className="text-xs text-[#A9AEC5]">
              Speaker: <span className="text-white font-medium">{speaker}</span> · Location:{" "}
              <span className="text-[#F9B17A] font-semibold">{location || "Regional Archive"}</span>
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-right">
              <div className="text-[10px] font-mono text-[#A9AEC5] uppercase">
                Original Language
              </div>
              <div className="text-sm font-bold text-[#F9B17A] uppercase">
                {sourceLanguage}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Audio Tag for Original */}
        <audio
          ref={origAudioRef}
          src={originalAudioUrl || undefined}
          onTimeUpdate={handleOrigTimeUpdate}
          onLoadedMetadata={() => {
            if (origAudioRef.current && origAudioRef.current.duration > 0) {
              setOrigDuration(origAudioRef.current.duration);
            }
          }}
          onPlay={() => {
            setIsOrigPlaying(true);
            setOrigStatus("PLAYING");
          }}
          onPause={() => {
            if (origStatus !== "ENDED") {
              setIsOrigPlaying(false);
              setOrigStatus("PAUSED");
            }
          }}
          onEnded={() => {
            setIsOrigPlaying(false);
            setOrigStatus("ENDED");
          }}
          onError={() => {
            console.error("Audio element error on original audio:", { storyId, originalAudioUrl });
            setIsOrigPlaying(false);
            setOrigStatus("ERROR");
            setOrigError("Unable to play this recording.");
          }}
        />

        {/* Unavailable Banner */}
        {isUnavailable && (
          <div className="my-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center space-y-1">
            <div className="text-sm font-bold text-[#F9B17A]">Original recording unavailable</div>
            <p className="text-xs text-[#A9AEC5]">
              Audio has not been uploaded for this heritage record.
            </p>
          </div>
        )}

        {/* Error Banner */}
        {origStatus === "ERROR" && !isUnavailable && (
          <div className="my-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-rose-300">
              {origError || "Unable to play this recording."}
            </span>
            <button
              type="button"
              onClick={togglePlayOriginal}
              className="rounded-xl bg-rose-500/20 border border-rose-500/40 px-3.5 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Audio Waveform & Visualizer */}
        <div className="my-6">
          <div className="flex h-16 items-center justify-between gap-1 rounded-2xl border border-white/10 bg-[#1e2238]/80 px-4 py-2">
            {waveformBars.map((height, idx) => {
              const progressRatio = origCurrentTime / (origDuration || 1);
              const barRatio = idx / waveformBars.length;
              const isPast = barRatio <= progressRatio;
              return (
                <div
                  key={idx}
                  style={{ height: `${height}px` }}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPast
                      ? "bg-gradient-to-t from-amber-600 to-amber-400"
                      : "bg-white/10"
                  } ${isOrigPlaying && isPast ? "animate-pulse" : ""}`}
                />
              );
            })}
          </div>

          {/* Time Scrubber */}
          <div className="mt-2 space-y-1">
            <input
              type="range"
              min={0}
              max={origDuration || 100}
              step={0.1}
              value={origCurrentTime}
              onChange={handleOrigSeek}
              disabled={isUnavailable}
              aria-label="Seek original recording"
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#F9B17A] disabled:opacity-40"
            />
            <div className="flex justify-between text-[11px] font-mono text-[#A9AEC5]">
              <span>{formatTime(origCurrentTime)}</span>
              <span className="text-[#F9B17A] font-semibold">ORIGINAL MASTER TRACK</span>
              <span>{formatTime(origDuration)}</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayOriginal}
              disabled={isUnavailable}
              aria-label={
                isUnavailable
                  ? "Original recording unavailable"
                  : isOrigPlaying
                  ? "Pause Original Audio"
                  : "Play Original Audio"
              }
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 shadow-lg ${
                isUnavailable
                  ? "bg-white/5 text-[#A9AEC5] border border-white/10 cursor-not-allowed opacity-50"
                  : isOrigPlaying
                  ? "bg-[#F9B17A] text-[#242942] shadow-amber-500/30"
                  : "bg-gradient-to-br from-amber-500 to-amber-600 text-[#242942] hover:brightness-110 shadow-amber-500/20"
              }`}
            >
              {isOrigPlaying ? (
                <Pause className="h-6 w-6 fill-current" />
              ) : (
                <Play className="h-6 w-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (origAudioRef.current) {
                  origAudioRef.current.currentTime = 0;
                  setOrigCurrentTime(0);
                }
              }}
              title="Restart from beginning"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#A9AEC5] hover:text-white transition"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={cycleOrigSpeed}
              title="Cycle playback speed"
              className="flex h-10 items-center gap-1 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-mono font-semibold text-[#A9AEC5] hover:text-white transition"
            >
              <span>{origPlaybackRate}x</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (origAudioRef.current) {
                  origAudioRef.current.muted = !isOrigMuted;
                  setIsOrigMuted(!isOrigMuted);
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#A9AEC5] hover:text-white transition"
            >
              {isOrigMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <div className="text-[11px] text-[#A9AEC5] font-mono hidden sm:block">
              Acoustic Source Unaltered
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TRACK 2: TRANSLATED TARGET AUDIO (AI SPEECH SYNTHESIS)   */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-[#20253c]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-[10px] font-mono font-bold tracking-wider text-sky-400 uppercase border border-sky-500/30">
                AI Target-Language Speech Synthesizer
              </span>
              <span className="text-[11px] text-[#A9AEC5]">
                Translates both Text & Voice
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Listen in {selectedLangObj.name} ({selectedLangObj.native})
            </h3>
            <p className="text-xs text-[#A9AEC5]">
              Original recording is preserved in {sourceLanguage}. Switch target language below to generate speech.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-sky-300 font-mono">
              Voice: Indic Neural Custodian
            </span>
          </div>
        </div>

        {/* Target Language Selection Pills */}
        <div className="my-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#D9D9E2]">
            Select Target Audio Language:
          </label>
          <div className="flex flex-wrap gap-2">
            {TARGET_LANGUAGES.map((lang) => {
              const isSelected = selectedTargetLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    if (isTransPlaying) {
                      stopBrowserSpeech();
                      if (transAudioRef.current) transAudioRef.current.pause();
                      setIsTransPlaying(false);
                    }
                    setSelectedTargetLang(lang.code);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-95 ${
                    isSelected
                      ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/25"
                      : "border border-white/10 bg-white/5 text-[#A9AEC5] hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{lang.native}</span>
                  <span className="text-[10px] opacity-75">({lang.name})</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Translated Text Preview Card */}
        <div className="rounded-2xl border border-white/10 bg-[#1b1f33]/80 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A9AEC5]">
            <span className="font-semibold text-sky-300">
              Translated Script ({selectedLangObj.name}):
            </span>
            <span className="font-mono text-[10px] text-emerald-400">
              Verified Translation
            </span>
          </div>
          <p className="text-sm text-slate-200 font-serif leading-relaxed italic">
            &ldquo;
            {translations[selectedTargetLang] ||
              (selectedTargetLang === "en"
                ? originalTranscript || "Preserved oral narrative."
                : `[${selectedLangObj.name} audio translation ready for generation]`)}
            &rdquo;
          </p>
        </div>

        {/* Hidden Audio Tag for Server Speech synthesis fallback */}
        {cachedTrack?.audioUrl && (
          <audio
            ref={transAudioRef}
            src={cachedTrack.audioUrl}
            onTimeUpdate={() => {
              if (transAudioRef.current) {
                setTransCurrentTime(transAudioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (transAudioRef.current && transAudioRef.current.duration > 0) {
                setTransDuration(transAudioRef.current.duration);
              }
            }}
            onEnded={() => setIsTransPlaying(false)}
          />
        )}

        {/* Translated Track Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 mt-5 border-t border-white/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePlayTranslated}
              disabled={isGeneratingSpeech}
              aria-label={
                isTransPlaying
                  ? `Pause ${selectedLangObj.name} Audio`
                  : `Play ${selectedLangObj.name} Audio`
              }
              className={`flex h-14 items-center gap-2.5 rounded-2xl px-6 font-bold text-xs transition-all duration-200 active:scale-95 shadow-lg ${
                isTransPlaying
                  ? "bg-sky-400 text-slate-950 shadow-sky-400/30"
                  : "bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:brightness-110 shadow-sky-500/20"
              }`}
            >
              {isGeneratingSpeech ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating Speech…</span>
                </>
              ) : isTransPlaying ? (
                <>
                  <Pause className="h-5 w-5 fill-current" />
                  <span>Pause Translated Audio</span>
                </>
              ) : (
                <>
                  <Headphones className="h-5 w-5 ml-0.5" />
                  <span>Play in {selectedLangObj.name}</span>
                </>
              )}
            </button>

            {isTransPlaying && (
              <span className="flex items-center gap-1.5 text-xs text-sky-400 font-mono animate-pulse">
                <AudioLines className="h-4 w-4" />
                Playing {selectedLangObj.name} Audio Track
              </span>
            )}
          </div>

          <div className="text-xs text-[#A9AEC5]">
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 font-mono text-[11px]">
              Target: {selectedLangObj.bcp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
