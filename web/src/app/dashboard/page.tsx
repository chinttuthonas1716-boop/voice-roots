"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, Play, Pause, Mic, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

export default function DashboardPage() {
  const [recordings, setRecordings] = useState<StoredVoiceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRecordings(getUserRecordings());
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

  const filtered = recordings.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.language.toLowerCase().includes(q) ||
      (r.community && r.community.toLowerCase().includes(q))
    );
  });

  const getPlainStatus = (record: StoredVoiceRecord): string => {
    if (record.isUserUploaded) return "Waiting for review";
    return "Verified";
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return "Recent";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-20">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
              My recordings
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">
              {recordings.length} {recordings.length === 1 ? "voice story" : "voice stories"} preserved.
            </p>
          </div>

          <Link href="/record" className="btn-primary self-start sm:self-auto">
            <Mic className="h-4 w-4" />
            <span>Record voice</span>
          </Link>
        </div>

        {/* Search Box */}
        <div className="relative">
          <label htmlFor="search-recordings" className="sr-only">
            Search recordings
          </label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
          <input
            id="search-recordings"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, language, or community..."
            className="w-full min-h-[48px] rounded-xl border border-white/15 bg-white/5 pl-11 pr-4 text-base text-[#F8FAFC] placeholder-[#94A3B8] focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
          />
        </div>

        {/* Simple List */}
        {filtered.length === 0 ? (
          <div className="glass-card p-10 text-center space-y-3">
            <p className="text-base font-semibold text-[#F8FAFC]">No recordings found</p>
            <p className="text-sm text-[#94A3B8]">
              {searchQuery
                ? `No results matching "${searchQuery}". Clear search or try another keyword.`
                : "You don't have any recordings yet. Record your voice or upload a file."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="btn-glass mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record) => {
              const isPlaying = playingId === record.id;
              const statusText = getPlainStatus(record);

              return (
                <div
                  key={record.id}
                  className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#F8FAFC] truncate">
                        {record.title}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[#94A3B8] shrink-0">
                        {statusText}
                      </span>
                    </div>
                    <p className="text-sm text-[#94A3B8]">
                      {record.language} · {formatDate(record.uploadDate)} · {record.duration}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(record)}
                      className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-[#F8FAFC] hover:bg-white/10 transition"
                      aria-label={isPlaying ? `Pause ${record.title}` : `Play ${record.title}`}
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
                      href={`/passport/${record.id}`}
                      className="inline-flex items-center gap-1 min-h-[44px] px-3.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-[#F8FAFC] hover:bg-white/10 transition"
                    >
                      <span>Passport</span>
                      <ArrowRight className="h-4 w-4 text-[#94A3B8]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
