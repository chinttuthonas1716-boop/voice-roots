"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Languages,
  FileText,
} from "lucide-react";
import { GlassButton } from "./GlassButton";
import { GlassBadge } from "./GlassBadge";

export interface GlassPlayerProps {
  src: string;
  title: string;
  speaker?: string;
  language?: string;
  dialect?: string;
  transcript?: string;
  translation?: string;
  className?: string;
}

export const GlassPlayer: React.FC<GlassPlayerProps> = ({
  src,
  title,
  speaker = "Elder Oral Storyteller",
  language = "Gondi (గోండీ)",
  dialect = "Central Dravidian Basin",
  transcript = "మా పూర్వీకుల కథలు ఈ అడవులలో నిక్షిప్తమై ఉన్నాయి...",
  translation = "The sacred oral tales of our ancient ancestors are preserved in these evergreen canopies...",
  className = "",
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isExpanded, setIsExpanded] = useState(false);

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
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.log("Audio play error:", e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`rounded-3xl bg-[#1C1512]/80 border border-white/12 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 ${className}`}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Main Player Bar */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Metadata */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E58A4E]/20 to-[#4E9F76]/20 border border-white/15 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(229,138,78,0.25)]">
              <span className="text-xl">🎙️</span>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E58A4E] rounded-full animate-ping" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[#F7F3EE] truncate">
                  {title}
                </h4>
                <GlassBadge variant="gold" size="sm">
                  {language}
                </GlassBadge>
              </div>
              <p className="text-xs text-[#C4B5A5] truncate mt-0.5">
                {speaker} • <span className="text-[#C4B5A5]/70">{dialect}</span>
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <GlassButton
              variant="icon"
              size="icon"
              onClick={handleRestart}
              aria-label="Restart audio track"
              className="w-10 h-10 min-w-[40px] min-h-[40px]"
            >
              <RotateCcw className="w-4 h-4 text-[#C4B5A5]" />
            </GlassButton>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause audio track" : "Play audio track"}
              className="w-12 h-12 rounded-2xl bg-[#E58A4E] hover:bg-[#ED9C66] text-[#0C0908] flex items-center justify-center shadow-[0_4px_24px_rgba(229,138,78,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#E58A4E]/50 min-w-[48px] min-h-[48px]"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <GlassButton
              variant="icon"
              size="icon"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="w-10 h-10 min-w-[40px] min-h-[40px]"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#E05A6F]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#C4B5A5]" />
              )}
            </GlassButton>

            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label="Toggle expanded lyrics and transcript"
              leftIcon={
                isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )
              }
              className="text-xs hidden md:inline-flex"
            >
              {isExpanded ? "Collapse" : "Transcript"}
            </GlassButton>
          </div>
        </div>

        {/* Scrubber & Duration */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#C4B5A5] w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek track position"
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E58A4E] focus:outline-none"
            />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#E58A4E] to-[#ED9C66] rounded-lg pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-[#C4B5A5] w-10 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Expandable Dual-View: Transcript + Parallel Translation */}
      {isExpanded && (
        <div className="border-t border-white/10 bg-black/30 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Spoken Transcript */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E58A4E]" />
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#E58A4E]">
                  Original Phonetic Recording ({language})
                </h5>
              </div>
              <p className="text-sm text-[#F7F3EE] leading-relaxed font-serif italic">
                "{transcript}"
              </p>
            </div>

            {/* Parallel Indic Translation */}
            <div className="p-4 rounded-2xl bg-[#4E9F76]/[0.06] border border-[#4E9F76]/25 space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#4E9F76]" />
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#4E9F76]">
                  IndicTrans2 Standard Translation (English / Indic)
                </h5>
              </div>
              <p className="text-sm text-[#F7F3EE] leading-relaxed">
                "{translation}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

