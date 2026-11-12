"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, Search, Send, Sparkles, X } from "lucide-react";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { useAppLanguage } from "@/lib/languageContext";

type Match = { record: StoredVoiceRecord; excerpt: string };

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const { appLanguage } = useAppLanguage();
  const localeName = useMemo(() => ({ en: "English", te: "తెలుగు", hi: "हिन्दी", ta: "தமிழ்", kn: "ಕನ್ನಡ", ml: "മലയാളം" }[appLanguage]), [appLanguage]);

  const searchArchive = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    const found = getUserRecordings().flatMap((record) => {
      const haystack = [record.title, record.language, record.dialect, record.community, record.location, record.originalTranscript, record.culturalContext, ...Object.values(record.translations || {})].filter(Boolean).join(" ");
      const normalized = haystack.toLocaleLowerCase();
      if (!words.some((word) => normalized.includes(word))) return [];
      const selectedTranslation = record.translations?.[appLanguage];
      return [{ record, excerpt: selectedTranslation || record.originalTranscript || record.culturalContext || record.title }];
    }).slice(0, 5);
    setMatches(found);
  };

  return (
    <>
      {!isOpen && <button type="button" onClick={() => setIsOpen(true)} aria-haspopup="dialog" aria-expanded={false} className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-root-green/30 bg-[#18211c]/95 px-4 text-sm font-semibold text-leaf-green shadow-lg backdrop-blur-xl transition hover:bg-[#202d25] sm:bottom-6 sm:right-6"><Sparkles className="h-4 w-4" /><span>Ask Voice Roots</span></button>}

      {isOpen && <>
        <button type="button" aria-label="Close archive assistant" onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] sm:hidden" />
        <section role="dialog" aria-modal="true" aria-labelledby="assistant-title" className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex max-h-[78dvh] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#111713]/95 shadow-2xl backdrop-blur-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[min(420px,calc(100vw-2rem))]">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
            <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl border border-root-green/25 bg-root-green/10 text-leaf-green"><Bot className="h-4 w-4" /></span><div><h2 id="assistant-title" className="text-sm font-semibold text-white">Voice Roots archive search</h2><p className="text-[11px] text-secondary-text">App language: {localeName}</p></div></div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full text-secondary-text hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
            <p className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] p-3.5 leading-relaxed text-secondary-text">Ask about a saved story. This build can search transcripts and contributor context on this device; a generative AI provider is not connected, so it will not invent an answer.</p>
            {matches && (matches.length ? <div className="space-y-2"><p className="text-xs text-secondary-text">Archive matches · text search</p>{matches.map(({ record, excerpt }) => <Link key={record.id} href={`/recordings/${record.id}`} className="block rounded-2xl border border-root-green/15 bg-root-green/[0.04] p-3.5 transition hover:bg-root-green/[0.08]"><span className="block text-xs font-medium text-leaf-green">{record.title} · {record.language}</span><span className="mt-1 block line-clamp-3 text-sm leading-relaxed text-white/85">{excerpt}</span><span className="mt-2 block text-[11px] text-secondary-text">Open source story →</span></Link>)}</div> : <p role="status" className="rounded-2xl border border-white/10 p-3.5 text-sm text-secondary-text">No matching saved record was found. Try a title, language, transcript word, or contributor name.</p>)}
            <p className="text-[11px] leading-relaxed text-secondary-text/80">A language-specific AI response will be available when a real provider is configured. Any matches shown here are source material, not generated conclusions.</p>
          </div>

          <form onSubmit={searchArchive} className="flex items-center gap-2 border-t border-white/10 bg-black/20 p-3">
            <label className="sr-only" htmlFor="archive-question">Ask about your saved archive</label>
            <input id="archive-question" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved stories…" className="min-h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-secondary-text/75 focus:border-root-green/50" />
            <button type="submit" disabled={!query.trim()} aria-label="Search archive" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-root-green text-obsidian disabled:opacity-40"><Search className="h-4 w-4" /></button>
          </form>
        </section>
      </>}
    </>
  );
}
