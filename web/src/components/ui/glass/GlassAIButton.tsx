"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface GlassAIButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  className?: string;
}

export const GlassAIButton: React.FC<GlassAIButtonProps> = ({
  onClick,
  isOpen = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      aria-label="Open Voice Roots Cultural AI Assistant"
      className={`fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-30 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-[#D4A373]/95 via-[#D4A373]/85 to-[#1C1512]/90 border border-[#D4A373]/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(212,163,115,0.45)] hover:shadow-[0_12px_40px_rgba(212,163,115,0.65)] hover:-translate-y-1 active:scale-95 transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#D4A373]/50 min-h-[48px] ${className}`}
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 text-[#E58A4E] animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E58A4E] animate-ping" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold text-[#F7F3EE] tracking-wide flex items-center gap-1.5">
          Ask Heritage AI
        </span>
        <span className="text-[10px] text-[#C4B5A5] font-medium hidden sm:inline-block">
          Cultural Context & Meanings
        </span>
      </div>
    </button>
  );
};

