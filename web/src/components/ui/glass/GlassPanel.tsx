"use client";

import React from "react";

export interface GlassPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
  ...props
}) => {
  return (
    <div
      className={`relative rounded-3xl bg-[#1C1512]/60 border border-white/12 backdrop-blur-2xl shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden ${className}`}
      {...props}
    >
      {/* Specular sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {(title || subtitle || action) && (
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-semibold text-[#F7F3EE] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#C4B5A5] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
