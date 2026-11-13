"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { GlassButton } from "./GlassButton";

export interface GlassBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const GlassBottomSheet: React.FC<GlassBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0C0908]/80 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative w-full max-h-[88vh] rounded-t-3xl bg-[#1C1512]/95 border-t border-white/15 backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 animate-in slide-in-from-bottom duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${className}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
          <h3 className="text-base font-semibold text-[#F7F3EE]">{title}</h3>
          <GlassButton
            variant="icon"
            size="icon"
            onClick={onClose}
            aria-label="Close sheet"
            className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg"
          >
            <X className="w-4 h-4 text-[#C4B5A5]" />
          </GlassButton>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

