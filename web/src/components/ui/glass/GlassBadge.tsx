"use client";

import React from "react";

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "amber" | "teal" | "violet" | "emerald" | "neutral" | "danger";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  variant = "gold",
  size = "md",
  icon,
  children,
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: "text-[11px] px-2.5 py-0.5 rounded-full gap-1",
    md: "text-xs px-3 py-1 rounded-full gap-1.5",
  };

  const variantClasses = {
    gold:
      "bg-[#E58A4E]/15 text-[#E58A4E] border border-[#E58A4E]/30 shadow-[0_0_12px_rgba(229,138,78,0.20)]",
    amber:
      "bg-[#E58A4E]/15 text-[#E58A4E] border border-[#E58A4E]/30 shadow-[0_0_12px_rgba(229,138,78,0.20)]",
    teal:
      "bg-[#4E9F76]/15 text-[#4E9F76] border border-[#4E9F76]/30 shadow-[0_0_12px_rgba(78,159,118,0.20)]",
    violet:
      "bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30 shadow-[0_0_12px_rgba(212,163,115,0.20)]",
    emerald:
      "bg-[#4E9F76]/15 text-[#4E9F76] border border-[#4E9F76]/30 shadow-[0_0_12px_rgba(78,159,118,0.20)]",
    danger:
      "bg-[#E05A6F]/15 text-[#E05A6F] border border-[#E05A6F]/30 shadow-[0_0_12px_rgba(224,90,111,0.20)]",
    neutral:
      "bg-white/[0.08] text-[#C4B5A5] border border-white/12 shadow-[0_0_12px_rgba(0,0,0,0.25)]",
  };

  return (
    <span
      className={`inline-flex items-center font-medium backdrop-blur-md transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

