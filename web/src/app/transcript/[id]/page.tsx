"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  FileText,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Check,
  Edit3,
  ArrowRight,
  ShieldCheck,
  Languages,
  AlertCircle,
  Save,
  Clock,
} from "lucide-react";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { transitionStory, type PreservationWorkflow } from "@/lib/workflow";
import type { UserProfile } from "@/lib/auth";

export default function TranscriptPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";
  const router = useRouter();

  const [transcript, setTranscript] = useState<string>("");
  const [originalTranscript, setOriginalTranscript] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(225);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <WorkflowGuard
      route="/transcript"
      storyId={storyId}
      currentPhaseNumber={3}
    >
      {(workflow: PreservationWorkflow, user: UserProfile) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const text =
            workflow.originalTranscript ||
            "ఓ మేఘరాజా... రోహిణి కార్తెలో చల్లని చినుకులు కురిపించి, మా నల్లరేగడి నేలను తడిపి, జీవనది గోదావరికి ప్రాణం పోయవయ్యా. పంట పొలాల్లో సిరులు పండించి పశుపక్ష్యాదులను కాపాడాలి.";
          setTranscript(text);
          setOriginalTranscript(text);
          if (workflow.status === "TRANSCRIPT_REVIEW" || workflow.transcriptReviewedAt) {
            setHasSaved(true);
          }
        }, [workflow]);

        const handleSaveReview = () => {
          const result = transitionStory(
            storyId,
            {
              type: "SAVE_TRANSCRIPT_REVIEW",
              notes,
              editedTranscript: transcript,
            },
            user
          );

          if (result.success) {
            setHasSaved(true);
            setIsEditing(false);
          }
        };

        const handleProceedToTranslation = () => {
          if (!hasSaved) {
            handleSaveReview();
          }
          router.push(`/translate/${storyId}`);
        };

        const toggleAudio = () => {
          if (!audioRef.current) return;
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            audioRef.current.play();
            setIsPlaying(true);
          }
        };

        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
                <FileText className="w-4 h-4" />
                <span>Phase 03 — Transcript Review & Native Editing</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Review & Edit Spoken Oral Transcript
              </h1>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-2xl">
                Acoustic speech models often misspell indigenous botanical terminology or sacred place names. Review the transcript against the original field recording before translating.
              </p>
            </div>

            {/* Audio Synchronization Player */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAudio}
                    className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F9B17A] text-[#242942] hover:bg-[#F6A875] transition shadow-lg shadow-[#F9B17A]/25"
                    title={isPlaying ? "Pause Original Audio" : "Listen to Original Audio"}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                  </button>
                  <div>
                    <div className="text-xs text-[#A9AEC5]">Original Audio Master</div>
                    <div className="text-sm font-bold text-white">
                      {workflow.title} • {workflow.detectedLanguage || "Telugu"} ({workflow.detectedDialect || "Folk"})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#D9D9E2] bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F9B17A]" />
                    {workflow.audioDuration || "03:45"}
                  </span>
                  <span className="text-xs text-[#F9B17A] bg-[#F9B17A]/15 border border-[#F9B17A]/30 px-3 py-1.5 rounded-xl font-semibold">
                    Original Source Artifact
                  </span>
                </div>
              </div>

              {/* Native audio element */}
              <audio
                ref={audioRef}
                src={workflow.audioUrl || "/audio/harvest_song.wav"}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-8"
                controls
              />
            </div>

            {/* Transcript Editor Card */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-white">
                    Native Script Phonemes
                  </div>
                  <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-[11px] text-[#F9B17A] font-semibold">
                    {hasSaved ? "HUMAN EDITED ✓" : "AI GENERATED"}
                  </span>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#F9B17A]" />
                  <span>{isEditing ? "View Clean Mode" : "Edit Words"}</span>
                </button>
              </div>

              {/* Editor or Clean View */}
              {isEditing ? (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-[#A9AEC5]">
                    Edit Native Script (Correct spellings, tribal idioms, elder honorifics):
                  </label>
                  <textarea
                    rows={6}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-[#2D3250] p-4 text-sm text-white font-serif leading-relaxed focus:border-[#F9B17A] focus:outline-none"
                  />
                  <div>
                    <label className="block text-xs font-medium text-[#A9AEC5] mb-1">
                      Editorial Review Notes (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Corrected Rohini harvest reference per village elder..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#2D3250] px-3.5 py-2 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#2D3250]/70 p-6">
                  <p className="text-base sm:text-lg text-white font-serif leading-relaxed whitespace-pre-wrap">
                    {transcript}
                  </p>
                </div>
              )}

              {/* Status and Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10">
                <button
                  onClick={handleSaveReview}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  <Save className="w-4 h-4 text-[#F9B17A]" />
                  <span>{hasSaved ? "Changes Saved ✓" : "Save Transcript Draft"}</span>
                </button>

                <button
                  onClick={handleProceedToTranslation}
                  className="vr-button vr-button-primary !py-3 !px-7 text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F9B17A]/25"
                >
                  <span>Continue to Translation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </WorkflowGuard>
  );
}

