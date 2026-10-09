"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface GlassTabProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "pill" | "underline" | "glass";
}

export const GlassTab: React.FC<GlassTabProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "pill",
}) => {
  return (
    <div
      role="tablist"
      aria-label="Selection Tabs"
      className={`inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-xl transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#E58A4E]/50 min-h-[40px] whitespace-nowrap
              ${
                isActive
                  ? "text-[#F7F3EE] bg-white/[0.12] border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] font-semibold"
                  : "text-[#C4B5A5] hover:text-[#F7F3EE] hover:bg-white/[0.05] border border-transparent"
              }
            `}
          >
            {tab.icon && (
              <span
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-[#E58A4E]" : "text-[#C4B5A5]/70"
                }`}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E58A4E]/20 text-[#E58A4E] font-medium">
                {tab.badge}
              </span>
            )}
            {isActive && variant === "underline" && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#E58A4E] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

