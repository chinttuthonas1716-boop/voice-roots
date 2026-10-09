"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Sparkles,
  Maximize2,
} from "lucide-react";

interface EnhancedAudioPlayerProps {
  audioUrl: string;
  title: string;
  language: string;
  speaker?: string;
  durationSeconds?: number;
  onTimeUpdate?: (currentTime: number) => void;
}

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5];

export function EnhancedAudioPlayer({
  audioUrl,
  title,
  language,
  speaker = "Community Elder",
  durationSeconds = 180,
  onTimeUpdate,
}: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  // Generate responsive decorative waveform amplitudes
  useEffect(() => {
    const bars: number[] = [];
    for (let i = 0; i < 48; i++) {
      // Natural speech cadence pseudo-waveform pattern
      const height = Math.floor(18 + Math.sin(i * 0.35) * 14 + (i % 5) * 6);
      bars.push(Math.max(12, Math.min(48, height)));
    }
    setWaveformBars(bars);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Playback prevented:", e);
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);
    if (onTimeUpdate) onTimeUpdate(curr);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const cycleSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const nextSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-royal-indigo/90 via-[#140E0C]/95 to-obsidian/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header Info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-heritage-gold">
            Centerpiece Oral Audio Playback
          </span>
          <h3 className="text-xl font-bold text-warm-ivory mt-0.5">{title}</h3>
          <p className="text-xs text-soft-lavender">
            {language} • Spoken by {speaker}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full border border-heritage-teal/30 bg-heritage-teal/10 px-3 py-1 text-xs font-semibold text-heritage-teal">
            48kHz Lossless Master
          </span>
        </div>
      </div>

      {/* Large Reactive Audio Waveform */}
      <div className="my-6">
        <div className="flex h-16 items-center justify-between gap-1 rounded-2xl bg-black/40 px-4 py-2 border border-white/5">
          {waveformBars.map((height, index) => {
            const barFraction = (index / waveformBars.length) * 100;
            const isPassed = barFraction <= progressPercent;

            return (
              <div
                key={index}
                style={{ height: `${height}px` }}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isPassed
                    ? "bg-gradient-to-t from-heritage-gold to-[#f0c978] shadow-gold-glow"
                    : "bg-white/15"
                } ${isPlaying && isPassed ? "animate-pulse" : ""}`}
              />
            );
          })}
        </div>

        {/* Scrub Bar Slider */}
        <div className="mt-3 relative">
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E58A4E]"
            aria-label="Seek oral audio track"
          />
          <div className="flex justify-between text-[11px] font-mono text-soft-lavender mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* Audio Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-13 w-13 items-center justify-center rounded-2xl bg-heritage-gold text-[#0C0908] shadow-gold-glow transition hover:scale-105 active:scale-95 font-bold"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 fill-current" />
            ) : (
              <Play className="h-6 w-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-soft-lavender hover:text-warm-ivory hover:bg-white/10 transition"
            title="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Speed, Volume, and Chapter Controls */}
        <div className="flex items-center gap-2">
          {/* Playback Speed Selector */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-heritage-gold hover:bg-white/10 transition"
            title="Adjust playback speed"
          >
            <Gauge className="h-3.5 w-3.5" />
            <span>{playbackRate}x Speed</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-soft-lavender hover:text-warm-ivory hover:bg-white/10 transition"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
