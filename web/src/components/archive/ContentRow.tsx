"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RecordingCard, RecordingCardData } from "./RecordingCard";

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: RecordingCardData[];
}

export function ContentRow({ title, subtitle, items }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-3 group/row relative">
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-xs sm:text-sm text-secondary-text mt-0.5">{subtitle}</p>}
        </div>

        {/* Scroll arrows */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full glass-card hover:bg-white/10 text-secondary-text hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full glass-card hover:bg-white/10 text-secondary-text hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroller */}
      <div
        ref={rowRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-3"
      >
        {items.map((item) => (
          <RecordingCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
