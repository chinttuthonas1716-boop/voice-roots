"use client";

import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent" | "interactive";
  glow?: "none" | "amber" | "gold" | "violet" | "teal";
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = "default",
  glow = "none",
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "relative rounded-2xl backdrop-blur-xl border transition-all duration-300";

  const variantClasses = {
    default:
      "bg-[#1C1512]/70 border-white/12 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]",
    elevated:
      "bg-[#1C1512]/90 border-white/15 shadow-[0_16px_48px_0_rgba(0,0,0,0.65)]",
    accent:
      "bg-gradient-to-br from-[#E58A4E]/10 via-[#1C1512]/80 to-[#D4A373]/10 border-[#E58A4E]/25 shadow-[0_12px_40px_0_rgba(0,0,0,0.55)]",
    interactive:
      "bg-[#1C1512]/60 border-white/12 hover:bg-[#1C1512]/85 hover:border-[#E58A4E]/40 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(229,138,78,0.15)] cursor-pointer active:scale-[0.99]",
  };

  const glowClasses = {
    none: "",
    amber: "shadow-[0_0_30px_-5px_rgba(229,138,78,0.3)] border-[#E58A4E]/40",
    gold: "shadow-[0_0_30px_-5px_rgba(229,138,78,0.3)] border-[#E58A4E]/40",
    violet: "shadow-[0_0_30px_-5px_rgba(212,163,115,0.3)] border-[#D4A373]/40",
    teal: "shadow-[0_0_30px_-5px_rgba(78,159,118,0.3)] border-[#4E9F76]/40",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {/* Subtle top specular sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-t-2xl" />
      {children}
    </div>
  );
};

