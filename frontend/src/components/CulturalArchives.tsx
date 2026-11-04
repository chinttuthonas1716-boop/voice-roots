import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Search,
  PlusCircle,
  ShieldCheck,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Lock,
  Headphones,
  Languages,
  RotateCcw,
  RotateCw,
  Repeat,
  Radio,
} from "lucide-react";
import {
  ArchiveCollection,
  CulturalStory,
  CulturalArchiveOverview,
  CulturalSubmission,
  AuthUser,
  BilingualSegment,
} from "../types";

export interface CulturalArchivesProps {
  apiBaseUrl?: string;
  adminApiKey?: string;
  currentUser?: AuthUser | null;
  authToken?: string | null;
}

export const CulturalArchives: React.FC<CulturalArchivesProps> = ({
  apiBaseUrl = "",
  adminApiKey = "",
  currentUser = null,
  authToken = null,
}) => {
  // State
  const [overview, setOverview] = useState<CulturalArchiveOverview | null>(null);
  const [collections, setCollections] = useState<ArchiveCollection[]>([]);
  const [stories, setStories] = useState<CulturalStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<CulturalStory | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<ArchiveCollection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"collections" | "stories" | "elder_portal">("collections");
  const [storyInspectorTab, setStoryInspectorTab] = useState<"transcript" | "translation" | "provenance">("transcript");

  // User Role Switcher for OCAP demonstration
  const [userRole, setUserRole] = useState<"public" | "elder" | "researcher">("public");

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [inspectorMode, setInspectorMode] = useState<"bilingual" | "tabs">("bilingual");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync userRole with authenticated currentUser
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin" || currentUser.role === "reviewer") {
        setUserRole("elder");
      } else if (currentUser.role === "researcher") {
        setUserRole("researcher");
      } else {
        setUserRole("public");
      }
    }
  }, [currentUser]);

  // Community Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [subTitle, setSubTitle] = useState<string>("");
  const [subLanguage, setSubLanguage] = useState<string>("gon");
  const [subVariety, setSubVariety] = useState<string>("");
  const [subContributor, setSubContributor] = useState<string>("");
  const [subEmail, setSubEmail] = useState<string>("");
  const [subDescription, setSubDescription] = useState<string>("");
  const [subTranscript, setSubTranscript] = useState<string>("");
  const [subTranslation, setSubTranslation] = useState<string>("");
  const [subAttribution, setSubAttribution] = useState<string>("BY_NAME");
  const [subCollectionId, setSubCollectionId] = useState<string>("");
  const [subIsSacred, setSubIsSacred] = useState<boolean>(false);
  const [subAudioFile, setSubAudioFile] = useState<File | null>(null);

  // 6-Facet OCAP Consent State
  const [consentRecording, setConsentRecording] = useState<boolean>(true);
  const [consentTranscription, setConsentTranscription] = useState<boolean>(true);
  const [consentTranslation, setConsentTranslation] = useState<boolean>(false);
  const [consentPublicDisplay, setConsentPublicDisplay] = useState<boolean>(true);
  const [consentResearchReuse, setConsentResearchReuse] = useState<boolean>(true);
  const [consentEducationalReuse, setConsentEducationalReuse] = useState<boolean>(true);

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pending Submissions for Elder Review
  const [pendingSubmissions, setPendingSubmissions] = useState<CulturalSubmission[]>([]);
  const [reviewNotes, setReviewNotes] = useState<string>("");

  const getHeaders = () => {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
      headers["X-Admin-Key"] = authToken;
    } else if (adminApiKey) {
      headers["X-Admin-Key"] = adminApiKey;
      headers["Authorization"] = `Bearer ${adminApiKey}`;
    }
    if (userRole === "elder") {
      headers["X-User-Role"] = "elder";
    } else if (userRole === "researcher") {
      headers["X-User-Role"] = "researcher";
    }
    return headers;
  };

  // Fetch Overview, Collections, Stories
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const [ovRes, collRes, storyRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/v1/cultural-archives/overview`, { headers }),
        fetch(`${apiBaseUrl}/api/v1/cultural-archives/collections`, { headers }),
        fetch(`${apiBaseUrl}/api/v1/cultural-archives/stories`, { headers }),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (collRes.ok) setCollections(await collRes.json());
      if (storyRes.ok) setStories(await storyRes.json());
    } catch (err) {
      console.error("Failed to fetch cultural archives data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRole]);

  // Audio Playback Handlers
  const handleSelectStory = (story: CulturalStory) => {
    setSelectedStory(story);
    setIsPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(story.audio_duration_seconds || 0);
    setStoryInspectorTab("transcript");
  };

  const handleOpenSubmitModal = () => {
    if (currentUser) {
      if (!subContributor) setSubContributor(currentUser.full_name || currentUser.username);
      if (!subEmail) setSubEmail(currentUser.email);
    }
    setIsSubmitModalOpen(true);
  };

  const handleSkipSeconds = (deltaSeconds: number) => {
    if (!audioRef.current) return;
    const maxDur = audioDuration || selectedStory?.audio_duration_seconds || 100;
    const newTime = Math.max(0, Math.min(maxDur, (audioRef.current.currentTime || 0) + deltaSeconds));
    audioRef.current.currentTime = newTime;
    setAudioCurrentTime(newTime);
  };

  const handleSeekToTime = (targetTime: number) => {
    if (!audioRef.current) return;
    const maxDur = audioDuration || selectedStory?.audio_duration_seconds || 100;
    const clampedTime = Math.max(0, Math.min(maxDur, targetTime));
    audioRef.current.currentTime = clampedTime;
    setAudioCurrentTime(clampedTime);
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0;
    }
  };

  const handleToggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  // Synchronized Bilingual Segments Builder
  const bilingualSegments: BilingualSegment[] = useMemo(() => {
    if (!selectedStory) return [];
    const totalDuration = selectedStory.audio_duration_seconds || audioDuration || 60;
    const vernSource =
      selectedStory.transliteration ||
      selectedStory.raw_transcript_text ||
      selectedStory.native_title ||
      selectedStory.description ||
      "";
    const transSource = selectedStory.translation_text || selectedStory.description || "";

    // Split text into coherent sentences using punctuation or linebreaks
    const vernSentences = vernSource
      .split(/(?<=[.।?!;\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const transSentences = transSource
      .split(/(?<=[.।?!;\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const segmentCount = Math.max(vernSentences.length, transSentences.length, 1);
    const segmentInterval = totalDuration / segmentCount;

    return Array.from({ length: segmentCount }, (_, idx) => {
      const vern = vernSentences[idx] || (idx === 0 ? vernSource : `Narrative continues (${idx + 1})...`);
      const trans = transSentences[idx] || (idx === 0 ? transSource : `Translation continues (${idx + 1})...`);
      return {
        id: idx,
        vernacularText: vern,
        nativeScriptText: idx === 0 && selectedStory.native_title ? selectedStory.native_title : undefined,
        translatedText: trans,
        startTime: idx * segmentInterval,
        endTime: (idx + 1) * segmentInterval,
      };
    });
  }, [selectedStory, audioDuration]);

  // Active sentence segment index
  const activeSegmentIndex = useMemo(() => {
    if (!bilingualSegments.length || audioDuration === 0) return -1;
    return bilingualSegments.findIndex(
      (seg) => audioCurrentTime >= seg.startTime && audioCurrentTime < seg.endTime
    );
  }, [bilingualSegments, audioCurrentTime, audioDuration]);

  // Deterministic Waveform Heights based on Story ID
  const waveformBars = useMemo(() => {
    if (!selectedStory) return [];
    const seed = selectedStory.story_id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const count = 56;
    return Array.from({ length: count }, (_, i) => {
      const rawVal =
        0.2 +
        0.8 *
          Math.abs(
            Math.sin((seed + i * 5.73) * 1.6) * Math.cos((seed + i * 3.29) * 1.1)
          );
      return Math.max(0.18, Math.min(1.0, rawVal));
    });
  }, [selectedStory]);

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Filtered Stories
  const filteredStories = stories.filter((s) => {
    const matchLang = !selectedLanguage || s.primary_language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchCat = !selectedCategory || (s.collection_category && s.collection_category.includes(selectedCategory));
    const matchColl = !selectedCollection || s.collection_id === selectedCollection.collection_id;
    const matchQuery =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.native_title && s.native_title.includes(searchQuery)) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.location_name && s.location_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchLang && matchCat && matchColl && matchQuery;
  });

  // Handle Community Submission
  const handleSubmitRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subAudioFile) {
      setSubmitFeedback({ type: "error", message: "Audio file is required to preserve oral master." });
      return;
    }
    if (!consentRecording) {
      setSubmitFeedback({ type: "error", message: "Affirmative recording consent is required under OCAP rules." });
      return;
    }
    if (subIsSacred) {
      setSubmitFeedback({
        type: "error",
        message: "Sacred / secret ceremonial lore cannot be submitted through public queues. Please consult elders directly.",
      });
      return;
    }

    setSubmitLoading(true);
    setSubmitFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", subAudioFile);
      formData.append("title", subTitle);
      formData.append("language", subLanguage);
      formData.append("contributor_name", subContributor);
      if (subEmail) formData.append("contributor_email", subEmail);
      if (subVariety) formData.append("variety", subVariety);
      if (subDescription) formData.append("description", subDescription);
      if (subTranscript) formData.append("transcript_draft", subTranscript);
      if (subTranslation) formData.append("translation_draft", subTranslation);
      formData.append("attribution_preference", subAttribution);
      if (subCollectionId) formData.append("collection_id", subCollectionId);
      formData.append("consent_recording", String(consentRecording));
      formData.append("consent_transcription", String(consentTranscription));
      formData.append("consent_translation", String(consentTranslation));
      formData.append("consent_public_display", String(consentPublicDisplay));
      formData.append("consent_research_reuse", String(consentResearchReuse));
      formData.append("consent_educational_reuse", String(consentEducationalReuse));
      formData.append("is_sacred_ceremonial", "false");

      const res = await fetch(`${apiBaseUrl}/api/v1/cultural-archives/submissions/upload-audio`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Submission failed");
      }

      setSubmitFeedback({
        type: "success",
        message: "Oral recording submitted successfully! It is queued for Community Elder review.",
      });
      // Reset form
      setSubTitle("");
      setSubDescription("");
      setSubTranscript("");
      setSubTranslation("");
      setSubEmail("");
      setSubAudioFile(null);
      fetchData();
    } catch (err: any) {
      setSubmitFeedback({ type: "error", message: err.message || "Submission failed" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Review Submission (Elder role)
  const handleReviewSubmission = async (subId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      const headers = { ...getHeaders(), "Content-Type": "application/json" };
      const reviewerName = currentUser?.full_name || currentUser?.username || "Community Elder Council";
      const res = await fetch(`${apiBaseUrl}/api/v1/cultural-archives/submissions/${subId}/review`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          decision,
          reviewer_name: reviewerName,
          review_notes: reviewNotes || (decision === "APPROVED" ? "Verified authentic cultural lore" : "Declined"),
          create_story_on_approval: true,
        }),
      });
      if (res.ok) {
        alert(`Submission ${decision.toLowerCase()} successfully.`);
        setPendingSubmissions((prev) => prev.filter((p) => p.submission_id !== subId));
        fetchData();
      }
    } catch (e) {
      console.error("Review error:", e);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 text-neutral-800">
      {/* 1. Header & Telemetry */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-700/60 backdrop-blur rounded-full text-xs font-semibold tracking-wide text-amber-200 uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Milestone 17 — Oral History & Cultural Archives
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Interactive Cultural & Oral Archives
            </h1>
            <p className="text-amber-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
              Preserving living indigenous narratives, oral epics, healer chants, and harvest ballads with
              authentic master acoustic recordings, community governance, and strict OCAP data sovereignty.
            </p>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-500/60 text-xs text-emerald-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="uppercase text-emerald-300 font-bold">{currentUser.role}</strong>: {currentUser.full_name || currentUser.username}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-stone-950/60 p-1.5 rounded-xl border border-amber-700/50 text-xs">
              <span className="text-stone-400 font-medium px-2">Access View:</span>
              <button
                onClick={() => setUserRole("public")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  userRole === "public" ? "bg-amber-600 text-white font-semibold shadow" : "text-stone-300 hover:text-white"
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setUserRole("elder")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  userRole === "elder" ? "bg-amber-600 text-white font-semibold shadow" : "text-stone-300 hover:text-white"
                }`}
              >
                Elder / Custodian
              </button>
              <button
                onClick={() => setUserRole("researcher")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  userRole === "researcher" ? "bg-amber-600 text-white font-semibold shadow" : "text-stone-300 hover:text-white"
                }`}
              >
                Researcher
              </button>
            </div>

            <button
              onClick={handleOpenSubmitModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-all transform active:scale-95 text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Propose Recording
            </button>
          </div>
        </div>

        {/* Telemetry Stats Strip */}
        {overview && (
          <div className="mt-8 pt-6 border-t border-amber-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-stone-900/40 p-3 rounded-xl border border-amber-600/20">
              <div className="text-2xl font-black text-amber-300">{overview.total_collections}</div>
              <div className="text-xs text-amber-200/80 uppercase tracking-wider font-medium">Curated Collections</div>
            </div>
            <div className="bg-stone-900/40 p-3 rounded-xl border border-amber-600/20">
              <div className="text-2xl font-black text-amber-300">{overview.total_stories}</div>
              <div className="text-xs text-amber-200/80 uppercase tracking-wider font-medium">Oral Stories</div>
            </div>
            <div className="bg-stone-900/40 p-3 rounded-xl border border-amber-600/20">
              <div className="text-2xl font-black text-amber-300">
                {(overview.total_audio_duration_seconds / 60).toFixed(1)}m
              </div>
              <div className="text-xs text-amber-200/80 uppercase tracking-wider font-medium">Acoustic Master Audio</div>
            </div>
            <div className="bg-stone-900/40 p-3 rounded-xl border border-amber-600/20">
              <div className="text-2xl font-black text-amber-300">{overview.languages_represented.length}</div>
              <div className="text-xs text-amber-200/80 uppercase tracking-wider font-medium">Languages Represented</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("collections");
              setSelectedCollection(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "collections"
                ? "bg-stone-900 text-white shadow"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Curated Collections ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "stories"
                ? "bg-stone-900 text-white shadow"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All Oral Stories ({stories.length})
          </button>
          {userRole === "elder" && (
            <button
              onClick={() => setActiveTab("elder_portal")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "elder_portal"
                  ? "bg-amber-700 text-white shadow"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
              }`}
            >
              Elder Review Portal
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {selectedCollection && (
            <div className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span>Collection: {selectedCollection.title}</span>
              <button
                onClick={() => setSelectedCollection(null)}
                className="hover:text-amber-700 font-bold"
              >
                &times;
              </button>
            </div>
          )}

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search lore, title, script..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Languages</option>
            <option value="gon">Gondi (గోండీ)</option>
            <option value="kff">Koya (కోయ)</option>
            <option value="sat">Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
            <option value="lmn">Lambadi (లంబాడీ)</option>
          </select>
        </div>
      </div>

      {/* 3. Main Views */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading authenticated cultural archive resources...
        </div>
      ) : activeTab === "collections" ? (
        /* Collections Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((c) => (
            <div
              key={c.collection_id}
              onClick={() => {
                setSelectedCollection(c);
                setActiveTab("stories");
                setSelectedCategory(c.category);
              }}
              className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold uppercase tracking-wider">
                    {c.primary_language.toUpperCase()}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {c.access_classification === "SACRED_ELDER_ONLY" ? (
                      <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1 font-bold">
                        <Lock className="w-3 h-3" /> Sacred Elder Lore
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Public Heritage
                      </span>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                    {c.title}
                  </h3>
                  <div className="text-xs text-amber-700 font-medium mt-1">{c.category}</div>
                </div>

                <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed">
                  {c.description || "No description provided."}
                </p>
              </div>

              <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  {c.creator_name}
                </div>
                <div className="font-semibold text-amber-700">
                  {c.story_count || 0} Stories &rarr;
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "stories" ? (
        /* Stories Grid & Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Stories List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {filteredStories.length === 0 ? (
              <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
                No oral stories matching your query.
              </div>
            ) : (
              filteredStories.map((story) => {
                const isSelected = selectedStory?.story_id === story.story_id;
                return (
                  <div
                    key={story.story_id}
                    onClick={() => handleSelectStory(story)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-50/70 border-amber-400 shadow-md ring-1 ring-amber-400"
                        : "bg-white border-stone-200 hover:border-amber-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-xs font-semibold">
                            {story.primary_language.toUpperCase()}
                          </span>
                          {story.dialect_variety && (
                            <span className="text-xs text-stone-500 font-medium">{story.dialect_variety}</span>
                          )}
                          {story.access_classification === "SACRED_ELDER_ONLY" && (
                            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                              Sacred Lore
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-stone-900">{story.title}</h4>
                        {story.native_title && (
                          <div className="text-sm font-medium text-amber-900 font-serif">
                            {story.native_title}
                          </div>
                        )}
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1">{story.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="p-2.5 rounded-full bg-amber-100 text-amber-900 group-hover:scale-110 transition-transform">
                          <Headphones className="w-4 h-4" />
                        </div>
                        {story.audio_duration_seconds ? (
                          <span className="text-xs font-mono text-stone-500">
                            {Math.floor(story.audio_duration_seconds / 60)}:
                            {String(Math.floor(story.audio_duration_seconds % 60)).padStart(2, "0")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {story.contributor_name}
                      </span>
                      {story.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          {story.location_name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Player & Story Inspector (5 Cols) */}
          <div className="lg:col-span-5">
            {selectedStory ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-md sticky top-6 space-y-6">
                {/* Audio Master Player Container */}
                <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-4 shadow-xl border border-stone-800">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="w-4 h-4 animate-pulse text-amber-400" /> Authentic Acoustic Master
                    </div>
                    {/* Loop & Volume Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleToggleLoop}
                        title={isLooping ? "Looping Enabled" : "Loop Audio"}
                        className={`p-1.5 rounded-lg transition-all ${
                          isLooping ? "bg-amber-600 text-white" : "text-stone-400 hover:text-white bg-stone-800/80"
                        }`}
                      >
                        <Repeat className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-stone-800/80 px-2 py-1 rounded-lg">
                        <button
                          onClick={handleToggleMute}
                          className="text-stone-400 hover:text-white transition-colors"
                          title={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-16 h-1 accent-amber-500 bg-stone-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Story Title & Dialect */}
                  <div>
                    <div className="text-base font-bold truncate text-white">{selectedStory.title}</div>
                    <div className="text-xs text-amber-300/80 font-medium mt-0.5">
                      {selectedStory.primary_language.toUpperCase()} • {selectedStory.dialect_variety || "Traditional Dialect"}
                    </div>
                  </div>

                  {/* Interactive Multi-Bar Waveform Visualizer */}
                  <div className="space-y-1.5">
                    <div
                      className="h-14 bg-stone-950 rounded-xl p-2 px-3 border border-stone-800 flex items-end justify-between gap-1 cursor-pointer select-none relative overflow-hidden group"
                      title="Click anywhere on waveform to seek audio"
                    >
                      {waveformBars.map((height, i) => {
                        const totalDur = audioDuration || selectedStory.audio_duration_seconds || 100;
                        const barTime = (i / waveformBars.length) * totalDur;
                        const isPlayed = barTime <= audioCurrentTime;
                        const isCurrent = Math.abs(barTime - audioCurrentTime) < totalDur / waveformBars.length;
                        return (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeekToTime(barTime);
                            }}
                            className={`flex-1 rounded-full transition-all duration-75 ${
                              isCurrent
                                ? "bg-amber-200 ring-2 ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                                : isPlayed
                                ? "bg-gradient-to-t from-amber-600 to-amber-400"
                                : "bg-stone-700/70 group-hover:bg-stone-600"
                            }`}
                            style={{
                              height: `${Math.max(14, Math.round(height * 44))}px`,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Scrub Slider */}
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || selectedStory.audio_duration_seconds || 100}
                      step="0.1"
                      value={audioCurrentTime}
                      onChange={(e) => handleSeekToTime(parseFloat(e.target.value))}
                      className="w-full h-1.5 accent-amber-500 bg-stone-800 rounded-lg cursor-pointer"
                    />

                    {/* Time Counter */}
                    <div className="flex justify-between text-[11px] font-mono text-stone-400">
                      <span>{formatTime(audioCurrentTime)}</span>
                      <span>{formatTime(audioDuration || selectedStory.audio_duration_seconds || 0)}</span>
                    </div>
                  </div>

                  {/* HTML5 Audio Element streaming from backend */}
                  <audio
                    ref={audioRef}
                    src={`${apiBaseUrl}/api/v1/cultural-archives/stories/${selectedStory.story_id}/audio`}
                    onTimeUpdate={() => {
                      if (audioRef.current) {
                        setAudioCurrentTime(audioRef.current.currentTime);
                        setAudioDuration(audioRef.current.duration || selectedStory.audio_duration_seconds || 0);
                      }
                    }}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => {
                      setIsPlaying(false);
                    }}
                  />

                  {/* Main Playback & Skip Controls */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Skip -5s, Play/Pause, Skip +5s */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSkipSeconds(-5)}
                        title="Skip backward 5s"
                        className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all active:scale-90 flex items-center justify-center text-xs font-mono font-bold"
                      >
                        <RotateCcw className="w-4 h-4 mr-0.5" />
                        <span className="text-[10px]">5s</span>
                      </button>

                      <button
                        onClick={toggleAudioPlay}
                        className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-stone-950 flex items-center justify-center font-bold shadow-lg shadow-amber-900/40 transition-transform active:scale-95 shrink-0"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>

                      <button
                        onClick={() => handleSkipSeconds(5)}
                        title="Skip forward 5s"
                        className="p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all active:scale-90 flex items-center justify-center text-xs font-mono font-bold"
                      >
                        <span className="text-[10px]">5s</span>
                        <RotateCw className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl text-xs font-mono">
                      {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleSpeedChange(rate)}
                          className={`px-2 py-0.5 rounded-lg transition-all ${
                            playbackRate === rate
                              ? "bg-amber-600 text-white font-bold shadow-sm"
                              : "text-stone-400 hover:text-white"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inspector View Mode Switcher */}
                <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setInspectorMode("bilingual")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      inspectorMode === "bilingual"
                        ? "bg-white text-amber-900 shadow-sm border border-stone-200"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Synchronized Bilingual ({bilingualSegments.length} Segments)
                  </button>
                  <button
                    onClick={() => setInspectorMode("tabs")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      inspectorMode === "tabs"
                        ? "bg-white text-amber-900 shadow-sm border border-stone-200"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    Detailed Tabs & OCAP
                  </button>
                </div>

                {/* 1. Synchronized Bilingual Mode */}
                {inspectorMode === "bilingual" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                      <span>Live Sentence Alignment</span>
                      <span className="text-[11px] text-amber-800 font-medium">Click any line to jump audio</span>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {bilingualSegments.map((seg) => {
                        const isActive = activeSegmentIndex === seg.id;
                        return (
                          <div
                            key={seg.id}
                            onClick={() => {
                              handleSeekToTime(seg.startTime);
                              if (!isPlaying && audioRef.current) {
                                audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                              }
                            }}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isActive
                                ? "bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/30"
                                : "bg-stone-50/70 border-stone-200 hover:bg-amber-50/40 hover:border-amber-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-mono text-[11px] font-semibold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded">
                                {formatTime(seg.startTime)} - {formatTime(seg.endTime)}
                              </span>
                              {isActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                  <Radio className="w-3 h-3 text-emerald-600" /> Now Speaking
                                </span>
                              )}
                            </div>

                            {/* Vernacular Speech */}
                            {seg.nativeScriptText && (
                              <div className="text-sm font-serif font-bold text-stone-900 mb-1 leading-snug">
                                {seg.nativeScriptText}
                              </div>
                            )}
                            <div className="text-xs font-mono text-stone-800 leading-relaxed">
                              {seg.vernacularText}
                            </div>

                            {/* English / Hindi Translation */}
                            <div className="mt-2 pt-2 border-t border-stone-200/80 flex items-start gap-1.5 text-xs text-stone-600 leading-relaxed">
                              <Languages className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <span className="italic">{seg.translatedText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Detailed Tabs Mode */}
                {inspectorMode === "tabs" && (
                  <div className="space-y-4">
                    {/* Tab Navigation for Inspector */}
                    <div className="flex border-b border-stone-200">
                      <button
                        onClick={() => setStoryInspectorTab("transcript")}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                          storyInspectorTab === "transcript"
                            ? "border-amber-600 text-amber-900"
                            : "border-transparent text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        Transcript & Phonetics
                      </button>
                      <button
                        onClick={() => setStoryInspectorTab("translation")}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                          storyInspectorTab === "translation"
                            ? "border-amber-600 text-amber-900"
                            : "border-transparent text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        Verified Translation
                      </button>
                      <button
                        onClick={() => setStoryInspectorTab("provenance")}
                        className={`px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                          storyInspectorTab === "provenance"
                            ? "border-amber-600 text-amber-900"
                            : "border-transparent text-stone-500 hover:text-stone-800"
                        }`}
                      >
                        OCAP Provenance
                      </button>
                    </div>

                    {/* Tab Contents */}
                    {storyInspectorTab === "transcript" && (
                      <div className="space-y-4">
                        {selectedStory.native_title && (
                          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                            <div className="text-xs text-amber-800 font-semibold mb-1">Native Script Orthography</div>
                            <div className="text-base font-serif text-stone-900 font-bold">{selectedStory.native_title}</div>
                          </div>
                        )}
                        {selectedStory.transliteration && (
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                            <div className="text-xs text-stone-500 font-semibold mb-1">Phonetic Roman Transliteration</div>
                            <div className="text-sm font-mono text-stone-800">{selectedStory.transliteration}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {storyInspectorTab === "translation" && (
                      <div className="space-y-3">
                        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                          <div className="text-xs text-stone-500 font-semibold mb-1.5 flex items-center gap-1.5">
                            <Languages className="w-3.5 h-3.5 text-amber-700" /> Human-Verified Meaning
                          </div>
                          <p className="text-sm text-stone-800 leading-relaxed">
                            {selectedStory.translation_text || "Translation under community elder review."}
                          </p>
                        </div>
                      </div>
                    )}

                    {storyInspectorTab === "provenance" && (
                      <div className="space-y-3 text-xs text-stone-700">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 bg-stone-50 rounded-lg">
                            <span className="text-stone-400 block font-medium">Contributor</span>
                            <span className="font-semibold text-stone-900">{selectedStory.contributor_name}</span>
                          </div>
                          <div className="p-2.5 bg-stone-50 rounded-lg">
                            <span className="text-stone-400 block font-medium">Attribution Rule</span>
                            <span className="font-semibold text-stone-900">{selectedStory.attribution_preference}</span>
                          </div>
                          <div className="p-2.5 bg-stone-50 rounded-lg">
                            <span className="text-stone-400 block font-medium">Recorded Date</span>
                            <span className="font-semibold text-stone-900">{selectedStory.recording_date || "Historical"}</span>
                          </div>
                          <div className="p-2.5 bg-stone-50 rounded-lg">
                            <span className="text-stone-400 block font-medium">Location</span>
                            <span className="font-semibold text-stone-900">{selectedStory.location_name || "Preserved"}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <span className="text-amber-900 font-bold block mb-1">Traditional Knowledge Label</span>
                          <span className="text-stone-800">{selectedStory.traditional_knowledge_label || "TK Notice (Open Community Archive)"}</span>
                        </div>

                        {selectedStory.reviewed_by && (
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                            <span className="font-bold block">Verified by Elder:</span>
                            <span>{selectedStory.reviewed_by} ({selectedStory.reviewed_at ? selectedStory.reviewed_at.slice(0, 10) : ""})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center text-stone-500">
                <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                Select any oral story to listen to the original acoustic master and inspect translations.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Elder Review Portal (When role is Elder) */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Community Elder Moderation & Sovereignty Portal</h3>
              <p className="text-xs text-stone-500 mt-1">
                Authoritative governance panel for reviewing pending community oral contributions, verifying translations, or revoking consent.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentUser && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Reviewer: {currentUser.full_name || currentUser.username}
                </span>
              )}
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
                Elder Custodian Mode Active
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-800">Pending Review Submissions</h4>
              <div>
                <input
                  type="text"
                  placeholder="Review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="px-3 py-1 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {pendingSubmissions.length === 0 && stories.filter((s) => s.review_status === "SUBMITTED").length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-sm">
                No submissions currently waiting for elder review.
              </div>
            ) : (
              stories
                .filter((s) => s.review_status === "SUBMITTED")
                .map((sub) => (
                  <div key={sub.story_id} className="p-4 border border-stone-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-stone-900">{sub.title}</h5>
                        <span className="text-xs text-stone-500">
                          {sub.primary_language.toUpperCase()} • Contributor: {sub.contributor_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewSubmission(sub.story_id, "APPROVED")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Link
                        </button>
                        <button
                          onClick={() => handleReviewSubmission(sub.story_id, "REJECTED")}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 4. Community Contribution Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">Propose Oral Recording for Cultural Archive</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Upload an audio recording of traditional stories, healer formulations, or spoken-word folklore.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {submitFeedback && (
              <div
                className={`p-4 rounded-xl text-xs font-medium ${
                  submitFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {submitFeedback.message}
              </div>
            )}

            <form onSubmit={handleSubmitRecording} className="space-y-4">
              {/* Sacred lore warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <span className="font-bold">OCAP Sacred Knowledge Warning:</span>
                  <p>
                    Ceremonial or secret sacred lore must NOT be submitted here. Only general folklore, songs, and
                    community-approved histories should be archived publicly.
                  </p>
                </div>
              </div>

              {/* Title & Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Title of Oral Recording *</label>
                  <input
                    type="text"
                    required
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="e.g. Origin of the First Drum"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Language *</label>
                  <select
                    value={subLanguage}
                    onChange={(e) => setSubLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="gon">Gondi (గోండీ)</option>
                    <option value="kff">Koya (కోయ)</option>
                    <option value="sat">Santhali (ᱥᱟᱱᱛᱟᱲᱤ)</option>
                    <option value="lmn">Lambadi (లంబాడీ)</option>
                  </select>
                </div>
              </div>

              {/* Variety, Contributor & Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Dialect / Variety</label>
                  <input
                    type="text"
                    value={subVariety}
                    onChange={(e) => setSubVariety(e.target.value)}
                    placeholder="e.g. Bastar Gondi"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-700">Contributor Name *</label>
                    {currentUser && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Autofilled
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={subContributor}
                    onChange={(e) => setSubContributor(e.target.value)}
                    placeholder="e.g. Elder Sakru Bai"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Contributor Email</label>
                  <input
                    type="email"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    placeholder="contributor@example.org"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Collection & Attribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Target Collection (Optional)</label>
                  <select
                    value={subCollectionId}
                    onChange={(e) => setSubCollectionId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Standalone / Unassigned --</option>
                    {collections.map((coll) => (
                      <option key={coll.collection_id} value={coll.collection_id}>
                        {coll.title} ({coll.primary_language.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Attribution Preference</label>
                  <select
                    value={subAttribution}
                    onChange={(e) => setSubAttribution(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="BY_NAME">By Name (Public attribution)</option>
                    <option value="COMMUNITY_CLAN">Community Clan Attribution</option>
                    <option value="ANONYMOUS">Anonymous Contributor</option>
                  </select>
                </div>
              </div>

              {/* Audio File Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Master Audio Recording (.wav, .mp3) *</label>
                <input
                  type="file"
                  required
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSubAudioFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Cultural Context & Description</label>
                <textarea
                  rows={2}
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  placeholder="Context of when this oral story is recounted, instruments used, or clan significance."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Draft Transcript & Translation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Optional Draft Transcript / Lyrics</label>
                  <textarea
                    rows={2}
                    value={subTranscript}
                    onChange={(e) => setSubTranscript(e.target.value)}
                    placeholder="Original spoken text or phonetic words"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Optional Draft Translation</label>
                  <textarea
                    rows={2}
                    value={subTranslation}
                    onChange={(e) => setSubTranslation(e.target.value)}
                    placeholder="Meaning in English or Telugu"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Sacred Lore Checkbox */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-900">
                  <input
                    type="checkbox"
                    checked={subIsSacred}
                    onChange={(e) => setSubIsSacred(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>This recording contains secret / ceremonial sacred lore (Must be held under elder custody)</span>
                </label>
              </div>

              {/* 6-Facet OCAP Consent Checklist */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                  Mandatory 6-Facet OCAP Consent Permissions
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentRecording}
                      onChange={(e) => setConsentRecording(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Permission to preserve audio master *</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTranscription}
                      onChange={(e) => setConsentTranscription(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Permission to transcribe speech</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentTranslation}
                      onChange={(e) => setConsentTranslation(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Permission to translate text</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentPublicDisplay}
                      onChange={(e) => setConsentPublicDisplay(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Permission for public archive display</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentResearchReuse}
                      onChange={(e) => setConsentResearchReuse(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Permission for linguistic research</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentEducationalReuse}
                      onChange={(e) => setConsentEducationalReuse(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Permission for educational lessons</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-xl text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm shadow transition-all disabled:opacity-50"
                >
                  {submitLoading ? "Submitting..." : "Submit to Elder Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

