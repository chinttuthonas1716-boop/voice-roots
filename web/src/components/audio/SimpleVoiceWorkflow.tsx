"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mic, Square, Upload, Play, Pause, Check, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { saveUserRecording, type StoredVoiceRecord } from "@/lib/storage";

interface SimpleVoiceWorkflowProps {
  initialMode: "record" | "upload";
}

const LANGUAGES = [
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "gon", name: "Gondi", native: "గోండీ" },
  { code: "koy", name: "Koya", native: "కోయ" },
  { code: "lam", name: "Lambadi", native: "లంబాడీ" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "sat", name: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "en", name: "English", native: "English" },
];

export function SimpleVoiceWorkflow({ initialMode }: SimpleVoiceWorkflowProps) {
  const [mode, setMode] = useState<"record" | "upload">(initialMode);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Consent
  const [hasConsent, setHasConsent] = useState(false);

  // Step 2: Audio Capture
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  // Step 3: Language
  const [language, setLanguage] = useState("Telugu");

  // Step 4: Metadata & Save
  const [title, setTitle] = useState("");
  const [community, setCommunity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecord, setSavedRecord] = useState<StoredVoiceRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Recording Handlers
  const startRecording = async () => {
    setErrorMessage(null);
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
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioFileName("voice-recording.webm");
        setAudioDuration(recordSeconds);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(200);
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setErrorMessage("Microphone access was denied. Please allow microphone permissions or upload an audio file.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileSelect = (file?: File) => {
    if (!file) return;
    const validExts = /\.(wav|mp3|m4a|aac|webm|ogg|flac)$/i;
    if (!file.type.startsWith("audio/") && !validExts.test(file.name)) {
      setErrorMessage("Please select a supported audio file (MP3, WAV, M4A, OGG, WebM, FLAC).");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File exceeds 100MB size limit. Please choose a smaller file.");
      return;
    }

    setErrorMessage(null);
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioFileName(file.name);
    setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));

    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setAudioDuration(Math.round(audio.duration));
      }
    };
  };

  const togglePreview = () => {
    if (!audioUrl) return;
    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(audioUrl);
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch(() => {
        setIsPlayingPreview(false);
      });
    }
  };

  const handleSave = async () => {
    if (!audioBlob) {
      setErrorMessage("No audio recording found to save.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const recordId = `vr-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalDuration = audioDuration || recordSeconds || 15;
    const minutes = Math.floor(finalDuration / 60);
    const seconds = finalDuration % 60;
    const durationFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const record: StoredVoiceRecord = {
      id: recordId,
      title: title.trim() || `${language} Voice Story`,
      language,
      duration: durationFormatted,
      durationSeconds: finalDuration,
      type: "Oral Heritage Story",
      community: community.trim() || undefined,
      audioFileName: audioFileName || `${recordId}.webm`,
      audioFileSize: audioBlob.size,
      audioMimeType: audioBlob.type || "audio/webm",
      uploadDate: new Date().toISOString(),
      sourceType: mode === "record" ? "microphone_recording" : "file_upload",
      originalTranscript: "Voice recording safely preserved.",
      isUserUploaded: true,
      consentConfirmed: true,
    };

    try {
      await saveUserRecording(record, audioBlob);
      setSavedRecord(record);
    } catch {
      setErrorMessage("Could not save the recording locally. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setHasConsent(false);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioFileName("");
    setIsRecording(false);
    setRecordSeconds(0);
    setTitle("");
    setCommunity("");
    setSavedRecord(null);
    setErrorMessage(null);
  };

  const steps = [
    { num: 1, label: "Consent" },
    { num: 2, label: "Voice" },
    { num: 3, label: "Language" },
    { num: 4, label: "Save" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
          {mode === "record" ? "Record your voice" : "Upload your voice"}
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Follow 4 simple steps to preserve an oral story.
        </p>
      </div>

      {/* Step Indicator (1 Consent -> 2 Voice -> 3 Language -> 4 Save) */}
      <div className="flex items-center justify-between px-2" aria-label="Workflow progress">
        {steps.map((s, idx) => {
          const isDone = savedRecord ? true : step > s.num;
          const isCurrent = !savedRecord && step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                  isDone
                    ? "bg-[#F59E0B] text-black"
                    : isCurrent
                    ? "border-2 border-[#F59E0B] text-[#F59E0B] bg-white/5"
                    : "border border-white/20 text-[#94A3B8] bg-white/5"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${isCurrent ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-6 sm:w-10 rounded-full ${isDone ? "bg-[#F59E0B]" : "bg-white/15"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success State */}
      {savedRecord ? (
        <div className="glass-card p-6 sm:p-8 text-center space-y-4">
          <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F8FAFC]">Story saved successfully</h2>
            <p className="text-sm text-[#94A3B8] mt-1">
              Your voice recording is safely preserved in the community archive.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/passport/${savedRecord.id}`}
              className="btn-primary"
            >
              <span>View Heritage Passport</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="btn-glass"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Record another story</span>
            </button>
          </div>
        </div>
      ) : (
        /* Glass Workflow Card */
        <div className="glass-card p-6 sm:p-8 space-y-6">
          {/* STEP 1: CONSENT */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#F8FAFC]">Step 1: Speaker consent</h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  We honor speaker rights. Please confirm permission before recording or uploading.
                </p>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-white/15 bg-white/5 cursor-pointer hover:bg-white/[0.08] transition">
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-white/30 bg-white/10 text-[#F59E0B] focus:ring-[#F59E0B]"
                />
                <span className="text-sm text-[#F8FAFC] leading-relaxed">
                  I confirm that this voice is recorded with the speaker&apos;s voluntary permission under indigenous and community ethics.
                </span>
              </label>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!hasConsent}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next: Capture voice</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: VOICE (RECORD OR UPLOAD) */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#F8FAFC]">
                    {mode === "record" ? "Step 2: Record voice" : "Step 2: Choose audio file"}
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-0.5">
                    {mode === "record" ? "Speak clearly into your microphone." : "Select an audio file from your device."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "record" ? "upload" : "record");
                    setAudioBlob(null);
                    setAudioUrl(null);
                  }}
                  className="text-xs text-[#F59E0B] hover:underline"
                >
                  {mode === "record" ? "Switch to file upload" : "Switch to microphone"}
                </button>
              </div>

              {mode === "record" ? (
                /* Microphone View */
                <div className="p-8 rounded-2xl border border-white/15 bg-white/5 text-center space-y-4">
                  {isRecording ? (
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-pulse">
                        Recording in progress
                      </div>
                      <div className="text-3xl font-mono font-bold text-[#F8FAFC]">
                        {Math.floor(recordSeconds / 60).toString().padStart(2, "0")}:{(recordSeconds % 60).toString().padStart(2, "0")}
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="btn-primary bg-rose-500 hover:bg-rose-600 text-white mx-auto"
                      >
                        <Square className="h-4 w-4 fill-current" />
                        <span>Stop recording</span>
                      </button>
                    </div>
                  ) : audioBlob ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-emerald-300">
                        Recording captured ({recordSeconds}s)
                      </p>
                      <button
                        type="button"
                        onClick={togglePreview}
                        className="btn-glass mx-auto"
                      >
                        {isPlayingPreview ? <Pause className="h-4 w-4 text-[#F59E0B]" /> : <Play className="h-4 w-4 text-[#F59E0B] fill-current" />}
                        <span>{isPlayingPreview ? "Pause audio" : "Play recording"}</span>
                      </button>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setAudioBlob(null);
                            setAudioUrl(null);
                          }}
                          className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] underline"
                        >
                          Record again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={startRecording}
                        className="btn-primary mx-auto"
                      >
                        <Mic className="h-5 w-5" />
                        <span>Start recording</span>
                      </button>
                      <p className="text-xs text-[#94A3B8]">
                        Press to record. Stop when you are finished.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* File Upload View */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 text-center cursor-pointer hover:border-[#F59E0B]/50 transition space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.wav,.mp3,.m4a,.aac,.webm,.ogg,.flac"
                    className="sr-only"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-white/10 text-[#F8FAFC]">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-base font-bold text-[#F8FAFC]">
                      {audioFileName || "Choose audio file"}
                    </span>
                    <span className="block text-xs text-[#94A3B8] mt-1">
                      MP3, WAV, M4A, OGG, WebM, FLAC (up to 100MB)
                    </span>
                  </div>
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePreview();
                      }}
                      className="btn-glass mx-auto text-xs py-1.5"
                    >
                      {isPlayingPreview ? <Pause className="h-3.5 w-3.5 text-[#F59E0B]" /> : <Play className="h-3.5 w-3.5 text-[#F59E0B] fill-current" />}
                      <span>{isPlayingPreview ? "Pause" : "Listen preview"}</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-glass flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!audioBlob}
                  className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next: Choose language</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LANGUAGE */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#F8FAFC]">Step 3: Spoken language</h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Select the language or dialect used in this recording.
                </p>
              </div>

              <div>
                <label htmlFor="language-select" className="block text-sm font-medium text-[#F8FAFC] mb-2">
                  Language
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-white/15 bg-[#0B0F19] px-4 text-base text-[#F8FAFC] focus:border-[#F59E0B] focus:outline-none"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name}>
                      {l.name} ({l.native})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-glass flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-primary flex-1"
                >
                  <span>Next: Save story</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SAVE */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#F8FAFC]">Step 4: Save story</h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Add a title to finish preserving this voice.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label htmlFor="story-title" className="block text-sm font-medium text-[#F8FAFC] mb-1">
                    Story title
                  </label>
                  <input
                    id="story-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`e.g. ${language} Traditional Story`}
                    className="w-full min-h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 text-base text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="story-community" className="block text-sm font-medium text-[#F8FAFC] mb-1">
                    Community or Speaker (optional)
                  </label>
                  <input
                    id="story-community"
                    type="text"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    placeholder="e.g. Community Elders"
                    className="w-full min-h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 text-base text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#F59E0B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-glass flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex-1"
                >
                  {isSaving ? "Saving story..." : "Save story"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
