"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { SimpleVoiceWorkflow } from "@/components/audio/SimpleVoiceWorkflow";
import { PromptedRecordingView } from "@/components/audio/PromptedRecordingView";
import { Mic, ListChecks, Upload } from "lucide-react";

type RecordMode = "record" | "prompted" | "upload";

function RecordContent() {
  const searchParams = useSearchParams();
  const initialParam = searchParams.get("mode");
  const [mode, setMode] = useState<RecordMode>(
    initialParam === "prompted" ? "prompted" : initialParam === "upload" ? "upload" : "record"
  );

  useEffect(() => {
    if (initialParam === "prompted" || initialParam === "upload" || initialParam === "record") {
      setMode(initialParam);
    }
  }, [initialParam]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMode("record")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              mode === "record"
                ? "bg-[#F59E0B] text-black shadow-lg shadow-amber-500/20"
                : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5"
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>Freeform Record</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("prompted")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              mode === "prompted"
                ? "bg-[#F59E0B] text-black shadow-lg shadow-amber-500/20"
                : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5"
            }`}
          >
            <ListChecks className="h-4 w-4" />
            <span>Prompted Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              mode === "upload"
                ? "bg-[#F59E0B] text-black shadow-lg shadow-amber-500/20"
                : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {mode === "prompted" ? (
        <PromptedRecordingView onSwitchMode={() => setMode("record")} />
      ) : (
        <SimpleVoiceWorkflow key={mode} initialMode={mode} />
      )}
    </main>
  );
}

export default function RecordPage() {
  return (
    <div className="min-h-screen pb-24 pt-20">
      <Navbar />
      <Suspense fallback={<div className="text-center py-12 text-[#94A3B8]">Loading studio...</div>}>
        <RecordContent />
      </Suspense>
    </div>
  );
}

