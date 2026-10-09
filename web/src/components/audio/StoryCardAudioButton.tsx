"use client";

import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, AlertCircle, RefreshCw, AudioLines } from "lucide-react";
import { cardAudioPlayer, type PlaybackStatus } from "@/lib/cardAudioPlayer";

interface StoryCardAudioButtonProps {
  record: {
    id: string;
    title: string;
    language: string;
    audioUrl?: string;
    audioFileName?: string;
    isUserUploaded?: boolean;
  };
  compact?: boolean;
}

export function StoryCardAudioButton({ record, compact = false }: StoryCardAudioButtonProps) {
  const [state, setState] = useState<{ activeId: string | null; status: PlaybackStatus; error?: string }>({
    activeId: null,
    status: "IDLE",
  });

  useEffect(() => {
    if (!cardAudioPlayer) return;
    const unsubscribe = cardAudioPlayer.subscribe(setState);
    return unsubscribe;
  }, []);

  const isCurrent = state.activeId === record.id;
  const status: PlaybackStatus = isCurrent ? state.status : "IDLE";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cardAudioPlayer) return;
    cardAudioPlayer.playRecord(record);
  };

  if (status === "UNAVAILABLE") {
    return (
      <span
        title="Original recording unavailable: Audio has not been uploaded for this heritage record."
        className="inline-flex items-center gap-1.5 text-xs text-rose-300/80 font-medium cursor-not-allowed select-none"
      >
        <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
        <span>Recording unavailable</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        status === "PLAYING"
          ? `Pause ${record.title}`
          : status === "PAUSED"
          ? `Resume ${record.title}`
          : `Listen to original ${record.language} recording for ${record.title}`
      }
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 select-none active:scale-95 shadow-sm ${
        status === "PLAYING"
          ? "bg-[#F9B17A] text-[#242942] font-bold shadow-amber-500/25 ring-2 ring-[#F9B17A]/50"
          : status === "PAUSED"
          ? "bg-amber-500/20 text-[#F9B17A] border border-[#F9B17A]/40 hover:bg-amber-500/30"
          : status === "LOADING"
          ? "bg-white/10 text-slate-300 border border-white/15"
          : status === "ERROR"
          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
          : "bg-white/5 text-[#F9B17A] hover:bg-white/15 border border-[#F9B17A]/30 hover:border-[#F9B17A]/60"
      }`}
    >
      {status === "LOADING" ? (
        <>
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : status === "PLAYING" ? (
        <>
          <Pause className="h-3.5 w-3.5 fill-current" />
          <span className="flex items-center gap-1">
            <AudioLines className="h-3 w-3 animate-pulse" /> Playing
          </span>
        </>
      ) : status === "PAUSED" ? (
        <>
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Resume</span>
        </>
      ) : status === "ENDED" ? (
        <>
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Replay</span>
        </>
      ) : status === "ERROR" ? (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Retry</span>
        </>
      ) : (
        <>
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Listen</span>
        </>
      )}
    </button>
  );
}
