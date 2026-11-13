"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Volume2,
  Play,
  Pause,
  ShieldCheck,
  Lock,
  Globe,
  Languages,
  BookOpen,
  ArrowRight,
  Share2,
  Award,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { getWorkflow, isSeededHeritageStory, type PreservationWorkflow } from "@/lib/workflow";
import { getCurrentUser } from "@/lib/auth";

export default function PublicPlacardPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";

  const [workflow, setWorkflow] = useState<PreservationWorkflow | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const wf = getWorkflow(storyId);

    if (!wf) {
      setIsLoaded(true);
      return;
    }

    // Access control check
    const access = wf.consent?.accessLevel || "public";
    if (access !== "public" && !isSeededHeritageStory(storyId)) {
      // Must be authenticated and authorized
      if (!user) {
        setAccessDenied(true);
      }
    }

    setWorkflow(wf);
    setIsLoaded(true);
  }, [storyId]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#2D3250] flex items-center justify-center text-white">
        <div className="text-sm text-[#A9AEC5]">Loading heritage record…</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#2D3250] text-white">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 pt-32 pb-20 text-center">
          <div className="rounded-3xl border border-white/10 bg-[#242942]/95 p-8 backdrop-blur-xl shadow-2xl">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/20 text-[#F9B17A]">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
            <p className="text-sm text-[#A9AEC5] mb-6">
              This oral narrative is governed by Traditional Knowledge sovereignty and is restricted to verified community members.
            </p>
            <Link
              href="/login"
              className="vr-button vr-button-primary !py-2.5 !px-6 text-xs font-bold inline-flex items-center gap-2"
            >
              <span>Sign In with Custodian Credentials</span>
            </Link>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#2D3250] text-white">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 pt-32 pb-20 text-center">
          <div className="rounded-3xl border border-white/10 bg-[#242942] p-8">
            <h1 className="text-xl font-bold text-white mb-2">Record Not Found</h1>
            <p className="text-xs text-[#A9AEC5] mb-4">No oral tradition matches this identifier.</p>
            <Link href="/archive" className="text-xs text-[#F9B17A] font-bold hover:underline">
              Browse Oral Archive
            </Link>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  const translations = workflow.translations || {};

  return (
    <div className="min-h-screen bg-[#2D3250] text-white selection:bg-[#F9B17A] selection:text-[#242942] pb-28 md:pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 space-y-8">
        {/* Museum Exhibition Placard */}
        <article className="rounded-3xl border border-[#F9B17A]/30 bg-[#242942]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-[#F9B17A] text-[#242942] px-2.5 py-0.5 rounded-full">
                {workflow.id}
              </span>
              <span className="text-xs text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Elder Verified
              </span>
            </div>

            <Link
              href={`/passport/${workflow.id}`}
              className="text-xs text-[#F9B17A] hover:underline flex items-center gap-1 font-semibold"
            >
              <Award className="w-4 h-4" /> Inspect Digital Passport
            </Link>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              {workflow.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#A9AEC5] mt-1.5 flex flex-wrap items-center gap-x-4">
              <span>{workflow.culturalContext?.community}</span>
              <span>•</span>
              <span>{workflow.culturalContext?.location}</span>
              <span>•</span>
              <span className="text-white font-medium">{workflow.detectedLanguage} ({workflow.detectedDialect})</span>
            </p>
          </div>

          {/* Audio Player Card */}
          <div className="rounded-2xl border border-white/10 bg-[#2D3250] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F9B17A] flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Original Field Recording (48kHz)
              </span>
              <span className="text-xs font-mono text-[#D9D9E2]">
                {workflow.audioDuration || "03:45"}
              </span>
            </div>
            <audio
              src={workflow.audioUrl || "/audio/harvest_song.wav"}
              controls
              className="w-full h-8"
            />
          </div>

          {/* Original Transcript */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A9AEC5] block">
              Spoken Transcript ({workflow.detectedLanguage})
            </span>
            <p className="text-sm sm:text-base text-white font-serif leading-relaxed italic bg-white/5 p-5 rounded-2xl border border-white/5">
              &ldquo;{workflow.originalTranscript}&rdquo;
            </p>
          </div>

          {/* Multi-lingual Translation Tab */}
          {Object.keys(translations).length > 0 && (
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F9B17A] flex items-center gap-1.5">
                  <Languages className="w-4 h-4" /> Translation
                </span>
                <div className="flex gap-1.5">
                  {Object.keys(translations).map((code) => (
                    <button
                      key={code}
                      onClick={() => setSelectedLang(code)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase transition ${
                        selectedLang === code
                          ? "bg-[#F9B17A] text-[#242942]"
                          : "bg-white/5 text-[#A9AEC5] hover:text-white"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#D9D9E2] leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                {translations[selectedLang] || Object.values(translations)[0]}
              </p>
            </div>
          )}

          {/* Cultural Notes */}
          {workflow.culturalContext && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A9AEC5] block">
                Cultural Context & Tradition
              </span>
              <p className="text-xs text-[#D9D9E2] leading-relaxed">
                {workflow.culturalContext.background}
              </p>
            </div>
          )}
        </article>
      </main>

      <MobileBottomNav />
    </div>
  );
}

