"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import {
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
} from "lucide-react";

export interface DictionaryItem {
  id: number;
  word: string;
  language_code: string;
  dialect?: string;
  native_script?: string;
  script_name?: string;
  ipa?: string;
  part_of_speech: string;
  meanings: string[];
  translations: Record<string, string>;
  alternate_spellings?: string[];
  dialect_variations?: Record<string, string>;
  audio_url?: string;
  audio_sha256?: string;
  etymology?: string;
  cultural_context?: string;
  is_elder_approved: boolean;
  status: string;
  approved_by?: string;
  approved_at?: string;
  contributor_name?: string;
  contributor_role?: string;
  provenance?: string;
  created_at?: string;
}

export interface DictionaryOverview {
  total_words: number;
  approved_words: number;
  pending_words: number;
  approval_rate_pct: number;
  words_with_audio: number;
  audio_coverage_pct: number;
  dialects_represented: number;
  by_language: Array<{ language_code: string; total: number; approved: number }>;
}

const CORE_LANGUAGES = [
  { code: "all", name: "All Tongues", native: "అన్నీ" },
  { code: "gon", name: "Gondi", native: "గోండీ / गॊंडी" },
  { code: "kff", name: "Koya", native: "కోయ" },
  { code: "sat", name: "Santhali", native: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "lmn", name: "Lambadi", native: "गोरमाटी / లంబాడీ" },
];

const FALLBACK_ENTRIES: DictionaryItem[] = [
  {
    id: 1,
    word: "persapen",
    language_code: "gon",
    dialect: "Adilabad Southern",
    native_script: "పెర్సాపేన్",
    script_name: "Telugu / Masaram Gondi",
    ipa: "/peːɾsaːpeːn/",
    part_of_speech: "sacred_term",
    meanings: [
      "Supreme ancestral deity and spiritual guardian of the Gond clans",
      "Divinity invoked during the annual clan gathering and harvest festivals",
    ],
    translations: {
      en: "Supreme Clan Deity",
      te: "గోండుల కుల దైవం",
      hi: "गोंड समुदाय के कुल देवता",
    },
    alternate_spellings: ["persa pen", "phersapen", "पेर्सापेन"],
    dialect_variations: {
      "Adilabad Southern": "persapen",
      "Betul Northern": "badadeo",
      "Bastar Eastern": "persapen",
    },
    audio_url: "/api/v1/audio/samples/gon_persapen.wav",
    etymology: "Dravidian root: *per- (great/grand) + *pen (spirit/deity).",
    cultural_context: "Venerated under sacred Mahua or Saja trees. Exclusive sacred invocation requiring elder guidance.",
    is_elder_approved: true,
    status: "approved",
    approved_by: "Adilabad Gondwana Elders Council",
    approved_at: "2026-08-15T00:00:00Z",
    provenance: "Attributed to Kotnak Jangu, elder storyteller, Keslapur Assembly, 2026-08.",
  },
  {
    id: 2,
    word: "koitur",
    language_code: "kff",
    dialect: "Godavari Valley",
    native_script: "కోయ్తూర్",
    script_name: "Telugu",
    ipa: "/koːjtuːɾ/",
    part_of_speech: "cultural_idiom",
    meanings: [
      "The people of the mountains and rivers; auto-ethnonym for the Koya and Gond peoples",
    ],
    translations: {
      en: "People of the Hills / Earth",
      te: "కొండ ప్రజలు / మూల వాసులు",
      hi: "पहाड़ी मूल निवासी",
    },
    alternate_spellings: ["koythur", "koyatur"],
    dialect_variations: {
      "Godavari Valley": "koitur",
      "Malkangiri Eastern": "koytor",
    },
    audio_url: "/api/v1/audio/samples/kff_koitur.wav",
    etymology: "Proto-Dravidian *kō- (mountain) + *tur (people).",
    cultural_context: "Affirms sacred communal identity linked to customary forest territories.",
    is_elder_approved: true,
    status: "approved",
    approved_by: "Bhadrachalam Koya Dora Sangham",
    provenance: "Attributed to Madivi Somulu, Bhadrachalam Agency, 2026.",
  },
  {
    id: 3,
    word: "sarjom",
    language_code: "sat",
    dialect: "Mayurbhanj Standard",
    native_script: "ᱥᱟᱨᱡᱚᱢ",
    script_name: "Ol Chiki",
    ipa: "/saːɾd͡ʒɔm/",
    part_of_speech: "noun",
    meanings: [
      "The sacred Sal tree (Shorea robusta), central to Santhal spiritual cosmology and Baha Parab",
    ],
    translations: {
      en: "Sal Tree (Shorea robusta)",
      te: "సాల వృక్షం",
      hi: "साल का पेड़",
    },
    alternate_spellings: ["sarjum", "साल"],
    dialect_variations: {
      "Mayurbhanj Standard": "sarjom",
      "Dumka Western": "sarjom",
    },
    audio_url: "/api/v1/audio/samples/sat_sarjom.wav",
    etymology: "Austroasiatic Munda botanical lexicon root.",
    cultural_context: "Inhabited by Jaher Era; blossom branches distributed during Baha floral festival.",
    is_elder_approved: true,
    status: "approved",
    approved_by: "Mayurbhanj Majhi Pargana Council",
    provenance: "Recorded at Baripada Spring Baha festival, Majhi elder assembly, 2026.",
  },
  {
    id: 4,
    word: "dhavlo",
    language_code: "lmn",
    dialect: "Deccan Banjara",
    native_script: "ధావ్‌లో / धावलो",
    script_name: "Telugu / Devanagari",
    ipa: "/d̪ʱaːʋloː/",
    part_of_speech: "cultural_idiom",
    meanings: [
      "Customary melancholic choral lamentation sung during community farewells and bridal departures",
    ],
    translations: {
      en: "Banjara Farewell Lamentation Song",
      te: "లంబాడీ వీడ్కోలు విలాప గీతం",
      hi: "बंजारा विदाई विलाप गीत",
    },
    alternate_spellings: ["dhavalo", "dhawlo"],
    dialect_variations: {
      "Deccan Banjara": "dhavlo",
      "Marathwada Lambani": "dhavla",
    },
    audio_url: "/api/v1/audio/samples/lmn_dhavlo.wav",
    etymology: "Indo-Aryan root related to traditional oral bridal lament ceremonies.",
    cultural_context: "Perpetuated exclusively by female singers during traditional marriages.",
    is_elder_approved: true,
    status: "approved",
    approved_by: "All India Banjara Seva Sangh Elders",
    provenance: "Recorded at Nalgonda Thanda assembly, 2026.",
  },
];

export default function DictionaryPage() {
  const [items, setItems] = useState<DictionaryItem[]>(FALLBACK_ENTRIES);
  const [overview, setOverview] = useState<DictionaryOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "proposed">("all");
  const [selectedPos, setSelectedPos] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Audio state
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchOverview();
    fetchDictionary();
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, [selectedLanguage, statusFilter, selectedPos]);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/v1/dictionary/overview");
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch {
      // Offline fallback
    }
  };

  const fetchDictionary = async (query = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedLanguage !== "all") params.set("language_code", selectedLanguage);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (selectedPos !== "all") params.set("category", selectedPos);
      params.set("limit", "100");

      const res = await fetch(`/api/v1/dictionary/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setItems(data.results);
        } else if (!query.trim() && selectedLanguage === "all" && statusFilter === "all" && selectedPos === "all") {
          setItems(FALLBACK_ENTRIES);
        } else {
          setItems([]);
        }
      }
    } catch {
      // Filter fallback locally
      let filtered = [...FALLBACK_ENTRIES];
      if (selectedLanguage !== "all") {
        filtered = filtered.filter((it) => it.language_code === selectedLanguage);
      }
      if (statusFilter === "approved") {
        filtered = filtered.filter((it) => it.is_elder_approved);
      } else if (statusFilter === "proposed") {
        filtered = filtered.filter((it) => !it.is_elder_approved);
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (it) =>
            it.word.toLowerCase().includes(q) ||
            (it.native_script && it.native_script.includes(q)) ||
            (it.meanings && it.meanings.some((m) => m.toLowerCase().includes(q))) ||
            (it.translations && Object.values(it.translations).some((t) => t.toLowerCase().includes(q)))
        );
      }
      setItems(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDictionary(searchQuery);
  };

  const playWordAudio = (item: DictionaryItem) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    if (playingId === item.id) {
      setPlayingId(null);
      return;
    }

    const audioUrl = item.audio_url || `/api/v1/dictionary/words/${item.id}/audio`;
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setPlayingId(item.id);

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.onerror = () => {
      setPlayingId(null);
    };

    audio.play().catch(() => {
      setPlayingId(null);
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case "gon":
        return "Gondi (గోండీ)";
      case "kff":
      case "koy":
        return "Koya (కోయ)";
      case "sat":
        return "Santhali (ᱥᱟᱱᱛᱟᱲᱤ)";
      case "lmn":
      case "lam":
        return "Lambadi (లంబాడీ)";
      default:
        return code.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F8FAFC] pb-24 pt-20">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left sm:flex sm:items-end sm:justify-between border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Multilingual Lexicon & Phrasebook</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Oral Tongues Dictionary
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl">
              Preserving verified indigenous headwords, phonetics, and cultural wisdom across Gondi,
              Koya, Santhali, and Lambadi with community elder provenance.
            </p>
          </div>

          {/* Quick Metrics */}
          {overview && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 sm:pt-0">
              <div className="glass-card px-3 py-2 text-center">
                <span className="block text-xl font-bold text-amber-400">{overview.total_words}</span>
                <span className="block text-[11px] text-[#94A3B8]">Total Words</span>
              </div>
              <div className="glass-card px-3 py-2 text-center">
                <span className="block text-xl font-bold text-emerald-400">{overview.approved_words}</span>
                <span className="block text-[11px] text-[#94A3B8]">Elder Verified</span>
              </div>
              <div className="glass-card px-3 py-2 text-center">
                <span className="block text-xl font-bold text-cyan-400">{overview.words_with_audio}</span>
                <span className="block text-[11px] text-[#94A3B8]">With Audio</span>
              </div>
              <div className="glass-card px-3 py-2 text-center">
                <span className="block text-xl font-bold text-purple-400">{overview.dialects_represented}</span>
                <span className="block text-[11px] text-[#94A3B8]">Dialects</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar & Primary Language Filters */}
        <div className="space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Latin word, native script, English, or Telugu meaning (e.g., persapen, పెర్సాపేన్, deity)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-white/15 bg-white/5 text-sm sm:text-base text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 backdrop-blur-md transition shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs sm:text-sm font-bold transition shadow-md"
            >
              Search
            </button>
          </form>

          {/* Language Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {CORE_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    isSelected
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-white/5 border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/10"
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className={`text-[11px] ${isSelected ? "text-black/80 font-bold" : "text-[#94A3B8]"}`}>
                    ({lang.native})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#94A3B8] font-medium flex items-center gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filter by:
              </span>

              {/* Status Filter */}
              <div className="inline-flex rounded-lg border border-white/15 p-0.5 bg-black/40">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-md transition ${
                    statusFilter === "all" ? "bg-white/20 text-white font-bold" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  All Entries
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("approved")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    statusFilter === "approved"
                      ? "bg-emerald-500/30 text-emerald-300 font-bold"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Elder Approved</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("proposed")}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                    statusFilter === "proposed"
                      ? "bg-amber-500/30 text-amber-300 font-bold"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <Clock className="h-3 w-3 text-amber-400" />
                  <span>Draft / Proposed</span>
                </button>
              </div>

              {/* Part of Speech Filter */}
              <select
                value={selectedPos}
                onChange={(e) => setSelectedPos(e.target.value)}
                className="bg-black/40 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-[#F8FAFC] focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Parts of Speech</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="sacred_term">Sacred Term</option>
                <option value="cultural_idiom">Cultural Idiom</option>
                <option value="kinship_term">Kinship Term</option>
              </select>
            </div>

            <div className="text-[#94A3B8] text-[11px]">
              Showing <strong className="text-white">{items.length}</strong> entries
            </div>
          </div>
        </div>

        {/* Entries Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-amber-400" />
            <p className="text-sm text-[#94A3B8]">Searching indigenous vocabulary index...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-4">
            <BookOpen className="h-10 w-10 mx-auto text-[#94A3B8]" />
            <div>
              <h3 className="text-base font-bold text-white">No dictionary entries found</h3>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">
                No matching lexicon entries found for the selected query and filters. Try clearing your search term or switching language filters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedLanguage("all");
                setStatusFilter("all");
                setSelectedPos("all");
              }}
              className="btn-glass text-xs mx-auto"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isPlaying = playingId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="glass-card p-5 sm:p-6 space-y-4 hover:border-amber-500/30 transition duration-200"
                >
                  {/* Top Meta Line: Language & Approval Badge */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white">
                        {getLanguageName(entry.language_code)}
                      </span>
                      {entry.dialect && (
                        <span className="text-xs text-[#94A3B8] font-medium">
                          {entry.dialect}
                        </span>
                      )}
                    </div>

                    {/* Approved vs Proposed Badge */}
                    {entry.is_elder_approved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>Elder Approved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>Community Proposed</span>
                      </span>
                    )}
                  </div>

                  {/* Word Headword & Native Script & Audio Play */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h2 className="text-2xl font-black tracking-tight text-[#F8FAFC]">
                          {entry.word}
                        </h2>
                        {entry.native_script && (
                          <span className="text-xl font-bold text-amber-300">
                            {entry.native_script}
                          </span>
                        )}
                      </div>

                      {entry.ipa && (
                        <div className="text-xs font-mono text-cyan-300">
                          [{entry.ipa}]
                        </div>
                      )}
                    </div>

                    {/* One-click Audio Play Button */}
                    <button
                      type="button"
                      onClick={() => playWordAudio(entry)}
                      title="Play authentic oral pronunciation"
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition ${
                        isPlaying
                          ? "bg-amber-500 border-amber-400 text-black animate-pulse"
                          : "bg-white/10 border-white/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40"
                      }`}
                    >
                      {isPlaying ? (
                        <Volume2 className="h-5 w-5 fill-current" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Meanings */}
                  <div className="space-y-1">
                    {entry.meanings.map((meaning, idx) => (
                      <p key={idx} className="text-sm text-[#F8FAFC] leading-relaxed">
                        {meaning}
                      </p>
                    ))}
                  </div>

                  {/* Translations Matrix */}
                  {entry.translations && Object.keys(entry.translations).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {entry.translations.en && (
                        <div className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-xs text-[#94A3B8]">
                          <span className="text-amber-400 font-semibold mr-1">EN:</span>
                          <span className="text-white">{entry.translations.en}</span>
                        </div>
                      )}
                      {entry.translations.te && (
                        <div className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-xs text-[#94A3B8]">
                          <span className="text-emerald-400 font-semibold mr-1">TE:</span>
                          <span className="text-white">{entry.translations.te}</span>
                        </div>
                      )}
                      {entry.translations.hi && (
                        <div className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-xs text-[#94A3B8]">
                          <span className="text-cyan-400 font-semibold mr-1">HI:</span>
                          <span className="text-white">{entry.translations.hi}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expandable Cultural Notes & Provenance */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(entry.id)}
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline pt-1"
                    >
                      <span>{isExpanded ? "Hide cultural wisdom & provenance" : "Show cultural wisdom & provenance"}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs animate-in fade-in duration-200">
                        {entry.cultural_context && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                              Cultural Context & Customary Protocol
                            </span>
                            <p className="text-[#94A3B8] leading-relaxed">
                              {entry.cultural_context}
                            </p>
                          </div>
                        )}

                        {entry.etymology && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                              Etymological Root
                            </span>
                            <p className="text-[#94A3B8] font-mono leading-relaxed">
                              {entry.etymology}
                            </p>
                          </div>
                        )}

                        {entry.alternate_spellings && entry.alternate_spellings.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Alternate Spellings & Dialect Forms
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.alternate_spellings.map((alt, aIdx) => (
                                <span
                                  key={aIdx}
                                  className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]"
                                >
                                  {alt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Provenance attribution banner */}
                        {entry.provenance && (
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                            <span className="font-bold block text-[11px] mb-0.5">
                              📜 Elder Provenance & Attribution:
                            </span>
                            <span className="leading-snug text-[11px]">
                              {entry.provenance}
                            </span>
                            {entry.approved_by && (
                              <span className="block text-[10px] text-emerald-400/80 mt-1 font-mono">
                                Approved by: {entry.approved_by}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}

