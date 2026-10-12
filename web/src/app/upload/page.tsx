"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { SimpleVoiceWorkflow } from "@/components/audio/SimpleVoiceWorkflow";

export default function UploadPage() {
  return (
    <div className="min-h-screen pb-24 pt-20">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <SimpleVoiceWorkflow initialMode="upload" />
      </main>
    </div>
  );
}
