"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Search as SearchIcon, Sparkles, Play, ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  language: string;
  similarity: number;
  matchedSegment: string;
  translation: string;
  speaker: string;
  duration: string;
}

const SAMPLE_SEMANTIC_RESULTS: SearchResult[] = [
  {
    id: "vr-101",
    title: "Traditional Harvest & Rain Ceremony Song",
    language: "Telugu (Tribal Dialect)",
    similarity: 0.942,
    matchedSegment: "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట ఇది...",
    translation: "This is the traditional melody elders sing before monsoon rains, invoking the soil before sowing...",
    speaker: "Speaker 1 (Elder)",
    duration: "08:42",
  },
  {
    id: "vr-201",
    title: "Seed Preservation in Mud Granaries",
    language: "Telugu (Rayalaseema)",
    similarity: 0.891,
    matchedSegment: "పాతకాలం నాటి విత్తనాలను మట్టి గాదెలలో భద్రపరిచే సాంప్రదాయం...",
    translation: "The ancestral practice of safeguarding indigenous millet varieties in earthen granaries...",
    speaker: "Speaker 2 (Farmer)",
    duration: "09:12",
  },
  {
    id: "vr-203",
    title: "Cloud Reading & Wind Signs for Sowing",
    language: "Kannada (Deccan)",
    similarity: 0.854,
    matchedSegment: "ಮಳೆ ಬರುವ ಮುನ್ನ ಬೀಸುವ ಗಾಳಿಯ ದಿಕ್ಕು ಮತ್ತು ಮೋಡಗಳ ಚಲನೆಯನ್ನು ಗುರುತಿಸುವುದು...",
    translation: "Observing changes in wind currents and thunder hues to determine the ideal morning for tilling...",
    speaker: "Speaker 1 (Village Astronomer)",
    duration: "07:50",
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("farming and harvest traditions");
  const [results, setResults] = useState<SearchResult[]>(SAMPLE_SEMANTIC_RESULTS);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setResults(SAMPLE_SEMANTIC_RESULTS);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-28">
      <Navbar />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-netflix-red/10 border border-netflix-red/30 text-netflix-red text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-netflix-red" />
            <span>AI Semantic Vector Search (pgvector + Multilingual Embeddings)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Search by Meaning, Not Just Words
          </h1>

          <p className="text-netflix-gray text-sm max-w-xl mx-auto leading-relaxed">
            Query across oral dialect recordings in English or Indian languages. The vector model finds concepts even when exact words differ.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <div className="ios27-glass p-2 rounded-full border border-white/10 flex items-center shadow-2xl focus-within:border-netflix-red/60 focus-within:ring-1 focus-within:ring-netflix-red/30 transition-all">
            <SearchIcon className="w-5 h-5 text-netflix-gray ml-4 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="e.g. traditional farming stories, eclipse myths, herbal tea..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder:text-netflix-muted pr-4"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full ios27-button-primary font-bold text-xs transition-transform hover:scale-105 active:scale-95 flex-shrink-0 shadow-netflix-glow"
            >
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-netflix-gray">Try searching:</span>
          {["Rain and agriculture ceremonies", "Handloom weaving techniques", "Forest herbs for fevers", "Grandmother folk legends"].map(
            (term, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(term);
                  setResults(SAMPLE_SEMANTIC_RESULTS);
                }}
                className="px-3.5 py-1.5 rounded-full ios27-pill hover:bg-white/15 text-netflix-light hover:text-white transition-all text-xs"
              >
                {term}
              </button>
            )
          )}
        </div>

        {/* Results Stream */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between text-xs font-mono text-netflix-gray">
            <span>
              {isSearching ? "Computing cosine distance across 4,821 transcripts..." : `Found ${results.length} semantic matches`}
            </span>
            <span className="text-netflix-red font-semibold">Sorted by pgvector distance</span>
          </div>

          <div className="space-y-4">
            {results.map((item) => (
              <div
                key={item.id}
                className="ios27-glass p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-netflix-red/50 space-y-4 transition-all shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-netflix-red/15 border border-netflix-red/30 text-white text-[11px] font-mono font-medium">
                        {item.language}
                      </span>
                      <span className="text-xs text-netflix-gray">{item.speaker}</span>
                      <span className="text-xs font-mono text-netflix-gray">• {item.duration}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white hover:text-netflix-red transition-colors">{item.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="px-3 py-1 rounded-full bg-netflix-red/20 border border-netflix-red/40 text-netflix-red text-xs font-mono font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{(item.similarity * 100).toFixed(1)}% Match</span>
                    </div>
                  </div>
                </div>

                {/* Excerpts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-netflix-red uppercase font-bold block">Matched Oral Text</span>
                    <p className="text-white/90 leading-relaxed font-sans">{item.matchedSegment}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono text-cultural-gold uppercase font-bold block">IndicTrans2 Translation</span>
                    <p className="text-netflix-gray leading-relaxed font-sans italic">{item.translation}</p>
                  </div>
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button className="flex items-center gap-1.5 text-xs text-netflix-gray hover:text-white transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current text-netflix-red" />
                    <span>Play Audio Segment</span>
                  </button>

                  <Link
                    href={`/archive`}
                    className="flex items-center gap-1 text-xs text-netflix-red hover:underline font-semibold"
                  >
                    <span>View Full Recording & Metadata</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
