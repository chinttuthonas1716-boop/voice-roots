"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for the 10-day automated maintenance cycle
    console.error("[Voice Roots Smooth Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center p-4">
      <div className="ios27-glass max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-netflix-red/20 border border-netflix-red/40 mx-auto flex items-center justify-center text-netflix-red shadow-netflix-glow">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Smooth Recovery Triggered
          </h2>
          <p className="text-xs text-netflix-gray leading-relaxed">
            Voice Roots caught an unexpected exception and protected your active audio session from crashing.
          </p>
          {error?.message && (
            <p className="text-[11px] font-mono text-cultural-gold bg-black/50 p-2.5 rounded-xl border border-white/5 truncate">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full ios27-button-primary text-xs font-bold shadow-netflix-glow hover:scale-105 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full ios27-pill hover:bg-white/15 text-xs text-netflix-light hover:text-white transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
