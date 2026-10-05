"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RecordingCard, RecordingCardData } from "./RecordingCard";

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: RecordingCardData[];
}

export function ContentRow({ title, subtitle, items }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <div className="space-y-4 group/row relative">
      {/* Row Header with Netflix Cinematic Red Accent Indicator */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 rounded-full bg-netflix-red shadow-netflix-glow" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-netflix-red transition-colors cursor-pointer">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-netflix-gray pl-4">{subtitle}</p>
          )}
        </div>

        {/* Netflix-style Row Navigation Pills */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-2 rounded-full ios27-pill hover:bg-netflix-red hover:text-white text-netflix-light disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-2 rounded-full ios27-pill hover:bg-netflix-red hover:text-white text-netflix-light disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroller Container with Netflix Left/Right Edge Shadows */}
      <div className="relative">
        {/* Left fade gradient */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 z-20 pointer-events-none bg-gradient-to-r from-netflix-black via-netflix-black/60 to-transparent transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Scroller */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-5 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-8 pt-2"
        >
          {items.map((item) => (
            <RecordingCard key={item.id} item={item} />
          ))}
        </div>

        {/* Right fade gradient */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 z-20 pointer-events-none bg-gradient-to-l from-netflix-black via-netflix-black/60 to-transparent transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
