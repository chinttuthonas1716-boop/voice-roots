"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  useAppLanguage,
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
} from "@/lib/languageContext";

export function AppLanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { appLanguage, setAppLanguage } = useAppLanguage();

  const currentInfo = SUPPORTED_LANGUAGES[appLanguage] || SUPPORTED_LANGUAGES.en;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Selector: 🌐 EN ▾ (Per Checklist Point 6) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
        title="App Interface Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#00d8f6]" />
        <span className="font-mono uppercase font-bold text-xs">{appLanguage}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Dropdown Menu / Bottom Sheet Style */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#121622]/95 border border-[#00d8f6]/30 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(0,216,246,0.15)] backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00d8f6]" />
              <span>App Language</span>
            </span>
            <span className="text-[9px] font-mono text-[#00d8f6] bg-[#00d8f6]/10 px-1.5 py-0.5 rounded">
              UI
            </span>
          </div>

          <div className="py-1 space-y-0.5">
            {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguageCode[]).map((code) => {
              const lang = SUPPORTED_LANGUAGES[code];
              const isSelected = appLanguage === code;
              return (
                <button
                  key={code}
                  onClick={() => {
                    setAppLanguage(code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                    isSelected
                      ? "bg-[#0063e5] text-white font-bold shadow-md"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span className="font-medium text-sm">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">({lang.name})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Automatically suggested</span>
            <span className="text-[#00d8f6] font-mono">English Fallback</span>
          </div>
        </div>
      )}
    </div>
  );
}
