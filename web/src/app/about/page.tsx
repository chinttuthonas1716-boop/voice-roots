"use client";

import React from "react";
import Link from "next/link";
import {
  Mic,
  Compass,
  Radio,
  ShieldCheck,
  Users,
  Lock,
  FileCheck2,
  Flame,
  HeartHandshake,
  ArrowRight,
  Globe2,
  QrCode,
  TreePine,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { WORKFLOW_PHASES } from "@/lib/workflow";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F3E9] text-[#203329] pb-24 pt-16 sm:pt-20 font-sans selection:bg-[#A6C48A]/40 selection:text-[#102B20] overflow-x-hidden">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-16">
        
        {/* =========================================================================
           HERO: LUXURY BOTANICAL EDITORIAL HEADER (Reference: Image 4)
           ========================================================================= */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DCE9D7] border border-[#A6C48A]/40 text-xs font-bold text-[#1F5138] tracking-[0.2em] uppercase font-display">
            <TreePine className="h-3.5 w-3.5 text-[#1F5138]" />
            <span>ORAL HERITAGE PRESERVATION PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#102B20] font-serif font-serif-display tracking-tight leading-[1.12]">
            Every voice carries a <span className="text-[#1F5138] italic">living world.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#496354] leading-relaxed font-light">
            Every fortnight, an oral tongue falls silent. Along with it vanishes centuries
            of ethnobotanical wisdom, medicinal knowledge, seasonal songs, and ancestral memories
            that were never recorded on paper.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/record"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#1F5138] text-[#F5F3E9] font-bold text-sm tracking-wide hover:bg-[#102B20] transition-all shadow-md active:scale-95"
            >
              <Mic className="w-4 h-4 text-[#A6C48A]" />
              <span>Preserve a Voice Now</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#1F5138]/30 bg-white/70 hover:bg-white text-[#1F5138] font-semibold text-sm transition-all shadow-sm active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#1F5138]" />
              <span>Explore Archive</span>
            </Link>
          </div>
        </section>

        {/* =========================================================================
           CORE ARCHIVAL VALUES (IVORY BOTANICAL CARDS)
           ========================================================================= */}
        <section aria-label="Core Philosophy" className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold tracking-[0.2em] text-[#1F5138] uppercase font-display">
              ETHICAL SOVEREIGNTY
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#102B20] font-serif font-serif-display">
              The Voice is the Sacred Artifact
            </h2>
            <p className="text-sm text-[#496354]">
              AI serves strictly as an archival scribe — never as an author or synthesizer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[28px] border border-[#DCE9D7] bg-white/80 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-[#DCE9D7] text-[#1F5138] grid place-items-center">
                <Radio className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-[#102B20] font-serif">Lossless Acoustic Custody</h3>
              <p className="text-sm text-[#496354] leading-relaxed font-light">
                The spoken acoustic recording is the primary cultural source. Written transcripts and
                translations are secondary derivative artifacts. Voice Roots protects the original
                uncompressed cadence, pitch, and timbre at 48 kHz.
              </p>
            </div>

            <div className="p-8 rounded-[28px] border border-[#DCE9D7] bg-white/80 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-[#DCE9D7] text-[#1F5138] grid place-items-center">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-[#102B20] font-serif">OCAP® Indigenous Sovereignty</h3>
              <p className="text-sm text-[#496354] leading-relaxed font-light">
                Ownership, Control, Access, and Possession remain permanently with the contributing
                communities and families. Voice Roots enforces granular four-tier licensing: Public,
                Community-Only, Restricted Ceremonial, and Private Family Archive.
              </p>
            </div>

            <div className="p-8 rounded-[28px] border border-[#DCE9D7] bg-white/80 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-[#DCE9D7] text-[#1F5138] grid place-items-center">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-[#102B20] font-serif">Elder Peer Verification</h3>
              <p className="text-sm text-[#496354] leading-relaxed font-light">
                Machine learning models inevitably introduce dialectal errors. Voice Roots mandates
                human peer review by elder community custodians and native speakers before
                issuing permanent cryptographic certificates.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
           OCAP® DATA SOVEREIGNTY CHARTER & GOVERNANCE MANIFESTO
           ========================================================================= */}
        <section aria-label="OCAP Charter & Governance" className="p-8 sm:p-12 rounded-[36px] border border-[#DCE9D7] bg-white shadow-md space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold tracking-[0.2em] text-[#1F5138] uppercase font-display">
              DATA SOVEREIGNTY MANIFESTO
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#102B20] font-serif font-serif-display tracking-tight">
              First Nations OCAP® Principles & Governance Charter
            </h2>
            <p className="text-sm sm:text-base text-[#496354] leading-relaxed font-light">
              Voice Roots is legally and architecturally bounded by the principles of First Nations OCAP®
              (Ownership, Control, Access, and Possession) and the CARE Principles for Indigenous Data
              Governance across all language sources. We firmly reject digital colonialism and extractive data practices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-[#DCE9D7] bg-[#F5F3E9]/60 space-y-3">
              <div className="flex items-center gap-2 text-[#1F5138] font-bold text-lg font-serif">
                <Lock className="w-5 h-5 text-[#1F5138]" />
                <span>1. Ownership (Whose Voices Are These?)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#496354] leading-relaxed">
                Indigenous voices, clan narratives, ethnobotanical formulas, and songs belong exclusively
                to the individual speakers and their communities. Contributing speakers retain 100% intellectual
                property rights. Voice Roots acts solely as an ethical custodian.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#DCE9D7] bg-[#F5F3E9]/60 space-y-3">
              <div className="flex items-center gap-2 text-[#1F5138] font-bold text-lg font-serif">
                <Users className="w-5 h-5 text-[#1F5138]" />
                <span>2. Control (Customary Elder Authority)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#496354] leading-relaxed">
                Tribal councils and accredited customary elders hold unilateral veto power over the
                classification, moderation, and publication of any recording. Sacred clan lore, restricted
                rituals, and customary legal disputes are shielded from public exposure.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#DCE9D7] bg-[#F5F3E9]/60 space-y-3">
              <div className="flex items-center gap-2 text-[#1F5138] font-bold text-lg font-serif">
                <ShieldCheck className="w-5 h-5 text-[#1F5138]" />
                <span>3. Access (Four Server-Enforced Tiers)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#496354] leading-relaxed">
                Data access is enforced at the database and storage level across four distinct tiers:
                <strong className="text-[#102B20]"> Public</strong> (open heritage),
                <strong className="text-[#102B20]"> Community</strong> (authenticated tribal members),
                <strong className="text-[#102B20]"> Research</strong> (institutional scholars with OCAP MOUs), and
                <strong className="text-[#102B20]"> Private</strong> (family vault only).
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#DCE9D7] bg-[#F5F3E9]/60 space-y-3">
              <div className="flex items-center gap-2 text-[#1F5138] font-bold text-lg font-serif">
                <FileCheck2 className="w-5 h-5 text-[#1F5138]" />
                <span>4. Possession (Immutable Master Preservation)</span>
              </div>
              <p className="text-xs sm:text-sm text-[#496354] leading-relaxed">
                The original 48kHz acoustic master recording is permanently preserved in lossless WAV/FLAC format
                with cryptographic SHA-256 integrity verification. AI transcripts and translations are secondary
                annotation layers that can never overwrite the immutable master.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-rose-300 bg-rose-50/70 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-base font-serif">
              <Flame className="w-5 h-5 text-rose-600" />
              <span>Strict Commercial Prohibition & AI Mining Moratorium</span>
            </div>
            <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
              No audio recording, phonetic transcription, or lexical alignment archived within Voice Roots
              may be sold, sublicensed, aggregated, or utilized for commercial foundation model training,
              synthetic voice cloning, or commercial advertising. Any commercial exploitation constitutes
              an immediate breach of community trust and triggers automated data isolation.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-emerald-300 bg-emerald-50/70 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base font-serif">
              <HeartHandshake className="w-5 h-5 text-emerald-700" />
              <span>Academic Pilot Status & IRB Ethics Moratorium</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
              All records currently displayed on this demonstration instance are designated as
              <strong className="text-emerald-950"> DEMO / SYNTHETIC EVALUATION DATA</strong>. Field archiving of real
              ancestral voices will only commence following formal Institutional Review Board (IRB) ethics clearance
              and bilateral community consent agreements with participating councils across all language sources.
            </p>
          </div>
        </section>

        {/* =========================================================================
           CANONICAL 8-PHASE PRESERVATION LIFECYCLE
           ========================================================================= */}
        <section aria-label="Preservation Lifecycle" className="p-8 sm:p-12 rounded-[36px] border border-[#DCE9D7] bg-white shadow-md space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#203329]/15 pb-6">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-[#1F5138] uppercase font-display">
                STRICT ARCHIVAL PROTOCOL
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#102B20] font-serif font-serif-display mt-1">
                The 8-Phase Preservation Pipeline
              </h2>
              <p className="text-sm text-[#496354] mt-1 max-w-xl font-light">
                Every recording advances through an unbroken, sequential workflow to ensure provenance,
                linguistic precision, and ethical consent.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-[#DCE9D7] text-[#1F5138] w-fit">
              Deterministic State Machine
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKFLOW_PHASES.map((phase) => (
              <div
                key={phase.phaseNumber}
                className="p-5 rounded-2xl bg-[#F5F3E9]/80 border border-[#DCE9D7] hover:border-[#1F5138]/40 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black tracking-widest text-[#1F5138] uppercase">
                    PHASE 0{phase.phaseNumber}
                  </span>
                  <span className="text-[10px] font-mono text-[#496354] bg-white px-2 py-0.5 rounded border border-[#DCE9D7]">
                    {phase.key}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#102B20] font-serif group-hover:text-[#1F5138] transition-colors">
                  {phase.label}
                </h3>
                <p className="text-xs text-[#496354] mt-1 leading-relaxed font-light">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#E8EFE1] border border-[#DCE9D7] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F5138] text-[#F5F3E9] grid place-items-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#102B20]">Route Guard Enforced</p>
                <p className="text-xs text-[#496354]">
                  Workflow steps cannot be skipped or bypassed via URLs. Verification requires verified consent.
                </p>
              </div>
            </div>
            <Link
              href="/record"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1F5138] text-[#F5F3E9] font-bold text-xs tracking-wide hover:bg-[#102B20] transition shadow-sm whitespace-nowrap"
            >
              <span>Begin Step 01</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* =========================================================================
           CRYPTOGRAPHIC PASSPORT & DATA SOVEREIGNTY
           ========================================================================= */}
        <section aria-label="Cryptographic Provenance" className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold tracking-[0.2em] text-[#1F5138] uppercase font-display">
              TAMPER-EVIDENT ARCHIVES
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#102B20] font-serif font-serif-display">
              Heritage Passport & Verifiable QR Codes
            </h2>
            <p className="text-sm sm:text-base text-[#496354] leading-relaxed font-light">
              When a story completes elder peer verification, Voice Roots generates a cryptographic
              Heritage Passport. Each passport includes:
            </p>
            <ul className="space-y-3 text-sm text-[#496354]">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#1F5138] mt-0.5 shrink-0" />
                <span><strong className="text-[#102B20]">SHA-256 Bitstream Seal:</strong> Mathematically validates that the original audio has not been spliced or modified.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Globe2 className="w-4 h-4 text-[#1F5138] mt-0.5 shrink-0" />
                <span><strong className="text-[#102B20]">Dialectal Provenance:</strong> Geospatial river basin, district, and mother tongue dialect categorization across all language sources.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <QrCode className="w-4 h-4 text-[#1F5138] mt-0.5 shrink-0" />
                <span><strong className="text-[#102B20]">Exhibition Placard QR:</strong> Scannable museum-ready placard to stream authentic recordings on any phone or tablet.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-[32px] border border-[#DCE9D7] bg-white shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-[#203329]/10 pb-4">
              <span className="text-xs font-bold text-[#102B20] tracking-wider uppercase">HERITAGE PASSPORT SPECIFICATION</span>
              <span className="text-[11px] font-mono text-[#1F5138] bg-[#DCE9D7] px-2 py-0.5 rounded-full font-bold">
                v2.4 Live
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#203329]">
              <div className="flex justify-between border-b border-[#203329]/5 py-1.5">
                <span className="text-[#496354]">Standard:</span>
                <span className="font-semibold">ISO 639-3 & UNESCO Atlas</span>
              </div>
              <div className="flex justify-between border-b border-[#203329]/5 py-1.5">
                <span className="text-[#496354]">Audio Codec:</span>
                <span className="font-semibold">WAV / FLAC / High-Q Opus</span>
              </div>
              <div className="flex justify-between border-b border-[#203329]/5 py-1.5">
                <span className="text-[#496354]">Translation:</span>
                <span className="font-semibold">IndicTrans2 Neural Engine</span>
              </div>
              <div className="flex justify-between border-b border-[#203329]/5 py-1.5">
                <span className="text-[#496354]">Verification:</span>
                <span className="font-semibold">Cryptographic Custodian Seal</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#496354]">Storage Model:</span>
                <span className="font-semibold">Offline-First Local + Cloud Backup</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/passport/1"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1F5138] text-[#F5F3E9] hover:bg-[#102B20] text-xs font-bold transition shadow-sm"
              >
                <span>Inspect Sample Passport (vr-106)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
           ZERO NATIVE LOCK-IN / WEB ONLY STATEMENT
           ========================================================================= */}
        <section aria-label="Web Platform Architecture" className="p-8 rounded-[28px] border border-[#DCE9D7] bg-[#E8EFE1] text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold tracking-[0.2em] text-[#1F5138] uppercase font-display">
            COMMUNITY ACCESS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102B20] font-serif font-serif-display">
            Accessible Everywhere · Web First
          </h2>
          <p className="text-sm text-[#496354] leading-relaxed font-light">
            Voice Roots requires zero app store downloads. It runs seamlessly on desktop workstations,
            laptops, and any mobile browser. Field workers in rural communities can record, draft,
            and review even when offline, syncing automatically once cellular connectivity is restored.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#1F5138]">
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
