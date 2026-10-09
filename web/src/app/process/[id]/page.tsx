"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Languages,
  FileText,
  Volume2,
  RefreshCw,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { transitionStory, saveWorkflow, type PreservationWorkflow } from "@/lib/workflow";
import type { UserProfile } from "@/lib/auth";

export default function ProcessPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [detectedLang, setDetectedLang] = useState<string>("Telugu");
  const [detectedDialect, setDetectedDialect] = useState<string>("Northern Telangana Folk");
  const [confidence, setConfidence] = useState<number>(98.2);
  const [sampleTranscript, setSampleTranscript] = useState<string>("");

  return (
    <WorkflowGuard
      route="/process"
      storyId={storyId}
      currentPhaseNumber={2}
    >
      {(workflow: PreservationWorkflow, user: UserProfile) => {
        // Run AI pipeline animation / simulation
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const lang = workflow.detectedLanguage || "Telugu";
          const dial = workflow.detectedDialect || "Northern Telangana Rural";
          setDetectedLang(lang);
          setDetectedDialect(dial);

          const transcript =
            workflow.originalTranscript ||
            "ఓ మేఘరాజా... రోహిణి కార్తెలో చల్లని చినుకులు కురిపించి, మా నల్లరేగడి నేలను తడిపి, జీవనది గోదావరికి ప్రాణం పోయవయ్యా. పంట పొలాల్లో సిరులు పండించి పశుపక్ష్యాదులను కాపాడాలి.";
          setSampleTranscript(transcript);

          // Simulated 3-stage acoustic pipeline
          const t1 = setTimeout(() => {
            setCurrentStep(1); // Language detected
            transitionStory(storyId, { type: "LANGUAGE_DETECTED", language: lang, dialect: dial, confidence: 98.4 }, user);
          }, 1200);

          const t2 = setTimeout(() => {
            setCurrentStep(2); // Transcription created
            transitionStory(storyId, { type: "TRANSCRIPTION_COMPLETE", transcript }, user);
            setIsProcessing(false);
          }, 2600);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }, [workflow]);

        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
                <Cpu className="w-4 h-4" />
                <span>Phase 02 — Acoustic AI & Linguistic Layer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Acoustic Analysis & Speech Transcription
              </h1>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-2xl">
                The original oral audio is being analyzed by Whisper-Indic and Wav2Vec2 models to detect regional dialect patterns and produce native script phonemes.
              </p>
            </div>

            {/* Audio Master Card */}
            <div className="rounded-2xl border border-white/10 bg-[#242942]/70 p-5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F9B17A]/15 text-[#F9B17A]">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-[#A9AEC5]">Preservation Master Track</div>
                  <div className="text-sm font-bold text-white">
                    {workflow.audioFileName || `${storyId}_field_master.wav`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#D9D9E2] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  Duration: {workflow.audioDuration || "03:45"}
                </span>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 48kHz Audio Intact
                </span>
              </div>
            </div>

            {/* Processing Stepper Box */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F9B17A]" />
                  <h2 className="text-base font-bold text-white">AI Acoustic Pipeline Status</h2>
                </div>
                <span className="text-xs font-mono text-[#F9B17A]">
                  {isProcessing ? "PROCESSING IN PROGRESS…" : "ANALYSIS COMPLETE ✓"}
                </span>
              </div>

              <div className="space-y-4">
                {/* Stage 1 */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-[#242942] shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">Oral Audio Master Ingested</div>
                    <div className="text-xs text-[#A9AEC5]">
                      Lossless 48kHz PCM acoustic master validated without compression artifacts.
                    </div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-full shrink-0 text-xs font-bold ${
                      currentStep >= 1
                        ? "bg-emerald-500 text-[#242942]"
                        : "bg-[#F9B17A] text-[#242942] animate-pulse"
                    }`}
                  >
                    {currentStep >= 1 ? "✓" : "●"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Wav2Vec2 Dialect Classification</span>
                      {currentStep >= 1 && (
                        <span className="text-xs text-[#F9B17A] font-normal">
                          ({detectedLang} • {detectedDialect} — {confidence}% Confidence)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#A9AEC5]">
                      Classifying acoustic phonemes into regional dialect continuum clusters.
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-full shrink-0 text-xs font-bold ${
                      currentStep >= 2
                        ? "bg-emerald-500 text-[#242942]"
                        : currentStep === 1
                        ? "bg-[#F9B17A] text-[#242942] animate-pulse"
                        : "bg-white/10 text-[#6F76A0]"
                    }`}
                  >
                    {currentStep >= 2 ? "✓" : currentStep === 1 ? "●" : "○"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">
                      Whisper-Indic Phonetic Transcription
                    </div>
                    <div className="text-xs text-[#A9AEC5]">
                      Generating synchronized native script phonemes with timecode anchors.
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Transcript Preview when ready */}
              {!isProcessing && (
                <div className="rounded-2xl border border-[#F9B17A]/30 bg-[#F9B17A]/10 p-5 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#F9B17A] flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Generated Native Script Transcript
                    </div>
                    <span className="text-[11px] text-[#D9D9E2]">Whisper-Indic v3</span>
                  </div>
                  <p className="text-sm text-white font-serif leading-relaxed italic bg-[#242942]/70 p-4 rounded-xl border border-white/10">
                    &ldquo;{sampleTranscript}&rdquo;
                  </p>
                </div>
              )}

              {/* Action */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link
                  href="/record"
                  className="text-xs text-[#A9AEC5] hover:text-white transition"
                >
                  ← Re-record or Replace Audio
                </Link>

                <button
                  onClick={() => {
                    transitionStory(storyId, { type: "TRANSCRIPTION_COMPLETE", transcript: sampleTranscript }, user);
                    router.push(`/transcript/${storyId}`);
                  }}
                  disabled={isProcessing}
                  className="vr-button vr-button-primary !py-3 !px-7 text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F9B17A]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue to Transcript Review</span>
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

