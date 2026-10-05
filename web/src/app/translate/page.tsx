"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import {
  Mic,
  Volume2,
  Copy,
  ArrowRightLeft,
  Sparkles,
  Check,
  Languages,
  MessageSquare,
  Send,
  RotateCcw,
  Upload,
  Coffee,
  ShoppingBag,
  Compass,
  HeartPulse,
  CloudRain,
  HelpCircle,
  Play,
  Pause,
} from "lucide-react";
import { DAY_TO_DAY_PHRASES, ConversationPhrase } from "@/lib/conversations";

const QUICK_CATEGORIES = [
  { id: "all", name: "అన్నీ (All Categories)", icon: Sparkles },
  { id: "greetings", name: "పరిచయాలు (Greetings)", icon: Coffee },
  { id: "needs", name: "ఆహారం & దాహం (Needs)", icon: Coffee },
  { id: "market", name: "సంత & ధరలు (Market)", icon: ShoppingBag },
  { id: "travel", name: "దారి & ప్రయాణం (Travel)", icon: Compass },
  { id: "health", name: "వైద్యం & సాయం (Health)", icon: HeartPulse },
  { id: "weather", name: "వాతావరణం (Weather)", icon: CloudRain },
];

export default function DayToDayTranslatePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [inputText, setInputText] = useState("బాగున్నారా? ఎలా ఉన్నారు?");
  const [targetLang, setTargetLang] = useState<"te" | "en" | "hi" | "gondi" | "koya">("en");
  const [sourceLang, setSourceLang] = useState("telugu");

  const [translatedText, setTranslatedText] = useState("Greetings! How are you doing? Are you well?");
  const [detectedCategory, setDetectedCategory] = useState("Greetings (పలకరింపులు)");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Filtered phrases by category
  const filteredPhrases = DAY_TO_DAY_PHRASES.filter((p) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "greetings") return p.category.includes("Greetings") || p.category.includes("Introductions");
    if (activeCategory === "needs") return p.category.includes("Needs") || p.category.includes("Food");
    if (activeCategory === "market") return p.category.includes("Market");
    if (activeCategory === "travel") return p.category.includes("Travel");
    if (activeCategory === "health") return p.category.includes("Health");
    if (activeCategory === "weather") return p.category.includes("Weather");
    return true;
  });

  // Call translation API
  const handleTranslate = async (text: string, tLang: string, sLang: string) => {
    if (!text.trim()) {
      setTranslatedText("");
      return;
    }
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage: tLang,
          sourceLanguage: sLang,
        }),
      });
      const data = await res.json();
      if (data.translation) {
        setTranslatedText(data.translation);
        if (data.category) setDetectedCategory(data.category);
      }
    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      handleTranslate(inputText, targetLang, sourceLang);
    }, 200);
    return () => clearTimeout(t);
  }, [inputText, targetLang, sourceLang]);

  // Audio Speech Input (Microphone)
  const handleSpeechInput = () => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      try {
        const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechClass();
        rec.lang = targetLang === "en" ? "te-IN" : "en-IN";
        rec.continuous = false;
        rec.interimResults = false;

        setIsListening(true);

        rec.onresult = (e: any) => {
          const phrase = e.results[0][0].transcript;
          if (phrase) {
            setInputText(phrase);
            handleTranslate(phrase, targetLang, sourceLang);
          }
          setIsListening(false);
        };
        rec.onerror = () => {
          setIsListening(false);
          runSimulatedVoiceInput();
        };
        rec.onend = () => setIsListening(false);
        rec.start();
        return;
      } catch (err) {
        console.warn("Speech API fallback", err);
      }
    }
    runSimulatedVoiceInput();
  };

  const runSimulatedVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const randomPhrases = [
        "నాకు తాగడానికి మంచి నీళ్ళు కావాలి, దాహం వేస్తోంది",
        "దయచేసి నాకు కొంచెం సహాయం చేయండి",
        "ఈ వస్తువు ధర ఎంత? ఎంతకి ఇస్తారు?",
        "ఈ దారి ఊరికి వెళ్తుందా?",
        "నాకు ఒంట్లో బాగోలేదు, డాక్టర్ ఎక్కడ ఉంటారు?",
      ];
      const pick = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
      setInputText(pick);
      handleTranslate(pick, targetLang, sourceLang);
    }, 1800);
  };

  // Text to Speech playback
  const handleSpeakOutput = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = targetLang === "te" ? "te-IN" : targetLang === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 0.9;
      setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectQuickPhrase = (phrase: ConversationPhrase) => {
    setInputText(phrase.te);
    setDetectedCategory(phrase.category);
    handleTranslate(phrase.te, targetLang, "telugu");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-4">
      <Navbar />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#141414]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-netflix-red via-netflix-red-hover to-netflix-red-dark flex items-center justify-center text-white shadow-netflix-glow">
              <Languages className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  దైనందిన సంభాషణల అనువాదం (Day-to-Day Translation)
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-netflix-red/20 text-netflix-red border border-netflix-red/30 uppercase">
                  Daily Conversations
                </span>
              </div>
              <p className="text-xs text-netflix-light mt-1">
                రోజువారీ జీవితంలో మాట్లాడే సాధారణ వాక్యాలు — పలకరింపులు, నీళ్ళు, భోజనం, ధరలు, దారి వివరాలు & అత్యవసర సహాయం (Telugu, English, Hindi, Gondi, Koya).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputText("");
                setTranslatedText("");
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-netflix-light hover:text-white transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Translation Workstation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl space-y-6">
          {/* Target Language Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cultural-gold uppercase tracking-wider">
                మీరు మాట్లాడే భాష (Speak In):
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/10 text-xs font-bold text-white border border-white/15">
                తెలుగు (Telugu) / Any
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-netflix-red uppercase tracking-wider">
                అనువాద భాష (Translate To):
              </span>
              <div className="flex p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  onClick={() => setTargetLang("en")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    targetLang === "en" ? "bg-netflix-red text-white shadow-netflix-glow" : "text-netflix-light hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setTargetLang("te")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    targetLang === "te" ? "bg-netflix-red text-white shadow-netflix-glow" : "text-netflix-light hover:text-white"
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  onClick={() => setTargetLang("hi")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    targetLang === "hi" ? "bg-netflix-red text-white shadow-netflix-glow" : "text-netflix-light hover:text-white"
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setTargetLang("gondi")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    targetLang === "gondi" ? "bg-netflix-red text-white shadow-netflix-glow" : "text-netflix-light hover:text-white"
                  }`}
                >
                  గోండి (Gondi)
                </button>
                <button
                  onClick={() => setTargetLang("koya")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    targetLang === "koya" ? "bg-netflix-red text-white shadow-netflix-glow" : "text-netflix-light hover:text-white"
                  }`}
                >
                  కోయ (Koya)
                </button>
              </div>
            </div>
          </div>

          {/* Dual Textboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Side */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-netflix-light">
                <span className="font-semibold text-white">మీ వాక్యం టైప్ చేయండి లేదా మాట్లాడండి:</span>
                <span className="text-[11px] text-cultural-gold">{detectedCategory}</span>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="ఉదాహరణ: 'బాగున్నారా?', 'మంచి నీళ్ళు ఇవ్వండి', 'దీని ధర ఎంత?', 'దారి ఎక్కడ?'..."
                  className="w-full p-4 rounded-2xl bg-black/50 border border-white/15 text-white placeholder-netflix-light/50 text-sm focus:outline-none focus:border-netflix-red leading-relaxed resize-none"
                />

                {/* Microphone Button */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleSpeechInput}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isListening
                        ? "bg-netflix-red text-white animate-pulse shadow-netflix-glow"
                        : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                    }`}
                    title="Speak into Microphone"
                  >
                    <Mic className={`w-3.5 h-3.5 ${isListening ? "animate-bounce" : ""}`} />
                    <span>{isListening ? "వింటున్నాను..." : "మాట్లాడండి (Speak)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Translation Output Side */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-netflix-light">
                <span className="font-semibold text-white">తక్షణ అనువాదం (Instant Translation):</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeakOutput}
                    className="flex items-center gap-1 text-[11px] text-cultural-gold hover:text-white transition-colors"
                    title="Listen Pronunciation"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "text-netflix-red animate-pulse" : ""}`} />
                    <span>{isPlayingAudio ? "Speaking..." : "వినండి (Listen)"}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-netflix-light hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c1c1c] via-[#161616] to-[#121212] border border-white/15 min-h-[110px] flex items-center shadow-inner relative">
                {isTranslating ? (
                  <div className="flex items-center gap-2 text-xs text-cultural-gold">
                    <Sparkles className="w-4 h-4 animate-spin text-netflix-red" />
                    <span>అనువదిస్తున్నాము...</span>
                  </div>
                ) : (
                  <p className="text-base font-semibold text-white leading-relaxed">
                    {translatedText || "మీరు ఏదైనా మాట్లాడగానే లేదా టైప్ చేయగానే ఇక్కడ అనువాదం కనిపిస్తుంది."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Day-to-Day Categories Matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Coffee className="w-4 h-4 text-cultural-gold" />
              <span>నిత్య జీవిత సాధారణ సంభాషణలు (Click Any Daily Sentence to Translate):</span>
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {QUICK_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-netflix-red text-white shadow-netflix-glow"
                      : "bg-white/5 hover:bg-white/10 text-netflix-light border border-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Sentences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPhrases.map((phrase, idx) => (
              <div
                key={idx}
                onClick={() => selectQuickPhrase(phrase)}
                className="p-4 rounded-2xl bg-[#141414] border border-white/10 hover:border-netflix-red/60 hover:bg-[#1a1a1a] transition-all cursor-pointer group shadow-lg space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-cultural-gold font-bold">
                    {phrase.category}
                  </span>
                  <span className="text-[10px] text-netflix-light group-hover:text-netflix-red transition-colors flex items-center gap-1">
                    <span>క్లిక్ చేయండి</span>
                    <span>→</span>
                  </span>
                </div>

                <p className="text-sm font-bold text-white group-hover:text-netflix-red-hover transition-colors">
                  {phrase.te}
                </p>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-netflix-light space-y-1">
                  <div>
                    <span className="text-[10px] font-bold text-cultural-gold mr-1.5">English:</span>
                    <span>{phrase.en}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-netflix-red mr-1.5">Gondi:</span>
                    <span>{phrase.gondi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
