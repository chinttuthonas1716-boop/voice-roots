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
      const source = [record.title, record.language, record.dialect, record.community, record.location, record.originalTranscript, record.culturalContext, ...Object.values(record.translations || {})].filter(Boolean).join(" ").toLocaleLowerCase();
      return words.some((word) => source.includes(word));
    });
  }, [query, records]);

  return <div className="min-h-screen bg-obsidian pb-24 text-primary-text"><Navbar /><main className="mx-auto max-w-5xl space-y-6 px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
    <header><p className="text-xs font-medium uppercase tracking-[0.18em] text-leaf-green">This device</p><h1 className="mt-1 text-3xl font-semibold text-white">Search your archive</h1><p className="mt-2 text-sm text-secondary-text">Search titles, source transcripts, contributor notes, and saved translations. This is text search, not semantic AI retrieval.</p></header>
    <label className="relative block"><SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What would you like to find?" className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none placeholder:text-secondary-text/70 focus:border-root-green/50" /></label>
    {!query.trim() ? <p className="text-sm text-secondary-text">{records.length} recordings available in this browser.</p> : results.length ? <><p className="text-sm text-secondary-text">{results.length} matching {results.length === 1 ? "story" : "stories"}</p><div className="space-y-3">{results.map((record) => <Link key={record.id} href={`/recordings/${record.id}`} className="glass-card flex items-center justify-between gap-4 rounded-2xl p-4 sm:p-5"><span className="min-w-0"><span className="block truncate font-medium text-white">{record.title}</span><span className="mt-1 block text-xs text-secondary-text">{record.language} · {record.duration}</span><span className="mt-2 block line-clamp-2 text-sm text-secondary-text">{record.originalTranscript || record.culturalContext || "No transcript or context has been added."}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-leaf-green" /></Link>)}</div></> : <p role="status" className="rounded-2xl border border-white/10 p-5 text-sm text-secondary-text">No saved stories match this search.</p>}
  </main><AIAssistant /></div>;
}
