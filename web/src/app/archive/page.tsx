"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AudioLines, BookOpen, Mic, Search, ShieldCheck, Sparkles, Play, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

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
    <div className="min-h-screen bg-obsidian pb-28 text-primary-text">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-root-green/30 bg-root-green/10 px-3 py-1 text-xs font-semibold text-leaf-green">
              <Sparkles className="h-3.5 w-3.5" /> Living Cultural Archive
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Oral Heritage Archive
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-secondary-text">
              Browse authentic spoken traditions, regional dialects, and community wisdom preserved with their original audio and multilingual transcriptions.
            </p>
          </div>

          <Link
            href="/record"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-root-green px-6 text-sm font-bold text-obsidian shadow-glow hover:bg-leaf-green transition sm:self-auto"
          >
            <Mic className="h-4 w-4" /> Record a Story
          </Link>
        </header>

        {/* Search & Language Filters */}
        <div className="glass-surface space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-xl">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by story title, dialect, clan, location, or spoken words..."
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-4 text-sm text-white outline-none placeholder:text-secondary-text/70 focus:border-root-green"
            />
          </label>

          {languages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="mr-1 text-xs font-semibold text-secondary-text">Filter Language:</span>
              <button
                type="button"
                onClick={() => setLanguage("all")}
                className={`min-h-8 rounded-full px-4 text-xs font-semibold transition ${
                  language === "all"
                    ? "bg-root-green text-obsidian shadow-glow"
                    : "border border-white/10 text-secondary-text hover:text-white hover:bg-white/5"
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
                        ? "bg-root-green text-obsidian shadow-glow"
                        : "border border-white/10 text-secondary-text hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-secondary-text px-1">
          <span>Showing {filtered.length} oral heritage {filtered.length === 1 ? "story" : "stories"}</span>
          <span className="inline-flex items-center gap-1.5 text-leaf-green">
            <ShieldCheck className="h-3.5 w-3.5" /> High-Fidelity Audio Preserved
          </span>
        </div>

        {/* Story Grid */}
        {filtered.length === 0 ? (
          <div className="glass-surface flex flex-col items-center justify-center gap-4 rounded-3xl p-12 text-center">
            <AudioLines className="h-10 w-10 text-secondary-text/60" />
            <h2 className="text-lg font-semibold text-white">No recordings match this filter</h2>
            <p className="max-w-md text-xs text-secondary-text">
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
              <Link
                key={record.id}
                href={`/recordings/${record.id}`}
                className="glass-card group flex min-h-[260px] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-root-green/40 hover:bg-white/[0.06] hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-secondary-text">
                    <span className="rounded-full border border-root-green/30 bg-root-green/15 px-3 py-1 font-semibold text-leaf-green">
                      {record.language}
                    </span>
                    <span className="font-mono text-secondary-text">{record.duration}</span>
                  </div>

                  <div>
                    <h2 className="line-clamp-2 text-lg font-bold text-white group-hover:text-leaf-green transition">
                      {record.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-secondary-text">
                      {record.culturalContext || "Spoken heritage recording preserved in native tongue."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-secondary-text">
                  <span className="inline-flex items-center gap-1.5 truncate max-w-[180px]">
                    <BookOpen className="h-3.5 w-3.5 text-leaf-green shrink-0" />
                    <span className="truncate">{record.community || record.location || "Community Lore"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-leaf-green font-semibold">
                    Listen & View <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <AIAssistant />
    </div>
  );
}
