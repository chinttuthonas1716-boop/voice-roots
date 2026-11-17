"use client";

import { useState, useEffect } from "react";
import {
  Volume2,
  Copy,
  Check,
  ArrowRightLeft,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  X,
  Send,
  Info,
  Layers,
  BookOpen,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

interface LanguageOption {
  code: string;
  name: string;
  native: string;
  family: string;
  tier: "Community Memory" | "Neural IndicTrans2" | "Global NLLB";
  speechCode?: string;
}

const LANGUAGES: LanguageOption[] = [
  // Indigenous & Oral Heritage Languages (Community Translation Memory)
  { code: "gon", name: "Gondi", native: "గోండీ / 𑵶𑶍𑶕𑶛𑶗", family: "Central Dravidian", tier: "Community Memory", speechCode: "te-IN" },
  { code: "koy", name: "Koya", native: "కోయ", family: "South-Central Dravidian", tier: "Community Memory", speechCode: "te-IN" },
  { code: "sat", name: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ", family: "Austroasiatic (Munda)", tier: "Community Memory", speechCode: "hi-IN" },
  { code: "lam", name: "Lambadi", native: "లంబాడీ / गोरबोली", family: "Indo-Aryan (Banjara)", tier: "Community Memory", speechCode: "te-IN" },

  // Scheduled Indic Languages (IndicTrans2)
  { code: "te", name: "Telugu", native: "తెలుగు", family: "Dravidian", tier: "Neural IndicTrans2", speechCode: "te-IN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "hi-IN" },
  { code: "en", name: "English", native: "English", family: "Germanic", tier: "Neural IndicTrans2", speechCode: "en-US" },
  { code: "ta", name: "Tamil", native: "தமிழ்", family: "Dravidian", tier: "Neural IndicTrans2", speechCode: "ta-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", family: "Dravidian", tier: "Neural IndicTrans2", speechCode: "kn-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", family: "Dravidian", tier: "Neural IndicTrans2", speechCode: "ml-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "mr-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "bn-IN" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "or-IN" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "gu-IN" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "pa-IN" },
  { code: "as", name: "Assamese", native: "অসমীয়া", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "bn-IN" },
  { code: "ur", name: "Urdu", native: "اردو", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "ur-IN" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्", family: "Indo-Aryan", tier: "Neural IndicTrans2", speechCode: "hi-IN" },

  // Global Indigenous & World Languages
  { code: "qu", name: "Quechua", native: "Runa Simi", family: "Quechuan (Andes)", tier: "Global NLLB", speechCode: "es-ES" },
  { code: "sw", name: "Swahili", native: "Kiswahili", family: "Niger-Congo", tier: "Global NLLB", speechCode: "sw-KE" },
  { code: "es", name: "Spanish", native: "Español", family: "Romance", tier: "Global NLLB", speechCode: "es-ES" },
  { code: "fr", name: "French", native: "Français", family: "Romance", tier: "Global NLLB", speechCode: "fr-FR" },
];

const SAMPLE_PHRASES = [
  { label: "Hello, how are you? (En → Gondi)", text: "Hello, how are you?", src: "en", tgt: "gon" },
  { label: "Sacred greetings (Gondi → En)", text: "సేవా జోహార్", src: "gon", tgt: "en" },
  { label: "Clan council (Gondi → Te)", text: "మహువా", src: "gon", tgt: "te" },
  { label: "Greetings (Te → Gondi)", text: "నమస్కారం, మీరు ఎలా ఉన్నారు?", src: "te", tgt: "gon" },
  { label: "Conversational (Te → Hindi)", text: "మీరు ఎలా ఉన్నారు?", src: "te", tgt: "hi" },
  { label: "Ethnobotany (Koya → En)", text: "వనమూలిక", src: "koy", tgt: "en" },
  { label: "Nomadic greeting (Lambadi → En)", text: "రామ్ రామ్", src: "lam", tgt: "en" },
];

interface TranslationHistoryItem {
  id: number | null;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  model: string;
  reviewStatus: string;
  badgeLabel: string;
  dialect?: string | null;
  culturalContext?: string | null;
  provenanceHash?: string | null;
  timestamp: string;
}

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("gon");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translationId, setTranslationId] = useState<number | null>(null);

  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [translationMethod, setTranslationMethod] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [badgeLabel, setBadgeLabel] = useState<string | null>(null);
  const [dialect, setDialect] = useState<string | null>(null);
  const [culturalContext, setCulturalContext] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [provenanceHash, setProvenanceHash] = useState<string | null>(null);
  const [limitationNote, setLimitationNote] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History & Community Review Drawer
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRole, setReviewerRole] = useState("community_elder");
  const [correctionText, setCorrectionText] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  // Fetch initial history from server
  useEffect(() => {
    fetch("/api/translation/history?limit=10")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.history && Array.isArray(data.history)) {
          const items: TranslationHistoryItem[] = data.history.map((h: any) => ({
            id: h.id,
            sourceLang: h.source_language,
            targetLang: h.target_language,
            sourceText: h.source_text,
            translatedText: h.translated_text,
            model: h.model || "VoiceRoots-Translation-Module",
            reviewStatus: h.review_status,
            badgeLabel: h.badge_label,
            dialect: h.dialect,
            culturalContext: h.cultural_context,
            provenanceHash: h.provenance_hash,
            timestamp: h.created_at,
          }));
          setHistory(items);
        }
      })
      .catch(() => {});
  }, []);

  const handleSwap = () => {
    if (sourceLang === "auto") return;
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
    setInputText(translatedText);
    setTranslatedText(inputText);
    setReviewStatus(null);
    setBadgeLabel(null);
    setLimitationNote(null);
    setDialect(null);
    setCulturalContext(null);
    setTranslationId(null);
  };

  const handleTranslate = async (overrideText?: string, overrideSrc?: string, overrideTgt?: string) => {
    const textToUse = (overrideText !== undefined ? overrideText : inputText).trim();
    const srcToUse = overrideSrc || sourceLang;
    const tgtToUse = overrideTgt || targetLang;

    if (!textToUse) {
      setTranslatedText("");
      setReviewStatus(null);
      setBadgeLabel(null);
      setLimitationNote(null);
      return;
    }

    setIsTranslating(true);
    setError(null);
    setReviewSuccessMsg(null);

    try {
      // Call primary translation endpoint
      const resp = await fetch("/api/translation/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToUse,
          source_language: srcToUse,
          target_language: tgtToUse,
        }),
      });

      if (resp.status === 422) {
        const errData = await resp.json().catch(() => ({}));
        setTranslatedText("");
        setReviewStatus("elder_review_required");
        setBadgeLabel("Elder Review Required");
        setLimitationNote(
          "Direct automated AI translation for oral heritage tongues is restricted under Indigenous Data Sovereignty (OCAP) protocols. Awaiting community linguist and elder verification."
        );
        setError(
          errData.detail ||
          errData.error ||
          "Oral language translation restricted: unwritten oral languages require community elder verification under Indigenous Data Sovereignty protocols."
        );
        return;
      }

      if (!resp.ok) {
        // Fallback to Next.js translate proxy route if main endpoint errored
        const fallbackResp = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToUse,
            sourceLang: srcToUse,
            targetLang: tgtToUse,
          }),
        });

        if (!fallbackResp.ok) {
          throw new Error(`Translation request failed (${resp.status})`);
        }
        const fbData = await fallbackResp.json();
        populateTranslationData(fbData, textToUse, srcToUse, tgtToUse);
        return;
      }

      const data = await resp.json();
      populateTranslationData(data, textToUse, srcToUse, tgtToUse);
    } catch {
      setError("Unable to process translation right now. Please check pair support or try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const populateTranslationData = (data: any, originalInput: string, sLang: string, tLang: string) => {
    const tText = data.translated_text || data.translation || "Translation unavailable.";
    setTranslatedText(tText);
    setTranslationId(data.id || null);
    setModelUsed(data.model || "IndicTrans2-1B-Multi-Instruct");
    setTranslationMethod(data.translation_method || "direct_neural");
    setReviewStatus(data.review_status || "unreviewed_draft");
    setBadgeLabel(data.badge_label || (data.verified ? "Community Verified" : "AI Draft · Unreviewed"));
    setDialect(data.dialect || null);
    setCulturalContext(data.cultural_context || null);
    setConfidence(data.confidence ? Math.round(data.confidence * 100) : null);
    setProvenanceHash(data.provenance_hash || null);
    setLimitationNote(data.limitation_note || null);

    // Add to local history list
    const newItem: TranslationHistoryItem = {
      id: data.id || null,
      sourceLang: sLang,
      targetLang: tLang,
      sourceText: originalInput,
      translatedText: tText,
      model: data.model || "VoiceRoots-Translation-Module",
      reviewStatus: data.review_status || "unreviewed_draft",
      badgeLabel: data.badge_label || (data.verified ? "Community Verified" : "Draft (Unreviewed)"),
      dialect: data.dialect || null,
      culturalContext: data.cultural_context || null,
      provenanceHash: data.provenance_hash || null,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
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
    if (targetObj && targetObj.speechCode) {
      utterance.lang = targetObj.speechCode;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleApplySample = (sample: typeof SAMPLE_PHRASES[0]) => {
    setInputText(sample.text);
    setSourceLang(sample.src);
    setTargetLang(sample.tgt);
    handleTranslate(sample.text, sample.src, sample.tgt);
  };

  const handleSubmitReview = async (action: "approve" | "correct" | "reject") => {
    if (!translationId) {
      // Offline fallback: locally update badge
      setReviewStatus(action === "reject" ? "rejected" : "community_verified");
      setBadgeLabel(action === "reject" ? "Community Rejected" : "Community Verified");
      setShowReviewModal(false);
      setReviewSuccessMsg("Community review recorded locally.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const resp = await fetch(`/api/translation/${translationId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_name: reviewerName.trim() || "Community Elder Reviewer",
          reviewer_role: reviewerRole,
          action,
          corrected_text: action === "correct" ? correctionText.trim() : null,
          dialect_notes: reviewNotes.trim() || null,
          cultural_context: "Verified via Community Elder Council on Web Portal",
        }),
      });

      if (!resp.ok) {
        throw new Error("Review submission failed");
      }

      const resData = await resp.json();
      setReviewStatus(resData.review_status);
      setBadgeLabel(resData.badge_label);
      if (action === "correct" && resData.translated_text) {
        setTranslatedText(resData.translated_text);
      }
      setShowReviewModal(false);
      setReviewSuccessMsg(`Review successfully recorded: ${resData.badge_label}`);
    } catch {
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isCommunityVerified =
    reviewStatus === "elder_approved" || reviewStatus === "community_verified";
  const isUnreviewedDraft = reviewStatus === "unreviewed_draft";
  const isHonestLimitation =
    reviewStatus === "elder_review_required" || reviewStatus === "honest_limitation";

  return (
    <div className="min-h-screen bg-[#071A13] text-[#F5F3E9] pb-24 pt-20">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A]">
            <Sparkles className="h-3.5 w-3.5 text-[#A6C48A]" />
            <span>Voice Roots Multilingual Engine · v2.0 Production</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F3E9]">
            Multilingual Language Translator
          </h1>
          <p className="text-sm sm:text-base text-[#DCE9D7]/80 max-w-2xl mx-auto leading-relaxed">
            Direct language-to-language translation across Scheduled Indic languages, global world tongues,
            and verified Community Translation Memories for oral heritage languages.
          </p>
        </div>

        {/* Quick Sample Phrase Chips */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[#A6C48A] uppercase tracking-wider">
            Quick Test Phrases (Authentic Lexical Memory):
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PHRASES.map((sp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplySample(sp)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#102B20] hover:bg-[#1F5138] border border-[#A6C48A]/20 text-[#DCE9D7] transition flex items-center gap-1.5"
              >
                <span>{sp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Restriction Alert for Unverified Phrases */}
        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-200 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-100">Elder Verification Required (OCAP Protocol)</p>
              <p className="text-xs text-rose-200/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Success Review Message */}
        {reviewSuccessMsg && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-sm text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{reviewSuccessMsg}</span>
          </div>
        )}

        {/* Main Translator Card */}
        <div className="rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/80 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/40">
          {/* Language Selector Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Source Selector */}
            <div className="w-full sm:flex-1">
              <label htmlFor="source-lang" className="block text-xs font-medium text-[#A6C48A] mb-1.5">
                Source Language
              </label>
              <select
                id="source-lang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full min-h-[50px] rounded-2xl border border-[#A6C48A]/30 bg-[#071A13] px-4 text-sm sm:text-base text-[#F5F3E9] focus:border-[#A6C48A] focus:outline-none"
              >
                <option value="auto">✨ Auto-Detect Language</option>
                <optgroup label="Oral Heritage (Community Translation Memory)">
                  {LANGUAGES.filter((l) => l.tier === "Community Memory").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} — {l.name} ({l.family})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Scheduled Indic Languages (IndicTrans2)">
                  {LANGUAGES.filter((l) => l.tier === "Neural IndicTrans2").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} — {l.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Global Languages">
                  {LANGUAGES.filter((l) => l.tier === "Global NLLB").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} — {l.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              disabled={sourceLang === "auto"}
              className="mt-2 sm:mt-5 p-3 rounded-2xl border border-[#A6C48A]/30 bg-[#1F5138]/60 hover:bg-[#1F5138] text-[#F5F3E9] transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Swap source and target languages"
            >
              <ArrowRightLeft className="h-4 w-4 text-[#A6C48A]" />
            </button>

            {/* Target Selector */}
            <div className="w-full sm:flex-1">
              <label htmlFor="target-lang" className="block text-xs font-medium text-[#A6C48A] mb-1.5">
                Target Language
              </label>
              <select
                id="target-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full min-h-[50px] rounded-2xl border border-[#A6C48A]/30 bg-[#071A13] px-4 text-sm sm:text-base text-[#F5F3E9] focus:border-[#A6C48A] focus:outline-none"
              >
                <optgroup label="Oral Heritage (Community Translation Memory)">
                  {LANGUAGES.filter((l) => l.tier === "Community Memory").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} — {l.name} ({l.family})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Scheduled Indic Languages (IndicTrans2)">
                  {LANGUAGES.filter((l) => l.tier === "Neural IndicTrans2").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} — {l.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Global Languages">
                  {LANGUAGES.filter((l) => l.tier === "Global NLLB").map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} — {l.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Text Input Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-text" className="text-xs font-medium text-[#A6C48A]">
                Input Phrase or Sentence
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#A6C48A]/70">{inputText.length} / 1500 chars</span>
                {inputText && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText("");
                      setTranslatedText("");
                      setError(null);
                    }}
                    className="text-xs text-rose-300 hover:text-rose-200 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              id="input-text"
              rows={4}
              maxLength={1500}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type phrase, sentence, or oral heritage greeting to translate..."
              className="w-full rounded-2xl border border-[#A6C48A]/25 bg-[#071A13]/90 p-4 text-base text-[#F5F3E9] placeholder-[#DCE9D7]/40 focus:border-[#A6C48A] focus:outline-none transition leading-relaxed"
            />
          </div>

          {/* Translate Action Button */}
          <button
            type="button"
            onClick={() => handleTranslate()}
            disabled={isTranslating || !inputText.trim()}
            className="w-full min-h-[50px] rounded-2xl font-semibold bg-[#A6C48A] text-[#071A13] hover:bg-[#DCE9D7] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-[#A6C48A]/10"
          >
            {isTranslating ? (
              <>
                <div className="h-4 w-4 border-2 border-[#071A13] border-t-transparent rounded-full animate-spin" />
                <span>Translating between languages...</span>
              </>
            ) : (
              <>
                <span>Translate Directly</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Output Translation Area */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="result-text" className="text-xs font-medium text-[#A6C48A] flex items-center gap-1.5">
                <span>Translated Output</span>
                {confidence && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#1F5138] text-[#DCE9D7]">
                    {confidence}% Confidence
                  </span>
                )}
              </label>

              {/* Status Badge */}
              {badgeLabel && (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isCommunityVerified
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : isHonestLimitation
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {isCommunityVerified && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  {isHonestLimitation && <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />}
                  {isUnreviewedDraft && <Sparkles className="h-3.5 w-3.5 text-amber-400" />}
                  <span>{badgeLabel}</span>
                </div>
              )}
            </div>

            {/* Result Box */}
            <div
              id="result-text"
              className="min-h-[120px] rounded-2xl border border-[#A6C48A]/25 bg-[#071A13] p-5 text-lg text-[#F5F3E9] leading-relaxed relative flex flex-col justify-between"
            >
              {translatedText ? (
                <p className="font-medium">{translatedText}</p>
              ) : (
                <p className="text-[#DCE9D7]/40 italic text-sm">
                  Translated output will appear here. Select languages and click Translate.
                </p>
              )}

              {/* Dialect / Cultural Provenance Banner */}
              {dialect && (
                <div className="mt-3 pt-3 border-t border-[#A6C48A]/15 text-xs text-[#A6C48A] flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#DCE9D7]">Dialect:</span>
                  <span>{dialect}</span>
                  {culturalContext && (
                    <span className="text-[#DCE9D7]/70 italic">· {culturalContext}</span>
                  )}
                </div>
              )}
            </div>

            {/* Model & Metadata Strip */}
            {translatedText && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#DCE9D7]/70 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#A6C48A]">Model:</span>
                  <span>{modelUsed}</span>
                  {translationMethod && (
                    <span className="px-2 py-0.5 rounded bg-[#1F5138]/60 text-[#DCE9D7]">
                      {translationMethod.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                {provenanceHash && (
                  <div className="flex items-center gap-1 text-[11px] text-[#A6C48A]/70 font-mono">
                    <span>SHA-256:</span>
                    <span>{provenanceHash.slice(0, 10)}...</span>
                  </div>
                )}
              </div>
            )}

            {/* Limitation Note Banner */}
            {limitationNote && isUnreviewedDraft && (
              <p className="text-xs text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                <Info className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{limitationNote}</span>
              </p>
            )}
          </div>

          {/* Action Buttons: Speak, Copy, Community Review */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSpeak}
              disabled={!translatedText}
              className="flex-1 min-h-[46px] rounded-xl border border-[#A6C48A]/30 bg-[#1F5138]/50 hover:bg-[#1F5138] text-[#F5F3E9] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Volume2 className="h-4 w-4 text-[#A6C48A]" />
              <span>Listen / Pronounce</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!translatedText}
              className="flex-1 min-h-[46px] rounded-xl border border-[#A6C48A]/30 bg-[#1F5138]/50 hover:bg-[#1F5138] text-[#F5F3E9] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-[#A6C48A]" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {/* Community Elder Verification Action */}
            <button
              type="button"
              onClick={() => {
                setCorrectionText(translatedText);
                setShowReviewModal(true);
              }}
              disabled={!translatedText}
              className="flex-1 min-h-[46px] rounded-xl border border-[#A6C48A]/40 bg-[#102B20] hover:bg-[#1F5138] text-[#A6C48A] disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm font-semibold"
            >
              <CheckCircle2 className="h-4 w-4 text-[#A6C48A]" />
              <span>Community Verify</span>
            </button>
          </div>
        </div>

        {/* Translation History Toggle & Drawer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#A6C48A] hover:text-[#DCE9D7] transition"
            >
              <History className="h-4 w-4" />
              <span>{showHistory ? "Hide Translation History" : "View Translation History"} ({history.length})</span>
            </button>
          </div>

          {showHistory && (
            <div className="rounded-2xl border border-[#A6C48A]/20 bg-[#102B20]/60 p-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-[#DCE9D7]/50 italic">No translation history recorded yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#071A13] border border-[#A6C48A]/15 text-xs space-y-1 hover:border-[#A6C48A]/40 transition cursor-pointer"
                      onClick={() => {
                        setInputText(h.sourceText);
                        setTranslatedText(h.translatedText);
                        setSourceLang(h.sourceLang);
                        setTargetLang(h.targetLang);
                        setTranslationId(h.id);
                        setBadgeLabel(h.badgeLabel);
                        setReviewStatus(h.reviewStatus);
                        setDialect(h.dialect || null);
                        setCulturalContext(h.culturalContext || null);
                        setProvenanceHash(h.provenanceHash || null);
                      }}
                    >
                      <div className="flex items-center justify-between text-[#A6C48A]">
                        <span className="font-semibold uppercase">
                          {h.sourceLang} → {h.targetLang}
                        </span>
                        <span className="text-[10px] text-[#DCE9D7]/60">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[#DCE9D7] truncate">“{h.sourceText}”</p>
                      <p className="text-[#A6C48A] font-medium truncate">→ {h.translatedText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Community Elder Review & Verification Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-3xl border border-[#A6C48A]/30 bg-[#102B20] p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#A6C48A]/20 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#A6C48A]" />
                <h3 className="text-lg font-bold text-[#F5F3E9]">Community Elder Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-[#DCE9D7] hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#DCE9D7]/80 leading-relaxed">
              Under Indigenous Data Sovereignty (OCAP), community elders and native speakers verify or correct AI machine drafts before permanent archiving.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#A6C48A] mb-1">
                  Reviewer Identity or Council Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Kotnak Jangu (Muria Elder Council)"
                  className="w-full rounded-xl border border-[#A6C48A]/30 bg-[#071A13] px-3.5 py-2.5 text-sm text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6C48A] mb-1">
                  Reviewer Role / Authority
                </label>
                <select
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  className="w-full rounded-xl border border-[#A6C48A]/30 bg-[#071A13] px-3.5 py-2.5 text-sm text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                >
                  <option value="community_elder">Community Council Elder (Full Authority)</option>
                  <option value="linguist">Indigenous Linguist / Language Specialist</option>
                  <option value="native_speaker">Native Heritage Speaker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6C48A] mb-1">
                  Translated Text (or Native Correction)
                </label>
                <textarea
                  rows={2}
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  className="w-full rounded-xl border border-[#A6C48A]/30 bg-[#071A13] p-3 text-sm text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6C48A] mb-1">
                  Dialect & Cultural Verification Notes
                </label>
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Muria Gondi authentic clan honorific greeting"
                  className="w-full rounded-xl border border-[#A6C48A]/30 bg-[#071A13] px-3.5 py-2.5 text-sm text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleSubmitReview("approve")}
                disabled={isSubmittingReview}
                className="flex-1 py-2.5 rounded-xl bg-[#A6C48A] text-[#071A13] font-semibold text-xs sm:text-sm hover:bg-[#DCE9D7] transition disabled:opacity-40"
              >
                🌿 Approve as Verified
              </button>
              <button
                type="button"
                onClick={() => handleSubmitReview("correct")}
                disabled={isSubmittingReview}
                className="flex-1 py-2.5 rounded-xl border border-[#A6C48A]/40 bg-[#1F5138] text-[#F5F3E9] font-semibold text-xs sm:text-sm hover:bg-[#1F5138]/80 transition disabled:opacity-40"
              >
                ✏️ Save Correction
              </button>
              <button
                type="button"
                onClick={() => handleSubmitReview("reject")}
                disabled={isSubmittingReview}
                className="py-2.5 px-3 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 font-semibold text-xs sm:text-sm hover:bg-rose-950/70 transition disabled:opacity-40"
              >
                Flag Error
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
