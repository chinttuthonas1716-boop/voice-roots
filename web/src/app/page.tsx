"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Mic, Upload, Languages, Play, Pause, ArrowRight, BookOpen, ShieldCheck, TreePine, Sparkles } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

export default function HomePage() {
  const [recentRecordings, setRecentRecordings] = useState<StoredVoiceRecord[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const all = getUserRecordings();
    setRecentRecordings(all.slice(0, 3));
  }, []);

  const handleTogglePlay = (record: StoredVoiceRecord) => {
    const src = record.audioUrl || `/audio/${record.audioFileName}`;

    if (playingId === record.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(src);
    audioRef.current.onended = () => setPlayingId(null);
    audioRef.current.onerror = () => setPlayingId(null);

    audioRef.current.play().then(() => {
      setPlayingId(record.id);
    }).catch((e) => {
      console.warn("Audio play blocked", e);
      setPlayingId(null);
    });
  };

  return (
    <div className="min-h-screen pb-24 pt-20">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10 space-y-12">
        {/* Cinematic Misty Forest Hero (Reference: Image 1) */}
        <section className="relative text-center space-y-6 pt-6 sm:pt-12 px-4">
          {/* Ambient Ethereal Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#A6C48A]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          {/* Micro Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102B20]/80 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="tracking-wide">INDIGENOUS ORAL HERITAGE & AI PRESERVATION</span>
          </div>

          {/* Lowercase Iconic Hero Typography: voice roots. */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[#F5F3E9] font-sans">
            voice roots<span className="text-[#A6C48A]">.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#A6C48A]/90 max-w-2xl mx-auto font-light leading-relaxed">
            Voice Roots is a community-owned platform that roots oral languages in text with AI.
            Preserving spoken stories across Gondi, Koya, Santhali, and Lambadi.
          </p>

          {/* Micro Badge Indicators (Reference: Image 1 bottom row) */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-medium text-[#F5F3E9]/80">
            <div className="flex items-center gap-2 bg-[#102B20]/60 border border-[#A6C48A]/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span className="font-bold text-[#A6C48A] border border-[#A6C48A]/40 rounded-full px-1.5 py-0.5 text-[10px]">OCAP</span>
              <span className="tracking-wider uppercase text-[11px]">COMMUNITY SOVEREIGNTY</span>
            </div>
            <div className="flex items-center gap-2 bg-[#102B20]/60 border border-[#A6C48A]/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <ShieldCheck className="h-4 w-4 text-[#A6C48A]" />
              <span className="tracking-wider uppercase text-[11px]">PRESERVE ROOTS</span>
            </div>
            <div className="flex items-center gap-2 bg-[#102B20]/60 border border-[#A6C48A]/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <TreePine className="h-4 w-4 text-[#A6C48A]" />
              <span className="tracking-wider uppercase text-[11px]">IMMUTABLE AUDIO</span>
            </div>
          </div>
        </section>

        {/* 4 Frosted Action Cards */}
        <section aria-label="Main actions" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/record"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1F5138] border border-[#A6C48A]/30 text-[#F5F3E9] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Record</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Capture live oral voice</span>
            </div>
          </Link>

          <Link
            href="/upload"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#163B2C] border border-[#A6C48A]/20 text-[#A6C48A] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Upload</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Add an archival audio file</span>
            </div>
          </Link>

          <Link
            href="/translate"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#163B2C] border border-[#A6C48A]/20 text-[#A6C48A] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <Languages className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Translate</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Honest AI & elder review</span>
            </div>
          </Link>

          <Link
            href="/dictionary"
            className="forest-glass-panel flex flex-col items-center justify-center gap-3 p-6 text-center hover:border-[#A6C48A]/60 group transition-all"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#163B2C] border border-[#A6C48A]/20 text-[#A6C48A] group-hover:scale-105 group-hover:bg-[#A6C48A] group-hover:text-[#102B20] transition-all">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F5F3E9]">Dictionary</span>
              <span className="block text-xs text-[#A6C48A]/80 mt-0.5">Explore 4 indigenous lexicons</span>
            </div>
          </Link>
        </section>

        {/* Your Recent Recordings Section */}
        <section aria-label="Recent recordings" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-[#F5F3E9] flex items-center gap-2">
              <TreePine className="h-5 w-5 text-[#A6C48A]" />
              <span>Your recent recordings</span>
            </h2>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#A6C48A] hover:text-[#F5F3E9] flex items-center gap-1.5 transition"
            >
              <span>My recordings</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentRecordings.length === 0 ? (
            <div className="forest-glass-panel p-8 sm:p-10 text-center space-y-3">
              <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-[#1F5138]/40 border border-[#A6C48A]/30 text-[#A6C48A] mx-auto text-xl">
                🌲
              </div>
              <p className="text-base text-[#F5F3E9] font-medium">No recordings saved in local session yet.</p>
              <p className="text-sm text-[#A6C48A]/80 max-w-md mx-auto">
                Press Record or Upload above to save your first spoken story in Gondi, Koya, Santhali, or Lambadi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecordings.map((recording) => {
                const isPlaying = playingId === recording.id;
                return (
                  <div
                    key={recording.id}
                    className="forest-glass-panel p-4 sm:p-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-[#F5F3E9] truncate">
                        {recording.title}
                      </h3>
                      <p className="text-sm text-[#A6C48A]/80 mt-0.5">
                        {recording.language} · {recording.duration}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(recording)}
                        className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full border border-[#A6C48A]/30 bg-[#1F5138] text-sm font-semibold text-[#F5F3E9] hover:bg-[#A6C48A] hover:text-[#102B20] transition-all"
                        aria-label={isPlaying ? `Pause ${recording.title}` : `Play ${recording.title}`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 fill-current" />
                            <span>Play</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/passport/${recording.id}`}
                        className="inline-flex items-center gap-1 min-h-[44px] px-3.5 rounded-full border border-[#A6C48A]/25 bg-white/5 text-sm font-medium text-[#A6C48A] hover:text-[#F5F3E9] hover:bg-white/10 transition"
                      >
                        <span>Passport</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer Statement (Reference: Image 1) */}
        <footer className="text-center text-xs text-[#A6C48A]/60 pt-8 pb-4 space-y-1">
          <p className="font-medium text-[#F5F3E9]/75">Stay rooted whenever, wherever.</p>
          <p>Voice Roots © 2026. Preserving oral heritage under OCAP® principles.</p>
        </footer>
      </main>
    </div>
  );
}
