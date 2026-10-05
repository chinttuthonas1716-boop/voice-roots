import React from "react";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-netflix-black text-white flex items-center justify-center p-4">
      <div className="ios27-glass max-w-md w-full p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-6">
        <span className="text-6xl font-black font-mono text-netflix-red tracking-tight block">
          404
        </span>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Oral Recording Not Found
          </h2>
          <p className="text-xs text-netflix-gray leading-relaxed">
            The narrative or linguistic archive route you requested may have moved or been re-indexed.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full ios27-button-primary text-xs font-bold shadow-netflix-glow hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Archive Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
