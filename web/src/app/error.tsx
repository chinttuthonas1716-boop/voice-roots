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
    <div className="flex min-h-screen items-center justify-center bg-obsidian p-4 text-white">
      <div className="glass-card w-full max-w-md space-y-6 rounded-3xl p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-root-green/30 bg-root-green/10 text-leaf-green">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Something went wrong
          </h2>
          <p className="text-sm leading-relaxed text-secondary-text">
            Voice Roots could not finish loading this page. Your saved recordings remain in this browser.
          </p>
          {error?.message && (
            <p className="truncate rounded-xl border border-white/5 bg-black/50 p-2.5 font-mono text-[11px] text-earth-gold">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <button
            onClick={() => reset()}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-root-green px-6 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.02] sm:w-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs text-secondary-text transition-colors hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
