"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { RecordingStudio } from "@/components/audio/RecordingStudio";
import { AIAssistant } from "@/components/ai/AIAssistant";

export default function RecordPage() {
  return (
    <div className="vr-app pb-28">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <RecordingStudio />
      </main>
      <AIAssistant />
    </div>
  );
}
