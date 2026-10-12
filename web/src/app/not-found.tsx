import React from "react";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian p-4 text-white">
      <div className="glass-card w-full max-w-md space-y-6 rounded-3xl p-8 text-center shadow-2xl">
        <span className="block font-mono text-6xl font-black tracking-tight text-leaf-green">
          404
        </span>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Page not found
          </h2>
          <p className="text-sm leading-relaxed text-secondary-text">
            This page may have moved, or the saved story may no longer be available in this browser.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-root-green px-6 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.02]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
