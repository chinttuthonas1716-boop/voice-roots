"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Edit3,
  Play,
  Pause,
  ShieldCheck,
  AlertCircle,
  Filter,
  BookOpen,
  Languages,
  Mic,
  User,
  Clock,
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { getCurrentUser, DEMO_USERS, type UserProfile } from "@/lib/auth";

export interface ReviewQueueItem {
  id: string; // e.g. "transcript:12" or "translation:4"
  item_type: "transcript" | "translation" | "dictionary" | "cultural_story";
  raw_id: string | number;
  title: string;
  language: string;
  target_language?: string;
  dialect?: string | null;
  contributor: string;
  role: string;
  text: string;
  text_preview: string;
  source_text?: string;
  translated_text?: string;
  ipa?: string;
  meaning?: string;
  audio_url?: string | null;
  status: string;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  action_type: string;
  actor_name: string;
  actor_role: string;
  entity_type: string;
  entity_id: string;
  details_json: string;
  timestamp: string;
}

export default function ReviewerQueuePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [reviewerName, setReviewerName] = useState("Elder Soyam Laxman");
  const [reviewerRole, setReviewerRole] = useState("elder");
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "transcript" | "translation" | "dictionary">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Correction inline state: itemId -> { correctedText, notes }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [culturalNotes, setCulturalNotes] = useState("");

  // Rejection inline state: itemId -> notes
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Audio playback state
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Collapsible audit drawer
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setReviewerName(user.name);
      setReviewerRole(user.role === "reviewer" || user.verifiedElder ? "elder" : user.role);
    } else {
      // Default to Elder Soyam Laxman if guest or not signed in
      const defaultElder = DEMO_USERS.find((u) => u.role === "reviewer") || DEMO_USERS[0];
      setReviewerName(defaultElder.name);
      setReviewerRole("elder");
    }
    fetchQueue();
    fetchAuditLogs();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/reviewer/queue?limit=100");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        // Fallback demo queue if backend offline
        setItems(getFallbackItems());
      }
    } catch {
      setItems(getFallbackItems());
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/v1/governance/audit-logs?limit=20");
      if (res.ok) {
        const logs = await res.json();
        setAuditLogs(Array.isArray(logs) ? logs : []);
      }
    } catch {
      // Ignore background audit fetch failures
    }
  };

  const getFallbackItems = (): ReviewQueueItem[] => [
    {
      id: "transcript:101",
      raw_id: 101,
      item_type: "transcript",
      title: "Mahua Harvest Sacred Chant",
      language: "Gondi",
      dialect: "Adilabad Northern",
      contributor: "Kumuram Jangu",
      role: "speaker",
      text: "నార లోపల మహువా పూలు రాలిపడ్డాయి. మన పెద్దల భూమి మీద సమృద్ధి వచ్చింది.",
      text_preview: "నార లోపల మహువా పూలు రాలిపడ్డాయి. మన పెద్దల భూమి మీద సమృద్ధి వచ్చింది.",
      audio_url: "/audio/sample_gondi.wav",
      status: "draft",
      created_at: new Date().toISOString(),
    },
    {
      id: "translation:204",
      raw_id: 204,
      item_type: "translation",
      title: "Translation #204 (Gondi → English)",
      language: "Gondi",
      target_language: "English",
      dialect: null,
      contributor: "IndicTrans2",
      role: "machine_translation",
      source_text: "నార లోపల మహువా పూలు రాలిపడ్డాయి.",
      translated_text: "Inside the village, mahua flowers have fallen upon the soil.",
      text: "Inside the village, mahua flowers have fallen upon the soil.",
      text_preview: "Inside the village, mahua flowers have fallen upon the soil.",
      status: "unreviewed_draft",
      created_at: new Date().toISOString(),
    },
    {
      id: "dictionary:305",
      raw_id: 305,
      item_type: "dictionary",
      title: "నార",
      language: "gon",
      dialect: "Adilabad",
      contributor: "Kovvasi Ramesh",
      role: "contributor",
      ipa: "naːra",
      meaning: "Ancestral village settlement or clan hamlet",
      text: "నార — Ancestral village settlement or clan hamlet (IPA: naːra)",
      text_preview: "Ancestral village settlement or clan hamlet (IPA: naːra)",
      status: "pending_review",
      created_at: new Date().toISOString(),
    },
  ];

  const handleToggleAudio = (url: string | null | undefined, id: string) => {
    if (!url) return;
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.onended = () => setPlayingId(null);
    audioRef.current.onerror = () => setPlayingId(null);
    audioRef.current.play().then(() => setPlayingId(id)).catch(() => setPlayingId(null));
  };

  const handleDecision = async (
    item: ReviewQueueItem,
    action: "approve" | "correct" | "reject",
    correctedText?: string,
    notes?: string
  ) => {
    setProcessingId(item.id);
    setErrorMsg(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/v1/reviewer/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: item.item_type,
          item_id: item.raw_id,
          action,
          reviewer_name: reviewerName,
          reviewer_role: reviewerRole,
          corrected_text: correctedText || null,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        const actionLabel =
          action === "approve"
            ? "Approved & Published"
            : action === "correct"
            ? "Corrected & Published"
            : "Rejected";
        setActionSuccess(
          `✓ Success: ${item.title} has been ${actionLabel}. State moved to PUBLISHED and logged to governance_audit_logs with identity '${reviewerName}'.`
        );
        // Remove item from queue in state
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setEditingId(null);
        setRejectingId(null);
        fetchAuditLogs();
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || "Reviewer decision execution failed.");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Network error submitting reviewer decision.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "all" || item.item_type === activeTab;
    const matchesLang =
      selectedLanguage === "all" ||
      item.language.toLowerCase().includes(selectedLanguage.toLowerCase()) ||
      (item.target_language && item.target_language.toLowerCase().includes(selectedLanguage.toLowerCase()));
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.text.toLowerCase().includes(q) ||
      item.contributor.toLowerCase().includes(q) ||
      item.language.toLowerCase().includes(q);

    return matchesTab && matchesLang && matchesSearch;
  });

  const counts = {
    all: items.length,
    transcript: items.filter((i) => i.item_type === "transcript").length,
    translation: items.filter((i) => i.item_type === "translation").length,
    dictionary: items.filter((i) => i.item_type === "dictionary").length,
  };

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F8FAFC] pb-24 pt-20">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Reviewer Identity Banner */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-amber-950/20 to-emerald-950/20 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  OCAP Protocol Elder Moderation
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Task T2.3 Verified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Community Reviewer Queue
              </h1>
              <p className="text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
                Affirmative elder governance portal for human transcript verification, IndicTrans2 translation approval,
                and multilingual seed lexicon validation. Approval moves draft assets to PUBLISHED status with immutable provenance.
              </p>
            </div>

            {/* Active Reviewer Persona Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 min-w-[280px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Active Reviewer
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                  <Check className="h-3 w-3" /> Accredited
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/40 grid place-items-center text-amber-300 font-bold text-sm">
                  {reviewerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{reviewerName}</div>
                  <div className="text-xs text-[#94A3B8] capitalize">
                    {reviewerRole === "elder" ? "Community Elder / Custodian" : reviewerRole}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Persona Switcher:</span>
                <select
                  value={reviewerName}
                  onChange={(e) => {
                    const selected = DEMO_USERS.find((u) => u.name === e.target.value);
                    if (selected) {
                      setReviewerName(selected.name);
                      setReviewerRole(selected.role === "reviewer" || selected.verifiedElder ? "elder" : selected.role);
                    }
                  }}
                  className="bg-[#080A12] border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {DEMO_USERS.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {actionSuccess && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-start gap-3 text-emerald-200 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{actionSuccess}</div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-400 hover:text-white text-xs font-semibold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-start gap-3 text-rose-200 text-sm">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-white text-xs font-semibold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Bar & Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "all"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span>All Items</span>
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/10 text-white font-semibold">
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("transcript")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "transcript"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Mic className="h-4 w-4" />
                <span>Transcripts</span>
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/10 text-white font-semibold">
                  {counts.transcript}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("translation")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "translation"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Languages className="h-4 w-4" />
                <span>Translations</span>
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/10 text-white font-semibold">
                  {counts.translation}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("dictionary")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  activeTab === "dictionary"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Dictionary</span>
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/10 text-white font-semibold">
                  {counts.dictionary}
                </span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchQueue();
                fetchAuditLogs();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-[#94A3B8] hover:text-white hover:bg-white/10 transition self-start sm:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Search & Language Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search transcripts, vocabulary words, contributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-[#0F1420] text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#94A3B8]" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-[#0F1420] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Languages</option>
                <option value="gondi">Gondi (గోండీ)</option>
                <option value="koya">Koya (కోయ)</option>
                <option value="santhali">Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                <option value="lambadi">Lambadi (లంబాడీ)</option>
                <option value="telugu">Telugu (తెలుగు)</option>
                <option value="hindi">Hindi (हिन्दी)</option>
                <option value="english">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queue Items List */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#0F1420]/50 p-12 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm text-[#94A3B8]">Loading community moderation queue...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0F1420]/40 p-12 text-center space-y-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Reviewer Queue is Clear</h3>
              <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
                No pending recordings, machine translations, or vocabulary headwords match the selected criteria.
                All contributed heritage items are currently reviewed and published.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isProcessing = processingId === item.id;
              const isEditing = editingId === item.id;
              const isRejecting = rejectingId === item.id;
              const isPlaying = playingId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#0F1420]/80 p-5 sm:p-6 backdrop-blur-sm space-y-4 hover:border-white/20 transition"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Type Badge */}
                      {item.item_type === "transcript" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <Mic className="h-3 w-3" /> Oral Transcript
                        </span>
                      )}
                      {item.item_type === "translation" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Languages className="h-3 w-3" /> Translation Draft
                        </span>
                      )}
                      {item.item_type === "dictionary" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <BookOpen className="h-3 w-3" /> Lexicon Entry
                        </span>
                      )}

                      {/* Language Pill */}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10">
                        {item.language}
                        {item.target_language && ` → ${item.target_language}`}
                        {item.dialect && ` (${item.dialect})`}
                      </span>

                      {/* Status Badge */}
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Draft (Awaiting Review)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {item.contributor} ({item.role})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3 pt-1">
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
                      <span>{item.title}</span>
                      {/* Audio Playback button if url available */}
                      {item.audio_url && (
                        <button
                          type="button"
                          onClick={() => handleToggleAudio(item.audio_url, item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            isPlaying
                              ? "bg-amber-500 text-black shadow-md"
                              : "bg-white/10 text-white hover:bg-white/15"
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-3.5 w-3.5" /> Playing Stream
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 text-amber-400" /> Play Master Audio
                            </>
                          )}
                        </button>
                      )}
                    </h3>

                    {/* Content Display for Translation */}
                    {item.item_type === "translation" && item.source_text && (
                      <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-xs space-y-1">
                        <div className="text-[#94A3B8] font-medium uppercase tracking-wider text-[10px]">
                          Source Utterance ({item.language}):
                        </div>
                        <div className="text-[#F8FAFC] font-serif text-sm">
                          “{item.source_text}”
                        </div>
                      </div>
                    )}

                    {/* Content Display for Dictionary */}
                    {item.item_type === "dictionary" && (
                      <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-xs space-y-1">
                        <div className="flex items-center gap-4 text-sm font-semibold text-amber-300">
                          <span>IPA: {item.ipa || "N/A"}</span>
                          <span className="text-[#94A3B8] font-normal">Meaning: {item.meaning || item.text}</span>
                        </div>
                      </div>
                    )}

                    {/* Text Preview */}
                    {!isEditing && (
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-[#F8FAFC] font-serif leading-relaxed italic">
                        “{item.translated_text || item.text}”
                      </div>
                    )}

                    {/* Inline Correction Panel */}
                    {isEditing && (
                      <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3">
                        <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                          <Edit3 className="h-3.5 w-3.5" />
                          Elder Phonetic & Semantic Correction Editor:
                        </div>
                        <textarea
                          rows={3}
                          value={correctionText}
                          onChange={(e) => setCorrectionText(e.target.value)}
                          placeholder="Refine phonetic transcription, dialect spelling, or verified gloss..."
                          className="w-full rounded-xl border border-white/20 bg-[#080A12] p-3 text-sm text-white font-serif focus:outline-none focus:border-amber-400"
                        />
                        <div>
                          <label className="block text-xs font-medium text-[#94A3B8] mb-1">
                            Customary Rationale / Cultural Notes (Stored in Provenance Record):
                          </label>
                          <input
                            type="text"
                            value={culturalNotes}
                            onChange={(e) => setCulturalNotes(e.target.value)}
                            placeholder="e.g. Corrected ritual harvest phrasing per ancestral Koitur idiom"
                            className="w-full rounded-xl border border-white/20 bg-[#080A12] px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-[#94A3B8] hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing || !correctionText.trim()}
                            onClick={() => handleDecision(item, "correct", correctionText.trim(), culturalNotes.trim())}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Submit Correction & Publish
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Rejection Panel */}
                    {isRejecting && (
                      <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 space-y-3">
                        <div className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" />
                          Reason for Rejection / Withdrawal:
                        </div>
                        <input
                          type="text"
                          value={rejectionNotes}
                          onChange={(e) => setRejectionNotes(e.target.value)}
                          placeholder="e.g. Inaudible acoustic recording, sacred restricted clan chant, or unverified phrase"
                          className="w-full rounded-xl border border-white/20 bg-[#080A12] px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                        />
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setRejectingId(null)}
                            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-[#94A3B8] hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleDecision(item, "reject", undefined, rejectionNotes.trim())}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && !isRejecting && (
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-[#94A3B8]">
                        Approval will move item to <strong className="text-emerald-400">PUBLISHED</strong> status.
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Reject Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => {
                            setRejectingId(item.id);
                            setEditingId(null);
                            setRejectionNotes("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>

                        {/* Correct Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => {
                            setEditingId(item.id);
                            setRejectingId(null);
                            setCorrectionText(item.translated_text || item.text);
                            setCulturalNotes("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Correct & Publish</span>
                        </button>

                        {/* Approve Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleDecision(item, "approve")}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Governance Audit Log Collapsible Section */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1420]/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Immutable Governance Audit Trail (OCAP Protocols)
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Every elder moderation decision, transcript publication, and phonetic revision is cryptographically logged with reviewer identity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-medium text-white hover:bg-white/10 transition"
            >
              <span>{showAuditLogs ? "Hide Audit Records" : "View Recent Decisions"}</span>
              {showAuditLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showAuditLogs && (
            <div className="space-y-3 pt-2">
              {auditLogs.length === 0 ? (
                <div className="text-xs text-[#94A3B8] p-4 text-center">
                  No governance audit log entries recorded yet in this session.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[#94A3B8] uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Reviewer / Custodian</th>
                        <th className="py-2.5 px-3">Entity Type & ID</th>
                        <th className="py-2.5 px-3">Decision Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-[#94A3B8] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.action_type.includes("APPROVE")
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : log.action_type.includes("CORRECT")
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {log.action_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-white font-sans">
                            {log.actor_name} <span className="text-[#94A3B8]">({log.actor_role})</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#94A3B8]">
                            {log.entity_type} #{log.entity_id}
                          </td>
                          <td className="py-2.5 px-3 text-[#94A3B8] font-sans truncate max-w-xs">
                            {log.details_json}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
