"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Languages,
  ArrowRight,
  Sparkles,
  Check,
  RefreshCw,
  Copy,
  BookOpen,
  Volume2,
} from "lucide-react";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { transitionStory, type PreservationWorkflow } from "@/lib/workflow";
import type { UserProfile } from "@/lib/auth";

const TARGET_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "Telugu (తెలుగు)" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", label: "Malayalam (മലയാളം)" },
];

const PRESET_TRANSLATIONS: Record<string, string> = {
  en: "O sovereign rain clouds... shower cooling drops under the Rohini constellation, moisten our fertile black soil, and bring life to the sacred Godavari river. Nourish the harvest and safeguard the cattle and creatures of the land.",
  te: "ఓ మేఘరాజా... రోహిణి కార్తెలో చల్లని చినుకులు కురిపించి, మా నల్లరేగడి నేలను తడిపి, జీవనది గోదావరికి ప్రాణం పోయవయ్యా. పంట పొలాల్లో సిరులు పండించి పశుపక్ష్యాదులను కాపాడాలి.",
  hi: "हे मेघराज... रोहिणी नक्षत्र में शीतल वर्षा कर हमारी उपजाऊ काली मिट्टी को सींचें और पावन गोदावरी को नवजीवन दें। फसलों को समृद्ध करें और सभी जीवों की रक्षा करें।",
  ta: "மழை அரசனே... ரோகிணி விண்மீன் காலத்தில் குளிர்ந்த மழையைப் பொழிந்து, எங்கள் வளமான கரிசல் மண்ணை நனைத்து, புனித கோதாவரி ஆற்றுக்கு உயிர் தருவாய். பயிர்களைச் செழிக்க வைத்து உயிர்களைக் காப்பாயாக.",
  kn: "ಓ ಮೇಘರಾಜನೇ... ರೋಹಿಣಿ ನಕ್ಷತ್ರದಲ್ಲಿ ತಂಪಾದ ಹನಿಗಳನ್ನು ಸುರಿಸಿ, ನಮ್ಮ ಕಪ್ಪು ಮಣ್ಣನ್ನು ಹಸನುಮಾಡಿ, ಪವಿತ್ರ ಗೋದಾವರಿ ನದಿಗೆ ಜೀವ ತುಂಬು. ಬೆಳೆಗಳನ್ನು ಫಲವತ್ತಾಗಿಸಿ ಸಮಸ್ತ ಜೀವರಾಶಿಯನ್ನು ರಕ್ಷಿಸು.",
  ml: "മേഘരാജാവേ... രോഹിണി നಕ್ಷത്രത്തിൽ തണുത്ത മഴ പെയ്യിച്ച് ഞങ്ങളുടെ കറുത്ത മണ്ണിനെ നനയ്ക്കുകയും പുണ്യ ഗോദാവരി നദിക്ക് പുതുജീവൻ നൽകുകയും ചെയ്യുക. വിളവുകൾ വർദ്ധിപ്പിച്ച് എല്ലാ ജീവജാലങ്ങളെയും സംരക്ഷിക്കുക.",
};

export default function TranslateStoryPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";
  const router = useRouter();

  const [targetLang, setTargetLang] = useState<string>("en");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"original" | "translation">("translation");

  return (
    <WorkflowGuard
      route="/translate"
      storyId={storyId}
      currentPhaseNumber={4}
    >
      {(workflow: PreservationWorkflow, user: UserProfile) => {
        const original =
          workflow.originalTranscript ||
          "ఓ మేఘరాజా... రోహిణి కార్తెలో చల్లని చినుకులు కురిపించి, మా నల్లరేగడి నేలను తడిపి, జీవనది గోదావరికి ప్రాణం పోయవయ్యా.";

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (workflow.translations && workflow.translations[targetLang]) {
            setTranslatedText(workflow.translations[targetLang]);
          } else {
            setTranslatedText(PRESET_TRANSLATIONS[targetLang] || PRESET_TRANSLATIONS.en);
          }
        }, [targetLang, workflow]);

        const handleTranslateChange = (newCode: string) => {
          setTargetLang(newCode);
          setIsTranslating(true);
          setTimeout(() => {
            const translation =
              workflow.translations?.[newCode] || PRESET_TRANSLATIONS[newCode] || PRESET_TRANSLATIONS.en;
            setTranslatedText(translation);
            setIsTranslating(false);
          }, 450);
        };

        const handleContinue = () => {
          transitionStory(
            storyId,
            {
              type: "SAVE_TRANSLATION",
              targetLanguage: targetLang,
              translatedText,
            },
            user
          );
          router.push(`/cultural-context/${storyId}`);
        };

        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
                <Languages className="w-4 h-4" />
                <span>Phase 04 — IndicTrans2 Bidirectional Translation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Translate Spoken Narrative
              </h1>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-2xl">
                The original oral recording is never replaced. IndicTrans2 preserves nuanced cultural idioms across 6+ official and regional tongues.
              </p>
            </div>

            {/* Target Language Selection Pills */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 backdrop-blur-xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#D9D9E2]">
                Select Target Translation Language:
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslateChange(lang.code)}
                    className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      targetLang === lang.code
                        ? "bg-[#F9B17A] text-[#242942] shadow-md shadow-[#F9B17A]/20"
                        : "border border-white/10 bg-white/5 text-[#D9D9E2] hover:bg-white/10"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tab Toggle */}
            <div className="md:hidden flex rounded-xl border border-white/10 bg-[#242942] p-1">
              <button
                onClick={() => setActiveTabMobile("original")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  activeTabMobile === "original" ? "bg-white/15 text-white" : "text-[#A9AEC5]"
                }`}
              >
                Original Source
              </button>
              <button
                onClick={() => setActiveTabMobile("translation")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  activeTabMobile === "translation" ? "bg-[#F9B17A] text-[#242942]" : "text-[#A9AEC5]"
                }`}
              >
                AI Translation
              </button>
            </div>

            {/* Desktop Side-by-Side (or Mobile Tab View) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Original Transcript */}
              <div
                className={`rounded-3xl border border-white/10 bg-[#242942]/80 p-6 sm:p-7 backdrop-blur-md space-y-3 ${
                  activeTabMobile === "translation" ? "hidden md:block" : "block"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#A9AEC5]">
                    Original Oral Source ({workflow.detectedLanguage || "Telugu"})
                  </div>
                  <span className="text-[11px] text-[#F9B17A] font-semibold">Primary Artifact</span>
                </div>
                <p className="text-sm sm:text-base text-white font-serif leading-relaxed pt-2">
                  {original}
                </p>
              </div>

              {/* Right: Translated Text */}
              <div
                className={`rounded-3xl border border-[#F9B17A]/30 bg-[#242942]/90 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-3 relative ${
                  activeTabMobile === "original" ? "hidden md:block" : "block"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F9B17A]">
                    AI Translation (IndicTrans2)
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#D9D9E2]">
                    High Fidelity
                  </span>
                </div>

                {isTranslating ? (
                  <div className="py-12 flex flex-col items-center justify-center text-xs text-[#A9AEC5] gap-2">
                    <RefreshCw className="w-5 h-5 text-[#F9B17A] animate-spin" />
                    <span>Translating idiomatically…</span>
                  </div>
                ) : (
                  <p className="text-sm sm:text-base text-[#D9D9E2] font-serif leading-relaxed pt-2">
                    {translatedText}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/70 p-6 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-4">
              <Link
                href={`/transcript/${storyId}`}
                className="text-xs text-[#A9AEC5] hover:text-white transition"
              >
                ← Back to Transcript Review
              </Link>

              <button
                onClick={handleContinue}
                className="vr-button vr-button-primary !py-3 !px-7 text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F9B17A]/25"
              >
                <span>Continue to Cultural Context</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      }}
    </WorkflowGuard>
  );
}

