"use client";

import Link from "next/link";
import { Mic, Upload, ArrowRight, ShieldCheck, Sparkles, Languages, CheckCircle2, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

export default function PreserveGatewayPage() {
  const phases = [
    { number: "01", name: "Capture", desc: "Live microphone recording or audio file upload", icon: Mic },
    { number: "02", name: "Understand", desc: "Acoustic dialect identification & transcription", icon: Languages },
    { number: "03", name: "Review", desc: "Elder transcript verification & phonetic tuning", icon: CheckCircle2 },
    { number: "04", name: "Translate", desc: "IndicTrans2 preservation across 6+ languages", icon: Sparkles },
    { number: "05", name: "Protect", desc: "Cultural consent & traditional knowledge licensing", icon: ShieldCheck },
    { number: "06", name: "Verify", desc: "Peer custodian review and cryptographic attestation", icon: CheckCircle2 },
    { number: "07", name: "Preserve", desc: "Tamper-evident Heritage Passport & verifiable QR", icon: Sparkles },
  ];

  return (
    <div className="vr-app pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="eyebrow">
            09. RECORD / UPLOAD · MASTER PRESERVE GATEWAY
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Preserve a Voice.
          </h1>
          <p className="text-base sm:text-lg text-[#D9D9E2] leading-relaxed">
            Every voice carries irreplaceable oral traditions, memories, and songs.
            Select how you would like to ingest your audio into the living archive.
          </p>
        </div>

        {/* Primary Action Cards (Record vs Upload) */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Option A: Live Microphone Recording */}
          <Link
            href="/record"
            className="group relative p-8 sm:p-10 rounded-[28px] border border-white/12 bg-[rgba(66,71,108,0.35)] backdrop-blur-2xl transition-all duration-300 hover:border-[#F9B17A]/50 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-2xl grid place-items-center bg-[#F9B17A]/15 border border-[#F9B17A]/35 text-[#F9B17A] group-hover:scale-105 transition-transform">
                <Mic className="w-8 h-8 stroke-[2.3]" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#F9B17A] tracking-wider uppercase">
                  Option 01 · Live Studio
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Record Voice
                </h2>
                <p className="text-sm text-[#A9AEC5] leading-relaxed">
                  Record directly in your browser or phone with real-time waveform visualization, automatic silence clipping, and voluntary community consent.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between border-t border-white/10 mt-6">
              <span className="text-xs font-semibold text-[#D9D9E2]">
                Microphone · Studio VAD · Instant
              </span>
              <div className="vr-button vr-button-primary !min-h-10 !py-1 !px-4 text-xs font-bold">
                <span>Start Recording</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Option B: Upload Existing Audio File */}
          <Link
            href="/upload"
            className="group relative p-8 sm:p-10 rounded-[28px] border border-white/12 bg-[rgba(66,71,108,0.35)] backdrop-blur-2xl transition-all duration-300 hover:border-[#F9B17A]/50 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-2xl grid place-items-center bg-white/10 border border-white/20 text-[#D9D9E2] group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 stroke-[2.3]" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#F9B17A] tracking-wider uppercase">
                  Option 02 · Archive Files
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Upload Audio File
                </h2>
                <p className="text-sm text-[#A9AEC5] leading-relaxed">
                  Upload high-fidelity master recordings from your device (WAV, MP3, FLAC, M4A, OGG). Attach elder names, locations, and cultural metadata.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between border-t border-white/10 mt-6">
              <span className="text-xs font-semibold text-[#D9D9E2]">
                WAV, MP3, M4A up to 50MB
              </span>
              <div className="vr-button vr-button-secondary !min-h-10 !py-1 !px-4 text-xs font-bold">
                <span>Select Audio File</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* 7-Phase Preservation Journey */}
        <div className="mt-16 p-8 sm:p-10 rounded-[32px] border border-white/10 bg-[rgba(36,41,66,0.7)] backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">PRESERVATION LIFECYCLE</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                How Your Voice Becomes Living Heritage
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] w-fit">
              7-Phase Pipeline
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {phases.map((phase, idx) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.number}
                  className="p-4 rounded-2xl bg-white/[0.04] border border-white/8 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#F9B17A] tracking-wider">
                      PHASE {phase.number}
                    </span>
                    <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                      <Icon className="w-4 h-4 text-[#F9B17A] shrink-0" />
                      <span>{phase.name}</span>
                    </div>
                    <p className="text-[11px] text-[#A9AEC5] leading-tight">
                      {phase.desc}
                    </p>
                  </div>
                  {idx < phases.length - 1 && (
                    <div className="hidden lg:block text-right pt-2 text-[#A9AEC5]/30">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

