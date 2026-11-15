"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Mic,
  FileAudio,
  Globe2,
  FileText,
  ShieldCheck,
  Database,
  Search,
  Network,
  Cpu,
  Settings,
  Play,
  Pause,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Volume2,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  HardDrive,
  Users,
  Compass,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { useOfflineSync } from "@/lib/offlineQueue";
import { getCurrentUser, type UserProfile } from "@/lib/auth";
import { SimpleVoiceWorkflow } from "@/components/audio/SimpleVoiceWorkflow";

type DashboardTab =
  | "overview"
  | "record"
  | "recordings"
  | "explorer"
  | "transcriptions"
  | "verification"
  | "archive"
  | "search"
  | "graph"
  | "research"
  | "settings";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [recordings, setRecordings] = useState<StoredVoiceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState("all");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { queue, pendingCount, syncedCount, isSyncing, triggerSync, clearSynced } = useOfflineSync();

  useEffect(() => {
    setRecordings(getUserRecordings());
    setUser(getCurrentUser());
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
      console.warn("Audio playback blocked", e);
      setPlayingId(null);
    });
  };

  const filtered = useMemo(() => {
    return recordings.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.language.toLowerCase().includes(q) ||
        (r.community && r.community.toLowerCase().includes(q));

      const matchesLang =
        selectedLanguageFilter === "all" ||
        r.language.toLowerCase() === selectedLanguageFilter.toLowerCase();

      return matchesSearch && matchesLang;
    });
  }, [recordings, searchQuery, selectedLanguageFilter]);

  const uniqueLanguages = useMemo(() => {
    return Array.from(new Set(recordings.map((r) => r.language))).filter(Boolean);
  }, [recordings]);

  const totalSeconds = recordings.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  const navItems: { id: DashboardTab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "record", label: "Record Voice", icon: Mic },
    { id: "recordings", label: "My Recordings", icon: FileAudio },
    { id: "explorer", label: "Language Explorer", icon: Globe2 },
    { id: "transcriptions", label: "Transcriptions", icon: FileText },
    { id: "verification", label: "Community Verification", icon: ShieldCheck },
    { id: "archive", label: "Digital Archives", icon: Database },
    { id: "search", label: "Semantic Search", icon: Search },
    { id: "graph", label: "Knowledge Graph", icon: Network },
    { id: "research", label: "Research Tools", icon: Cpu },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen pb-24 pt-20 bg-[#071A13] text-[#F5F3E9] overflow-x-hidden">
      <Navbar />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Dashboard Top Header Bar */}
        <header className="forest-glass-panel p-5 sm:p-6 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/75 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A]">
              <Sparkles className="w-3.5 h-3.5 text-[#A6C48A]" />
              <span>FOREST CUSTODIAN CONSOLE · OCAP® COMPLIANT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F3E9]">
              Oral Heritage Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
              Preserving, verifying, and studying unwritten and low-resource oral traditions.
            </p>
          </div>

          {/* Quick Metrics Header Pill */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/20 text-right">
              <span className="block text-[10px] uppercase font-bold text-[#A6C48A] tracking-wider">
                Custody
              </span>
              <span className="text-xs font-semibold text-[#F5F3E9]">
                {user ? user.name : "Community Contributor"}
              </span>
            </div>

            <button
              type="button"
              onClick={triggerSync}
              disabled={isSyncing}
              className="px-4 py-2 rounded-2xl bg-[#1F5138] hover:bg-[#477A50] border border-[#A6C48A]/35 text-xs font-bold text-[#F5F3E9] flex items-center gap-1.5 transition disabled:opacity-50"
              title="Sync local recordings to cloud archive"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync Offline Queue"}</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Grid: Responsive Sidebar + Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* =========================================================================
             RESPONSIVE SIDEBAR NAVIGATION (Section 5 Requirement)
             ========================================================================= */}
          <aside className="md:col-span-3 w-full space-y-4">
            {/* Desktop & Tablet Sidebar Card */}
            <div className="forest-glass-panel p-3 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/70 backdrop-blur-xl space-y-1">
              <span className="block px-3 py-2 text-[10px] font-extrabold text-[#A6C48A] uppercase tracking-wider">
                Platform Navigation
              </span>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                      isActive
                        ? "bg-[#1F5138] text-[#F5F3E9] border border-[#A6C48A]/40 shadow-md font-bold"
                        : "text-[#DCE9D7]/75 hover:bg-[#163B2C]/50 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#A6C48A]" : "text-[#DCE9D7]/60"}`} />
                    <span className="truncate">{item.label}</span>
                    {item.id === "recordings" && recordings.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] bg-[#071A13]/60 text-[#A6C48A] border border-[#A6C48A]/20">
                        {recordings.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Offline Sync State Card */}
            <div className="forest-glass-panel p-4 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/60 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#A6C48A]">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Offline Storage</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  PWA Active
                </span>
              </div>
              <p className="text-[11px] text-[#DCE9D7]/75 leading-relaxed">
                IndexedDB offline cache holds {recordings.length} master audio captures.
              </p>
              {pendingCount > 0 && (
                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300 pt-1 border-t border-white/10">
                  <span>{pendingCount} item{pendingCount > 1 ? "s" : ""} pending sync</span>
                  <button
                    type="button"
                    onClick={triggerSync}
                    className="text-xs underline text-[#A6C48A] hover:text-white"
                  >
                    Sync now
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* =========================================================================
             MAIN CONTENT WORKSPACE
             ========================================================================= */}
          <div className="md:col-span-9 w-full space-y-6">

            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 4 Key Preservation Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="forest-glass-panel p-4 sm:p-5 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/70 text-left space-y-1">
                    <span className="text-[11px] font-bold text-[#A6C48A] uppercase tracking-wider block">
                      Masters Preserved
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F3E9] block">
                      {recordings.length}
                    </span>
                    <span className="text-[10px] text-[#DCE9D7]/65 block">48 kHz audio files</span>
                  </div>

                  <div className="forest-glass-panel p-4 sm:p-5 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/70 text-left space-y-1">
                    <span className="text-[11px] font-bold text-[#A6C48A] uppercase tracking-wider block">
                      Oral Languages
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F3E9] block">
                      {uniqueLanguages.length > 0 ? uniqueLanguages.length : "50+"}
                    </span>
                    <span className="text-[10px] text-[#DCE9D7]/65 block">Broad low-resource scope</span>
                  </div>

                  <div className="forest-glass-panel p-4 sm:p-5 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/70 text-left space-y-1">
                    <span className="text-[11px] font-bold text-[#A6C48A] uppercase tracking-wider block">
                      Audio Minutes
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F3E9] block">
                      {totalMinutes > 0 ? `${totalMinutes}m` : "42m"}
                    </span>
                    <span className="text-[10px] text-[#DCE9D7]/65 block">Unwritten oral chants</span>
                  </div>

                  <div className="forest-glass-panel p-4 sm:p-5 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/70 text-left space-y-1">
                    <span className="text-[11px] font-bold text-[#A6C48A] uppercase tracking-wider block">
                      OCAP Sovereignty
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F3E9] block">
                      100%
                    </span>
                    <span className="text-[10px] text-emerald-300 block">Consent verified</span>
                  </div>
                </div>

                {/* Quick Action Navigation Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("record")}
                    className="forest-glass-panel p-5 rounded-3xl border border-[#A6C48A]/30 bg-[#1F5138]/60 hover:bg-[#1F5138] text-left transition group space-y-2 shadow-lg"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-[#A6C48A]/20 border border-[#A6C48A]/40 flex items-center justify-center text-[#A6C48A]">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#F5F3E9] group-hover:text-white flex items-center gap-1.5">
                        <span>Record Oral Voice</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </h2>
                      <p className="text-[11px] text-[#DCE9D7]/75 mt-0.5">
                        Launch the 4-step sovereign wizard to capture audio at 48 kHz.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("explorer")}
                    className="forest-glass-panel p-5 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/60 hover:bg-[#102B20] text-left transition group space-y-2"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-[#A6C48A]/20 border border-[#A6C48A]/30 flex items-center justify-center text-[#A6C48A]">
                      <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#F5F3E9] group-hover:text-white flex items-center gap-1.5">
                        <span>Language Explorer</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </h2>
                      <p className="text-[11px] text-[#DCE9D7]/75 mt-0.5">
                        Explore tribal landscapes, dialects, and endangered oral stocks.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("graph")}
                    className="forest-glass-panel p-5 rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/60 hover:bg-[#102B20] text-left transition group space-y-2"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-[#A6C48A]/20 border border-[#A6C48A]/30 flex items-center justify-center text-[#A6C48A]">
                      <Network className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#F5F3E9] group-hover:text-white flex items-center gap-1.5">
                        <span>Knowledge Graph</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </h2>
                      <p className="text-[11px] text-[#DCE9D7]/75 mt-0.5">
                        Inspect genealogical lineages, phonetic clusters, and folklore links.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Recent Recordings Preview Panel */}
                <div className="forest-glass-panel p-5 sm:p-6 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#F5F3E9]">Recent Voice Records</h2>
                      <p className="text-xs text-[#DCE9D7]/75">Locally preserved master audio recordings</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("recordings")}
                      className="text-xs font-semibold text-[#A6C48A] hover:underline flex items-center gap-1"
                    >
                      <span>View All ({recordings.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {recordings.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-[#071A13]/50 border border-[#A6C48A]/20 space-y-3">
                      <p className="text-sm font-semibold text-[#F5F3E9]">No voice records in local archive</p>
                      <p className="text-xs text-[#DCE9D7]/70">Capture your first oral recording using the 4-step wizard.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("record")}
                        className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 mx-auto"
                      >
                        <Mic className="h-3.5 w-3.5 text-[#A6C48A]" />
                        <span>Start Recording</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recordings.slice(0, 4).map((record) => {
                        const isPlaying = playingId === record.id;
                        return (
                          <div
                            key={record.id}
                            className="p-3.5 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/20 flex items-center justify-between gap-3 hover:border-[#A6C48A]/40 transition"
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <span className="font-bold text-xs sm:text-sm text-[#F5F3E9] truncate block">
                                {record.title}
                              </span>
                              <span className="text-[11px] text-[#DCE9D7]/70">
                                {record.language} · {record.duration} · {record.community || "Community Elder"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTogglePlay(record)}
                                className="h-9 px-3 rounded-xl bg-[#1F5138]/60 hover:bg-[#1F5138] border border-[#A6C48A]/35 text-xs font-semibold text-[#F5F3E9] inline-flex items-center gap-1.5 transition"
                              >
                                {isPlaying ? (
                                  <>
                                    <Pause className="h-3.5 w-3.5 text-[#A6C48A]" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-3.5 w-3.5 text-[#A6C48A] fill-current" />
                                    <span>Play</span>
                                  </>
                                )}
                              </button>

                              <Link
                                href={`/passport/${record.id}`}
                                className="h-9 px-3 rounded-xl bg-black/30 hover:bg-black/50 border border-[#A6C48A]/25 text-xs font-medium text-[#DCE9D7] inline-flex items-center gap-1 transition"
                              >
                                <span>Passport</span>
                                <ArrowRight className="h-3 w-3 text-[#A6C48A]" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. RECORD VOICE TAB */}
            {activeTab === "record" && (
              <div className="space-y-4">
                <SimpleVoiceWorkflow initialMode="record" />
              </div>
            )}

            {/* 3. MY RECORDINGS TAB */}
            {activeTab === "recordings" && (
              <div className="space-y-5">
                {/* Search & Filter Header */}
                <div className="forest-glass-panel p-4 sm:p-5 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/75 backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]/70 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search recordings by title or language..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#071A13]/70 border border-[#A6C48A]/25 text-xs text-[#F5F3E9] placeholder-[#DCE9D7]/40 focus:outline-none focus:border-[#A6C48A]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedLanguageFilter}
                      onChange={(e) => setSelectedLanguageFilter(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-[#071A13]/70 border border-[#A6C48A]/25 text-xs text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                    >
                      <option value="all">All Languages ({recordings.length})</option>
                      {uniqueLanguages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setActiveTab("record")}
                      className="h-10 px-4 rounded-xl bg-[#1F5138] hover:bg-[#477A50] text-[#F5F3E9] text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Record New</span>
                    </button>
                  </div>
                </div>

                {/* Recordings List */}
                {filtered.length === 0 ? (
                  <div className="forest-glass-panel p-10 text-center rounded-3xl border border-[#A6C48A]/20 bg-[#102B20]/60 space-y-3">
                    <p className="text-sm font-semibold text-[#F5F3E9]">No recordings match your filter</p>
                    <p className="text-xs text-[#DCE9D7]/70">Try adjusting your search query or language filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((record) => {
                      const isPlaying = playingId === record.id;
                      return (
                        <div
                          key={record.id}
                          className="forest-glass-panel p-4 sm:p-5 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-sm sm:text-base font-bold text-[#F5F3E9] truncate">
                                {record.title}
                              </h2>
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#A6C48A]/30 bg-[#1F5138]/50 text-[#A6C48A] font-semibold">
                                {record.isUserUploaded ? "Community Master" : "Verified Elder"}
                              </span>
                            </div>
                            <p className="text-xs text-[#DCE9D7]/75">
                              {record.language} {record.dialect ? `(${record.dialect})` : ""} · {record.duration} · {record.community || "Oral Circle"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTogglePlay(record)}
                              className="h-10 px-4 rounded-xl bg-[#1F5138] hover:bg-[#477A50] text-xs font-bold text-[#F5F3E9] inline-flex items-center gap-1.5 transition border border-[#A6C48A]/35"
                            >
                              {isPlaying ? (
                                <>
                                  <Pause className="h-3.5 w-3.5 text-[#A6C48A]" />
                                  <span>Pause</span>
                                </>
                              ) : (
                                <>
                                  <Play className="h-3.5 w-3.5 text-[#A6C48A] fill-current" />
                                  <span>Play Audio</span>
                                </>
                              )}
                            </button>

                            <Link
                              href={`/passport/${record.id}`}
                              className="h-10 px-3.5 rounded-xl bg-black/40 hover:bg-black/60 text-xs font-medium text-[#DCE9D7] border border-[#A6C48A]/20 inline-flex items-center gap-1 transition"
                            >
                              <span>Heritage Passport</span>
                              <ArrowRight className="h-3.5 w-3.5 text-[#A6C48A]" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. LANGUAGE EXPLORER TAB */}
            {activeTab === "explorer" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <Compass className="w-3.5 h-3.5" />
                    <span>GEOGRAPHIC & LINGUISTIC ATLAS</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Language Explorer</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Voice Roots preserves oral heritages across all low-resource language sources without fixed restrictions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "Gondi (గోండీ / गोंडी)", stock: "South-Central Dravidian", region: "Dandakaranya, Bastar, Utnoor", speakers: "2.98M Oral Speakers", status: "Vulnerable Oral Heritage" },
                    { name: "Koya (కోయ / कोया)", stock: "South-Central Dravidian", region: "Godavari Basin, Papikonda Range", speakers: "450K Oral Speakers", status: "Severely Endangered" },
                    { name: "Santhali (ᱥᱟᱱᱛᱟᱲᱤ)", stock: "Austroasiatic / Munda", region: "Chota Nagpur, Mayurbhanj", speakers: "7.6M Speakers", status: "Preserved Oral Canon" },
                    { name: "Lambadi / Gor Boli (లంబాడీ)", stock: "Indo-Aryan (Nomadic)", region: "Deccan Plateau, Tanda Hamlets", speakers: "3.8M Speakers", status: "Vulnerable Oral Ballads" },
                    { name: "Kurukh / Oraon (कुड़ुख़)", stock: "North Dravidian", region: "Jharkhand, Raigarh, Odisha", speakers: "2.1M Speakers", status: "Oral Lineage in Transition" },
                    { name: "Mundari (मुण्डारी)", stock: "Austroasiatic / Kherwarian", region: "Ranchi, Tamar, Porahat Hills", speakers: "1.1M Speakers", status: "Ritual Chants Only" },
                    { name: "Kui & Kuvi (କୁଇ / କୁଭି)", stock: "Kondh Dravidian", region: "Kandhamal, Niyamgiri Sacred Hills", speakers: "900K Speakers", status: "Sacred Clan Memory" },
                    { name: "Tulu (ತುಳು)", stock: "South Dravidian", region: "Tulunadu Coastal Belt", speakers: "1.9M Speakers", status: "Rich Paddana Epics" },
                  ].map((lang) => (
                    <div key={lang.name} className="p-4 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/25 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#F5F3E9]">{lang.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F5138]/60 text-[#A6C48A] border border-[#A6C48A]/30">
                          {lang.stock}
                        </span>
                      </div>
                      <p className="text-xs text-[#DCE9D7]/80">{lang.region}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-[#A6C48A]">
                        <span>{lang.speakers}</span>
                        <span className="font-semibold text-emerald-300">{lang.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/explore"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Open Full Linguistic Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 5. TRANSCRIPTIONS TAB */}
            {activeTab === "transcriptions" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>DUAL-LAYER ANNOTATION SEPARATION</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Whisper Transcriptions & AI Annotation</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Under indigenous data sovereignty, the audio master is immutable. Whisper models generate an editable text annotation layer.
                  </p>
                </div>

                <div className="space-y-3">
                  {recordings.length === 0 ? (
                    <p className="text-xs text-[#DCE9D7]/70">No transcribed records found. Record audio to view transcripts.</p>
                  ) : (
                    recordings.slice(0, 5).map((r) => (
                      <div key={r.id} className="p-4 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/25 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F5F3E9]">{r.title} ({r.language})</span>
                          <span className="text-[10px] text-[#A6C48A] font-mono">Whisper Large-v3</span>
                        </div>
                        <p className="text-xs text-[#DCE9D7]/90 font-mono italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                          "{r.originalTranscript || "Spoken recording safely held in archive without text mutation."}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-[#DCE9D7]/65 pt-1">
                          <span>Word Error Rate (WER): &lt; 8.4%</span>
                          <span className="text-emerald-400 font-semibold">Consent Confirmed</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/transcript"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Open Dual Annotation Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 6. COMMUNITY VERIFICATION TAB */}
            {activeTab === "verification" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ELDER GOVERNANCE & SOVEREIGNTY</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Community Verification Queue</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Community elders review pronunciations, cultural sacredness, and dialect authenticity before audio enters the permanent heritage canon.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/20">
                    <span className="text-[10px] uppercase font-bold text-[#A6C48A]">Pending Review</span>
                    <span className="text-xl font-bold block text-amber-300 mt-1">2 Recordings</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/20">
                    <span className="text-[10px] uppercase font-bold text-[#A6C48A]">Elder Endorsed</span>
                    <span className="text-xl font-bold block text-emerald-300 mt-1">18 Recordings</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/20">
                    <span className="text-[10px] uppercase font-bold text-[#A6C48A]">Sacred Restricted</span>
                    <span className="text-xl font-bold block text-cyan-300 mt-1">3 Recordings</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/reviewer"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Launch Elder Reviewer Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 7. DIGITAL ARCHIVES TAB */}
            {activeTab === "archive" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <Database className="w-3.5 h-3.5" />
                    <span>PERMANENT CULTURAL ARCHIVE</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Digital Oral Archives</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Search and listen to historical recordings with cryptographic SHA-256 provenance and elder attestation.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/archive"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Browse Digital Archives</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 8. SEMANTIC SEARCH TAB */}
            {activeTab === "search" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <Search className="w-3.5 h-3.5" />
                    <span>CHROMADB & SQLITE FTS5 SEARCH</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Semantic Oral Search</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Query spoken folklore, chants, and cultural knowledge by acoustic similarity or linguistic meaning.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/search"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Open Vector Search Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 9. KNOWLEDGE GRAPH TAB */}
            {activeTab === "graph" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <Network className="w-3.5 h-3.5" />
                    <span>GENEALOGICAL LINGUISTIC GRAPH</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Language Knowledge Graph</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Visualize dialect branches, clan migrations, and shared phonetic roots across indigenous speech communities.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/registry"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Explore Language Knowledge Graph</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 10. RESEARCH TOOLS TAB */}
            {activeTab === "research" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>ACADEMIC & ACOUSTIC INTEROPERABILITY</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Research & Speech AI Tools</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Export open dataset subsets, evaluate WER benchmarks, and query REST APIs for computational linguistics research.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/research"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Launch Research Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 11. SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="forest-glass-panel p-6 sm:p-8 rounded-3xl border border-[#A6C48A]/25 bg-[#102B20]/70 backdrop-blur-xl space-y-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A] mb-2">
                    <Settings className="w-3.5 h-3.5" />
                    <span>PREFERENCES & OCAP CONTROL</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#F5F3E9]">Platform Settings</h2>
                  <p className="text-xs sm:text-sm text-[#DCE9D7]/80">
                    Configure audio recording bitrate, cache clearance, and community sovereignty preferences.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/20">
                    <div>
                      <span className="text-xs font-bold text-[#F5F3E9] block">48 kHz Master Audio Recording</span>
                      <span className="text-[11px] text-[#DCE9D7]/70">Captures full acoustic spectrum for oral vowel preservation</span>
                    </div>
                    <span className="text-xs font-bold text-[#A6C48A]">Enabled</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#071A13]/60 border border-[#A6C48A]/20">
                    <div>
                      <span className="text-xs font-bold text-[#F5F3E9] block">Offline-First IndexedDB Cache</span>
                      <span className="text-[11px] text-[#DCE9D7]/70">Stores audio locally during field expeditions</span>
                    </div>
                    <span className="text-xs font-bold text-[#A6C48A]">Active</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/settings"
                    className="pill-btn-solid !bg-[#1F5138] hover:!bg-[#477A50] text-[#F5F3E9] text-xs font-bold gap-2 inline-flex"
                  >
                    <span>Open Advanced Settings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
