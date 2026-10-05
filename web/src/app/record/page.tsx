"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { RecordingStudio } from "@/components/audio/RecordingStudio";
import { AIAssistant } from "@/components/ai/AIAssistant";

export default function RecordPage() {
  return (
    <div className="min-h-screen bg-obsidian text-primary-text pb-24">
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <RecordingStudio />
      </main>
      <AIAssistant />
    </div>
  );
}
