"use client";

import React, { useState } from "react";
import { Globe, X, Check } from "lucide-react";
import {
  useAppLanguage,
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
} from "@/lib/languageContext";

export function LocationLanguageBanner() {
  const {
    showLocationSuggestion,
    dismissSuggestion,
    setAppLanguage,
    detectedLanguage,
  } = useAppLanguage();
  const [showLanguageChooser, setShowLanguageChooser] = useState(false);

  if (!showLocationSuggestion) return null;

  const detectedInfo =
    SUPPORTED_LANGUAGES[detectedLanguage] || SUPPORTED_LANGUAGES.te;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 rounded-2xl bg-[#121622]/95 border border-[#00d8f6]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_25px_rgba(0,216,246,0.2)] backdrop-blur-2xl space-y-3.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0063e5]/20 border border-[#00d8f6]/40 flex items-center justify-center text-[#00d8f6]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Welcome to Voice Roots</span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                We detected <strong className="text-[#00d8f6]">{detectedInfo.nativeName}</strong> as your preferred browser language.
              </p>
            </div>
          </div>

          <button
            onClick={dismissSuggestion}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Would you like to use Voice Roots in {detectedInfo.name}?
        </p>

        {/* Buttons per Checklist Point 7 */}
        {!showLanguageChooser ? (
          <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
            {/* [ Use Native Language ] */}
            <button
              onClick={() => {
                setAppLanguage(detectedLanguage);
              }}
              className="flex-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0063e5] to-[#00d8f6] text-white font-bold text-xs shadow-md hover:brightness-110 transition-all text-center"
            >
              Use {detectedInfo.nativeName}
            </button>

            {/* [ Keep English ] */}
            <button
              onClick={dismissSuggestion}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs transition-all text-center"
            >
              Keep English
            </button>

            {/* [ Choose another language ] */}
            <button
              onClick={() => setShowLanguageChooser(true)}
              className="text-[11px] text-[#00d8f6] hover:underline self-center pt-1 sm:pt-0"
            >
              Choose another
            </button>
          </div>
        ) : (
          <div className="pt-1 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Choose your interface language:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguageCode[]).map((code) => {
                const lang = SUPPORTED_LANGUAGES[code];
                return (
                  <button
                    key={code}
                    onClick={() => {
                      setAppLanguage(code);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#0063e5] text-white text-xs text-left transition-colors flex items-center justify-between"
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[9px] text-slate-400 font-mono">({code})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
