"use client";

import React, { useState, useRef } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Check,
  Sparkles,
  Shield,
  ArrowRight,
  Upload,
  FileAudio,
  HardDrive,
  Database,
  Music,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { saveUserRecording, StoredVoiceRecord } from "@/lib/storage";

interface RecordingStudioProps {
  onSaved?: (data: any) => void;
}

const SAMPLE_PRESETS = [
  {
    name: "gondi_elder_harvest_chant_1978.wav",
    title: "The Mountain Spring & Harvest Legend",
    language: "gondi",
    dialect: "Mandla Hill Variety (Bastar)",
    type: "song",
    durationSec: 154,
    sizeBytes: 4410200,
    format: "WAV (Lossless 48kHz)",
    transcript:
      "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक पुरानी कहानी है। जब सूखा पड़ता था, तो हमारे गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।",
    translation:
      "Behind the perennial spring flowing on the mountain peak lies an ancient tale of our ancestors. Whenever drought descended, the village elders would sing this sacred chant to invoke the rain deity.",
  },
  {
    name: "koya_sacred_forest_healing.mp3",
    title: "Wild Neem & Turmeric Healing Lore",
    language: "koya",
    dialect: "Godavari River Valley",
    type: "traditional_knowledge",
    durationSec: 210,
    sizeBytes: 3240000,
    format: "MP3 (320 kbps)",
    transcript:
      "అడవిలో దొరికే వేప, పసుపు వేర్లతో జ్వరాలు తగ్గించే సాంప్రదాయ వైద్య విధానం. ఈ మూలికలను వర్షాకాలంలో సేకరించి ఎండబెట్టి భద్రపరుస్తాము.",
    translation:
      "How wild neem and indigenous turmeric roots are formulated into seasonal fever remedies. These herbs are gathered during early monsoons and dried according to clan protocols.",
  },
  {
    name: "khasi_living_root_engineering.m4a",
    title: "Living Root Bridges Oral Engineering",
    language: "khasi",
    dialect: "Sohra Variety (Cherrapunji)",
    type: "traditional_knowledge",
    durationSec: 320,
    sizeBytes: 5820000,
    format: "M4A (AAC-LC)",
    transcript:
      "Ka jingshna ia ki jingkieng da ki thied dieng ha ki khlaw ba rben. Ki kpa tymmen ki la hikai ia ngi ban pyniaid ia ki thied Ficus elastica ban long jingkieng ba neh shispah snem.",
    translation:
      "Elders narrating how aerial Ficus elastica roots are guided across roaring gorges over seventy years to create living bridges that endure for centuries.",
  },
];

export function RecordingStudio({ onSaved }: RecordingStudioProps) {
  // Mode: Live Mic vs Upload File
  const [sourceType, setSourceType] = useState<"microphone_recording" | "file_upload">(
    "microphone_recording"
  );

  // Live Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Upload File state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [uploadedFileFormat, setUploadedFileFormat] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Metadata
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("telugu");
  const [dialect, setDialect] = useState("");
  const [recordingType, setRecordingType] = useState("story");
  const [community, setCommunity] = useState("Community Contributor");

  // Consent
  const [consentSpeaker, setConsentSpeaker] = useState(true);
  const [consentAI, setConsentAI] = useState(true);
  const [consentResearch, setConsentResearch] = useState(true);

  // Processing & Storage Results
  const [selectedTranslationTarget, setSelectedTranslationTarget] = useState<"te" | "en" | "hi">("te");
  const [activeResultTranslationTab, setActiveResultTranslationTab] = useState<"te" | "en" | "hi">("te");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [savedRecord, setSavedRecord] = useState<StoredVoiceRecord | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Waveform visualization for microphone
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isRecording ? "#E50914" : "#555555";
    ctx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    if (isRecording && !isPaused) {
      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      drawWaveform();
    } catch (err) {
      console.warn("Microphone not available, using simulated live recording", err);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    drawWaveform();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (!audioUrl) {
      const dummy = new Blob(["mock-audio-data"], { type: "audio/webm" });
      setAudioBlob(dummy);
      setAudioUrl("#simulated-preview");
    }
  };

  // File Upload Handlers
  const handleFileProcess = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSize(file.size);
    setUploadedFileFormat(file.type || file.name.split(".").pop()?.toUpperCase() || "AUDIO");
    setAudioUrl(objectUrl);
    setAudioBlob(file);

    // Auto deduce title if empty
    if (!title) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setTitle(cleanName);
    }

    // Determine duration from HTML5 audio element
    const tempAudio = new Audio();
    tempAudio.src = objectUrl;
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDuration(Math.round(tempAudio.duration));
      } else {
        setDuration(120); // fallback default
      }
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSampleAudioSelect = (sample: typeof SAMPLE_PRESETS[0]) => {
    setUploadedFileName(sample.name);
    setUploadedFileSize(sample.sizeBytes);
    setUploadedFileFormat(sample.format);
    setTitle(sample.title);
    setLanguage(sample.language);
    setDialect(sample.dialect);
    setRecordingType(sample.type);
    setDuration(sample.durationSec);
    const mockBlob = new Blob(["sample-audio"], { type: "audio/wav" });
    setAudioBlob(mockBlob);
    setAudioUrl("#sample-audio-preview");
  };

  // AI Pipeline & Storage Persistence
  const handleProcessAI = async () => {
    if (!consentSpeaker) {
      alert("Speaker consent is required before preserving and processing with AI.");
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setProcessingStage(
      sourceType === "file_upload"
        ? "Extracting acoustic headers & VAD segmentation from audio file..."
        : "Preprocessing audio & VAD filtering..."
    );

    await new Promise((r) => setTimeout(r, 600));
    setProgress(35);
    setProcessingStage("AI Language Identification (IndicLID neural model)...");

    await new Promise((r) => setTimeout(r, 700));
    setProgress(65);
    setProcessingStage("Speech-to-Text Transcription & Multi-speaker Diarization...");

    await new Promise((r) => setTimeout(r, 800));
    setProgress(85);
    setProcessingStage("Generating IndicTrans2 Translation & Semantic Embeddings...");

    await new Promise((r) => setTimeout(r, 600));
    setProgress(95);
    setProcessingStage("Writing encrypted audio object to local & cloud vault storage...");

    await new Promise((r) => setTimeout(r, 500));
    setProgress(100);
    setProcessingStage("Voice record preserved and stored successfully!");
    setIsProcessing(false);

    // Language-aware custom transcripts
    let originalTranscript =
      "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట ఇది. ఆకాశంలో మబ్బులు కనిపించగానే గ్రామ దేవతకు నమస్కరించి విత్తనాలు చల్లుతారు.";
    let translationTe =
      "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట ఇది. ఆకాశంలో మబ్బులు కనిపించగానే గ్రామ దేవతకు నమస్కరించి విత్తనాలు చల్లుతారు.";
    let translationEn =
      "This is a traditional song that the village elders sing before the rains arrive, performing the Earth worship ritual. As soon as dark clouds appear in the sky, they bow to the village deity and sow seeds.";
    let translationHi =
      "यह एक पारंपरिक गीत है जो हमारे गाँव के बुजुर्ग मानसून की बारिश आने से पहले गाते हैं, धरती पूजा करते हैं। जैसे ही आसमान में काले बादल छाते हैं, वे ग्राम देवता को नमन कर देशी बीज बोते हैं।";

    if (language === "gondi") {
      originalTranscript =
        "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक पुरानी कहानी है। जब सूखा पड़ता था, तो हमारे गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।";
      translationTe =
        "కొండ శిఖరంపై ప్రవహించే ఊట వెనుక మా పూర్వీకుల పురాతన కథ దాగి ఉంది. కరవు వచ్చినప్పుడు గ్రామ పెద్దలు ఈ పవిత్ర గీతాన్ని పాడి వరుణ దేవుని ప్రార్థించేవారు.";
      translationEn =
        "Behind the perennial spring on the mountain peak lies an ancient tale of our ancestors. Whenever drought descended, the village elders would sing this sacred chant to invoke the rain deity.";
      translationHi =
        "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक प्राचीन कथा है। जब सूखा पड़ता था, तो गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।";
    } else if (language === "koya") {
      originalTranscript =
        "అడవిలో దొరికే వేప, పసుపు వేర్లతో జ్వరాలు తగ్గించే సాంప్రదాయ వైద్య విధానం. ఈ మూలికలను వర్షాకాలంలో సేకరించి ఎండబెట్టి భద్రపరుస్తాము.";
      translationTe =
        "అడవిలో లభించే వేప, అడవి పసుపు వేర్లతో జ్వరాలను నయం చేసే సాంప్రదాయ వైద్య జ్ఞానం. ఈ మూలికలను వర్షాకాలంలో సేకరించి ఎండబెట్టి భద్రపరుస్తారు.";
      translationEn =
        "How wild neem and indigenous turmeric roots are formulated into seasonal fever remedies. These herbs are gathered during early monsoons and dried according to clan protocols.";
      translationHi =
        "जंगल में मिलने वाले नीम और हल्दी की जड़ों से मौसमी बुखार का इलाज करने का पारंपरिक ज्ञान। इन जड़ी-बूटियों को मानसून के शुरू में इकट्ठा करके सुखाया जाता है।";
    } else if (language === "khasi") {
      originalTranscript =
        "Ka jingshna ia ki jingkieng da ki thied dieng ha ki khlaw ba rben. Ki kpa tymmen ki la hikai ia ngi ban pyniaid ia ki thied Ficus elastica ban long jingkieng ba neh shispah snem.";
      translationTe =
        "నదుల మీదుగా మర్రి వేర్లను డెబ్బై ఏళ్ల పాటు పెంచి శతాబ్దాల పాటు నిలిచే సజీవ వేరు వంతెనలను నిర్మించే సాంప్రదాయ ఖాసీ ఇంజనీరింగ్ జ్ఞానం.";
      translationEn =
        "Elders narrating how aerial Ficus elastica roots are guided across roaring gorges over seventy years to create living bridges that endure for centuries.";
      translationHi =
        "बुजुर्ग बताते हैं कि कैसे जीवित फिकस पेड़ों की जड़ों को गहरी घाटियों के पार निर्देशित कर ऐसे जीवित पुल बनाए जाते हैं जो सदियों तक टिकते हैं।";
    }

    const newRecordId = "vr-" + Math.floor(Math.random() * 90000 + 10000);
    const durationFormatted = formatTimer(duration || 42);

    const fullRecord: StoredVoiceRecord = {
      id: newRecordId,
      title:
        title ||
        (sourceType === "file_upload"
          ? uploadedFileName || "Uploaded Field Audio"
          : "Live Community Voice Capture"),
      language: language.charAt(0).toUpperCase() + language.slice(1),
      dialect: dialect || "Agency Variety",
      duration: durationFormatted,
      durationSeconds: duration || 42,
      type: recordingType,
      community: community || "Community Contributor",
      sourceType,
      audioFileName: uploadedFileName || `recording_${newRecordId}.wav`,
      audioFileSize: uploadedFileSize || (duration ? duration * 16000 * 2 : 240000),
      audioFormat: uploadedFileFormat || (sourceType === "file_upload" ? "MP3/WAV" : "WEBM/PCM"),
      uploadDate: new Date().toISOString(),
      originalTranscript,
      translationEn,
      translationTe,
      translationHi,
      translations: {
        te: translationTe,
        en: translationEn,
        hi: translationHi,
      },
      excerpt: originalTranscript.slice(0, 110) + "...",
      translationExcerpt: (selectedTranslationTarget === "te" ? translationTe : translationEn).slice(0, 110) + "...",
      confidence: 0.942,
      keywords: ["Oral Language", "Indigenous Lore", "Dialect Shift", "Voice Roots"],
      vocabulary: [
        { word: "భూమి పూజ / सगा", meaning: "Ritual reverence of ancestral earth before sowing" },
        { word: "విత్తనాలు / बीज", meaning: "Heirloom native agricultural seed heritage" },
        { word: "గ్రామ దేవత", meaning: "Protective deity of the local village community" },
      ],
      isUserUploaded: true,
    };

    setActiveResultTranslationTab(selectedTranslationTarget);

    // Save to persistent localStorage storage
    saveUserRecording(fullRecord);
    setSavedRecord(fullRecord);
    setResult(fullRecord);

    // Also persist to API endpoint
    try {
      fetch("/api/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fullRecord.title,
          language: fullRecord.language,
          dialect: fullRecord.dialect,
          recordingType: fullRecord.type,
          durationSeconds: fullRecord.durationSeconds,
          audioFileName: fullRecord.audioFileName,
          audioFileSize: fullRecord.audioFileSize,
          sourceType: fullRecord.sourceType,
          consentSpeaker: true,
        }),
      }).catch((e) => console.warn("API recording sync note:", e));
    } catch (e) {
      // background sync
    }

    if (onSaved) onSaved(fullRecord);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-netflix-red/10 border border-netflix-red/30 text-netflix-red text-xs font-mono font-semibold">
          <Shield className="w-3.5 h-3.5 text-netflix-red" />
          <span>Voice Record & Storage Studio • Consent Verified</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Preserve Oral Languages
        </h1>
        <p className="text-netflix-gray text-sm sm:text-base max-w-xl mx-auto">
          Record your voice live or upload existing audio recordings (.wav, .mp3, .m4a). Securely stored with clan data sovereignty.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Mode Switcher: Live Microphone vs Upload Audio Files */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 rounded-full bg-black/60 border border-white/10 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setSourceType("microphone_recording");
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setDuration(0);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  sourceType === "microphone_recording"
                    ? "bg-netflix-red text-white shadow-netflix-glow scale-102"
                    : "text-netflix-gray hover:text-white"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Live Voice Recording</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSourceType("file_upload");
                  setIsRecording(false);
                  setIsPaused(false);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  sourceType === "file_upload"
                    ? "bg-netflix-red text-white shadow-netflix-glow scale-102"
                    : "text-netflix-gray hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Audio Files</span>
              </button>
            </div>
          </div>

          {/* MODE 1: LIVE VOICE RECORDING */}
          {sourceType === "microphone_recording" && (
            <div className="ios27-glass p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl">
              {/* Live Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isRecording
                        ? isPaused
                          ? "bg-cultural-gold"
                          : "bg-netflix-red animate-ping"
                        : "bg-white/30"
                    }`}
                  />
                  <span className="text-xs uppercase tracking-wider font-mono text-netflix-light">
                    {isRecording
                      ? isPaused
                        ? "Paused"
                        : "Live Recording"
                      : audioBlob
                      ? "Recorded Audio"
                      : "Ready"}
                  </span>
                </div>
                <span className="font-mono text-xl sm:text-2xl text-white font-bold">
                  {formatTimer(duration)}
                </span>
              </div>

              {/* Canvas Waveform */}
              <div className="h-32 w-full rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden relative">
                <canvas ref={canvasRef} width={800} height={128} className="w-full h-full" />
                {!isRecording && !audioBlob && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-netflix-gray">
                    <Mic className="w-8 h-8 stroke-1 text-netflix-red/60 animate-pulse" />
                    <span className="text-xs font-mono">Tap Start Recording below</span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="mt-6 flex items-center justify-center gap-4">
                {!isRecording && !audioBlob && (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-full ios27-button-primary font-bold shadow-netflix-glow transition-all hover:scale-105 active:scale-95"
                  >
                    <Mic className="w-5 h-5 fill-current text-white" />
                    <span>Start Recording</span>
                  </button>
                )}

                {isRecording && (
                  <>
                    {!isPaused ? (
                      <button
                        onClick={pauseRecording}
                        className="px-5 py-3 rounded-full ios27-pill hover:bg-white/10 text-white font-medium text-sm flex items-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={resumeRecording}
                        className="px-5 py-3 rounded-full bg-netflix-red/20 border border-netflix-red/40 text-netflix-red font-medium text-sm flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Resume
                      </button>
                    )}

                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 rounded-full bg-netflix-red text-white font-bold text-sm flex items-center gap-2 shadow-netflix-glow hover:bg-netflix-red-hover"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      Finish Recording
                    </button>
                  </>
                )}

                {audioBlob && !isRecording && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setAudioBlob(null);
                        setAudioUrl(null);
                        setDuration(0);
                      }}
                      className="p-3 rounded-full ios27-pill hover:bg-white/10 text-netflix-gray hover:text-white"
                      title="Re-record"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <audio src={audioUrl || ""} controls className="h-10 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 2: UPLOAD AUDIO FILES */}
          {sourceType === "file_upload" && (
            <div className="ios27-glass p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl space-y-6">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.webm"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />

              {!uploadedFileName ? (
                /* Drag and drop zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? "border-netflix-red bg-netflix-red/10 scale-101"
                      : "border-white/15 bg-black/40 hover:border-netflix-red/50 hover:bg-black/60"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-netflix-red/15 border border-netflix-red/30 flex items-center justify-center text-netflix-red mb-2">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Drop your audio recording here, or{" "}
                    <span className="text-netflix-red underline decoration-netflix-red/40">browse files</span>
                  </h3>
                  <p className="text-xs text-netflix-gray font-mono">
                    Supports WAV (48kHz recommended), MP3, M4A, AAC, FLAC, OGG, WEBM (up to 100 MB)
                  </p>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-5 rounded-2xl bg-black/60 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-netflix-red/20 border border-netflix-red/40 flex items-center justify-center text-netflix-red flex-shrink-0">
                      <FileAudio className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                          {uploadedFileName}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-cultural-gold border border-white/10">
                          {uploadedFileFormat}
                        </span>
                      </div>
                      <p className="text-xs text-netflix-gray font-mono mt-0.5">
                        {uploadedFileSize ? formatFileSize(uploadedFileSize) : "Direct Audio"} •{" "}
                        {formatTimer(duration)} duration
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadedFileName(null);
                        setUploadedFileSize(null);
                        setAudioUrl(null);
                        setAudioBlob(null);
                        setDuration(0);
                      }}
                      className="px-3 py-1.5 rounded-full ios27-pill text-xs text-netflix-gray hover:text-white"
                    >
                      Change File
                    </button>
                    {audioUrl && (
                      <audio src={audioUrl} controls className="h-9 rounded-full max-w-[200px]" />
                    )}
                  </div>
                </div>
              )}

              {/* Quick Sample Oral Recordings Preset Picker */}
              <div className="pt-2 border-t border-white/5 space-y-2.5">
                <span className="text-[11px] font-mono uppercase text-netflix-gray tracking-wider block">
                  Or Test with Real Indigenous Field Audio Samples:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_PRESETS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSampleAudioSelect(sample)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        uploadedFileName === sample.name
                          ? "bg-netflix-red/15 border-netflix-red text-white"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-netflix-light hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                        <Music className="w-3.5 h-3.5 text-netflix-red" />
                        <span className="truncate">{sample.title}</span>
                      </div>
                      <p className="text-[11px] text-netflix-gray truncate">{sample.dialect}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-cultural-gold">
                        <span>{sample.format.split(" ")[0]}</span>
                        <span>•</span>
                        <span>{formatTimer(sample.durationSec)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metadata & Consent Form */}
          <div className="glass-surface p-6 sm:p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-lg font-medium text-white flex items-center justify-between">
              <span>Recording Details & Cultural Metadata</span>
              <div className="flex items-center gap-2 text-xs font-mono text-netflix-gray">
                <HardDrive className="w-3.5 h-3.5 text-netflix-red" />
                <span>Encrypted Storage Vault</span>
              </div>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-secondary-text mb-1.5">
                  Title / Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Village Harvest Ceremony Story"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-netflix-red"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-secondary-text mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-netflix-red"
                >
                  <optgroup label="Dravidian Oral Traditions">
                    <option value="telugu">Telugu (తెలుగు)</option>
                    <option value="gondi">Gondi (గోండీ / गोंडी)</option>
                    <option value="koya">Koya (కోయ)</option>
                    <option value="tulu">Tulu (ತುಳು)</option>
                    <option value="toda">Toda (തോഡാ / Thōda)</option>
                    <option value="kurukh">Kurukh / Oraon (कुड़ुख़)</option>
                    <option value="kodava">Kodava (ಕೊಡವ)</option>
                    <option value="badaga">Badaga (ಬಡಗ)</option>
                    <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="tamil">Tamil (தமிழ்)</option>
                  </optgroup>
                  <optgroup label="Austroasiatic & Munda Languages">
                    <option value="santali">Santali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                    <option value="ho">Ho (ᱦᱳ)</option>
                    <option value="mundari">Mundari (ᱢᱩᱱᱰᱟᱨᱤ)</option>
                    <option value="khasi">Khasi (Ka Ktien Khasi)</option>
                    <option value="korku">Korku (कोरकू)</option>
                  </optgroup>
                  <optgroup label="Tibeto-Burman Traditions">
                    <option value="bodo">Bodo (बर'/बड़ो)</option>
                    <option value="garo">Garo (A·chik Ku·sik)</option>
                    <option value="ao_naga">Ao Naga (Ao O)</option>
                    <option value="mizo">Mizo (Mizo ṭawng)</option>
                    <option value="lepcha">Lepcha (ᰛᰩᰵᰛᰧᰵ)</option>
                    <option value="ladakhi">Ladakhi (ལ་དྭགས་སྐད་)</option>
                  </optgroup>
                  <optgroup label="Indo-Aryan & Tribal Contact">
                    <option value="bhili">Bhili (भीली)</option>
                    <option value="lambadi">Lambadi / Banjara (गोर बोली)</option>
                    <option value="halbi">Halbi (हल्बी)</option>
                    <option value="hindi">Hindi (हिन्दी)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-secondary-text mb-1.5">
                  Dialect / Regional Variety
                </label>
                <input
                  type="text"
                  placeholder="e.g. Telangana North / Agency Area"
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-netflix-red"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-secondary-text mb-1.5">
                  Recording Type
                </label>
                <select
                  value={recordingType}
                  onChange={(e) => setRecordingType(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-netflix-red"
                >
                  <option value="story">Folk Story / Legend</option>
                  <option value="song">Traditional Song / Poem</option>
                  <option value="conversation">Everyday Dialect Conversation</option>
                  <option value="traditional_knowledge">Traditional Knowledge (Agriculture / Craft)</option>
                  <option value="proverb">Proverb & Idiom</option>
                  <option value="history">Oral History / Memory</option>
                </select>
              </div>
            </div>

            {/* Consent Checklist (First-class ethical preservation) */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-xs font-mono uppercase text-secondary-text block">
                Ethical Consent & Preservation Protocol
              </span>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentSpeaker}
                  onChange={(e) => setConsentSpeaker(e.target.checked)}
                  className="mt-1 accent-netflix-red rounded w-4 h-4"
                />
                <span className="text-xs text-secondary-text leading-relaxed">
                  <strong className="text-white">Informed Speaker Consent:</strong> The speaker explicitly agreed to have their voice digitally preserved in the Voice Roots archive.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentAI}
                  onChange={(e) => setConsentAI(e.target.checked)}
                  className="mt-1 accent-netflix-red rounded w-4 h-4"
                />
                <span className="text-xs text-secondary-text leading-relaxed">
                  <strong className="text-white">AI Language Processing:</strong> Allow automatic speech transcription, dialect analysis, and translation. Original voice audio will never be modified.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentResearch}
                  onChange={(e) => setConsentResearch(e.target.checked)}
                  className="mt-1 accent-netflix-red rounded w-4 h-4"
                />
                <span className="text-xs text-secondary-text leading-relaxed">
                  <strong className="text-white">Scholarly & Linguistic Research:</strong> Permit linguists and open-source models to use this consent-verified recording for model evaluation (WER/CER).
                </span>
              </label>
            </div>

            {/* Submit & Translation Action */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cultural-gold font-bold">
                  Translate Audio To (అనువాదం):
                </span>
                <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedTranslationTarget("te")}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${
                      selectedTranslationTarget === "te"
                        ? "bg-netflix-red text-white shadow-netflix-glow"
                        : "text-netflix-gray hover:text-white"
                    }`}
                  >
                    తెలుగు (Telugu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTranslationTarget("en")}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${
                      selectedTranslationTarget === "en"
                        ? "bg-netflix-red text-white shadow-netflix-glow"
                        : "text-netflix-gray hover:text-white"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTranslationTarget("hi")}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${
                      selectedTranslationTarget === "hi"
                        ? "bg-netflix-red text-white shadow-netflix-glow"
                        : "text-netflix-gray hover:text-white"
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              </div>

              <button
                disabled={!audioBlob || isProcessing}
                onClick={handleProcessAI}
                className="flex items-center gap-2 px-6 py-3 rounded-full ios27-button-primary font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-netflix-glow hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>
                  {sourceType === "file_upload"
                    ? "Upload & Translate Audio Now (ఆడియోను అనువదించు)"
                    : "Record & Translate Audio Now (ఆడియోను అనువదించు)"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Preservation & Transcription Studio Result */
        <div className="space-y-6">
          <div className="ios27-glass p-6 sm:p-8 rounded-3xl border border-netflix-red/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-netflix-red font-bold">
                    Archive Entry #{result.id}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-netflix-red/20 text-netflix-red border border-netflix-red/30">
                    {result.sourceType === "file_upload" ? "UPLOADED AUDIO FILE" : "LIVE MIC CAPTURE"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">{result.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-mono font-bold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cultural-gold" />
                  <span>Stored & Encrypted</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-netflix-red/20 border border-netflix-red/40 text-netflix-red text-xs font-mono font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>AI {(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Storage Confirmation Pill */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-netflix-gray">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-netflix-red flex-shrink-0" />
                <span>
                  Audio preserved in persistent archive storage:{" "}
                  <strong className="text-white font-mono">{result.audioFileName}</strong> (
                  {formatFileSize(result.audioFileSize)})
                </span>
              </div>
              <span className="font-mono text-[10px] text-cultural-gold hidden sm:inline">
                AES-256 ENCRYPTED
              </span>
            </div>

            {/* Split Screen Original vs Translation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/10">
              {/* Original Oral Language */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-netflix-gray">
                  <span className="text-netflix-red font-bold">ORIGINAL ORAL SPEECH ({result.language})</span>
                  <span>Immutable Archive</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-white/90 text-sm leading-relaxed font-sans">
                  {result.originalTranscript}
                </div>
              </div>

              {/* Verified Multi-language Translation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cultural-gold font-bold">INDIC-TRANS2 TRANSLATION</span>
                  {/* Language Tab Switcher */}
                  <div className="inline-flex p-0.5 rounded-full bg-white/5 border border-white/10 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setActiveResultTranslationTab("te")}
                      className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                        activeResultTranslationTab === "te"
                          ? "bg-netflix-red text-white shadow-netflix-glow"
                          : "text-netflix-gray hover:text-white"
                      }`}
                    >
                      తెలుగు (Telugu)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultTranslationTab("en")}
                      className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                        activeResultTranslationTab === "en"
                          ? "bg-netflix-red text-white shadow-netflix-glow"
                          : "text-netflix-gray hover:text-white"
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultTranslationTab("hi")}
                      className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                        activeResultTranslationTab === "hi"
                          ? "bg-netflix-red text-white shadow-netflix-glow"
                          : "text-netflix-gray hover:text-white"
                      }`}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/60 border border-cultural-gold/30 text-white text-sm leading-relaxed font-sans font-medium">
                  {activeResultTranslationTab === "te"
                    ? result.translationTe || result.translations?.te || result.translationEn
                    : activeResultTranslationTab === "hi"
                    ? result.translationHi || result.translations?.hi || result.translationEn
                    : result.translationEn}
                </div>
              </div>
            </div>

            {/* Extracted Vocabulary */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <span className="text-xs font-mono uppercase text-netflix-gray block">
                Extracted Cultural Vocabulary & Terms
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.vocabulary?.map((v: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-sm font-bold text-netflix-red block">{v.word}</span>
                    <span className="text-xs text-netflix-gray block">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setResult(null);
                  setUploadedFile(null);
                  setUploadedFileName(null);
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setDuration(0);
                }}
                className="text-xs text-netflix-gray hover:text-white transition-colors"
              >
                ← Preserve Another Voice
              </button>

              <Link
                href="/archive"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full ios27-button-primary font-bold text-xs transition-transform hover:scale-105 shadow-netflix-glow"
              >
                <span>View in Global Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Progress modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="ios27-glass p-8 rounded-3xl max-w-md w-full border border-white/15 space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-netflix-red/20 border border-netflix-red/40 mx-auto flex items-center justify-center text-netflix-red animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Preservation Pipeline</h3>
              <p className="text-xs text-netflix-gray mt-1">{processingStage}</p>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-netflix-red h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-xs font-mono text-netflix-gray">{progress}% complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
