"use client";

import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[#C4B5A5] tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#C4B5A5]/70 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-12 bg-white/[0.05] hover:bg-white/[0.08] border text-[#F7F3EE] placeholder-[#C4B5A5]/40 rounded-xl px-4 text-sm backdrop-blur-md transition-all duration-200 outline-none
              ${
                leftIcon ? "pl-11" : "pl-4"
              } ${rightIcon ? "pr-11" : "pr-4"} ${
              error
                ? "border-[#E05A6F]/60 focus:border-[#E05A6F] focus:ring-2 focus:ring-[#E05A6F]/20"
                : "border-white/12 focus:border-[#E58A4E] focus:bg-white/[0.09] focus:ring-2 focus:ring-[#E58A4E]/25 focus:shadow-[0_0_20px_-3px_rgba(229,138,78,0.25)]"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#C4B5A5]/70 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="flex items-center gap-1.5 text-xs text-[#E05A6F] mt-0.5 animate-in fade-in-50 duration-150">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#C4B5A5]/70 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

