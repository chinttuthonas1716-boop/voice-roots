"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  Globe,
  Database,
  Cpu,
  ShieldCheck,
  Radio,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface LanguageDiscoveryArchitectureProps {
  className?: string;
  showSectionHeader?: boolean;
}

export function LanguageDiscoveryArchitecture({
  className = "",
  showSectionHeader = true,
}: LanguageDiscoveryArchitectureProps) {
  const [activeTier, setActiveTier] = useState<number | null>(null);

  const toggleTier = (index: number) => {
    setActiveTier((prev) => (prev === index ? null : index));
  };

  return (
    <section className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Optional Top Section Header matching Screenshot 2 */}
      {showSectionHeader && (
        <div className="text-left space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3E9] font-sans tracking-tight">
            3. The Voice Roots language discovery architecture
          </h2>
          <p className="text-sm sm:text-base text-[#A6C48A]/90 font-light">
            Instead of hardcoding languages, build a dynamic registry.
          </p>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-3xl border border-[#A6C48A]/25 bg-[#071A13]/90 backdrop-blur-xl p-4 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-3 sm:space-y-4">
        
        {/* =========================================================================
            TIER 1: VOICE ROOTS GLOBAL LANGUAGE REGISTRY (Deep Green Card)
            ========================================================================= */}
        <div
          onClick={() => toggleTier(1)}
          className="rounded-2xl border border-[#1F5138] bg-[#102B20] p-4 sm:p-5 text-center shadow-lg cursor-pointer hover:border-[#A6C48A]/50 transition-all duration-200"
        >
          <h3 className="text-sm sm:text-base md:text-lg font-bold tracking-wider uppercase text-[#F5F3E9] font-sans">
            VOICE ROOTS GLOBAL LANGUAGE REGISTRY
          </h3>
          <p className="text-xs sm:text-sm text-[#A6C48A] mt-1 font-normal">
            Dynamic, extensible and language-independent
          </p>

          {/* Side-by-Side Split Cards (India & Global) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mt-3.5 pt-3 border-t border-white/10 text-left">
            {/* India Sub-card */}
            <div className="rounded-xl bg-[#E8F0E4] p-3 sm:p-4 text-[#102B20] shadow-sm transition hover:scale-[1.01]">
              <span className="block text-xs sm:text-sm font-bold text-[#102B20]">
                India
              </span>
              <span className="block text-[11px] sm:text-xs text-[#3D5447] mt-0.5 leading-snug">
                Government and research sources
              </span>
            </div>

            {/* Global Sub-card */}
            <div className="rounded-xl bg-[#E8F0E4] p-3 sm:p-4 text-[#102B20] shadow-sm transition hover:scale-[1.01]">
              <span className="block text-xs sm:text-sm font-bold text-[#102B20]">
                Global
              </span>
              <span className="block text-[11px] sm:text-xs text-[#3D5447] mt-0.5 leading-snug">
                International language resources
              </span>
            </div>
          </div>

          <AnimatePresence>
            {activeTier === 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-white/10 text-left text-xs text-[#A6C48A]/90 space-y-1.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="font-semibold text-[#F5F3E9]">India Pipelines:</span>
                    <p className="text-[#A6C48A]/80 mt-0.5">Census 2011 C-16, CIIL SPPEL, Bhashini National Language Translation Mission, regional university linguistic field surveys.</p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="font-semibold text-[#F5F3E9]">Global Repositories:</span>
                    <p className="text-[#A6C48A]/80 mt-0.5">UNESCO World Atlas of Languages, Glottolog 5.0, ISO 639-3, OLAC Open Language Archives, ELAR endangered language catalog.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Down Arrow 1 */}
        <div className="flex justify-center py-0.5">
          <ArrowDown className="h-5 w-5 text-[#477A50] animate-bounce" />
        </div>

        {/* =========================================================================
            TIER 2: LANGUAGE ASSESSMENT ENGINE (Ivory/Mist Card)
            ========================================================================= */}
        <div
          onClick={() => toggleTier(2)}
          className="rounded-2xl border border-[#DCE9D7]/40 bg-[#E8F0E4] p-4 sm:p-5 text-center shadow-md cursor-pointer hover:bg-[#F5F3E9] transition-all duration-200"
        >
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-[#102B20] font-sans">
            Language assessment engine
          </h4>
          <p className="text-xs sm:text-sm text-[#3D5447] mt-1 font-medium leading-relaxed">
            Digital resources • Speech data • Script • Dialects • Community consent
          </p>

          <AnimatePresence>
            {activeTier === 2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-[#3D5447]/20 text-left text-xs text-[#102B20] space-y-1.5"
              >
                <p className="text-[11px] sm:text-xs text-[#223B2D] leading-relaxed">
                  Evaluates language endangerment without hardcoding: calculates speech corpus hours, checks phonemic orthography availability, verifies dialect clusters, and validates whether customary permissions exist prior to automated ingestion.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Down Arrow 2 */}
        <div className="flex justify-center py-0.5">
          <ArrowDown className="h-5 w-5 text-[#477A50] animate-bounce" />
        </div>

        {/* =========================================================================
            TIER 3: COMMUNITY-APPROVED LANGUAGE PROFILES (Deep Green Card)
            ========================================================================= */}
        <div
          onClick={() => toggleTier(3)}
          className="rounded-2xl border border-[#1F5138] bg-[#102B20] p-4 sm:p-5 text-center shadow-lg cursor-pointer hover:border-[#A6C48A]/50 transition-all duration-200"
        >
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-[#F5F3E9] font-sans">
            Community-approved language profiles
          </h4>
          <p className="text-xs sm:text-sm text-[#A6C48A] mt-1 font-normal leading-relaxed">
            Only onboarded when data access and consent requirements are met
          </p>

          <AnimatePresence>
            {activeTier === 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-white/10 text-left text-xs text-[#A6C48A]/90 space-y-1.5"
              >
                <p className="text-[11px] sm:text-xs text-[#DCE9D7] leading-relaxed">
                  First Nations OCAP® Principles (Ownership, Control, Access, Possession) strictly govern archiving. Clan elders verify recordings; sacred spiritual oral songs remain shielded and cannot be mined or monetized.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Down Arrow 3 */}
        <div className="flex justify-center py-0.5">
          <ArrowDown className="h-5 w-5 text-[#477A50] animate-bounce" />
        </div>

        {/* =========================================================================
            TIER 4: SHARED AI AND PRESERVATION ENGINE (Ivory/Mist Card)
            ========================================================================= */}
        <div
          onClick={() => toggleTier(4)}
          className="rounded-2xl border border-[#DCE9D7]/40 bg-[#E8F0E4] p-4 sm:p-5 text-center shadow-md cursor-pointer hover:bg-[#F5F3E9] transition-all duration-200"
        >
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-[#102B20] font-sans">
            Shared AI and preservation engine
          </h4>
          <p className="text-xs sm:text-sm text-[#3D5447] mt-1 font-medium leading-relaxed">
            Speech recognition • Transcription • Verification • Search • Archives
          </p>

          <AnimatePresence>
            {activeTier === 4 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-[#3D5447]/20 text-left text-xs text-[#102B20] space-y-1.5"
              >
                <p className="text-[11px] sm:text-xs text-[#223B2D] leading-relaxed">
                  Unified Whisper + Conformer acoustic models, SQLite FTS5 multilingual full-text search, elder verification consensus workflows, and immutable 48 kHz WAV master audio storage.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#A6C48A]/80 border-t border-white/10">
          <span className="text-[11px] font-mono">
            4-Tier Extensible Pipeline · Language Agnostic
          </span>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#F5F3E9] hover:text-[#A6C48A] transition"
          >
            <span>Explore 420+ Languages</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

      </div>
    </section>
  );
}

export default LanguageDiscoveryArchitecture;
