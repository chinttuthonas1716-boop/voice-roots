"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, X, ArrowRight, ShieldCheck, Sparkles, Clock } from "lucide-react";
import {
  getActiveDraftCheckpoint,
  clearDraftCheckpoint,
  type DraftStoryState,
} from "@/lib/offlineSync";

export function ResumeDraftBanner() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftStoryState | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const active = getActiveDraftCheckpoint();
    if (active && active.progressPercent < 100) {
      setDraft(active);
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !draft) return null;

  const handleResume = () => {
    // Navigate to studio / upload with draft context
    router.push("/#studio");
    setIsVisible(false);
  };

  const handleDiscard = () => {
    clearDraftCheckpoint();
    setIsVisible(false);
  };

  return (
    <aside aria-label="Resume unfinished preservation draft" className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-[#0c0f1c]/95 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Welcome Back · Resume Unfinished Work</p>
              <p className="text-[10px] text-amber-300 font-mono">
                Last auto-saved checkpoint intact
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDiscard}
            className="text-slate-400 hover:text-white"
            title="Dismiss draft"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-3 space-y-1 text-xs">
          <p className="font-semibold text-white truncate">
            Story: {draft.title}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span>Step: {draft.step.replace(/_/g, " ")}</span>
            <span className="font-mono text-teal-300">{draft.progressPercent}% Completed</span>
          </div>

          {/* Mini progress bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-gradient-to-r from-amber-400 to-teal-400 h-full transition-all duration-300"
              style={{ width: `${draft.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            Discard Draft
          </button>
          <button
            type="button"
            onClick={handleResume}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition shadow-sm"
          >
            <span>Resume Work</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

