"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Mic, Upload, Languages, Play, Pause, ArrowRight } from "lucide-react";
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

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-10">
        {/* Short Greeting */}
        <section className="text-center space-y-3 pt-4 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
            Welcome to Voice Roots
          </h1>
          <p className="text-base sm:text-lg text-[#94A3B8] max-w-xl mx-auto">
            Preserve and understand spoken voices in indigenous and regional languages.
          </p>
        </section>

        {/* 3 Big Glass Buttons */}
        <section aria-label="Main actions" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/record"
            className="glass-card flex flex-col items-center justify-center gap-3 p-6 min-h-[120px] text-center border-amber-500/30 hover:border-amber-400 group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-[#F59E0B] group-hover:scale-105 transition-transform">
              <Mic className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F8FAFC]">Record</span>
              <span className="block text-xs text-[#94A3B8] mt-0.5">Capture live voice</span>
            </div>
          </Link>

          <Link
            href="/upload"
            className="glass-card flex flex-col items-center justify-center gap-3 p-6 min-h-[120px] text-center group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#F8FAFC] group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F8FAFC]">Upload</span>
              <span className="block text-xs text-[#94A3B8] mt-0.5">Add an audio file</span>
            </div>
          </Link>

          <Link
            href="/translate"
            className="glass-card flex flex-col items-center justify-center gap-3 p-6 min-h-[120px] text-center group"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-500/15 text-teal-400 group-hover:scale-105 transition-transform">
              <Languages className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-lg font-bold text-[#F8FAFC]">Translate</span>
              <span className="block text-xs text-[#94A3B8] mt-0.5">Across 13 languages</span>
            </div>
          </Link>
        </section>

        {/* Your Recent Recordings (Max 3) */}
        <section aria-label="Recent recordings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#F8FAFC]">Your recent recordings</h2>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#F59E0B] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentRecordings.length === 0 ? (
            <div className="glass-card p-8 text-center space-y-2">
              <p className="text-base text-[#F8FAFC] font-medium">No recordings yet.</p>
              <p className="text-sm text-[#94A3B8]">
                Press Record or Upload above to save your first spoken story.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecordings.map((recording) => {
                const isPlaying = playingId === recording.id;
                return (
                  <div
                    key={recording.id}
                    className="glass-card p-4 sm:p-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-[#F8FAFC] truncate">
                        {recording.title}
                      </h3>
                      <p className="text-sm text-[#94A3B8] mt-0.5">
                        {recording.language} · {recording.duration}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(recording)}
                        className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-[#F8FAFC] hover:bg-white/10 transition"
                        aria-label={isPlaying ? `Pause ${recording.title}` : `Play ${recording.title}`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4 text-[#F59E0B]" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 text-[#F59E0B] fill-current" />
                            <span>Play</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/passport/${recording.id}`}
                        className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/10 transition"
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
      </main>
    </div>
  );
}
