"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AudioLines, BookOpen, Mic, Search, ShieldCheck, Sparkles, Play, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { formatCardMetadata } from "@/lib/indiaGeoData";

import { StoryCardAudioButton } from "@/components/audio/StoryCardAudioButton";

export default function ArchivePage() {
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");

  useEffect(() => {
    setRecords(getUserRecordings());
  }, []);

  const languages = useMemo(
    () => Array.from(new Set(records.map((record) => record.language))).sort(),
    [records]
  );

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const matchesLanguage = language === "all" || record.language === language;
      const needle = search.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        [
          record.title,
          record.language,
          record.dialect,
          record.community,
          record.location,
          record.originalTranscript,
          record.culturalContext,
        ].some((value) => value?.toLowerCase().includes(needle));
      return matchesLanguage && matchesSearch;
    });
  }, [records, search, language]);

  return (
    <div className="vr-app pb-28">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">
              LIVING CULTURAL ARCHIVE · STEP 04 / 26
            </span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Oral Heritage Archive
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#D9D9E2]">
              Browse authentic spoken traditions, regional dialects, and community wisdom preserved with their original audio and multilingual transcriptions.
            </p>
          </div>

          <Link
            href="/preserve"
            className="vr-button vr-button-primary shrink-0 text-xs sm:text-sm font-bold"
          >
            <Mic className="h-4 w-4" /> Preserve a Voice
          </Link>
        </header>

        {/* Search & Language Filters */}
        <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.25)] backdrop-blur-xl shadow-xl space-y-4">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9AEC5]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by story title, dialect, clan, location, or spoken words..."
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#42476C]/60 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#A9AEC5]/60 focus:border-[#F9B17A]"
            />
          </label>

          {languages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="mr-1 text-xs font-semibold text-[#A9AEC5]">Filter Language:</span>
              <button
                type="button"
                onClick={() => setLanguage("all")}
                className={`min-h-8 rounded-full px-4 text-xs font-semibold transition ${
                  language === "all"
                    ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                    : "border border-white/10 text-[#A9AEC5] hover:text-white hover:bg-white/5"
                }`}
              >
                All Languages ({records.length})
              </button>
              {languages.map((item) => {
                const count = records.filter((r) => r.language === item).length;
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setLanguage(item)}
                    className={`min-h-8 rounded-full px-4 text-xs font-semibold transition ${
                      language === item
                        ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                        : "border border-white/10 text-[#A9AEC5] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[#A9AEC5] px-1">
          <span>Showing {filtered.length} oral heritage {filtered.length === 1 ? "story" : "stories"}</span>
          <span className="inline-flex items-center gap-1.5 text-[#F9B17A]">
            <ShieldCheck className="h-3.5 w-3.5" /> High-Fidelity Audio Preserved
          </span>
        </div>

        {/* Story Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl p-12 text-center border border-white/10 bg-[rgba(66,71,108,0.2)]">
            <AudioLines className="h-10 w-10 text-[#A9AEC5]/60" />
            <h2 className="text-lg font-semibold text-white">No recordings match this filter</h2>
            <p className="max-w-md text-xs text-[#A9AEC5]">
              Try searching for a different language or keyword, or contribute a new oral recording.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLanguage("all");
              }}
              className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((record) => (
              <div
                key={record.id}
                className="group flex min-h-[260px] flex-col justify-between rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F9B17A]/40 hover:bg-[rgba(66,71,108,0.4)] hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full border border-[#F9B17A]/40 bg-[#F9B17A]/15 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-bold text-[#F9B17A] tracking-wider uppercase truncate max-w-[220px]">
                      {formatCardMetadata(record)}
                    </span>
                    <span className="font-mono text-[#A9AEC5]">{record.duration}</span>
                  </div>

                  <Link href={`/story/${record.id}`} className="block group/link">
                    <h2 className="line-clamp-2 text-lg font-bold text-white group-hover/link:text-[#F9B17A] transition">
                      {record.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#A9AEC5]">
                      {record.culturalContext || "Spoken heritage recording preserved in native tongue."}
                    </p>
                  </Link>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#A9AEC5]">
                  <StoryCardAudioButton record={record} />

                  <Link
                    href={`/story/${record.id}`}
                    className="inline-flex items-center gap-1 text-[#F9B17A] font-semibold hover:underline"
                  >
                    <span>View Story</span> <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AIAssistant />
    </div>
  );
}
