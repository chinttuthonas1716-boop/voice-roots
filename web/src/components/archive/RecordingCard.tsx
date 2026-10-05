"use client";

import React, { useState } from "react";
import { Play, Pause, Bookmark, Volume2, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface RecordingCardData {
  id: string;
  title: string;
  language: string;
  dialect?: string;
  duration: string;
  type: string;
  community: string;
  excerpt: string;
  translationExcerpt: string;
  confidence: number;
}

export function RecordingCard({ item }: { item: RecordingCardData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div
      className="netflix-card-wrapper flex-shrink-0 w-72 sm:w-80 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="netflix-card-surface p-5 flex flex-col justify-between h-full relative overflow-hidden group">
        {/* Ambient background glow on hover */}
        <div
          className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-root-emerald/15 blur-2xl pointer-events-none transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Top Badges & Animated Equalizer */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-root-emerald/15 border border-root-emerald/30 text-leaf-mint text-[11px] font-mono font-medium">
              {item.language}
            </span>

            {/* Netflix-style Equalizer Wave on Hover */}
            <div className="flex items-center gap-1.5 h-4">
              {isHovered && (
                <div className="flex items-center gap-0.5 h-3.5">
                  <div className="w-1 bg-root-glow rounded-full animate-equalizer-1" />
                  <div className="w-1 bg-leaf-mint rounded-full animate-equalizer-2" />
                  <div className="w-1 bg-root-emerald rounded-full animate-equalizer-3" />
                  <div className="w-1 bg-root-glow rounded-full animate-equalizer-4" />
                </div>
              )}
              <span className="text-[11px] font-mono text-text-muted">{item.duration}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-text-primary text-base group-hover:text-leaf-mint transition-colors line-clamp-1">
            {item.title}
          </h3>

          {/* Original Oral Snippet */}
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
            {item.excerpt}
          </p>

          {/* IndicTrans2 Translation Bubble */}
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-[11px] text-text-secondary italic line-clamp-2 leading-relaxed group-hover:border-root-emerald/20 transition-colors">
            "{item.translationExcerpt}"
          </div>
        </div>

        {/* Netflix Expanded Action Footer */}
        <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isPlaying
                  ? "bg-root-emerald text-obsidian shadow-emerald-glow"
                  : "bg-white/10 hover:bg-root-emerald hover:text-obsidian text-text-primary"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? "Playing" : "Preview"}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              className={`p-1.5 rounded-full border border-white/10 transition-colors ${
                isSaved ? "bg-earth text-white" : "bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10"
              }`}
              title={isSaved ? "Saved to Archive List" : "Save to Archive"}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Confidence Badge & Detail Link */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-root-glow font-medium text-[11px]">
              {(item.confidence * 100).toFixed(0)}% AI
            </span>
            <Link
              href={`/recordings/${item.id}`}
              className="text-text-muted hover:text-leaf-mint flex items-center transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
