"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  Languages,
} from "lucide-react";
import { saveUserRecording, type StoredVoiceRecord } from "@/lib/storage";

export interface PromptItem {
  id: number;
  prompt_id: string;
  language: string;
  language_code: string;
  category: string;
  prompt_text: string;
  phonetic_target?: string;
  english_meaning: string;
  telugu_meaning?: string;
  difficulty_level: string;
  is_placeholder: number;
  provenance: string;
}

interface PromptedRecordingViewProps {
  onRecordingComplete?: (record: StoredVoiceRecord) => void;
  onSwitchMode?: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: "gon", name: "Gondi", native: "గోండీ" },
  { code: "koy", name: "Koya", native: "కోయ" },
  { code: "sat", name: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "lam", name: "Lambadi", native: "లంబాడీ" },
];

export function PromptedRecordingView({ onRecordingComplete, onSwitchMode }: PromptedRecordingViewProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("Gondi");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "swadesh_word" | "short_sentence">("all");
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  // Audio capture state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchPrompts();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [selectedLanguage, selectedCategory]);

  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    setErrorMessage(null);
    try {
      let url = `/api/v1/prompts?language=${encodeURIComponent(selectedLanguage)}&limit=100`;
      if (selectedCategory !== "all") {
        url += `&category=${selectedCategory}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPrompts(data.prompts || []);
        setCurrentIndex(0);
      } else {
        setPrompts(getFallbackPrompts(selectedLanguage));
      }
    } catch {
      setPrompts(getFallbackPrompts(selectedLanguage));
    } finally {
      setLoadingPrompts(false);
    }
  };

  const getFallbackPrompts = (lang: string): PromptItem[] => {
    if (lang === "Gondi") {
      return [
        {
          id: 1,
          prompt_id: "gon-swadesh-001",
          language: "Gondi",
          language_code: "gon",
          category: "swadesh_word",
          prompt_text: "యేర్",
          phonetic_target: "yeːr",
          english_meaning: "Water",
          telugu_meaning: "నీరు / ఉదకం",
          difficulty_level: "beginner",
          is_placeholder: 1,
          provenance: "swadesh_seed_placeholder",
        },
        {
          id: 2,
          prompt_id: "gon-swadesh-002",
          language: "Gondi",
          language_code: "gon",
          category: "swadesh_word",
          prompt_text: "కిస్",
          phonetic_target: "kis",
          english_meaning: "Fire",
          telugu_meaning: "నిప్పు",
          difficulty_level: "beginner",
          is_placeholder: 1,
          provenance: "swadesh_seed_placeholder",
        },
        {
          id: 3,
          prompt_id: "gon-sent-031",
          language: "Gondi",
          language_code: "gon",
          category: "short_sentence",
          prompt_text: "నిమ్మా బగా హందోంతీ?",
          phonetic_target: "nimmaː bagaː handoːntiː",
          english_meaning: "Where are you going?",
          telugu_meaning: "నువ్వు ఎక్కడికి వెళ్తున్నావు?",
          difficulty_level: "intermediate",
          is_placeholder: 1,
          provenance: "swadesh_seed_placeholder",
        },
      ];
    }
    return [
      {
        id: 1,
        prompt_id: "koy-swadesh-001",
        language: "Koya",
        language_code: "koy",
        category: "swadesh_word",
        prompt_text: "యేరు",
        phonetic_target: "yeːru",
        english_meaning: "Water",
        telugu_meaning: "నీరు",
        difficulty_level: "beginner",
        is_placeholder: 1,
        provenance: "swadesh_seed_placeholder",
      },
    ];
  };

  const currentPrompt = prompts[currentIndex];

  const startRecording = async () => {
    setErrorMessage(null);
    setToastMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage("Microphone access blocked. Please enable microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTogglePreview = () => {
    if (!recordedUrl) return;
    if (isPlayingPreview) {
      previewAudioRef.current?.pause();
      setIsPlayingPreview(false);
      return;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    previewAudioRef.current = new Audio(recordedUrl);
    previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    previewAudioRef.current.play().then(() => setIsPlayingPreview(true)).catch(() => setIsPlayingPreview(false));
  };

  const handleDiscardAudio = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordSeconds(0);
    setIsPlayingPreview(false);
  };

  const handleUploadAndAdvance = async () => {
    if (!recordedBlob || !currentPrompt) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      const ext = recordedBlob.type.includes("wav") ? "wav" : "webm";
      const fileName = `prompt_${currentPrompt.prompt_id}_${Date.now()}.${ext}`;
      formData.append("file", recordedBlob, fileName);
      formData.append("title", `Prompt: ${currentPrompt.prompt_text} (${currentPrompt.english_meaning})`);
      formData.append("language", currentPrompt.language);
      formData.append("dialect", "Standard / Prompted Mode");
      formData.append("consent", "true");
      formData.append("prompt_id", currentPrompt.prompt_id);

      let recordId = `prompt_rec_${Date.now()}`;
      let audioPath = recordedUrl || "";

      try {
        const res = await fetch("/api/v1/transcripts/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const resData = await res.json();
          recordId = String(resData.id);
          audioPath = resData.audio_url || audioPath;
        }
      } catch {
        // Continue with local save if backend offline
      }

      // Save locally to IndexedDB & storage
      const finalSecs = recordSeconds || 2;
      const mins = Math.floor(finalSecs / 60);
      const secs = finalSecs % 60;
      const durationFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      const newRecord: StoredVoiceRecord = {
        id: recordId,
        title: `Prompt: ${currentPrompt.prompt_text} (${currentPrompt.english_meaning})`,
        language: currentPrompt.language,
        dialect: "Prompted Mode",
        duration: durationFormatted,
        durationSeconds: finalSecs,
        type: "Prompted Word / Phrase",
        community: "Oral Heritage Seed Archive",
        culturalContext: `Swadesh prompt ${currentPrompt.prompt_id} (${currentPrompt.english_meaning})`,
        audioUrl: audioPath,
        audioFileName: fileName,
        audioFileSize: recordedBlob.size,
        audioMimeType: recordedBlob.type || "audio/webm",
        uploadDate: new Date().toISOString(),
        sourceType: "microphone_recording",
        originalTranscript: currentPrompt.prompt_text,
        isUserUploaded: true,
        consentConfirmed: true,
        promptId: currentPrompt.prompt_id,
        translations: { en: currentPrompt.english_meaning, te: currentPrompt.telugu_meaning },
      };

      await saveUserRecording(newRecord, recordedBlob);

      setCompletedCount((prev) => prev + 1);
      setToastMessage(`✓ Saved prompt "${currentPrompt.prompt_text}"! Advancing to next...`);

      if (onRecordingComplete) {
        onRecordingComplete(newRecord);
      }

      // Reset audio for next prompt
      handleDiscardAudio();

      // Advance to next prompt
      if (currentIndex < prompts.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setToastMessage(`🎉 Amazing! You have completed all ${prompts.length} prompts in this set.`);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to save prompted recording.");
    } finally {
      setIsUploading(false);
    }
  };

  const progressPercent = prompts.length > 0 ? Math.round(((currentIndex + 1) / prompts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header controls: Language & Category Selector */}
      <div className="rounded-2xl border border-white/10 bg-[#0F1420]/80 p-5 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3 w-3" /> Prompted Recording Mode (T2.4)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DB-Driven
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Prompted Word & Sentence Recording</h2>
            <p className="text-xs text-[#94A3B8]">
              Record against verified Swadesh core vocabulary and everyday oral expressions. One prompt at a time.
            </p>
          </div>

          {onSwitchMode && (
            <button
              type="button"
              onClick={onSwitchMode}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium underline self-start sm:self-auto"
            >
              Switch to Freeform Recording →
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Languages className="h-3.5 w-3.5" /> Language:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLanguage(lang.name)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition ${
                  selectedLanguage === lang.name
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "bg-white/5 text-[#94A3B8] hover:text-white border border-white/10"
                }`}
              >
                {lang.name} ({lang.native})
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[#94A3B8]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-[#080A12] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Prompts</option>
              <option value="swadesh_word">Swadesh Words</option>
              <option value="short_sentence">Daily Sentences</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-200 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="flex-1 font-medium">{toastMessage}</div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-center gap-3 text-rose-200 text-xs">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Loading State */}
      {loadingPrompts ? (
        <div className="rounded-2xl border border-white/10 bg-[#0F1420]/50 p-12 text-center text-sm text-[#94A3B8]">
          Loading {selectedLanguage} prompt catalogue...
        </div>
      ) : prompts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0F1420]/50 p-12 text-center space-y-2">
          <BookOpen className="h-8 w-8 text-[#94A3B8] mx-auto" />
          <div className="text-sm font-semibold text-white">No Prompts Found</div>
          <p className="text-xs text-[#94A3B8]">No prompts matching the selected filter.</p>
        </div>
      ) : (
        /* One-Prompt-at-a-Time Card */
        <div className="rounded-2xl border border-white/10 bg-[#0F1420] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-semibold text-amber-400">
                Prompt {currentIndex + 1} of {prompts.length}
              </span>
              <span>{progressPercent}% Complete ({completedCount} recorded)</span>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Prompt Details Card */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 p-6 sm:p-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/10">
                {currentPrompt.category === "swadesh_word" ? "Core Swadesh Vocabulary" : "Daily Oral Expression"}
              </span>
              {currentPrompt.is_placeholder === 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300/80 border border-amber-500/20">
                  Seed Placeholder
                </span>
              )}
            </div>

            {/* Big Prominent Prompt Text */}
            <div className="space-y-2 py-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
                {currentPrompt.prompt_text}
              </h1>
              {currentPrompt.phonetic_target && (
                <div className="text-base text-amber-400 font-mono tracking-wide">
                  IPA: [{currentPrompt.phonetic_target}]
                </div>
              )}
            </div>

            {/* Meanings */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-[#94A3B8] border-t border-white/5">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-white/50 block">English:</span>
                <span className="text-white font-medium">{currentPrompt.english_meaning}</span>
              </div>
              {currentPrompt.telugu_meaning && (
                <>
                  <span className="text-white/20">•</span>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-white/50 block">Telugu:</span>
                    <span className="text-white font-medium">{currentPrompt.telugu_meaning}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Audio Recording Controls */}
          <div className="p-4 sm:p-6 rounded-xl border border-white/10 bg-black/40 flex flex-col items-center justify-center gap-4 text-center">
            {/* Status Indicator */}
            {isRecording ? (
              <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold animate-pulse">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                Recording live audio: {recordSeconds}s
              </div>
            ) : recordedBlob ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Audio recorded ({recordSeconds}s). Ready to review and advance!
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]">
                Press the record button and clearly pronounce the prompt word above.
              </p>
            )}

            {/* Action Buttons: Record / Stop / Preview */}
            <div className="flex items-center gap-3">
              {!isRecording && !recordedBlob && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                >
                  <Mic className="h-5 w-5" />
                  <span>Record Prompt</span>
                </button>
              )}

              {isRecording && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 transition shadow-lg shadow-rose-600/30 animate-pulse"
                >
                  <Square className="h-5 w-5" />
                  <span>Stop Recording</span>
                </button>
              )}

              {recordedBlob && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePreview}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause className="h-4 w-4 text-amber-400" /> Pause Preview
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 text-amber-400" /> Play Preview
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDiscardAudio}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[#94A3B8] text-xs font-medium hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Re-record
                  </button>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleUploadAndAdvance}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-md disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>{isUploading ? "Uploading..." : "Save & Advance →"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation: Previous / Skip */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                handleDiscardAudio();
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-[#94A3B8] hover:text-white disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous Prompt</span>
            </button>

            <button
              type="button"
              disabled={currentIndex >= prompts.length - 1}
              onClick={() => {
                handleDiscardAudio();
                setCurrentIndex((prev) => Math.min(prompts.length - 1, prev + 1));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-[#94A3B8] hover:text-white disabled:opacity-40"
            >
              <span>Skip Prompt</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
