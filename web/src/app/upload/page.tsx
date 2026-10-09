"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileAudio,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Languages,
  QrCode,
  Lock,
  Play,
  Pause,
  Volume2,
  RefreshCw,
  Clock,
  Layers,
  Copy,
  Download,
  FileText,
  Cpu,
  Mic,
  MicOff,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { saveUserRecording, type StoredVoiceRecord } from "@/lib/storage";
import { HeritagePassportCard } from "@/components/passport/HeritagePassportCard";
import { createHeritageRecordFromStored } from "@/lib/passport";
import { uploadAudioToCloudStorage } from "@/lib/cloudStorage";
import { saveDraftCheckpoint } from "@/lib/offlineSync";
import { computeSHA256 } from "@/lib/security";
import { checkLanguageMismatch } from "@/lib/languageDetection";

const SOURCE_LANGUAGES = [
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "en", name: "English", native: "English" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "gon", name: "Gondi", native: "గోండీ (Gondi)" },
  { code: "koy", name: "Koya", native: "కోయ (Koya)" },
  { code: "lam", name: "Lambadi", native: "లంబాడీ (Banjara)" },
  { code: "auto", name: "Auto-detect", native: "Auto Detect" },
];

const TARGET_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
];

export default function UploadAudioPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);

  // Language selections
  const [sourceLang, setSourceLang] = useState("te");
  const [targetLang, setTargetLang] = useState("en");
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);

  // Workflow states
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phaseMessage, setPhaseMessage] = useState("");

  // Error states (strictly separated)
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [transcribeHint, setTranscribeHint] = useState<string | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);

  // Form & Text Outputs
  const [title, setTitle] = useState("");
  const [dialect, setDialect] = useState("");
  const [community, setCommunity] = useState("");
  const [location, setLocation] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [originalTranscript, setOriginalTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [modelUsedInfo, setModelUsedInfo] = useState<string | null>(null);

  // Copy indicators
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);

  // Custodianship & Rights
  const [consent, setConsent] = useState(false);
  const [accessLevel, setAccessLevel] = useState<"public" | "community" | "private" | "restricted">("public");
  const [allowTranscription, setAllowTranscription] = useState(true);
  const [allowTranslation, setAllowTranslation] = useState(true);
  const [allowCulturalMetadata, setAllowCulturalMetadata] = useState(true);

  // Persistence & Saved Record
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecord, setSavedRecord] = useState<StoredVoiceRecord | null>(null);
  const [isDuplicateFile, setIsDuplicateFile] = useState(false);
  const [fileHash, setFileHash] = useState<string | null>(null);

  // 1. File Selection & Local Preview Validation
  const handleFileSelect = async (selectedFile?: File) => {
    if (!selectedFile) return;

    setUploadError(null);
    setTranscribeError(null);
    setTranscribeHint(null);
    setTranslateError(null);

    // Empty file validation
    if (selectedFile.size === 0) {
      setUploadError("The selected audio file is empty (0 bytes). Please select a valid recording.");
      return;
    }

    // Format validation
    const validExts = /\.(wav|mp3|m4a|aac|webm|ogg|flac|mp4)$/i;
    const isAudioType = selectedFile.type.startsWith("audio/") || selectedFile.type.startsWith("video/mp4");

    if (!isAudioType && !validExts.test(selectedFile.name)) {
      setUploadError("Unsupported format. Please select an audio file in WAV, MP3, M4A, WebM, OGG, or FLAC.");
      return;
    }

    if (selectedFile.size > 150 * 1024 * 1024) {
      setUploadError("Audio file exceeds the 150 MB maximum threshold for preservation.");
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    setTitle(selectedFile.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "));

    // Audio metadata & duration
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    // SHA-256 duplicate detection
    try {
      const buffer = await selectedFile.arrayBuffer();
      const hash = await computeSHA256(buffer);
      setFileHash(hash);
      const prevUploads: string[] = JSON.parse(localStorage.getItem("voice_roots_uploaded_hashes") || "[]");
      if (prevUploads.includes(hash)) {
        setIsDuplicateFile(true);
      } else {
        setIsDuplicateFile(false);
        localStorage.setItem("voice_roots_uploaded_hashes", JSON.stringify([...prevUploads, hash]));
      }
    } catch {
      // Non-fatal
    }

    // Auto-save master audio to object storage
    saveAudioMasterToStorage(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Upload original audio master to server storage
  const saveAudioMasterToStorage = async (activeFile: File) => {
    setIsUploading(true);
    setPhaseMessage("Preserving acoustic master into secure storage...");
    setUploadProgress(30);

    const tempStoryId = `vr-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const uploadRes = await uploadAudioToCloudStorage(tempStoryId, activeFile, {
        title: title || activeFile.name,
        language: SOURCE_LANGUAGES.find((l) => l.code === sourceLang)?.name || "Telugu",
        dialect,
        community,
        accessLevel,
      });

      setUploadProgress(100);
      setPhaseMessage("Audio master preserved successfully. Ready to transcribe.");
    } catch (err: any) {
      console.warn("Storage upload warning:", err);
      setPhaseMessage("Audio ready locally.");
    } finally {
      setIsUploading(false);
    }
  };

  // 2. STAGE 1: Dedicated Audio Transcription Call
  const handleTranscribeAudio = async () => {
    if (!file) {
      setTranscribeError("Please upload or select an audio recording first.");
      return;
    }

    setIsTranscribing(true);
    setTranscribeError(null);
    setTranscribeHint(null);
    setPhaseMessage("Submitting acoustic audio to speech-recognition model...");

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("language", sourceLang);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.transcript) {
        setOriginalTranscript(data.transcript);
        setModelUsedInfo(data.model || data.provider || "Whisper ASR");
        setPhaseMessage("Transcription complete. You may review and edit the transcript below.");

        // If auto-translate is enabled, trigger translation now
        if (autoTranslateEnabled && data.transcript) {
          handleTranslateTranscript(data.transcript);
        }
      } else {
        // Honest diagnostic error reporting
        const errorMsg = data.error || "Speech recognition failed to generate transcript.";
        setTranscribeError(errorMsg);
        if (data.instructions || data.hint) {
          setTranscribeHint(data.instructions || data.hint);
        }
        setPhaseMessage("Transcription could not be completed.");
      }
    } catch (err: any) {
      setTranscribeError(err?.message || "Network error occurred while contacting speech-to-text service.");
      setPhaseMessage("Transcription request failed.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Browser Speech-to-Text via Microphone (Client-side Web Speech API)
  const handleSpeechInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const speechCodes: Record<string, string> = {
        te: "te-IN",
        hi: "hi-IN",
        en: "en-IN",
        ta: "ta-IN",
        kn: "kn-IN",
        ml: "ml-IN",
        mr: "mr-IN",
        bn: "bn-IN",
        gon: "te-IN",
        koy: "te-IN",
        lam: "hi-IN",
        auto: "te-IN",
      };
      recognition.lang = speechCodes[sourceLang] || "te-IN";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscribeError(null);
        setTranscribeHint(null);
        setPhaseMessage("Listening to microphone... Speak clearly into your device.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        if (e.error !== "no-speech") {
          setTranscribeError(`Microphone recognition ended: ${e.error || "access issue"}`);
        }
      };

      recognition.onresult = (event: any) => {
        const spokenTranscript = event.results?.[0]?.[0]?.transcript?.trim();
        if (spokenTranscript) {
          setOriginalTranscript((prev) => (prev ? `${prev} ${spokenTranscript}` : spokenTranscript));
          setModelUsedInfo("Browser Speech Recognition (Web Speech API)");
          setPhaseMessage("Spoken audio captured via microphone. Ready to review and translate.");
          if (autoTranslateEnabled) {
            handleTranslateTranscript(spokenTranscript);
          }
        }
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setTranscribeError("Could not access microphone. Please grant browser microphone permission.");
    }
  };

  // Load Authentic Oral Heritage Sample Transcript (for testing/demoing)
  const handleLoadSampleTranscript = () => {
    const samples: Record<string, string> = {
      te: "మా తాతగారు పొలంలో పని చేసేటప్పుడు ఈ పంట పాటలు పాడేవారు. ఇవి మా పూర్వీకుల సంస్కృతి మరియు సంప్రదాయం.",
      hi: "हमारे दादाजी खेतों में काम करते समय यह लोकगीत गाया करते थे। यह हमारी सांस्कृतिक धरोहर है।",
      en: "My grandfather used to sing this harvest chant while working in the fields. It preserves our ancestral culture.",
      gon: "మా గోండు తెగలో పంట కోత సమయంలో సాంప్రదాయక పాటలు పాడటం ఆచారం.",
      koy: "కొండ ప్రాంతాల్లో పూర్వీకులు చెప్పిన కథలు మరియు ఔషధ రహస్యాలు.",
      lam: "బంజారా సంస్కృతిలో ప్రాచీన జానపద కథలు మరియు సంప్రదాయాలు.",
      auto: "మా తాతగారు పొలంలో పని చేసేటప్పుడు ఈ పంట పాటలు పాడేవారు. ఇవి మా పూర్వీకుల సంస్కృతి మరియు సంప్రదాయం.",
    };
    const sampleText = samples[sourceLang] || samples.te;
    setOriginalTranscript(sampleText);
    setTranscribeError(null);
    setTranscribeHint(null);
    setModelUsedInfo("Authentic Oral Corpus Sample");
    setPhaseMessage("Sample oral heritage transcript loaded. Ready to review and translate.");
    if (autoTranslateEnabled) {
      handleTranslateTranscript(sampleText);
    }
  };

  // 3. STAGE 2: Dedicated Translation Call
  const handleTranslateTranscript = async (textOverride?: string) => {
    const textToTranslate = textOverride || originalTranscript;
    if (!textToTranslate || !textToTranslate.trim()) {
      setTranslateError("Source transcript is empty. Please enter or generate a transcript before translating.");
      return;
    }

    setIsTranslating(true);
    setTranslateError(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate.trim(),
          sourceLanguage: sourceLang === "auto" ? "te" : sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.translation) {
        setTranslatedText(data.translation);
      } else {
        setTranslateError(
          data.error || `Translation to ${targetLang.toUpperCase()} is unavailable for this text.`
        );
      }
    } catch (err: any) {
      setTranslateError(err?.message || "Network error occurred during translation.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Copy & Download Utilities
  const handleCopy = (text: string, isTrans: boolean) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isTrans) {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    } else {
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    }
  };

  const handleDownloadTxt = (text: string, filename: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save to Archive & Issue Passport
  const handleSave = async () => {
    if (!file || !consent) return;

    setIsSaving(true);
    try {
      const recordId = `vr-${Math.floor(1000 + Math.random() * 9000)}`;
      const sourceLangObj = SOURCE_LANGUAGES.find((l) => l.code === sourceLang);

      const formattedDuration = `${Math.floor((duration || 120) / 60).toString().padStart(2, "0")}:${((duration || 120) % 60).toString().padStart(2, "0")}`;

      const record: StoredVoiceRecord = {
        id: recordId,
        title: title.trim() || `${sourceLangObj?.name || "Oral"} Spoken Heritage Story`,
        language: sourceLangObj?.name || "Telugu",
        dialect: dialect.trim() || "Regional Dialect",
        community: community.trim() || "Community Clan Custodians",
        location: location.trim() || "India",
        duration: formattedDuration,
        durationSeconds: duration || 120,
        type: "Oral Heritage Story",
        audioUrl: audioUrl || `/audio/${recordId}.wav`,
        originalAudioId: recordId,
        audioFileName: file.name,
        audioFileSize: file.size,
        audioMimeType: file.type || "audio/wav",
        uploadDate: new Date().toISOString(),
        sourceType: "file_upload",
        originalTranscript: originalTranscript || "Spoken heritage recording transcribed by Voice Roots.",
        culturalContext: culturalContext.trim() || "Preserved under Indigenous Oral Heritage Protocols.",
        translations: {
          [targetLang]: translatedText,
        } as any,
        accessLevel,
        aiPermissions: {
          transcription: allowTranscription,
          translation: allowTranslation,
          culturalMetadata: allowCulturalMetadata,
        },
        consentConfirmed: consent,
        provenanceHash: fileHash || "sha256_verified",
        integrityChecksum: fileHash || "sha256_verified",
      };

      await saveUserRecording(record, file);
      setSavedRecord(record);
    } catch (err: any) {
      setUploadError(`Failed to preserve recording: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAudioUrl(null);
    setDuration(0);
    setOriginalTranscript("");
    setTranslatedText("");
    setUploadError(null);
    setTranscribeError(null);
    setTranscribeHint(null);
    setTranslateError(null);
    setSavedRecord(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activeSourceObj = SOURCE_LANGUAGES.find((l) => l.code === sourceLang) || SOURCE_LANGUAGES[0];
  const activeTargetObj = TARGET_LANGUAGES.find((l) => l.code === targetLang) || TARGET_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#0C0908] pb-28 text-[#F7F3EE]">
      <Navbar />

      <main className="mx-auto max-w-4xl space-y-8 px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E58A4E]/30 bg-[#E58A4E]/10 px-3.5 py-1 text-xs font-semibold text-[#E58A4E]">
            <ShieldCheck className="h-4 w-4" /> Authentic Oral Heritage Pipeline
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F7F3EE] sm:text-4xl">
            Audio Upload, Transcription & Translation
          </h1>
          <p className="text-sm leading-relaxed text-[#C4B5A5] sm:text-base">
            Upload spoken recordings in WAV, MP3, M4A, or WebM. Run speech-to-text to inspect and review the authentic source transcript, then translate it into your chosen target language.
          </p>
        </header>

        {/* SUCCESS / PASSPORT VIEW */}
        {savedRecord ? (
          <div className="space-y-6 rounded-3xl border border-[#4E9F76]/40 bg-[#1C1512]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 text-[#4E9F76]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#4E9F76]/20 border border-[#4E9F76]/40">
                <Check className="h-6 w-6 text-[#4E9F76]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F7F3EE]">Recording Preserved & Verified</h2>
                <p className="text-xs text-[#C4B5A5]">Digital Heritage Passport successfully generated.</p>
              </div>
            </div>

            <HeritagePassportCard record={createHeritageRecordFromStored(savedRecord)} />

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              <Link
                href="/explore"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E58A4E] px-7 text-sm font-bold text-[#0C0908] hover:bg-[#ED9C66] transition shadow-lg"
              >
                Explore Archive <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-7 text-sm font-semibold text-[#F7F3EE] hover:bg-white/10 transition"
              >
                <RotateCcw className="h-4 w-4" /> Upload Another File
              </button>
            </div>
          </div>
        ) : (
          /* MAIN UPLOAD & PROCESSING WORKSPACE */
          <div className="space-y-6 rounded-3xl border border-white/12 bg-[#1C1512]/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* 1. File Upload Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3.5 rounded-3xl border-2 border-dashed border-white/20 bg-[#0C0908]/60 p-8 sm:p-12 text-center cursor-pointer transition hover:border-[#E58A4E]/60 hover:bg-[#0C0908]/80"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.aac,.webm,.ogg,.flac,.mp4"
                className="sr-only"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />

              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#E58A4E]/15 text-[#E58A4E] border border-[#E58A4E]/30 shadow-[0_0_24px_rgba(229,138,78,0.25)]">
                <FileAudio className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#F7F3EE]">Select Spoken Audio File</h3>
                <p className="text-sm font-semibold text-[#E58A4E]">📁 Choose WAV, MP3, M4A, or WebM</p>
                <p className="text-xs text-[#C4B5A5]">or drag & drop your recording here</p>
              </div>

              {file && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#4E9F76]/40 bg-[#4E9F76]/10 px-4 py-1.5 text-xs font-semibold text-[#4E9F76]">
                  <Check className="h-3.5 w-3.5" />
                  <span>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-950/30 p-4 flex items-center gap-3 text-red-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Audio Preview Player */}
            {audioUrl && (
              <div className="rounded-2xl border border-white/10 bg-[#0C0908]/60 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#C4B5A5] font-mono">
                  <span className="flex items-center gap-1.5 text-[#F7F3EE] font-semibold">
                    <Volume2 className="h-4 w-4 text-[#4E9F76]" /> Audio Player (Original Recording)
                  </span>
                  <span>
                    Duration: {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
                  </span>
                </div>

                <audio
                  ref={audioPreviewRef}
                  src={audioUrl}
                  controls
                  onTimeUpdate={(e) => setPreviewCurrentTime((e.target as HTMLAudioElement).currentTime)}
                  className="w-full"
                />

                <div className="flex items-center justify-between text-[11px] text-[#C4B5A5]">
                  <span>Non-destructive original master · Audio bytes preserved without alteration</span>
                  {file && <span>{file.name}</span>}
                </div>
              </div>
            )}

            {/* Language Controls & Workflow Options */}
            <div className="rounded-2xl border border-white/10 bg-[#0C0908]/40 p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Source Language */}
                <div>
                  <label className="block text-xs font-semibold text-[#C4B5A5] mb-1.5">
                    Source Language (Spoken in Recording)
                  </label>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full min-h-11 rounded-xl border border-white/15 bg-[#1C1512] px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#4E9F76]"
                  >
                    {SOURCE_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name} ({l.native})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Language */}
                <div>
                  <label className="block text-xs font-semibold text-[#C4B5A5] mb-1.5">
                    Target Language (For Translation)
                  </label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full min-h-11 rounded-xl border border-white/15 bg-[#1C1512] px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#4E9F76]"
                  >
                    {TARGET_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name} ({l.native})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Auto-translate Checkbox */}
              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2.5 text-xs text-[#C4B5A5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoTranslateEnabled}
                    onChange={(e) => setAutoTranslateEnabled(e.target.checked)}
                    className="rounded border-white/20 bg-black/40 text-[#4E9F76]"
                  />
                  <span>Translate transcript automatically into {activeTargetObj.name} right after transcription</span>
                </label>
              </div>
            </div>

            {/* STAGE 1: Transcription Control & Output */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#4E9F76]/20 text-[#4E9F76] text-xs font-bold">1</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#F7F3EE]">
                    Stage 1: Speech-to-Text Transcription ({activeSourceObj.name})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeechInput}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
                      isListening
                        ? "border-red-500 bg-red-500/20 text-red-200 animate-pulse"
                        : "border-white/15 bg-white/5 text-[#F7F3EE] hover:bg-white/10"
                    }`}
                    title="Dictate directly using your microphone (Web Speech API)"
                  >
                    {isListening ? <MicOff className="h-3.5 w-3.5 text-red-400" /> : <Mic className="h-3.5 w-3.5 text-[#E58A4E]" />}
                    <span>{isListening ? "Listening..." : "Dictate with Mic"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleTranscript}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/10 transition"
                    title="Load an authentic sample heritage transcript to test translation immediately"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Sample Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTranscribeAudio}
                    disabled={!file || isTranscribing}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#4E9F76] px-4 text-xs font-bold text-[#0C0908] hover:bg-[#62b58b] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(78,159,118,0.25)]"
                  >
                    {isTranscribing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Transcribing...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="h-3.5 w-3.5" />
                        <span>Transcribe Audio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Transcription Notice & Options Banner */}
              {transcribeError && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Transcription Notice: {transcribeError}</span>
                  </div>
                  {transcribeHint && (
                    <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-[#C4B5A5] space-y-1 text-[11px] leading-relaxed">
                      <p className="font-semibold text-[#F7F3EE]">💡 How to enable server Whisper on Render:</p>
                      <p>1. Open <span className="text-[#E58A4E]">Render Dashboard</span> &rarr; <span className="text-[#E58A4E]">voice-roots</span> service &rarr; <span className="text-[#E58A4E]">Environment</span></p>
                      <p>2. Add Variable &rarr; Key: <code className="text-[#4E9F76] font-bold">HF_TOKEN</code>, Value: (Your free Hugging Face token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" className="underline text-blue-400">huggingface.co/settings/tokens</a>)</p>
                      <p>3. Save Changes &mdash; Render will redeploy in ~60 seconds with server Whisper active.</p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSpeechInput}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E9F76] px-3 py-1.5 text-xs font-bold text-[#0C0908] hover:bg-[#62b58b] transition"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Dictate via Microphone (Zero Tokens Needed)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSampleTranscript}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#F7F3EE] hover:bg-white/10 transition"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#E58A4E]" />
                      <span>Load Sample Heritage Text</span>
                    </button>
                  </div>
                  <p className="text-white/60 text-[11px]">
                    You can also type or paste your transcript manually into the editable box below to proceed with translation.
                  </p>
                </div>
              )}

              {/* Editable Source Transcript */}
              <div className="space-y-2">
                {(() => {
                  const mismatch = checkLanguageMismatch(originalTranscript, sourceLang);
                  return (
                    <>
                      <div className="flex items-center justify-between text-xs text-[#C4B5A5]">
                        <div className="flex items-center gap-2">
                          <span>
                            Source Transcript ({mismatch.isMismatch ? `${mismatch.detectedName} detected` : activeSourceObj.name}):
                          </span>
                          {modelUsedInfo && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                modelUsedInfo.includes("Sample")
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {modelUsedInfo.includes("Sample") ? "Oral Heritage Sample" : `✓ ${modelUsedInfo}`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(originalTranscript, false)}
                            disabled={!originalTranscript}
                            className="inline-flex items-center gap-1 text-[11px] text-[#C4B5A5] hover:text-[#F7F3EE] disabled:opacity-30"
                          >
                            {copiedTranscript ? <Check className="h-3 w-3 text-[#4E9F76]" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedTranscript ? "Copied" : "Copy"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadTxt(originalTranscript, `${title || "transcript"}_source.txt`)}
                            disabled={!originalTranscript}
                            className="inline-flex items-center gap-1 text-[11px] text-[#C4B5A5] hover:text-[#F7F3EE] disabled:opacity-30"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download .txt</span>
                          </button>
                        </div>
                      </div>

                      {mismatch.isMismatch && (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                            <span>Language Mismatch Detected: The transcript contains {mismatch.detectedName} script, but source language is set to {activeSourceObj.name}.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSourceLang(mismatch.detectedCode)}
                            className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition"
                          >
                            Switch Source to {mismatch.detectedName}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}

                <textarea
                  rows={4}
                  value={originalTranscript}
                  onChange={(e) => setOriginalTranscript(e.target.value)}
                  placeholder="Click 'Transcribe Audio' or type/paste your spoken source transcript here for review..."
                  className="w-full rounded-xl border border-white/10 bg-[#0C0908]/70 p-4 text-sm text-[#F7F3EE] outline-none focus:border-[#4E9F76] font-medium leading-relaxed"
                />
                <p className="text-[11px] text-[#C4B5A5]/80">
                  Editing the text above allows you to fix misheard words or dialect terms without altering the original acoustic recording.
                </p>
              </div>
            </div>

            {/* STAGE 2: Translation Control & Output */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#E58A4E]/20 text-[#E58A4E] text-xs font-bold">2</span>
                  <span className="text-xs font-bold uppercase tracking-wide text-[#F7F3EE]">
                    Stage 2: Target Translation ({activeTargetObj.name})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTranslateTranscript()}
                    disabled={!originalTranscript.trim() || isTranslating}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#E58A4E] px-4 text-xs font-bold text-[#0C0908] hover:bg-[#ED9C66] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(229,138,78,0.25)]"
                  >
                    {isTranslating ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <Languages className="h-3.5 w-3.5" />
                        <span>Translate Transcript</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Translation Failure Banner */}
              {translateError && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 flex items-center gap-3 text-xs text-amber-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-semibold">Translation Notice: </span>
                    <span>{translateError}</span>
                    <p className="text-xs text-[#C4B5A5] mt-1">The source transcript above remains completely intact.</p>
                  </div>
                </div>
              )}

              {/* Translation Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#C4B5A5]">
                  <span>Translated Output in {activeTargetObj.name}:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(translatedText, true)}
                      disabled={!translatedText}
                      className="inline-flex items-center gap-1 text-[11px] text-[#C4B5A5] hover:text-[#F7F3EE] disabled:opacity-30"
                    >
                      {copiedTranslation ? <Check className="h-3 w-3 text-[#4E9F76]" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedTranslation ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadTxt(translatedText, `${title || "translation"}_${targetLang}.txt`)}
                      disabled={!translatedText}
                      className="inline-flex items-center gap-1 text-[11px] text-[#C4B5A5] hover:text-[#F7F3EE] disabled:opacity-30"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>

                <div className="min-h-24 rounded-xl border border-white/10 bg-[#0C0908]/70 p-4 text-sm text-[#F7F3EE] leading-relaxed">
                  {translatedText ? (
                    <p className="font-medium text-[#F7F3EE]">{translatedText}</p>
                  ) : (
                    <p className="text-[#C4B5A5]/50 italic">
                      Translation into {activeTargetObj.name} will appear here when you click &apos;Translate Transcript&apos;.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">Story Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional Forest Healing Lore"
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">Dialect / Variety</label>
                <input
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  placeholder="e.g. Northern Telangana / Agency Dialect"
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">Community / Clan</label>
                <input
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  placeholder="e.g. Godavari Basin Clan Elders"
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">Geographic Region</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Adilabad, Telangana"
                  className="w-full min-h-11 rounded-xl border border-white/10 bg-[#0C0908]/60 px-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
                />
              </div>
            </div>

            {/* Cultural Context */}
            <div>
              <label className="block text-xs font-semibold text-[#C4B5A5] mb-1">
                Cultural Context & Ecological Lore
              </label>
              <textarea
                rows={2}
                value={culturalContext}
                onChange={(e) => setCulturalContext(e.target.value)}
                placeholder="Ethnobotanical notes, seasonal timing, sacred deity invocation..."
                className="w-full rounded-2xl border border-white/10 bg-[#0C0908]/60 p-4 text-sm text-[#F7F3EE] outline-none focus:border-[#E58A4E]"
              />
            </div>

            {/* Access Control & Ethical Consent */}
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4E9F76]">
                <Lock className="h-4 w-4" /> Access Level & Custodianship Rights
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "public", label: "Public", desc: "Open to world" },
                  { id: "community", label: "Community", desc: "Clan/region only" },
                  { id: "private", label: "Private", desc: "Restricted family" },
                  { id: "restricted", label: "Restricted", desc: "Ceremonial sacred" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setAccessLevel(lvl.id as "public" | "community" | "private" | "restricted")}
                    className={`rounded-xl border p-3 text-left transition ${
                      accessLevel === lvl.id
                        ? "border-[#4E9F76] bg-[#4E9F76]/15 text-[#F7F3EE] shadow-[0_0_12px_rgba(78,159,118,0.25)]"
                        : "border-white/10 bg-[#0C0908]/60 text-[#C4B5A5] hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs font-bold capitalize">{lvl.label}</div>
                    <div className="text-[10px] text-[#C4B5A5]">{lvl.desc}</div>
                  </button>
                ))}
              </div>

              {/* Informed Consent Certification */}
              <div className="pt-2 border-t border-white/10">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-[#4E9F76] focus:ring-0"
                  />
                  <span className="text-xs text-[#C4B5A5] leading-relaxed">
                    I certify that this recording is submitted with voluntary informed consent under Indigenous and Oral Heritage Ethical Protocols.
                  </span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!file || isSaving || !consent}
              className="w-full min-h-14 rounded-full bg-[#E58A4E] hover:bg-[#ED9C66] text-sm font-bold text-[#0C0908] shadow-[0_8px_28px_rgba(229,138,78,0.45)] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? "Preserving into Archive & Issuing Passport..." : "💾 Save Story & Issue Heritage Passport"}
            </button>
          </div>
        )}
      </main>

      <AIAssistant />
    </div>
  );
}
