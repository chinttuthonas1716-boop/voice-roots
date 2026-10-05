"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Mic, Clock, BookOpen, Sparkles, Plus, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-obsidian text-primary-text pb-24">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-leaf-green">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Community Contributor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-1">
              Good evening, Sai
            </h1>
            <p className="text-secondary-text text-sm mt-0.5">
              Your voice contributions are helping preserve northern Telugu & tribal dialects.
            </p>
          </div>

          <Link
            href="/record"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-root-green text-obsidian font-semibold text-sm shadow-glow hover:scale-105 transition-all self-start sm:self-auto"
          >
            <Mic className="w-4 h-4 fill-current" />
            <span>Record New Voice</span>
          </Link>
        </div>

        {/* User Stats Trio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-1">
            <span className="text-xs font-mono uppercase text-secondary-text">Stories Preserved</span>
            <div className="text-3xl font-bold font-mono text-white">24</div>
            <p className="text-[11px] text-secondary-text">18 verified by community linguists</p>
          </div>

          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-1">
            <span className="text-xs font-mono uppercase text-secondary-text">Audio Archived</span>
            <div className="text-3xl font-bold font-mono text-leaf-green">8.4h</div>
            <p className="text-[11px] text-secondary-text">100% loss-less WAV format stored</p>
          </div>

          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-1">
            <span className="text-xs font-mono uppercase text-secondary-text">Words Digitized</span>
            <div className="text-3xl font-bold font-mono text-earth">12.3K</div>
            <p className="text-[11px] text-secondary-text">Indexed for semantic vector search</p>
          </div>
        </div>

        {/* Start Recording Big Action Card */}
        <div className="glass-surface p-8 rounded-3xl border border-root-green/30 bg-gradient-to-r from-root-green/10 via-transparent to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono uppercase text-leaf-green">Preserve an Oral Memory</span>
            <h2 className="text-2xl font-semibold text-white">Capture an elder's story or traditional song</h2>
            <p className="text-xs text-secondary-text leading-relaxed">
              Every recording is transcribed by open-source ASR, translated into standardized text, and integrated into our searchable linguistic repository.
            </p>
          </div>

          <Link
            href="/record"
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-root-green hover:bg-leaf-green text-obsidian font-semibold text-sm transition-transform hover:scale-105 active:scale-95 shadow-glow whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Start Recording Now</span>
          </Link>
        </div>

        {/* Recent Recordings Table */}
        <div className="glass-surface p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Recent Recordings</h2>
            <Link href="/archive" className="text-xs text-leaf-green hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {[
              {
                id: "vr-101",
                title: "Traditional Harvest & Rain Song",
                lang: "Telugu (Tribal)",
                date: "Today, 4:20 PM",
                duration: "08:42",
                status: "Verified & Archived",
                confidence: "94.2%",
              },
              {
                id: "vr-104",
                title: "Agency Herbal Medicine Notes",
                lang: "Telugu / Koya",
                date: "Yesterday",
                duration: "06:15",
                status: "AI Transcribed",
                confidence: "91.8%",
              },
              {
                id: "vr-109",
                title: "Childhood Games in the Forest",
                lang: "Telugu",
                date: "Oct 2, 2026",
                duration: "14:30",
                status: "Community Verified",
                confidence: "96.0%",
              },
            ].map((rec) => (
              <div key={rec.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">{rec.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-secondary-text text-[10px] font-mono">
                      {rec.lang}
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary-text flex items-center gap-2 font-mono">
                    <span>{rec.date}</span>
                    <span>•</span>
                    <span>{rec.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-root-green/10 text-leaf-green border border-root-green/20 text-[10px] font-mono">
                    {rec.status}
                  </span>
                  <Link
                    href={`/archive`}
                    className="p-1.5 rounded-full hover:bg-white/10 text-secondary-text hover:text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
