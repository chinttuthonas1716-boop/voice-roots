"use client";

import React from "react";
import Link from "next/link";
import {
  Mic,
  Languages,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  Globe2,
  Lock,
  FileCheck2,
  Users,
  Compass,
  Cpu,
  HeartHandshake,
  QrCode,
  Radio,
  Flame,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { WORKFLOW_PHASES } from "@/lib/workflow";

export default function AboutPage() {
  return (
    <div className="vr-app pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 space-y-20">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <span className="eyebrow">
            ORAL HERITAGE PRESERVATION PLATFORM
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Every voice carries a living world.
          </h1>
          <p className="text-lg sm:text-xl text-[#D9D9E2] leading-relaxed">
            Every fortnight, an oral tongue falls silent. Along with it vanishes centuries
            of ethnobotanical wisdom, medicinal knowledge, seasonal songs, and ancestral memories
            that were never recorded on paper.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/preserve" className="vr-button vr-button-primary">
              <Mic className="w-4 h-4" />
              <span>Preserve a Voice Now</span>
            </Link>
            <Link href="/explore" className="vr-button vr-button-secondary">
              <Compass className="w-4 h-4" />
              <span>Explore Archive</span>
            </Link>
          </div>
        </section>

        {/* CORE ARCHIVAL VALUES */}
        <section aria-label="Core Philosophy" className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="eyebrow">ETHICAL SOVEREIGNTY</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              The Voice is the Sacred Artifact
            </h2>
            <p className="text-sm text-[#A9AEC5]">
              AI serves strictly as an archival scribe — never as an author or synthesizer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[28px] border border-white/10 bg-[rgba(66,71,108,0.3)] backdrop-blur-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] grid place-items-center">
                <Radio className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-white">Lossless Acoustic Custody</h3>
              <p className="text-sm text-[#A9AEC5] leading-relaxed">
                The spoken acoustic recording is the primary cultural source. Written transcripts and
                translations are secondary derivative artifacts. Voice Roots protects the original
                uncompressed cadence, pitch, and timbre.
              </p>
            </div>

            <div className="p-8 rounded-[28px] border border-white/10 bg-[rgba(66,71,108,0.3)] backdrop-blur-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] grid place-items-center">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-white">OCAP® Indigenous Sovereignty</h3>
              <p className="text-sm text-[#A9AEC5] leading-relaxed">
                Ownership, Control, Access, and Possession remain permanently with the contributing
                communities and families. Voice Roots enforces granular four-tier licensing: Public,
                Community-Only, Restricted Ceremonial, and Private Family Archive.
              </p>
            </div>

            <div className="p-8 rounded-[28px] border border-white/10 bg-[rgba(66,71,108,0.3)] backdrop-blur-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] grid place-items-center">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-white">Elder Peer Verification</h3>
              <p className="text-sm text-[#A9AEC5] leading-relaxed">
                Machine learning models inevitably introduce dialectal halluncinations. Voice Roots
                mandates human peer review by elder community custodians and native linguists before
                issuing permanent cryptographic certificates.
              </p>
            </div>
          </div>
        </section>

        {/* CANONICAL 8-PHASE PRESERVATION LIFECYCLE */}
        <section aria-label="Preservation Lifecycle" className="p-8 sm:p-12 rounded-[36px] border border-white/10 bg-[rgba(36,41,66,0.8)] backdrop-blur-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="eyebrow">STRICT ARCHIVAL PROTOCOL</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                The 8-Phase Preservation Pipeline
              </h2>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-xl">
                Every recording advances through an unbroken, sequential workflow to ensure provenance,
                linguistic precision, and ethical consent.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] w-fit">
              Deterministic State Machine
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKFLOW_PHASES.map((phase) => (
              <div
                key={phase.phaseNumber}
                className="p-5 rounded-2xl bg-white/[0.04] border border-white/8 hover:border-[#F9B17A]/30 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black tracking-widest text-[#F9B17A] uppercase">
                    PHASE 0{phase.phaseNumber}
                  </span>
                  <span className="text-[10px] font-mono text-[#A9AEC5] bg-white/5 px-2 py-0.5 rounded">
                    {phase.key}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#F9B17A] transition-colors">
                  {phase.label}
                </h3>
                <p className="text-xs text-[#A9AEC5] mt-1 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#2D3250]/70 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] grid place-items-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Route Guard Enforced</p>
                <p className="text-xs text-[#A9AEC5]">
                  Workflow steps cannot be skipped or bypassed via URLs. Verification requires verified consent.
                </p>
              </div>
            </div>
            <Link
              href="/preserve"
              className="vr-button vr-button-primary !min-h-10 text-xs font-bold whitespace-nowrap"
            >
              <span>Begin Step 01</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* CRYPTOGRAPHIC PASSPORT & DATA SOVEREIGNTY */}
        <section aria-label="Cryptographic Provenance" className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <span className="eyebrow">TAMPER-EVIDENT ARCHIVES</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Heritage Passport & Verifiable QR Codes
            </h2>
            <p className="text-sm sm:text-base text-[#D9D9E2] leading-relaxed">
              When a story completes elder peer verification, Voice Roots generates a cryptographic
              Heritage Passport. Each passport includes:
            </p>
            <ul className="space-y-3 text-sm text-[#A9AEC5]">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#F9B17A] mt-0.5 shrink-0" />
                <span><strong className="text-white">SHA-256 Bitstream Seal:</strong> Mathematically validates that the original audio has not been spliced or modified.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Globe2 className="w-4 h-4 text-[#F9B17A] mt-0.5 shrink-0" />
                <span><strong className="text-white">Dialectal Provenance:</strong> Geospatial river basin, district, and mother tongue dialect categorization.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <QrCode className="w-4 h-4 text-[#F9B17A] mt-0.5 shrink-0" />
                <span><strong className="text-white">Exhibition Placard QR:</strong> Scannable museum-ready placard to stream authentic recordings on any phone or tablet.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-[32px] border border-white/10 bg-[rgba(66,71,108,0.35)] backdrop-blur-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-bold text-white tracking-wider">HERITAGE PASSPORT SPECIFICATION</span>
              <span className="text-[11px] font-mono text-[#F9B17A] bg-[#F9B17A]/10 border border-[#F9B17A]/30 px-2 py-0.5 rounded-full">
                v2.4 Live
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#D9D9E2]">
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-[#A9AEC5]">Standard:</span>
                <span>ISO 639-3 & UNESCO Atlas</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-[#A9AEC5]">Audio Codec:</span>
                <span>WAV / FLAC / High-Q Opus</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-[#A9AEC5]">Translation:</span>
                <span>IndicTrans2 Neural Engine</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-[#A9AEC5]">Verification:</span>
                <span>Cryptographic Custodian Seal</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#A9AEC5]">Storage Model:</span>
                <span>Offline-First Local + Distributed Cloud</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/passport/vr-106"
                className="w-full vr-button vr-button-secondary !min-h-11 text-xs justify-center"
              >
                <span>Inspect Sample Passport (vr-106)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ZERO NATIVE LOCK-IN / WEB ONLY STATEMENT */}
        <section aria-label="Web Platform Architecture" className="p-8 rounded-[28px] border border-white/10 bg-gradient-to-r from-[rgba(45,50,80,0.7)] to-[rgba(36,41,66,0.9)] text-center max-w-3xl mx-auto space-y-4">
          <span className="eyebrow">COMMUNITY ACCESS</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Accessible Everywhere · Web First
          </h2>
          <p className="text-sm text-[#D9D9E2] leading-relaxed">
            Voice Roots requires zero app store downloads. It runs seamlessly on desktop workstations,
            laptops, and any mobile browser. Field workers in rural communities can record, draft,
            and review even when offline, syncing automatically once cellular connectivity is restored.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#F9B17A]">
            <span>✓ No Native App Required</span>
            <span>·</span>
            <span>✓ Offline Checkpointing</span>
            <span>·</span>
            <span>✓ Mobile Responsive</span>
            <span>·</span>
            <span>✓ 100% Open Standards</span>
          </div>
        </section>
      </main>
    </div>
  );
}

