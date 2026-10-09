"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

export default function SearchPage() {
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => setRecords(getUserRecordings()), []);

  const results = useMemo(() => {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return records.filter((record) => {
      const source = [
        record.title,
        record.language,
        record.dialect,
        record.community,
        record.location,
        record.originalTranscript,
        record.culturalContext,
        ...Object.values(record.translations || {}),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return words.some((word) => source.includes(word));
    });
  }, [query, records]);

  return (
    <div className="vr-app pb-24">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 pt-10 sm:px-6 lg:px-8">
        <header>
          <span className="eyebrow">
            SEARCH & DISCOVERY · STEP 05 / 26
          </span>
          <h1 className="mt-1 text-3xl font-extrabold text-white">Search Living Archive</h1>
          <p className="mt-2 text-sm text-[#D9D9E2]">
            Search titles, source transcripts, contributor notes, and saved translations across all community recordings.
          </p>
        </header>

        <label className="relative block">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9AEC5]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, words, elder name, dialect, or location..."
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-[#42476C]/60 pl-11 pr-4 text-sm text-white outline-none placeholder:text-[#A9AEC5]/60 focus:border-[#F9B17A]"
          />
        </label>

        {!query.trim() ? (
          <p className="text-sm text-[#A9AEC5]">{records.length} recordings available in this community repository.</p>
        ) : results.length ? (
          <>
            <p className="text-sm text-[#A9AEC5]">
              {results.length} matching {results.length === 1 ? "story" : "stories"}
            </p>
            <div className="space-y-3">
              {results.map((record) => (
                <Link
                  key={record.id}
                  href={`/story/${record.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl p-4 sm:p-5 border border-white/10 bg-[rgba(66,71,108,0.25)] hover:border-[#F9B17A]/40 hover:bg-[rgba(66,71,108,0.4)] transition"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-white text-base">{record.title}</span>
                    <span className="mt-1 block text-xs text-[#F9B17A] font-semibold">{record.language} · {record.duration}</span>
                    <span className="mt-2 block line-clamp-2 text-sm text-[#A9AEC5]">
                      {record.originalTranscript || record.culturalContext || "No transcript or context has been added."}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#F9B17A]" />
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.2)] text-center text-sm text-[#A9AEC5]">
            No records matched &ldquo;{query}&rdquo;. Try another dialect or term.
          </div>
        )}
      </main>
      <AIAssistant />
    </div>
  );
}
