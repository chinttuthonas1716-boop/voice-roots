"use client";

import React, { useState } from "react";
import { Play, Pause, Bookmark, Shield, Sparkles } from "lucide-react";
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

  return (
    <div className="glass-card flex-shrink-0 w-72 sm:w-80 rounded-2xl p-5 flex flex-col justify-between group cursor-pointer border border-white/5 hover:border-root-green/40">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-root-green/10 border border-root-green/20 text-leaf-green text-[11px] font-mono">
            {item.language}
          </span>
          <span className="text-[11px] font-mono text-secondary-text">{item.duration}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white text-base group-hover:text-leaf-green transition-colors line-clamp-1">
          {item.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-secondary-text line-clamp-2 leading-relaxed">
          {item.excerpt}
        </p>

        {/* Translation teaser */}
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-secondary-text/80 italic line-clamp-2">
          "{item.translationExcerpt}"
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-root-green/20 hover:text-leaf-green text-xs font-medium text-white transition-all"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? "Pause" : "Listen"}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-secondary-text">
          <span className="text-root-green">{(item.confidence * 100).toFixed(0)}% AI</span>
          <Link
            href={`/archive`}
            className="hover:text-white transition-colors underline decoration-white/20 underline-offset-2"
          >
            Read
          </Link>
        </div>
      </div>
    </div>
  );
}
