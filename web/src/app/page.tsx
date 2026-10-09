"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  Mic,
  Play,
  Pause,
  ShieldCheck,
  Sparkles,
  Upload,
  ArrowRight,
  ExternalLink,
  Volume2,
  CheckCircle2,
  Languages,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { LocationLanguageBanner } from "@/components/ui/LocationLanguageBanner";
import { RecordingStudio } from "@/components/audio/RecordingStudio";
import { getStorageStats, getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { getActiveWorkflow, getNextValidRoute, type PreservationWorkflow } from "@/lib/workflow";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalRecordingsCount: 0,
    languagesCovered: 0,
    durationSeconds: 0,
    wordCount: 0,
  });
  const [stories, setStories] = useState<StoredVoiceRecord[]>([]);
  const [featuredStory, setFeaturedStory] = useState<StoredVoiceRecord | null>(null);
  const [activeWf, setActiveWf] = useState<PreservationWorkflow | null>(null);
  const [isHeroAudioPlaying, setIsHeroAudioPlaying] = useState(false);
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const heroAudioRef = useRef<HTMLAudioElement | null>(null);
  const cardAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setStats(getStorageStats());
    const all = getUserRecordings();
    setStories(all);
    if (all.length > 0) {
      setFeaturedStory(all[0]);
    }

    const currentWf = getActiveWorkflow();
    if (currentWf && currentWf.status !== "PUBLISHED" && currentWf.status !== "REJECTED") {
      setActiveWf(currentWf);
    }
  }, []);

  const toggleHeroAudio = () => {
    if (!featuredStory || !featuredStory.audioUrl) return;
    const src = featuredStory.audioUrl;

    if (!heroAudioRef.current || heroAudioRef.current.src !== src) {
      if (heroAudioRef.current) {
        heroAudioRef.current.pause();
      }
      heroAudioRef.current = new Audio(src);
      heroAudioRef.current.onended = () => setIsHeroAudioPlaying(false);
    }

    if (isHeroAudioPlaying) {
      heroAudioRef.current.pause();
      setIsHeroAudioPlaying(false);
    } else {
      if (cardAudioRef.current) {
        cardAudioRef.current.pause();
        setPlayingCardId(null);
      }
      heroAudioRef.current.play().then(() => {
        setIsHeroAudioPlaying(true);
      }).catch((e) => {
        console.warn("Audio play blocked", e);
        setIsHeroAudioPlaying(false);
      });
    }
  };

  const toggleCardAudio = (record: StoredVoiceRecord, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const src = record.audioUrl || `/audio/${record.audioFileName}`;

    if (playingCardId === record.id) {
      if (cardAudioRef.current) {
        cardAudioRef.current.pause();
        setPlayingCardId(null);
      }
    } else {
      if (cardAudioRef.current) {
        cardAudioRef.current.pause();
      }
      if (heroAudioRef.current && isHeroAudioPlaying) {
        heroAudioRef.current.pause();
        setIsHeroAudioPlaying(false);
      }
      const audio = new Audio(src);
      cardAudioRef.current = audio;
      setPlayingCardId(record.id);
      audio.onended = () => setPlayingCardId(null);
      audio.play().catch(() => setPlayingCardId(null));
    }
  };

  const duration =
    stats.durationSeconds < 60
      ? `${stats.durationSeconds}s`
      : `${Math.floor(stats.durationSeconds / 60)}m`;

  return (
    <div className="vr-app">
      <Navbar />

      <main>
        {/* 10. EDITORIAL HERO SECTION */}
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              ORAL HERITAGE · AI · AUDIO
            </span>
            <h1>
              Every voice
              <br />
              carries a story.
            </h1>
            <p>
              Preserve oral traditions, languages and memories with AI-assisted transcription, translation and human verification.
            </p>
            <div className="hero-actions">
              <Link href="/explore" className="vr-button vr-button-primary">
                Explore Heritage
              </Link>
              <Link href="/preserve" className="vr-button vr-button-secondary">
                🎙 Preserve a Voice
              </Link>
            </div>
            <div className="pt-2">
              <LocationLanguageBanner />
            </div>
          </div>

          {/* FEATURED STORY CARD */}
          <div className="hero-story vr-glass">
            <div className="flex items-center justify-between">
              <span>FEATURED ORAL HERITAGE</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A]">
                Human Verified ✓
              </span>
            </div>

            <div className="my-2 p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 grid place-items-center text-3xl">
                🌾
              </div>
              <h2>
                {featuredStory?.title || "Harvest Songs of the Village"}
              </h2>
              <p className="mt-1 text-[#F9B17A] font-semibold text-xs">
                {featuredStory?.language || "Telugu"} · {featuredStory?.location || "Andhra Pradesh"}
              </p>
              <p className="mt-2 text-xs text-[#A9AEC5] line-clamp-2">
                {featuredStory?.culturalContext || "Generational oral harvest prayer celebrating river waters, paddy sowing, and elder blessings."}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={toggleHeroAudio}
                className="vr-button vr-button-primary flex-1 !min-h-11 text-xs"
              >
                {isHeroAudioPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                <span>{isHeroAudioPlaying ? "Pause Audio" : "Listen Now"}</span>
              </button>
              <Link
                href={`/story/${featuredStory?.id || "vr-106"}`}
                className="vr-button vr-button-secondary !min-h-11 text-xs"
              >
                <span>View Story</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ACTIVE PRESERVATION RESUMPTION CARD */}
        {activeWf && (
          <section aria-label="Active preservation in progress" className="max-w-[1360px] mx-auto px-6 -mt-6 mb-16 animate-fade-in">
            <div className="relative overflow-hidden rounded-[28px] border border-[#F9B17A]/40 bg-gradient-to-r from-[rgba(45,50,80,0.95)] via-[rgba(36,41,66,0.95)] to-[rgba(45,50,80,0.95)] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9B17A]/20 border border-[#F9B17A]/40 text-xs font-bold text-[#F9B17A]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>CONTINUE PRESERVING · ACTIVE SESSION</span>
                    </span>
                    <span className="text-xs font-mono text-[#D9D9E2] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      ID: {activeWf.id}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {activeWf.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A9AEC5] mt-1">
                      Current Stage: <span className="text-[#F9B17A] font-semibold">{activeWf.status.replace(/_/g, " ")}</span>
                      {activeWf.detectedLanguage ? ` · Tongue: ${activeWf.detectedLanguage}` : ""}
                      {activeWf.audioDuration ? ` · Duration: ${activeWf.audioDuration}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/preserve"
                    className="vr-button vr-button-secondary !min-h-11 text-xs font-semibold"
                  >
                    <span>Start Fresh Draft</span>
                  </Link>
                  <Link
                    href={getNextValidRoute(activeWf)}
                    className="vr-button vr-button-primary !min-h-11 text-xs sm:text-sm font-bold shadow-lg shadow-[#F9B17A]/15"
                  >
                    <span>Continue Preserving Step</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3 CORE PILLARS */}
        <section className="max-w-[1360px] mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-5">
            <Link
              href="/explore"
              className="p-6 rounded-3xl bg-[rgba(66,71,108,0.3)] border border-white/10 hover:border-[#F9B17A]/40 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] grid place-items-center mb-4 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold text-[#F9B17A] tracking-wider uppercase">01. Discover</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Explore Heritage</h3>
              <p className="text-xs text-[#A9AEC5] leading-relaxed">
                Browse oral archives by dialect, river basin, community elders, and folk traditions.
              </p>
            </Link>

            <Link
              href="/preserve"
              className="p-6 rounded-3xl bg-[rgba(66,71,108,0.3)] border border-white/10 hover:border-[#F9B17A]/40 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] grid place-items-center mb-4 group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold text-[#F9B17A] tracking-wider uppercase">02. Ingest</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">Preserve a Voice</h3>
              <p className="text-xs text-[#A9AEC5] leading-relaxed">
                Record field voice or upload audio files to run phonetic transcription and translation.
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="p-6 rounded-3xl bg-[rgba(66,71,108,0.3)] border border-white/10 hover:border-[#F9B17A]/40 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A] grid place-items-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold text-[#F9B17A] tracking-wider uppercase">03. Custody</span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2">My Heritage</h3>
              <p className="text-xs text-[#A9AEC5] leading-relaxed">
                Manage your community recordings, view cryptographic passports, and verify provenance.
              </p>
            </Link>
          </div>
        </section>

        {/* LIVE ARCHIVE TELEMETRY */}
        <section aria-label="Archive telemetry" className="max-w-[1360px] mx-auto px-6 mb-16">
          <div className="mb-3 flex items-center gap-2 text-xs text-[#A9AEC5]">
            <ShieldCheck className="h-4 w-4 text-[#F9B17A]" />
            <span>Community preserved heritage metrics</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              [stats.totalRecordingsCount.toLocaleString(), "Preserved Recordings"],
              [stats.languagesCovered.toLocaleString(), "Indigenous Tongues"],
              [stats.wordCount.toLocaleString(), "Transcript Words"],
              [duration, "Lossless Audio Saved"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-5 backdrop-blur-xl">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white">{value}</span>
                <span className="mt-1 block text-xs text-[#A9AEC5] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 11. FEATURED STORY CARDS GRID */}
        <section className="story-section">
          <div className="section-heading flex items-end justify-between">
            <div>
              <span>DISCOVER</span>
              <h2>Featured Oral Heritage</h2>
            </div>
            <Link href="/archive" className="text-xs font-semibold text-[#F9B17A] hover:underline hidden sm:inline-flex items-center gap-1">
              <span>View all {stories.length} stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="story-grid">
            {stories.slice(0, 6).map((story, idx) => {
              const isPlaying = playingCardId === story.id;
              const icons = ["🌾", "🌲", "🌿", "🌊", "⛰️", "🔥"];
              const icon = icons[idx % icons.length];

              return (
                <div key={story.id} className="story-card">
                  <div className="story-card-image flex items-center justify-center relative">
                    <div className="text-5xl opacity-80">{icon}</div>
                    <button
                      type="button"
                      onClick={(e) => toggleCardAudio(story, e)}
                      aria-label={isPlaying ? "Pause audio" : "Play audio"}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#F9B17A] text-[#242942] grid place-items-center shadow-lg hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#242942]/80 backdrop-blur-md text-[#D9D9E2] border border-white/10">
                      {story.duration}
                    </span>
                  </div>

                  <div className="story-card-content">
                    <span className="story-card-meta">
                      {story.language} · {story.location || story.community || "Heritage"}
                    </span>
                    <h3>{story.title}</h3>
                    <p className="line-clamp-2">
                      {story.culturalContext || story.originalTranscript || "Oral tradition recorded and preserved in community custody."}
                    </p>

                    <div className="pt-4 mt-auto border-t border-white/8 flex items-center justify-between text-xs">
                      <span className="text-[#A9AEC5]">
                        {story.type || "Oral Tradition"}
                      </span>
                      <Link
                        href={`/story/${story.id}`}
                        className="text-[#F9B17A] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Listen & Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ALL-IN-ONE HERITAGE STUDIO */}
        <section id="studio" aria-label="All-in-One Studio" className="max-w-[1360px] mx-auto px-6 py-12 mb-16">
          <div className="mb-8 text-center space-y-2">
            <span className="eyebrow">
              VOICE ROOTS STUDIO
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Record, Upload, Translate & Preserve
            </h2>
            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#A9AEC5] leading-relaxed">
              Capture live voice or upload recordings to generate phonetic transcripts in 13+ languages and issue cryptographic Heritage Passports.
            </p>
          </div>
          <RecordingStudio onSaved={() => setStats(getStorageStats())} />
        </section>

        {/* MASTER PORTAL FOOTER LINK BAR */}
        <section className="max-w-[1360px] mx-auto px-6 mb-16">
          <div className="p-8 rounded-3xl bg-[rgba(66,71,108,0.25)] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="eyebrow">MASTER PROJECT FLOW & VERIFICATION</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Explore the 26-Step Heritage Journey
              </h3>
              <p className="text-xs text-[#A9AEC5] mt-1">
                View all pages, QR codes, authentication portals, and cryptographic proofs in one directory.
              </p>
            </div>
            <Link
              href="/links"
              className="vr-button vr-button-primary shrink-0 text-xs font-bold"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              <span>All 26 Steps & Features</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="max-w-[1360px] mx-auto border-t border-white/10 px-6 py-10 text-xs text-[#A9AEC5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>🌿 Voice Roots · Oral Heritage Kept in Community Hands.</div>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-[#F9B17A]">Sign In</Link>
          <Link href="/preserve" className="hover:text-[#F9B17A]">Preserve</Link>
          <Link href="/archive" className="hover:text-white">Archive</Link>
          <Link href="/links" className="hover:text-[#F9B17A]">Links</Link>
        </div>
      </footer>
    </div>
  );
}
