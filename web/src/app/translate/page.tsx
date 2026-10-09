"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Volume2,
  Copy,
  Check,
  Sparkles,
  ArrowRightLeft,
  Coffee,
  Navigation,
  HeartPulse,
  ShoppingBag,
  Users,
  Languages,
  BookOpen,
  ChevronDown,
  Globe,
  Trees,
  Search,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Play,
  RotateCcw,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import {
  STRUCTURED_DIALOGUES,
  DAY_TO_DAY_PHRASES,
  CONVERSATION_CATEGORIES,
  type ConversationDialogue,
  type ConversationPhrase,
  findMatchingPhrase,
} from "@/lib/conversations";

interface SourceLanguage {
  code: string;
  name: string;
  native: string;
  speechCode: string;
  category: "indigenous" | "regional" | "standard";
  placeholder: string;
}

const SOURCE_LANGS: SourceLanguage[] = [
  {
    code: "te",
    name: "Telugu",
    native: "తెలుగు",
    speechCode: "te-IN",
    category: "regional",
    placeholder: "ఉదాహరణ: 'నమస్కారం, మీరు బాగున్నారా?', 'మంచి నీళ్ళు ఇవ్వండి'...",
  },
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    speechCode: "hi-IN",
    category: "regional",
    placeholder: "उदाहरण: 'नमस्ते, आप कैसे हैं?', 'मुझे पानी चाहिए'...",
  },
  {
    code: "en",
    name: "English",
    native: "English",
    speechCode: "en-US",
    category: "standard",
    placeholder: "e.g., 'Hello, how are you?', 'Could I get water?'...",
  },
  {
    code: "ta",
    name: "Tamil",
    native: "தமிழ்",
    speechCode: "ta-IN",
    category: "regional",
    placeholder: "உதாரணம்: 'வணக்கம், எப்படி இருக்கிறீர்கள்?'...",
  },
  {
    code: "kn",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    speechCode: "kn-IN",
    category: "regional",
    placeholder: "ಉದಾಹರಣೆ: 'ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?'...",
  },
  {
    code: "ml",
    name: "Malayalam",
    native: "മലയാളം",
    speechCode: "ml-IN",
    category: "regional",
    placeholder: "ഉദാഹരണം: 'നമസ്കാരം, സുഖമാണോ?'...",
  },
  {
    code: "gondi",
    name: "Gondi",
    native: "గోండీ (Gondi)",
    speechCode: "te-IN",
    category: "indigenous",
    placeholder: "ఉదాహరణ: 'సేవా జోహార్, బాబో బాటో'...",
  },
  {
    code: "koya",
    name: "Koya",
    native: "కోయ (Koya)",
    speechCode: "te-IN",
    category: "indigenous",
    placeholder: "ఉదాహరణ: 'జోహార్! అందరూ క్షేమమేనా?'...",
  },
  {
    code: "lam",
    name: "Lambadi / Banjara",
    native: "లంబాడీ (Banjara)",
    speechCode: "te-IN",
    category: "indigenous",
    placeholder: "ఉదాహరణ: 'రామ్ రామ్ బావ, కైసో ఛే?'...",
  },
];

const TARGET_LANGS = [
  { code: "en", name: "English", label: "English", speechCode: "en-US" },
  { code: "te", name: "Telugu", label: "తెలుగు", speechCode: "te-IN" },
  { code: "hi", name: "Hindi", label: "हिन्दी", speechCode: "hi-IN" },
  { code: "ta", name: "Tamil", label: "தமிழ்", speechCode: "ta-IN" },
  { code: "kn", name: "Kannada", label: "ಕನ್ನಡ", speechCode: "kn-IN" },
  { code: "ml", name: "Malayalam", label: "മലയാളം", speechCode: "ml-IN" },
  { code: "mr", name: "Marathi", label: "मराठी", speechCode: "mr-IN" },
  { code: "bn", name: "Bengali", label: "বাংলা", speechCode: "bn-IN" },
] as const;

export default function DayToDayTranslationPage() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("te");
  const [targetLang, setTargetLang] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Category filter for Day-to-Day Conversations module
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransliteration, setShowTransliteration] = useState(true);

  const activeSourceObj = SOURCE_LANGS.find((l) => l.code === sourceLang) || SOURCE_LANGS[0];
  const activeTargetObj = TARGET_LANGS.find((l) => l.code === targetLang) || TARGET_LANGS[0];

  // Perform translation
  const performTranslation = async (textToTranslate: string, target: string, source: string) => {
    if (!textToTranslate.trim()) {
      setTranslatedText("");
      setTranslationError(null);
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    // 1. Instant local corpus matching
    const match = findMatchingPhrase(textToTranslate, source);
    if (match) {
      const matchResult = (match as any)[target] || match.en;
      if (matchResult) {
        setTranslatedText(matchResult);
        setIsTranslating(false);
        return;
      }
    }

    // 2. Fetch from /api/translate endpoint
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate.trim(),
          sourceLanguage: source,
          targetLanguage: target,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.translation) {
        setTranslatedText(data.translation);
      } else {
        setTranslationError(data.error || "Translation unavailable for this phrase.");
      }
    } catch (e: any) {
      setTranslationError("Network error while connecting to translation service.");
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        performTranslation(inputText, targetLang, sourceLang);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputText, targetLang, sourceLang]);

  // Swap Source and Target Languages
  const handleSwapLanguages = () => {
    const prevSource = sourceLang;
    const prevTarget = targetLang;

    const newTargetMatch = TARGET_LANGS.find((l) => l.code === prevSource);
    const newSourceMatch = SOURCE_LANGS.find((l) => l.code === prevTarget);

    if (newSourceMatch) setSourceLang(prevTarget);
    if (newTargetMatch) setTargetLang(prevSource);

    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText("");
    }
  };

  // Voice Speech Recognition
  const handleSpeechInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = activeSourceObj.speechCode || "te-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        performTranslation(transcript, targetLang, sourceLang);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text-To-Speech pronunciation playback
  const handleSpeakText = (text: string, speechCode: string, turnKey?: string) => {
    if (!text || typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechCode;

      if (turnKey) setSpeakingTurnId(turnKey);
      else setIsPlayingAudio(true);

      utterance.onend = () => {
        setIsPlayingAudio(false);
        setSpeakingTurnId(null);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setSpeakingTurnId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filtered Dialogues
  const filteredDialogues = STRUCTURED_DIALOGUES.filter((d) => {
    const matchesCategory =
      selectedCategory === "All" || d.category.toLowerCase() === selectedCategory.toLowerCase();

    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const matchesTitle = d.title.toLowerCase().includes(q) || d.situation.toLowerCase().includes(q);
    const matchesTurns = d.turns.some(
      (t) =>
        t.text.en?.toLowerCase().includes(q) ||
        t.text.te?.toLowerCase().includes(q) ||
        t.text.hi?.toLowerCase().includes(q)
    );

    return matchesTitle || matchesTurns;
  });

  return (
    <div className="min-h-screen bg-[#0C0908] pb-28 text-[#F7F3EE]">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-10 px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4E9F76]/30 bg-[#4E9F76]/10 px-3.5 py-1 text-xs font-semibold text-[#4E9F76]">
            <Languages className="h-4 w-4" /> Everyday Conversational Intelligence · 10 Core Practical Categories
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F7F3EE] sm:text-4xl">
            Day-to-Day Conversations & Multilingual Translator
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-[#C4B5A5] sm:text-base">
            Natural everyday phrases, dialogues, college exchanges, market interactions, and medical communications. Includes source transliterations, pronunciation guidance, and interactive speech playback.
          </p>
        </header>

        {/* SECTION 1: Interactive Translator Studio */}
        <section className="space-y-6 rounded-3xl border border-white/12 bg-[#1C1512]/70 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Language Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            {/* SOURCE LANGUAGE */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#C4B5A5]">Source:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {SOURCE_LANGS.slice(0, 6).map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => setSourceLang(s.code)}
                    className={`min-h-8 rounded-full px-3 text-xs font-semibold transition ${
                      sourceLang === s.code
                        ? "bg-[#4E9F76] text-[#0C0908] font-bold shadow-[0_0_16px_rgba(78,159,118,0.35)]"
                        : "border border-white/10 text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/5"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* SWAP BUTTON */}
            <button
              type="button"
              onClick={handleSwapLanguages}
              title="Swap Languages"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/5 text-[#4E9F76] hover:bg-[#4E9F76] hover:text-[#0C0908] transition hover:scale-105"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </button>

            {/* TARGET LANGUAGE */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#C4B5A5]">Translate To:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {TARGET_LANGS.slice(0, 6).map((t) => (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => setTargetLang(t.code)}
                    className={`min-h-8 rounded-full px-3 text-xs font-semibold transition ${
                      targetLang === t.code
                        ? "bg-[#E58A4E] text-[#0C0908] shadow-[0_0_16px_rgba(229,138,78,0.35)] font-bold"
                        : "border border-white/10 text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/5"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Banner */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0C0908]/60 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#C4B5A5]">Speaking:</span>
              <span className="rounded-lg bg-[#4E9F76]/20 px-2 py-0.5 font-bold text-[#4E9F76]">
                {activeSourceObj.native} ({activeSourceObj.name})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#C4B5A5]">Translating to:</span>
              <span className="rounded-lg bg-[#E58A4E]/20 px-2 py-0.5 font-bold text-[#E58A4E]">
                {activeTargetObj.label} ({activeTargetObj.name})
              </span>
            </div>
          </div>

          {/* Input & Output Textboxes */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Input Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#C4B5A5]">
                <span className="font-semibold text-[#F7F3EE]">Speak or type in {activeSourceObj.name}:</span>
                <span className="text-[#4E9F76]">Real-time Recognition</span>
              </div>

              <div className="relative">
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={activeSourceObj.placeholder}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-[#0C0908]/60 p-4 text-sm leading-relaxed text-[#F7F3EE] outline-none placeholder:text-[#C4B5A5]/40 focus:border-[#4E9F76]"
                />

                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSpeechInput}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "border border-white/15 bg-white/10 text-[#F7F3EE] hover:bg-white/20"
                    }`}
                  >
                    <Mic className={`h-3.5 w-3.5 ${isListening ? "animate-bounce" : ""}`} />
                    <span>{isListening ? "Listening..." : "Speak"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Translation Output Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#C4B5A5]">
                <span className="font-semibold text-[#F7F3EE]">Translation in {activeTargetObj.name}:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSpeakText(translatedText, activeTargetObj.speechCode)}
                    disabled={!translatedText}
                    title="Pronounce via Browser Speech Engine"
                    className="inline-flex items-center gap-1 text-xs text-[#C4B5A5] hover:text-[#4E9F76] transition disabled:opacity-30"
                  >
                    <Volume2 className={`h-3.5 w-3.5 ${isPlayingAudio ? "text-[#4E9F76] animate-pulse" : ""}`} />
                    <span>{isPlayingAudio ? "Speaking..." : "Pronounce (Browser TTS)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(translatedText)}
                    disabled={!translatedText}
                    className="inline-flex items-center gap-1 text-xs text-[#C4B5A5] hover:text-[#F7F3EE] transition disabled:opacity-30"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-[#4E9F76]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="relative flex min-h-[148px] items-start rounded-2xl border border-white/10 bg-[#0C0908]/70 p-4">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-xs text-[#4E9F76]">
                    <Sparkles className="h-4 w-4 animate-spin text-[#4E9F76]" />
                    <span>Translating phrase...</span>
                  </div>
                ) : translationError ? (
                  <p className="text-xs text-amber-400">{translationError}</p>
                ) : (
                  <p className="text-base font-semibold leading-relaxed text-[#F7F3EE]">
                    {translatedText || "Translation will appear here instantly as you type or speak."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Dedicated Day-to-Day Conversation Module */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#F7F3EE] flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#4E9F76]" />
                <span>Day-to-Day Conversations (10 Categories)</span>
              </h2>
              <p className="text-xs text-[#C4B5A5] pt-0.5">
                Authentic dialogues with speaker turns, transliterations, and pronunciation guidance.
              </p>
            </div>

            {/* Transliteration toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-[#C4B5A5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTransliteration}
                  onChange={(e) => setShowTransliteration(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-[#4E9F76]"
                />
                <span>Show Transliteration</span>
              </label>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#C4B5A5]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phrases by English, Telugu, or Hindi keyword (e.g. 'assignment', 'fever', 'price', 'water')..."
              className="w-full min-h-11 rounded-2xl border border-white/10 bg-[#1C1512]/60 pl-11 pr-4 text-xs text-[#F7F3EE] outline-none placeholder:text-[#C4B5A5]/50 focus:border-[#4E9F76]"
            />
          </div>

          {/* 10 Category Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedCategory === "All"
                  ? "bg-[#4E9F76] text-[#0C0908] font-bold shadow-md"
                  : "border border-white/10 text-[#C4B5A5] hover:bg-white/5 hover:text-[#F7F3EE]"
              }`}
            >
              All (10 Categories)
            </button>
            {CONVERSATION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#4E9F76] text-[#0C0908] font-bold shadow-md"
                  : "border border-white/10 text-[#C4B5A5] hover:bg-white/5 hover:text-[#F7F3EE]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dialogue Cards */}
          <div className="grid grid-cols-1 gap-6">
            {filteredDialogues.map((dialogue) => (
              <div
                key={dialogue.id}
                className="space-y-4 rounded-3xl border border-white/10 bg-[#1C1512]/70 p-6 backdrop-blur-xl shadow-xl transition hover:border-[#4E9F76]/40"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="rounded-md border border-[#4E9F76]/30 bg-[#4E9F76]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#4E9F76]">
                      {dialogue.category}
                    </span>
                    <h3 className="text-base font-bold text-[#F7F3EE] pt-1.5">{dialogue.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#C4B5A5] italic">{dialogue.situation}</span>
                </div>

                {/* Speaker Dialogue Turns */}
                <div className="space-y-4 pt-1">
                  {dialogue.turns.map((turn, tIdx) => {
                    const turnKey = `${dialogue.id}-${tIdx}`;
                    const sourceText = turn.text[sourceLang] || turn.text.te || turn.text.en;
                    const targetText = turn.text[targetLang] || turn.text.en;
                    const translit = turn.transliteration[sourceLang] || turn.transliteration.te || turn.transliteration.hi;
                    const isTurnPlaying = speakingTurnId === turnKey;

                    return (
                      <div
                        key={tIdx}
                        className="rounded-2xl border border-white/5 bg-[#0C0908]/60 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#E58A4E]">{turn.speaker}:</span>
                          <div className="flex items-center gap-2">
                            {/* Browser TTS playback with transparent labeling */}
                            <button
                              type="button"
                              onClick={() => handleSpeakText(sourceText, activeSourceObj.speechCode, turnKey)}
                              title="Listen to pronunciation (Browser TTS)"
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#C4B5A5] hover:text-[#4E9F76] hover:bg-white/10 transition"
                            >
                              <Volume2 className={`h-3 w-3 ${isTurnPlaying ? "text-[#4E9F76] animate-pulse" : ""}`} />
                              <span>{isTurnPlaying ? "Speaking..." : "Audio (Browser TTS)"}</span>
                            </button>

                            {/* Load into translator */}
                            <button
                              type="button"
                              onClick={() => {
                                setInputText(sourceText);
                                performTranslation(sourceText, targetLang, sourceLang);
                                window.scrollTo({ top: 180, behavior: "smooth" });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#4E9F76]/30 bg-[#4E9F76]/10 px-2.5 py-1 text-[11px] font-semibold text-[#4E9F76] hover:bg-[#4E9F76]/20 transition"
                            >
                              <span>Use in Translator ↑</span>
                            </button>
                          </div>
                        </div>

                        {/* Original Phrase */}
                        <p className="text-sm font-semibold text-[#F7F3EE] leading-relaxed">
                          {sourceText}
                        </p>

                        {/* Transliteration */}
                        {showTransliteration && translit && (
                          <p className="text-xs font-mono text-[#C4B5A5]/80 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                            🔤 Transliteration: {translit}
                          </p>
                        )}

                        {/* Target Language Translation */}
                        <div className="rounded-xl border border-white/5 bg-[#1C1512]/60 p-2.5 text-xs space-y-1">
                          <span className="font-semibold text-[#4E9F76] mr-1.5">{activeTargetObj.name} Translation:</span>
                          <span className="text-[#F7F3EE]">{targetText}</span>
                        </div>

                        {/* Pronunciation Guidance */}
                        {turn.pronunciationGuidance && (
                          <p className="text-[11px] text-[#C4B5A5]/70 pt-0.5">
                            💡 <span className="font-semibold text-[#C4B5A5]">Pronunciation tip:</span> {turn.pronunciationGuidance}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredDialogues.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#1C1512]/60 p-8 text-center text-[#C4B5A5]">
                No dialogues found matching your query. Try a different category or search term.
              </div>
            )}
          </div>
        </section>
      </main>

      <AIAssistant />
    </div>
  );
}
