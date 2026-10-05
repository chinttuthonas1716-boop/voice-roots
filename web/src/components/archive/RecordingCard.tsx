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
        {/* Ambient background glow on hover in Netflix Red */}
        <div
          className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-netflix-red/25 blur-3xl pointer-events-none transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Top Badges & Animated Equalizer */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-netflix-red/15 border border-netflix-red/40 text-netflix-white text-[11px] font-mono font-medium">
              {item.language}
            </span>

            {/* Netflix-style Equalizer Wave on Hover */}
            <div className="flex items-center gap-1.5 h-4">
              {isHovered && (
                <div className="flex items-center gap-0.5 h-3.5">
                  <div className="w-1 bg-netflix-red-hover rounded-full animate-equalizer-1" />
                  <div className="w-1 bg-netflix-red rounded-full animate-equalizer-2" />
                  <div className="w-1 bg-netflix-red-dark rounded-full animate-equalizer-3" />
                  <div className="w-1 bg-netflix-red rounded-full animate-equalizer-4" />
                </div>
              )}
              <span className="text-[11px] font-mono text-netflix-gray">{item.duration}</span>
            </div>
          </div>

          {/* Title with hover to Netflix Red */}
          <h3 className="font-semibold text-white text-base group-hover:text-netflix-red transition-colors line-clamp-1">
            {item.title}
          </h3>

          {/* Original Oral Snippet */}
          <p className="text-xs text-netflix-light line-clamp-2 leading-relaxed">
            {item.excerpt}
          </p>

          {/* IndicTrans2 Translation Bubble */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[11px] text-netflix-gray italic line-clamp-2 leading-relaxed group-hover:border-netflix-red/35 transition-colors">
            "{item.translationExcerpt}"
          </div>
        </div>

        {/* Netflix Expanded Action Footer */}
        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isPlaying
                  ? "bg-netflix-red text-white shadow-netflix-glow scale-105"
                  : "bg-white text-netflix-black hover:bg-netflix-red hover:text-white"
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? "Playing" : "Preview"}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              className={`p-1.5 rounded-full border border-white/10 transition-colors ${
                isSaved ? "bg-netflix-red text-white border-netflix-red" : "bg-white/5 text-netflix-gray hover:text-white hover:bg-white/15"
              }`}
              title={isSaved ? "Saved to My List" : "Add to My List"}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Confidence Badge & Detail Link */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-netflix-red font-bold text-[11px]">
              {(item.confidence * 100).toFixed(0)}% AI
            </span>
            <Link
              href={`/recordings/${item.id}`}
              className="text-netflix-gray hover:text-netflix-red flex items-center transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
