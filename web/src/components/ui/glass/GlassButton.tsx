"use client";

import React from "react";
import { Loader2, Check } from "lucide-react";

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ai" | "translate" | "accent" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  isSuccess?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  isSuccess = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#E58A4E]/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] ease-[cubic-bezier(0.22,1,0.36,1)]";

  const sizeClasses = {
    sm: "h-10 px-4 text-xs rounded-xl gap-2 min-h-[40px]",
    md: "h-12 px-6 text-sm rounded-2xl gap-2.5 min-h-[48px]", // Standard primary (48px)
    lg: "h-14 px-8 text-base rounded-2xl gap-3 min-h-[52px]", // Prominent primary (52px)
    icon: "h-11 w-11 p-0 rounded-xl min-w-[44px] min-h-[44px]", // Min touch target 44px
  };

  const variantClasses = {
    primary:
      "bg-[#E58A4E] hover:bg-[#ED9C66] text-[#0C0908] font-bold shadow-[0_8px_24px_-4px_rgba(229,138,78,0.45)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(229,138,78,0.6)] border border-[#E58A4E]/60",
    secondary:
      "bg-white/[0.06] hover:bg-white/[0.10] text-[#F7F3EE] border border-white/12 backdrop-blur-md hover:-translate-y-0.5 hover:border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
    ai:
      "bg-[#D4A373] hover:bg-[#DFB388] text-white font-semibold shadow-[0_8px_24px_-4px_rgba(212,163,115,0.45)] hover:-translate-y-0.5 border border-[#D4A373]/60",
    translate:
      "bg-[#4E9F76] hover:bg-[#5DBF8E] text-[#0C0908] font-bold shadow-[0_8px_24px_-4px_rgba(78,159,118,0.45)] hover:-translate-y-0.5 border border-[#4E9F76]/60",
    accent:
      "bg-gradient-to-r from-[#D4A373] to-[#4E9F76] text-white font-semibold shadow-[0_8px_24px_-4px_rgba(212,163,115,0.4)] hover:-translate-y-0.5 border border-[#D4A373]/40",
    ghost:
      "bg-transparent hover:bg-white/[0.08] text-[#C4B5A5] hover:text-[#F7F3EE] border border-transparent hover:border-white/10",
    danger:
      "bg-[#E05A6F]/15 hover:bg-[#E05A6F]/25 text-[#E05A6F] border border-[#E05A6F]/30 hover:border-[#E05A6F]/50 hover:-translate-y-0.5",
    icon:
      "bg-white/[0.06] hover:bg-white/[0.10] text-[#F7F3EE] border border-white/12 hover:border-[#E58A4E]/40 backdrop-blur-md hover:-translate-y-0.5",
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Specular top edge highlight for liquid glass finish */}
      {variant !== "ghost" && (
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none rounded-t-2xl" />
      )}

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSuccess ? (
        <Check className="w-5 h-5 text-emerald-400 animate-in zoom-in-50 duration-200" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

