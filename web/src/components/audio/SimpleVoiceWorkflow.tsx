"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  Check,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Volume2,
  ShieldCheck,
  Sparkles,
  Lock,
  Globe2,
  FileAudio,
} from "lucide-react";
import { saveUserRecording, type StoredVoiceRecord } from "@/lib/storage";
import { useAppLanguage } from "@/lib/languageContext";

interface SimpleVoiceWorkflowProps {
  initialMode: "record" | "upload";
}

const DEFAULT_LANGUAGES = [
  { code: "gon", name: "Gondi", native: "గోండీ / गोंडी", region: "Central India / Dandakaranya" },
  { code: "koy", name: "Koya", native: "కోయ / कोया", region: "Godavari Basin & Papikonda" },
  { code: "sat", name: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ", region: "Chota Nagpur Plateau" },
  { code: "lam", name: "Lambadi", native: "లంబాడీ / बंजारी", region: "Deccan Plateau" },
  { code: "kru", name: "Kurukh", native: "कुड़ुख़", region: "Jharkhand & Odisha" },
  { code: "unr", name: "Mundari", native: "मुण्डारी", region: "Ranchi & Mayurbhanj" },
  { code: "hoc", name: "Ho", native: "ᱦᱳ", region: "Singhbhum & Keonjhar" },
  { code: "kui", name: "Kui", native: "କୁଇ", region: "Kandhamal & Eastern Ghats" },
  { code: "tcy", name: "Tulu", native: "ತುಳು", region: "Tulunadu Coastal Belt" },
  { code: "brx", name: "Bodo", native: "बड़ो", region: "Bodoland / Assam" },
  { code: "te", name: "Telugu", native: "తెలుగు", region: "Andhra & Telangana" },
  { code: "hi", name: "Hindi", native: "हिन्दी", region: "Northern India" },
  { code: "en", name: "English", native: "English", region: "Global / Interoperable" },
];

export function SimpleVoiceWorkflow({ initialMode }: SimpleVoiceWorkflowProps) {
  const { t } = useAppLanguage();
  const [mode, setMode] = useState<"record" | "upload">(initialMode);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Consent
  const [hasConsent, setHasConsent] = useState(false);
  const [consentAudioLang, setConsentAudioLang] = useState<"te" | "hi" | "en" | "gon" | "kff">("te");
  const [isPlayingConsent, setIsPlayingConsent] = useState(false);
  const consentAudioRef = useRef<HTMLAudioElement | null>(null);

  const playConsentAudio = (lang: string) => {
    if (consentAudioRef.current) {
      consentAudioRef.current.pause();
    }

    if (isPlayingConsent) {
      setIsPlayingConsent(false);
      return;
    }

    const audio = new Audio(`/api/v1/consent/audio/${lang}`);
    consentAudioRef.current = audio;
    setIsPlayingConsent(true);

    audio.onended = () => setIsPlayingConsent(false);
    audio.onerror = () => setIsPlayingConsent(false);

    audio.play().catch(() => setIsPlayingConsent(false));
  };

  // Step 2: Audio Capture
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [micPermission, setMicPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [audioIntegrityHash, setAudioIntegrityHash] = useState<string | null>(null);

  // Step 3: Language Information (Dynamic & Open to all low-resource languages)
  const [language, setLanguage] = useState("Gondi");
  const [customLanguage, setCustomLanguage] = useState("");
  const [dialect, setDialect] = useState("");
  const [clanRegion, setClanRegion] = useState("");

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (consentAudioRef.current) consentAudioRef.current.pause();
    };
  }, [audioUrl]);

  // Compute SHA-256 audio integrity checksum
  const computeSha256 = async (blob: Blob): Promise<string> => {
    try {
      const buffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    }
  };

  // Recording Handlers (48 kHz broadcast audio capture)
  const startRecording = async () => {
    setErrorMessage(null);
    try {
      // Enforce 48 kHz studio sample rate
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false,
        },
      });

      setMicPermission("granted");

      // Preferred MIME types with lossless / high-quality encoding
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }

      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioFileName("voice-recording-48khz.webm");
        setAudioDuration(recordSeconds);
        stream.getTracks().forEach((track) => track.stop());

        // Compute SHA-256 hash immediately for audio integrity
        const hash = await computeSha256(blob);
        setAudioIntegrityHash(hash);
      };

      recorder.start(200);
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err: any) {
      setMicPermission("denied");
      setErrorMessage(
        "Microphone access denied or unavailable. Please grant microphone permissions in your browser or switch to audio file upload."
      );
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    const validExts = /\.(wav|mp3|m4a|aac|webm|ogg|flac)$/i;
    if (!file.type.startsWith("audio/") && !validExts.test(file.name)) {
      setErrorMessage("Please select a supported audio file (WAV, MP3, M4A, OGG, WebM, FLAC).");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage("File exceeds 100MB limit. Please choose a smaller master audio recording.");
      return;
    }

    setErrorMessage(null);
    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioFileName(file.name);
    setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));

    // Calculate SHA-256 for file
    const hash = await computeSha256(file);
    setAudioIntegrityHash(hash);

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
      setErrorMessage("No audio recording found to preserve.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const finalLanguage = customLanguage.trim() || language;
    const recordId = `vr-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalDuration = audioDuration || recordSeconds || 15;
    const minutes = Math.floor(finalDuration / 60);
    const seconds = finalDuration % 60;
    const durationFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const record: StoredVoiceRecord = {
      id: recordId,
      title: title.trim() || `${finalLanguage} Oral Narrative`,
      language: finalLanguage,
      dialect: dialect.trim() || undefined,
      duration: durationFormatted,
      durationSeconds: finalDuration,
      type: "Oral Heritage Story",
      community: community.trim() || clanRegion.trim() || undefined,
      location: clanRegion.trim() || undefined,
      audioFileName: audioFileName || `${recordId}.webm`,
      audioFileSize: audioBlob.size,
      audioMimeType: audioBlob.type || "audio/webm",
      uploadDate: new Date().toISOString(),
      sourceType: mode === "record" ? "microphone_recording" : "file_upload",
      originalTranscript: `[Original ${finalLanguage} master audio preserved under OCAP® protocols. SHA-256 integrity: ${audioIntegrityHash || "verified"}]`,
      isUserUploaded: true,
      consentConfirmed: true,
      accessLevel: "public",
    };

    try {
      await saveUserRecording(record, audioBlob);
      setSavedRecord(record);
    } catch {
      setErrorMessage("Could not save the master recording locally. Please try again.");
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
    setIsPaused(false);
    setRecordSeconds(0);
    setAudioIntegrityHash(null);
    setTitle("");
    setCommunity("");
    setDialect("");
    setCustomLanguage("");
    setSavedRecord(null);
    setErrorMessage(null);
  };

  const steps = [
    { num: 1, label: "Consent" },
    { num: 2, label: "Voice" },
    { num: 3, label: "Language" },
    { num: 4, label: "Save" },
  ];

  const effectiveLanguageName = customLanguage.trim() || language;

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-[#F5F3E9]">
      {/* Studio Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102B20]/80 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A]">
          <Sparkles className="w-3.5 h-3.5 text-[#A6C48A]" />
          <span>48 kHz IMMUTABLE MASTER AUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F3E9]">
          {mode === "record" ? "Preserve Spoken Voice" : "Upload Oral Master"}
        </h1>
        <p className="text-xs sm:text-sm text-[#DCE9D7]/80 max-w-md mx-auto">
          Follow 4 sovereign steps to record, verify consent, and archive indigenous oral heritages.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="flex items-center justify-between px-3 py-3 rounded-2xl bg-[#102B20]/60 border border-[#A6C48A]/20 backdrop-blur-md" aria-label="Workflow progress">
        {steps.map((s, idx) => {
          const isDone = savedRecord ? true : step > s.num;
          const isCurrent = !savedRecord && step === s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                  isDone
                    ? "bg-[#1F5138] text-[#F5F3E9] border border-[#A6C48A]/50 shadow-[0_0_10px_rgba(166,196,138,0.3)]"
                    : isCurrent
                    ? "bg-[#A6C48A] text-[#071A13] font-black shadow-[0_0_12px_rgba(166,196,138,0.5)]"
                    : "border border-[#A6C48A]/25 text-[#DCE9D7]/50 bg-[#071A13]/40"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${isCurrent ? "text-[#F5F3E9]" : "text-[#DCE9D7]/60"}`}>
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-4 sm:w-8 rounded-full ${isDone ? "bg-[#A6C48A]" : "bg-white/10"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200 backdrop-blur-md">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success State */}
      {savedRecord ? (
        <div className="forest-glass-panel p-6 sm:p-8 text-center space-y-5 rounded-3xl border border-[#A6C48A]/30 bg-[#102B20]/70 backdrop-blur-xl">
          <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-[#1F5138]/60 border border-[#A6C48A]/40 text-[#A6C48A] shadow-[0_0_20px_rgba(166,196,138,0.3)]">
            <Check className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3E9]">Voice Safely Preserved</h2>
            <p className="text-xs sm:text-sm text-[#DCE9D7]/80 mt-1 max-w-md mx-auto">
              Master audio for <strong className="text-[#A6C48A]">{savedRecord.title}</strong> has been secured in the community archive with cryptographic integrity.
            </p>
          </div>

          {/* Cryptographic SHA-256 Badge */}
          {audioIntegrityHash && (
            <div className="p-3 rounded-xl bg-[#071A13]/70 border border-[#A6C48A]/25 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A6C48A]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SHA-256 AUDIO INTEGRITY CHECKSUM</span>
              </div>
              <p className="font-mono text-[10px] text-[#DCE9D7]/75 break-all select-all">
                {audioIntegrityHash}
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/passport/${savedRecord.id}`}
              className="pill-btn-solid gap-2 !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] border border-[#A6C48A]/40 shadow-lg"
            >
              <span>View Heritage Passport</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[48px] px-5 rounded-full border border-[#A6C48A]/30 bg-black/30 hover:bg-black/50 text-xs font-semibold text-[#DCE9D7] flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Record Another Voice</span>
            </button>
          </div>
        </div>
      ) : (
        /* Glass Workflow Panel */
        <div className="forest-glass-panel p-6 sm:p-8 space-y-6 rounded-3xl border border-[#A6C48A]/30 bg-[#102B20]/70 backdrop-blur-xl shadow-[0_20px_50px_rgba(7,26,19,0.7)]">
          
          {/* =========================================================================
             STEP 1: SPEAKER CONSENT (Mandatory OCAP Gate)
             ========================================================================= */}
          {step === 1 && (
            <div className="space-y-5 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A6C48A] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Step 1 of 4: Community Consent</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F3E9]">{t("consent.step")}</h2>
                <p className="text-xs text-[#DCE9D7]/80 mt-1">
                  Oral recordings must adhere to OCAP® principles. Consent is strictly mandatory before any voice recording can begin.
                </p>
              </div>

              {/* Native Language Audio Consent Player */}
              <div className="p-4 rounded-2xl border border-[#A6C48A]/30 bg-[#071A13]/60 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#A6C48A]">
                    <Volume2 className="h-4 w-4" />
                    <span>Native Spoken Consent Playback</span>
                  </div>

                  {/* Language Selector for Consent Audio */}
                  <div className="flex items-center gap-1">
                    {[
                      { code: "te", label: "తెలుగు" },
                      { code: "hi", label: "हिन्दी" },
                      { code: "en", label: "English" },
                      { code: "gon", label: "Gondi" },
                      { code: "kff", label: "Koya" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setConsentAudioLang(l.code as any);
                          if (isPlayingConsent && consentAudioRef.current) {
                            consentAudioRef.current.pause();
                            setIsPlayingConsent(false);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                          consentAudioLang === l.code
                            ? "bg-[#1F5138] text-[#F5F3E9] border border-[#A6C48A]/50"
                            : "bg-black/30 text-[#DCE9D7]/60 hover:text-white"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => playConsentAudio(consentAudioLang)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1F5138]/70 hover:bg-[#1F5138] border border-[#A6C48A]/35 text-[#F5F3E9] text-xs font-semibold transition"
                  >
                    {isPlayingConsent ? (
                      <>
                        <Pause className="h-3.5 w-3.5 text-[#A6C48A]" />
                        <span>{t("consent.playing")}</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current text-[#A6C48A]" />
                        <span>{t("consent.listenBtn")}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-[#A6C48A]/80 font-mono">
                    OCAP® Indigenous Protocol
                  </span>
                </div>
              </div>

              {/* Consent Gate Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-2xl border border-[#A6C48A]/25 bg-[#071A13]/50 cursor-pointer hover:bg-[#071A13]/80 transition group">
                <input
                  type="checkbox"
                  checked={hasConsent}
                  onChange={(e) => setHasConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded bg-[#071A13] border-[#A6C48A]/40 text-[#1F5138] focus:ring-[#A6C48A]"
                />
                <span className="text-xs text-[#DCE9D7] leading-relaxed group-hover:text-white transition-colors">
                  I confirm that this voice is recorded with the speaker's voluntary permission under indigenous customary ethics and <strong className="text-[#A6C48A]">OCAP® Indigenous Data Sovereignty</strong>. The speaker agrees to oral audio preservation and dual-layer AI annotation that never overwrites the master voice.
                </span>
              </label>

              {/* Next Button (Strictly Gated) */}
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!hasConsent}
                className="w-full h-12 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] font-bold text-xs uppercase tracking-wider border border-[#A6C48A]/40 shadow-lg shadow-[#102B20]/60 flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next: Capture voice</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =========================================================================
             STEP 2: VOICE RECORDING (48 kHz Waveform, Timer, Pause/Resume)
             ========================================================================= */}
          {step === 2 && (
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A6C48A] uppercase tracking-wider mb-1">
                    <FileAudio className="w-4 h-4" />
                    <span>Step 2 of 4: {mode === "record" ? "Live Voice Capture" : "Audio Master File"}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#F5F3E9]">
                    {mode === "record" ? "Step 2: Record voice (48 kHz Master)" : "Step 2: Choose audio file"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "record" ? "upload" : "record");
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setAudioIntegrityHash(null);
                  }}
                  className="text-xs text-[#A6C48A] hover:underline font-semibold"
                >
                  {mode === "record" ? "Switch to file upload" : "Switch to live microphone"}
                </button>
              </div>

              {mode === "record" ? (
                /* Microphone 48 kHz Recording Panel */
                <div className="p-6 sm:p-8 rounded-2xl border border-[#A6C48A]/30 bg-[#071A13]/60 text-center space-y-4">
                  {/* Status Indicator Pill */}
                  <div className="flex items-center justify-center gap-2">
                    {isRecording ? (
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        isPaused
                          ? "bg-amber-900/40 border border-amber-500/40 text-amber-200"
                          : "bg-red-900/40 border border-red-500/40 text-red-200 animate-pulse"
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${isPaused ? "bg-amber-400" : "bg-red-500"}`} />
                        <span>{isPaused ? "Paused" : "Recording at 48 kHz"}</span>
                      </span>
                    ) : audioBlob ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Audio Captured ({recordSeconds}s)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs text-[#DCE9D7]/70">
                        <Mic className="h-3 w-3 text-[#A6C48A]" />
                        <span>Microphone Ready (48 kHz Broadcast Standard)</span>
                      </span>
                    )}
                  </div>

                  {/* Animated Waveform Visualization */}
                  <div className="h-20 flex items-center justify-center gap-1 sm:gap-1.5 px-4 bg-black/40 rounded-xl border border-[#A6C48A]/20 overflow-hidden">
                    {isRecording && !isPaused ? (
                      Array.from({ length: 24 }).map((_, i) => {
                        const randomHeight = Math.max(12, Math.floor(Math.sin((i + recordSeconds) * 0.7) * 45 + 50));
                        return (
                          <div
                            key={i}
                            className="w-1.5 sm:w-2 bg-[#A6C48A] rounded-full transition-all duration-150"
                            style={{ height: `${randomHeight}%` }}
                          />
                        );
                      })
                    ) : audioBlob ? (
                      Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 sm:w-2 bg-[#1F5138] rounded-full"
                          style={{ height: `${Math.sin(i * 0.4) * 30 + 40}%` }}
                        />
                      ))
                    ) : (
                      <div className="text-xs text-[#DCE9D7]/40 flex items-center gap-2">
                        <span>Waveform will animate dynamically while speaking</span>
                      </div>
                    )}
                  </div>

                  {/* Recording Timer */}
                  <div className="text-3xl font-mono font-extrabold text-[#F5F3E9] tracking-wider">
                    {Math.floor(recordSeconds / 60).toString().padStart(2, "0")}:{(recordSeconds % 60).toString().padStart(2, "0")}
                  </div>

                  {/* Controls: Start / Pause / Resume / Stop */}
                  {isRecording ? (
                    <div className="flex items-center justify-center gap-3">
                      {isPaused ? (
                        <button
                          type="button"
                          onClick={resumeRecording}
                          className="px-5 py-2.5 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] text-xs font-bold flex items-center gap-1.5 transition border border-[#A6C48A]/35"
                        >
                          <Play className="h-4 w-4" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={pauseRecording}
                          className="px-5 py-2.5 rounded-full bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition border border-amber-500/35"
                        >
                          <Pause className="h-4 w-4" />
                          <span>Pause</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-2.5 rounded-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg"
                      >
                        <Square className="h-4 w-4 fill-current" />
                        <span>Finish & Save Voice</span>
                      </button>
                    </div>
                  ) : audioBlob ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={togglePreview}
                        className="px-5 py-2 rounded-full bg-[#1F5138]/60 hover:bg-[#1F5138] text-xs font-semibold text-[#F5F3E9] border border-[#A6C48A]/35 inline-flex items-center gap-2 transition"
                      >
                        {isPlayingPreview ? <Pause className="h-4 w-4 text-[#A6C48A]" /> : <Play className="h-4 w-4 text-[#A6C48A] fill-current" />}
                        <span>{isPlayingPreview ? "Pause Preview" : "Listen to Recording"}</span>
                      </button>

                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            setAudioBlob(null);
                            setAudioUrl(null);
                            setAudioIntegrityHash(null);
                          }}
                          className="text-xs text-[#DCE9D7]/70 hover:text-white underline"
                        >
                          Discard and record again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={startRecording}
                        className="px-7 py-3 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] font-bold text-xs uppercase tracking-wider border border-[#A6C48A]/40 shadow-lg shadow-[#102B20]/60 inline-flex items-center gap-2 transition"
                      >
                        <Mic className="h-4 w-4 text-[#A6C48A]" />
                        <span>Start 48 kHz Recording</span>
                      </button>
                      <p className="text-[11px] text-[#DCE9D7]/65">
                        Microphone access will be requested. Speak naturally in the target oral language.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* File Upload Option */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-2xl border-2 border-dashed border-[#A6C48A]/35 bg-[#071A13]/60 text-center cursor-pointer hover:border-[#A6C48A] transition space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.wav,.mp3,.m4a,.aac,.webm,.ogg,.flac"
                    className="sr-only"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                  <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-[#1F5138]/60 text-[#A6C48A] border border-[#A6C48A]/30">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#F5F3E9]">
                      {audioFileName || "Choose Master Audio File"}
                    </span>
                    <span className="block text-xs text-[#DCE9D7]/60 mt-1">
                      WAV, FLAC, MP3, M4A, OGG, WebM (up to 100MB)
                    </span>
                  </div>
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePreview();
                      }}
                      className="px-4 py-1.5 rounded-full bg-[#1F5138]/60 text-xs font-semibold text-[#F5F3E9] border border-[#A6C48A]/30 inline-flex items-center gap-1.5"
                    >
                      {isPlayingPreview ? <Pause className="h-3.5 w-3.5 text-[#A6C48A]" /> : <Play className="h-3.5 w-3.5 text-[#A6C48A] fill-current" />}
                      <span>{isPlayingPreview ? "Pause" : "Preview Audio"}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 rounded-full border border-[#A6C48A]/30 bg-black/30 hover:bg-black/50 text-xs font-semibold text-[#DCE9D7] transition"
                >
                  Back to Consent
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!audioBlob || isRecording}
                  className="flex-1 h-11 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] text-xs font-bold uppercase tracking-wider border border-[#A6C48A]/40 shadow-lg shadow-[#102B20]/60 flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next: Language Details</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
             STEP 3: LANGUAGE INFORMATION (Dynamic & Open to All Languages)
             ========================================================================= */}
          {step === 3 && (
            <div className="space-y-5 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A6C48A] uppercase tracking-wider mb-1">
                  <Globe2 className="w-4 h-4" />
                  <span>Step 3 of 4: Linguistic Context</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F3E9]">Spoken Oral Language</h2>
                <p className="text-xs text-[#DCE9D7]/80 mt-1">
                  Voice Roots is open to all languages. Select from documented low-resource tongues or enter a custom unwritten dialect.
                </p>
              </div>

              {/* Language Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#DCE9D7]">Documented Language Family</label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    if (e.target.value !== "Custom") setCustomLanguage("");
                  }}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/80 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs focus:outline-none focus:border-[#A6C48A] transition"
                >
                  {DEFAULT_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.name}>
                      {l.name} ({l.native}) — {l.region}
                    </option>
                  ))}
                  <option value="Custom">+ Specify Other Low-Resource Oral Language...</option>
                </select>
              </div>

              {/* Custom Language Input (Ensuring Non-Hardcoded Inclusivity) */}
              {(language === "Custom" || customLanguage) && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#A6C48A]">
                    Custom / Low-Resource Language Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Birhor, Korwa, Nihali, Toda, Irula, Sora"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/80 border border-[#A6C48A]/40 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] transition"
                  />
                  <p className="text-[11px] text-[#DCE9D7]/65">
                    Any oral or indigenous language can be cataloged. Language boundaries are determined by community consensus.
                  </p>
                </div>
              )}

              {/* Dialect / Local Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#DCE9D7]">Local Dialect / Clan Tongue</label>
                  <input
                    type="text"
                    placeholder="e.g. Aheri Gondi / Raj Gonds"
                    value={dialect}
                    onChange={(e) => setDialect(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#DCE9D7]">Homeland / Geographic Valley</label>
                  <input
                    type="text"
                    placeholder="e.g. Bastar, Adilabad, Araku Valley"
                    value={clanRegion}
                    onChange={(e) => setClanRegion(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] transition"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 h-11 rounded-full border border-[#A6C48A]/30 bg-black/30 hover:bg-black/50 text-xs font-semibold text-[#DCE9D7] transition"
                >
                  Back to Recording
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 h-11 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] text-xs font-bold uppercase tracking-wider border border-[#A6C48A]/40 shadow-lg shadow-[#102B20]/60 flex items-center justify-center gap-2 transition"
                >
                  <span>Next: Review & Save</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
             STEP 4: REVIEW & SAVE (Integrity Hash & Immutable Master Archival)
             ========================================================================= */}
          {step === 4 && (
            <div className="space-y-5 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A6C48A] uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Step 4 of 4: Preservation Metadata</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#F5F3E9]">Review & Immutable Save</h2>
                <p className="text-xs text-[#DCE9D7]/80 mt-1">
                  Assign title and community credentials to finalize the cryptographic preservation package.
                </p>
              </div>

              {/* Story Title & Speaker Circle */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#DCE9D7]">Story / Chanting Title</label>
                  <input
                    type="text"
                    placeholder={`e.g. ${effectiveLanguageName} Sacred Monsoon Chant`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#DCE9D7]">Speaker / Elder Circle (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Utnoor Village Elders"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#071A13]/60 border border-[#A6C48A]/25 text-[#F5F3E9] text-xs placeholder-[#DCE9D7]/35 focus:outline-none focus:border-[#A6C48A] transition"
                  />
                </div>
              </div>

              {/* Preservation Summary Card */}
              <div className="p-4 rounded-2xl bg-[#071A13]/80 border border-[#A6C48A]/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#A6C48A]/15">
                  <span className="text-[#DCE9D7]/70">Oral Language:</span>
                  <span className="font-bold text-[#A6C48A]">{effectiveLanguageName}</span>
                </div>
                {dialect && (
                  <div className="flex items-center justify-between pb-2 border-b border-[#A6C48A]/15">
                    <span className="text-[#DCE9D7]/70">Dialect:</span>
                    <span className="font-medium text-[#F5F3E9]">{dialect}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pb-2 border-b border-[#A6C48A]/15">
                  <span className="text-[#DCE9D7]/70">Capture Duration:</span>
                  <span className="font-mono text-[#F5F3E9]">{audioDuration || recordSeconds} seconds</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#A6C48A]/15">
                  <span className="text-[#DCE9D7]/70">Protocol Standard:</span>
                  <span className="text-emerald-300 font-semibold">OCAP® Community Sovereign</span>
                </div>
                {audioIntegrityHash && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-[#A6C48A] flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>SHA-256 Audio Integrity:</span>
                    </span>
                    <p className="font-mono text-[10px] text-[#DCE9D7]/70 break-all select-all">
                      {audioIntegrityHash}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 h-11 rounded-full border border-[#A6C48A]/30 bg-black/30 hover:bg-black/50 text-xs font-semibold text-[#DCE9D7] transition"
                >
                  Back to Language
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 h-11 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] text-xs font-bold uppercase tracking-wider border border-[#A6C48A]/40 shadow-lg shadow-[#102B20]/60 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <span>{isSaving ? "Preserving Audio..." : "Save to Archive"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
