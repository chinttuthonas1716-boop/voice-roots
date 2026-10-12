"use client";

import { useState } from "react";
import { Volume2, Copy, Check, ArrowRightLeft } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

interface LanguageOption {
  code: string;
  name: string;
  native: string;
  speechCode: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "te", name: "Telugu", native: "తెలుగు", speechCode: "te-IN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", speechCode: "hi-IN" },
  { code: "en", name: "English", native: "English", speechCode: "en-US" },
  { code: "ta", name: "Tamil", native: "தமிழ்", speechCode: "ta-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", speechCode: "kn-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", speechCode: "ml-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", speechCode: "mr-IN" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", speechCode: "or-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", speechCode: "bn-IN" },
  { code: "gondi", name: "Gondi", native: "గోండీ", speechCode: "te-IN" },
  { code: "koya", name: "Koya", native: "కోయ", speechCode: "te-IN" },
  { code: "sat", name: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ", speechCode: "hi-IN" },
  { code: "lam", name: "Lambadi", native: "లంబాడీ", speechCode: "te-IN" },
];

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState("te");
  const [targetLang, setTargetLang] = useState("en");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwap = () => {
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setTranslatedText("");
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText.trim(),
          sourceLang,
          targetLang,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Translation request failed (${resp.status})`);
      }

      const data = await resp.json();
      setTranslatedText(data.translation || "Translation unavailable.");
    } catch {
      setError("Unable to translate right now. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!translatedText || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    const targetObj = LANGUAGES.find((l) => l.code === targetLang);
    if (targetObj) {
      utterance.lang = targetObj.speechCode;
    }
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen pb-24 pt-20">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
            Language Translator
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Translate spoken phrases across 13 Indian and tribal tongues.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300 text-center">
            {error}
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex-1">
              <label htmlFor="source-lang" className="block text-xs font-medium text-[#94A3B8] mb-1">
                From
              </label>
              <select
                id="source-lang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-white/15 bg-[#0B0F19] px-3.5 text-base text-[#F8FAFC] focus:border-[#F59E0B] focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="mt-5 p-3 rounded-xl border border-white/15 bg-white/5 text-[#F8FAFC] hover:bg-white/10 transition"
              aria-label="Swap languages"
            >
              <ArrowRightLeft className="h-4 w-4 text-[#F59E0B]" />
            </button>

            <div className="flex-1">
              <label htmlFor="target-lang" className="block text-xs font-medium text-[#94A3B8] mb-1">
                To
              </label>
              <select
                id="target-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-white/15 bg-[#0B0F19] px-3.5 text-base text-[#F8FAFC] focus:border-[#F59E0B] focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.native})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="input-text" className="block text-xs font-medium text-[#94A3B8] mb-1">
              Enter phrase
            </label>
            <textarea
              id="input-text"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type words or phrases to translate..."
              className="w-full rounded-xl border border-white/15 bg-white/5 p-4 text-base text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleTranslate}
            disabled={isTranslating || !inputText.trim()}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isTranslating ? "Translating..." : "Translate"}
          </button>

          <div>
            <label htmlFor="result-text" className="block text-xs font-medium text-[#94A3B8] mb-1">
              Translation
            </label>
            <div
              id="result-text"
              className="min-h-[100px] rounded-xl border border-white/15 bg-black/40 p-4 text-base text-[#F8FAFC] leading-relaxed"
            >
              {translatedText ? (
                <p>{translatedText}</p>
              ) : (
                <p className="text-[#94A3B8] italic">Translation will appear here.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              disabled={!translatedText}
              className="btn-glass flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Volume2 className="h-4 w-4 text-[#F59E0B]" />
              <span>Speak</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!translatedText}
              className="btn-glass flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-[#F59E0B]" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
