"use client";

import { useState } from "react";
import { Volume2, Copy, Check, ArrowRightLeft, ShieldAlert } from "lucide-react";
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
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [badgeLabel, setBadgeLabel] = useState<string | null>(null);
  const [limitationNote, setLimitationNote] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwap = () => {
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    setInputText(translatedText);
    setTranslatedText(inputText);
    setReviewStatus(null);
    setBadgeLabel(null);
    setLimitationNote(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setTranslatedText("");
      setReviewStatus(null);
      setBadgeLabel(null);
      setLimitationNote(null);
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

      if (resp.status === 422) {
        const errData = await resp.json().catch(() => ({}));
        setTranslatedText("");
        setReviewStatus("elder_review_required");
        setBadgeLabel("Elder Review Required");
        setLimitationNote(null);
        setError(
          errData.error ||
          "Oral language translation restricted: unwritten oral languages require community elder verification under Indigenous Data Sovereignty protocols."
        );
        return;
      }

      if (!resp.ok) {
        throw new Error(`Translation request failed (${resp.status})`);
      }

      const data = await resp.json();
      setTranslatedText(data.translation || "Translation unavailable.");
      setReviewStatus(data.reviewStatus || "unreviewed_draft");
      setBadgeLabel(data.badgeLabel || "Draft (Unreviewed)");
      setLimitationNote(data.limitationNote || null);
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
            Honest machine translation & verified oral phrasebooks across 13 Indian and tribal tongues.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 text-left flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">Elder Review Required</p>
              <p className="text-xs text-rose-300/90 leading-relaxed">{error}</p>
            </div>
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
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="result-text" className="block text-xs font-medium text-[#94A3B8]">
                Translation
              </label>
              {badgeLabel && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    reviewStatus === "elder_approved"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : reviewStatus === "elder_review_required"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {reviewStatus === "elder_approved" && <Check className="h-3 w-3 text-emerald-400" />}
                  {badgeLabel}
                </span>
              )}
            </div>

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

            {limitationNote && reviewStatus === "unreviewed_draft" && (
              <p className="text-xs text-amber-300/80 mt-1.5 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{limitationNote}</span>
              </p>
            )}
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
