"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Check, Sparkles, Shield, ArrowRight, Upload } from "lucide-react";
import Link from "next/link";

interface RecordingStudioProps {
  onSaved?: (data: any) => void;
}

export function RecordingStudio({ onSaved }: RecordingStudioProps) {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Form Metadata
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("telugu");
  const [dialect, setDialect] = useState("");
  const [recordingType, setRecordingType] = useState("story");
  const [visibility, setVisibility] = useState("public");

  // Consent
  const [consentSpeaker, setConsentSpeaker] = useState(true);
  const [consentAI, setConsentAI] = useState(true);
  const [consentResearch, setConsentResearch] = useState(true);

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState("");
  const [result, setResult] = useState<any | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Waveform visualization
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = "#0B0D0C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = isRecording ? "#6FAF8F" : "#A9B0AB";
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
      // Fallback simulated recording
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
      // simulated blob
      const dummy = new Blob(["mock-audio-data"], { type: "audio/webm" });
      setAudioBlob(dummy);
      setAudioUrl("#simulated-preview");
    }
  };

  const handleProcessAI = async () => {
    if (!consentSpeaker) {
      alert("Speaker consent is required before preserving and processing with AI.");
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setProcessingStage("Preprocessing audio & VAD filtering...");

    await new Promise((r) => setTimeout(r, 600));
    setProgress(35);
    setProcessingStage("AI Language Identification (IndicLID)...");

    await new Promise((r) => setTimeout(r, 700));
    setProgress(65);
    setProcessingStage("Speech-to-Text Transcription & Diarization...");

    await new Promise((r) => setTimeout(r, 800));
    setProgress(85);
    setProcessingStage("Generating IndicTrans2 Translation & Semantic Embeddings...");

    await new Promise((r) => setTimeout(r, 600));
    setProgress(100);
    setProcessingStage("Preservation completed!");
    setIsProcessing(false);

    const mockResult = {
      id: "vr-" + Math.floor(Math.random() * 90000 + 10000),
      title: title || "Traditional Harvest & Rain Song",
      language: language === "telugu" ? "Telugu (Tribal Dialect)" : language.toUpperCase(),
      confidence: 0.942,
      durationSeconds: duration || 42,
      speakerCount: 2,
      originalTranscript:
        "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట ఇది. ఆకాశంలో మబ్బులు కనిపించగానే గ్రామ దేవతకు నమస్కరించి విత్తనాలు చల్లుతారు.",
      normalizedTranscript:
        "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సాంప్రదాయ పాట ఇది. ఆకాశంలో మేఘాలు కనిపించగానే గ్రామ దేవతకు నమస్కరించి విత్తనాలు చల్లుతారు.",
      translationEn:
        "This is a traditional song that the village elders sing before the rains arrive, performing the Earth worship ritual. As soon as dark clouds appear in the sky, they bow to the village deity and sow seeds.",
      keywords: ["వరి వ్యవసాయం", "వర్షం", "గ్రామ దేవత", "విత్తనాలు", "భూమి పూజ"],
      topics: ["Traditional Agriculture", "Folk Rituals", "Oral Poetry"],
      vocabulary: [
        { word: "భూమి పూజ", meaning: "Ritual reverence of the earth/soil before sowing" },
        { word: "విత్తనాలు", meaning: "Native heirloom agricultural seeds" },
        { word: "గ్రామ దేవత", meaning: "Protective deity of the local village community" },
      ],
    };

    setResult(mockResult);
    if (onSaved) onSaved(mockResult);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-root-green/10 border border-root-green/20 text-leaf-green text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>Community Consent & AI Preservation Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Record Oral Language
        </h1>
        <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto">
          Capture folk stories, songs, dialect conversations, and indigenous knowledge. Original audio is permanently protected.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Waveform & Recording Canvas (iOS 27 Spatial Glass) */}
          <div className="glass-surface p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-glass">
            {/* Live Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isRecording
                      ? isPaused
                        ? "bg-earth"
                        : "bg-red-500 animate-ping"
                      : "bg-secondary-text/40"
                  }`}
                />
                <span className="text-xs uppercase tracking-wider font-mono text-secondary-text">
                  {isRecording ? (isPaused ? "Paused" : "Live Recording") : audioBlob ? "Recorded Audio" : "Ready"}
                </span>
              </div>
              <span className="font-mono text-xl sm:text-2xl text-white font-medium">
                {formatTimer(duration)}
              </span>
            </div>

            {/* Canvas Waveform */}
            <div className="h-32 w-full rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden relative">
              <canvas ref={canvasRef} width={800} height={128} className="w-full h-full" />
              {!isRecording && !audioBlob && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-secondary-text/60">
                  <Mic className="w-8 h-8 stroke-1 text-root-green/50" />
                  <span className="text-xs font-mono">Tap Start Recording below</span>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-root-green text-obsidian font-semibold hover:bg-leaf-green transition-all shadow-glow hover:scale-105 active:scale-95"
                >
                  <Mic className="w-5 h-5 fill-current" />
                  <span>Start Recording</span>
                </button>
              )}

              {isRecording && (
                <>
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="px-5 py-3 rounded-full glass-card hover:bg-white/10 text-white font-medium text-sm flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="px-5 py-3 rounded-full bg-root-green/20 border border-root-green/40 text-leaf-green font-medium text-sm flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Resume
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-medium text-sm flex items-center gap-2 hover:bg-red-500/30"
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
                    className="p-3 rounded-full glass-card hover:bg-white/10 text-secondary-text hover:text-white"
                    title="Re-record"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <audio src={audioUrl || ""} controls className="h-10 rounded-full" />
                </div>
              )}
            </div>
          </div>

          {/* Metadata & Consent Form */}
          <div className="glass-surface p-6 sm:p-8 rounded-3xl space-y-6 border border-white/5">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <span>Recording Details & Cultural Metadata</span>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-root-green/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-secondary-text mb-1.5">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-root-green/50"
                >
                  <option value="telugu">Telugu (తెలుగు)</option>
                  <option value="gondi">Gondi (గోండీ / गोंडी)</option>
                  <option value="koya">Koya (కోయ)</option>
                  <option value="santali">Santali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                  <option value="bhili">Bhili (भीली)</option>
                  <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="tamil">Tamil (தமிழ்)</option>
                  <option value="hindi">Hindi (हिन्दी)</option>
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-root-green/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-secondary-text mb-1.5">
                  Recording Type
                </label>
                <select
                  value={recordingType}
                  onChange={(e) => setRecordingType(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-root-green/50"
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
                  className="mt-1 accent-root-green rounded w-4 h-4"
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
                  className="mt-1 accent-root-green rounded w-4 h-4"
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
                  className="mt-1 accent-root-green rounded w-4 h-4"
                />
                <span className="text-xs text-secondary-text leading-relaxed">
                  <strong className="text-white">Scholarly & Linguistic Research:</strong> Permit linguists and open-source models to use this consent-verified recording for model evaluation (WER/CER).
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                disabled={!audioBlob || isProcessing}
                onClick={handleProcessAI}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-root-green hover:bg-leaf-green text-obsidian font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-glow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Process with AI & Save to Archive</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Preservation & Transcription Studio Result */
        <div className="space-y-6">
          <div className="glass-surface p-6 sm:p-8 rounded-3xl border border-root-green/30 shadow-glow space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-leaf-green">Archive Entry #{result.id}</span>
                <h2 className="text-2xl font-semibold text-white mt-1">{result.title}</h2>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-root-green/20 border border-root-green/40 text-leaf-green text-xs font-mono flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>AI Confidence {(result.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Split Screen Original vs Translation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              {/* Original Oral Language */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-secondary-text">
                  <span className="text-leaf-green font-semibold">ORIGINAL ORAL SPEECH ({result.language})</span>
                  <span>Immutable Archive</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-white/90 text-sm leading-relaxed font-sans">
                  {result.originalTranscript}
                </div>
              </div>

              {/* Verified English Translation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-secondary-text">
                  <span className="text-ai-violet font-semibold">INDIC-TRANS2 TRANSLATION (English)</span>
                  <span>Searchable Root</span>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-secondary-text text-sm leading-relaxed font-sans">
                  {result.translationEn}
                </div>
              </div>
            </div>

            {/* Extracted Vocabulary */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-xs font-mono uppercase text-secondary-text block">
                Extracted Cultural Vocabulary & Terms
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.vocabulary.map((v: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-sm font-semibold text-leaf-green block">{v.word}</span>
                    <span className="text-xs text-secondary-text block">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                onClick={() => setResult(null)}
                className="text-xs text-secondary-text hover:text-white transition-colors"
              >
                ← Record Another Sample
              </button>

              <Link
                href="/archive"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-root-green text-obsidian font-semibold text-xs transition-transform hover:scale-105"
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
          <div className="glass-surface p-8 rounded-3xl max-w-md w-full border border-white/10 space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-root-green/20 border border-root-green/40 mx-auto flex items-center justify-center text-leaf-green animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Preservation Pipeline</h3>
              <p className="text-xs text-secondary-text mt-1">{processingStage}</p>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-root-green h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-xs font-mono text-secondary-text">{progress}% complete</span>
          </div>
        </div>
      )}
    </div>
  );
}
