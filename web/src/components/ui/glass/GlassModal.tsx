"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { GlassButton } from "./GlassButton";

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0C0908]/80 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} rounded-3xl bg-[#1C1512]/90 border border-white/15 backdrop-blur-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden z-10 animate-in zoom-in-95 duration-200`}
      >
        {/* Specular sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-[#F7F3EE] tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-[#C4B5A5] mt-0.5">{subtitle}</p>
            )}
          </div>
          <GlassButton
            variant="icon"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-lg"
          >
            <X className="w-4 h-4 text-[#C4B5A5] hover:text-[#F7F3EE]" />
          </GlassButton>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

