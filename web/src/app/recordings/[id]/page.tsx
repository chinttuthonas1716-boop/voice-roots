"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Play, Pause, RotateCcw, Volume2, Shield, Sparkles, Check, Edit3, ArrowLeft, Bookmark } from "lucide-react";
import Link from "next/link";

export default function RecordingDetailPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<"dual" | "original" | "translation">("dual");
  const [isEditing, setIsEditing] = useState(false);
  const [transcriptText, setTranscriptText] = useState(
    "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట ఇది. ఆకాశంలో మబ్బులు కనిపించగానే గ్రామ దేవతకు నమస్కరించి విత్తనాలు చల్లుతారు."
  );

  return (
    <div className="min-h-screen bg-obsidian text-primary-text pb-24">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-xs text-secondary-text hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Archive</span>
        </Link>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-root-green/20 border border-root-green/40 text-leaf-green text-xs font-mono">
                Telugu (Agency Hill Dialect)
              </span>
              <span className="text-xs font-mono text-secondary-text">ID: {params.id || "vr-101"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-white">
              Traditional Harvest & Rain Ceremony Song (వరి పంట సంప్రదాయ పాట)
            </h1>

            <p className="text-xs sm:text-sm text-secondary-text">
              Recorded in Agency Valley • Contributed by Community Elder Sri Ramaiah • 08:42 duration
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-full bg-root-green/10 text-leaf-green border border-root-green/20 text-xs font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Full Informed Consent Verified</span>
            </span>
          </div>
        </div>

        {/* Audio Player & Spatial Waveform Card */}
        <div className="glass-surface p-6 sm:p-8 rounded-3xl border border-white/10 shadow-glass space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-root-green text-obsidian flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform shadow-glow"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <span className="text-sm font-semibold text-white block">Lossless Master Audio</span>
                <span className="text-xs font-mono text-secondary-text">48 kHz • 24-bit PCM WAV (Unprocessed)</span>
              </div>
            </div>

            <span className="font-mono text-sm text-white">02:34 / 08:42</span>
          </div>

          {/* Waveform graphic */}
          <div className="h-16 w-full rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center px-4 gap-1">
            {[20, 45, 60, 30, 80, 95, 70, 50, 65, 40, 85, 90, 75, 55, 35, 60, 85, 40, 70, 50, 90, 30, 45].map(
              (h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all ${
                    i < 7 ? "bg-root-green" : "bg-white/20"
                  }`}
                  style={{ height: `${h}%` }}
                />
              )
            )}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setViewMode("dual")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === "dual" ? "bg-white/10 text-white font-semibold" : "text-secondary-text hover:text-white"
              }`}
            >
              Dual View (Original + Translation)
            </button>
            <button
              onClick={() => setViewMode("original")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === "original" ? "bg-white/10 text-white font-semibold" : "text-secondary-text hover:text-white"
              }`}
            >
              Original Oral Text Only
            </button>
            <button
              onClick={() => setViewMode("translation")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === "translation" ? "bg-white/10 text-white font-semibold" : "text-secondary-text hover:text-white"
              }`}
            >
              English Translation Only
            </button>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 text-xs text-leaf-green hover:underline font-medium"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? "Done Editing" : "Suggest Correction"}</span>
          </button>
        </div>

        {/* Transcript Segments */}
        <div className="space-y-4">
          {/* Segment 1 */}
          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-secondary-text">
              <span className="text-leaf-green font-semibold">Speaker 1 (Village Elder) • 00:00 - 02:15</span>
              <span>AI Confidence: 94.2%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {(viewMode === "dual" || viewMode === "original") && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-secondary-text/80 block">
                    Original Dialect Transcript
                  </span>
                  {isEditing ? (
                    <textarea
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-root-green/50"
                    />
                  ) : (
                    <p className="text-white/95 leading-relaxed font-sans">{transcriptText}</p>
                  )}
                </div>
              )}

              {(viewMode === "dual" || viewMode === "translation") && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-ai-violet/80 block">
                    IndicTrans2 Translation (English)
                  </span>
                  <p className="text-secondary-text leading-relaxed font-sans italic">
                    "This is the traditional melody our elders sing before monsoon rains arrive, conducting the Earth reverence ritual. As soon as storm clouds gather in the sky, they bow before the village guardian deity and sow heirloom seeds."
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Extracted Cultural Terms */}
        <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-4">
          <span className="text-xs font-mono uppercase text-leaf-green block">
            Extracted Cultural Terms & Lexical Roots
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-sm font-semibold text-leaf-green block">భూమి పూజ (Bhoomi Pooja)</span>
              <span className="text-xs text-secondary-text block">Sacred soil ritual performed prior to first sowing</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-sm font-semibold text-leaf-green block">విత్తనాలు (Vithanaalu)</span>
              <span className="text-xs text-secondary-text block">Heirloom monsoon seeds conserved by elder women</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-sm font-semibold text-leaf-green block">గ్రామ దేవత (Grama Devata)</span>
              <span className="text-xs text-secondary-text block">Communal deity guarding the village boundaries</span>
            </div>
          </div>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
