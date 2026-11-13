"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import enTranslations from "@/i18n/en.json";
import teTranslations from "@/i18n/te.json";
import hiTranslations from "@/i18n/hi.json";
import taTranslations from "@/i18n/ta.json";
import knTranslations from "@/i18n/kn.json";
import mlTranslations from "@/i18n/ml.json";

export type SupportedLanguageCode = "en" | "te" | "hi" | "ta" | "kn" | "ml";

export interface SupportedLanguageInfo {
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguageCode, SupportedLanguageInfo> = {
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  te: { name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  hi: { name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  ta: { name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  ml: { name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
};

export const DEFAULT_LANGUAGE: SupportedLanguageCode = "en";

const TRANSLATION_MAP: Record<SupportedLanguageCode, Record<string, string>> = {
  en: enTranslations,
  te: teTranslations,
  hi: hiTranslations,
  ta: taTranslations,
  kn: knTranslations,
  ml: mlTranslations,
};

interface LanguageContextType {
  appLanguage: SupportedLanguageCode;
  setAppLanguage: (lang: SupportedLanguageCode) => void;
  detectedLanguage: SupportedLanguageCode;
  showLocationSuggestion: boolean;
  dismissSuggestion: () => void;
  confirmSuggestedLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  appLanguage: DEFAULT_LANGUAGE,
  setAppLanguage: () => {},
  detectedLanguage: DEFAULT_LANGUAGE,
  showLocationSuggestion: false,
  dismissSuggestion: () => {},
  confirmSuggestedLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [appLanguage, setAppLanguageState] = useState<SupportedLanguageCode>(DEFAULT_LANGUAGE);
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguageCode>(DEFAULT_LANGUAGE);
  const [showLocationSuggestion, setShowLocationSuggestion] = useState(false);

  useEffect(() => {
    // 1. Saved user choice (wins over browser preference)
    const saved = localStorage.getItem("voiceRootsLanguage") as SupportedLanguageCode | null;
    const bannerDismissed = localStorage.getItem("voiceRootsLanguageBannerDismissed");

    // 2. Detect browser/device preferred language
    let detected: SupportedLanguageCode = DEFAULT_LANGUAGE;
    try {
      const browserLanguages = navigator.languages || [navigator.language];
      for (const locale of browserLanguages) {
        const lang = locale.toLowerCase().split("-")[0] as SupportedLanguageCode;
        if (SUPPORTED_LANGUAGES[lang]) {
          detected = lang;
          break;
        }
      }
    } catch (e) {
      console.warn("Language detection error", e);
    }

    setDetectedLanguage(detected);

    if (saved && SUPPORTED_LANGUAGES[saved]) {
      setAppLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      // English is the safe default
      setAppLanguageState(DEFAULT_LANGUAGE);
      document.documentElement.lang = DEFAULT_LANGUAGE;

      // If browser indicates another supported language (e.g. te, hi, ta) and not dismissed, suggest it
      if (detected !== "en" && !bannerDismissed) {
        setShowLocationSuggestion(true);
      }
    }
  }, []);

  const setAppLanguage = (language: SupportedLanguageCode) => {
    if (!SUPPORTED_LANGUAGES[language]) return;
    setAppLanguageState(language);
    localStorage.setItem("voiceRootsLanguage", language);
    localStorage.setItem("voiceRootsLanguageBannerDismissed", "true");
    document.documentElement.lang = language;
    setShowLocationSuggestion(false);
  };

  const dismissSuggestion = () => {
    setShowLocationSuggestion(false);
    localStorage.setItem("voiceRootsLanguageBannerDismissed", "true");
    setAppLanguage(DEFAULT_LANGUAGE);
  };

  const confirmSuggestedLanguage = () => {
    setAppLanguage(detectedLanguage);
  };

  // Safe translation resolver with English fallback (Rule 15: Never show raw keys)
  const t = (key: string): string => {
    const currentDict = TRANSLATION_MAP[appLanguage];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    const fallbackDict = TRANSLATION_MAP[DEFAULT_LANGUAGE];
    return fallbackDict[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        appLanguage,
        setAppLanguage,
        detectedLanguage,
        showLocationSuggestion,
        dismissSuggestion,
        confirmSuggestedLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useAppLanguage() {
  return useContext(LanguageContext);
}
