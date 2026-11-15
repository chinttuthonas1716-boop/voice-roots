"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  Mic,
  Cpu,
  Layers,
  ChevronDown,
  Info,
  ExternalLink,
  PlusCircle,
  X,
  Volume2,
  TreePine,
  ShieldAlert,
  Radio,
  FileCheck2,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import {
  getAllLanguageResourceStatuses,
  getAllDatasetEntries,
  type LanguageResourceStatus,
  type LanguageLifecycleStage,
  type LanguageClassificationStatus,
  type DatasetEntry,
} from "@/lib/datasetRegistry";

export default function ExplorePage() {
  const [allLanguages, setAllLanguages] = useState<LanguageResourceStatus[]>([]);
  const [datasets, setDatasets] = useState<DatasetEntry[]>([]);
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<"ALL" | "India" | "Global">("ALL");
  const [selectedStage, setSelectedStage] = useState<LanguageLifecycleStage | "ALL">("ALL");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedFamily, setSelectedFamily] = useState<string>("ALL");
  const [selectedScriptType, setSelectedScriptType] = useState<"ALL" | "unwritten_oral" | "developing_orthography" | "standardized_script">("ALL");

  // Modal State
  const [activeLanguageModal, setActiveLanguageModal] = useState<LanguageResourceStatus | null>(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);

  // Propose Language Form State
  const [proposeName, setProposeName] = useState("");
  const [proposeCode, setProposeCode] = useState("");
  const [proposeCountry, setProposeCountry] = useState("");
  const [proposeFamily, setProposeFamily] = useState("");
  const [proposeScript, setProposeScript] = useState("Unwritten (Pure Oral)");
  const [proposeSource, setProposeSource] = useState("");
  const [proposeNotes, setProposeNotes] = useState("");
  const [proposeSuccess, setProposeSuccess] = useState(false);

  useEffect(() => {
    setAllLanguages(getAllLanguageResourceStatuses());
    setDatasets(getAllDatasetEntries());
    setRecords(getUserRecordings());
  }, []);

  // Distinct Filter Options
  const distinctRegions = useMemo(() => {
    const set = new Set(allLanguages.map((l) => l.macroRegion));
    return Array.from(set).sort();
  }, [allLanguages]);

  const distinctFamilies = useMemo(() => {
    const set = new Set(allLanguages.map((l) => l.languageFamily));
    return Array.from(set).sort();
  }, [allLanguages]);

  // Filtered Languages
  const filteredLanguages = useMemo(() => {
    return allLanguages.filter((l) => {
      // 1. Origin Filter (India vs Global)
      if (selectedOrigin !== "ALL" && l.regionCategory !== selectedOrigin) {
        return false;
      }

      // 2. Lifecycle Stage
      if (selectedStage !== "ALL" && l.lifecycleStage !== selectedStage) {
        return false;
      }

      // 3. Macro Region
      if (selectedRegion !== "ALL" && l.macroRegion !== selectedRegion) {
        return false;
      }

      // 4. Family
      if (selectedFamily !== "ALL" && l.languageFamily !== selectedFamily) {
        return false;
      }

      // 5. Script / Orthography Type
      if (selectedScriptType !== "ALL" && l.scriptType !== selectedScriptType) {
        return false;
      }

      // 6. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = l.languageName.toLowerCase().includes(q);
        const matchesNative = l.nativeName.toLowerCase().includes(q);
        const matchesCode = l.languageCode.toLowerCase().includes(q);
        const matchesCountry = l.country.toLowerCase().includes(q);
        const matchesFamily = l.languageFamily.toLowerCase().includes(q);
        const matchesDialect = l.dialectsList.some((d) => d.toLowerCase().includes(q));
        return matchesName || matchesNative || matchesCode || matchesCountry || matchesFamily || matchesDialect;
      }

      return true;
    });
  }, [allLanguages, selectedOrigin, selectedStage, selectedRegion, selectedFamily, selectedScriptType, searchQuery]);

  // Stage Badge Helper
  const getStageBadge = (stage: LanguageLifecycleStage) => {
    switch (stage) {
      case "DISCOVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/40 bg-blue-900/30 text-blue-200">
            <Search className="h-3.5 w-3.5 text-blue-300" />
            <span>Discovered (Cataloged)</span>
          </span>
        );
      case "RESEARCH_ASSESSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-purple-400/40 bg-purple-900/30 text-purple-200">
            <Cpu className="h-3.5 w-3.5 text-purple-300" />
            <span>Research-Assessed</span>
          </span>
        );
      case "COMMUNITY_APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-400/40 bg-emerald-900/30 text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            <span>Community-Approved (OCAP®)</span>
          </span>
        );
      case "DATASET_AVAILABLE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/40 bg-amber-900/30 text-amber-200">
            <Layers className="h-3.5 w-3.5 text-amber-300" />
            <span>Dataset Available</span>
          </span>
        );
      case "OPERATIONAL_ASR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/50 bg-emerald-600/30 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Operational Speech Recognition</span>
          </span>
        );
    }
  };

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeName.trim() || !proposeCountry.trim()) return;

    const newLang: LanguageResourceStatus = {
      languageCode: proposeCode.trim().toLowerCase() || "und",
      languageName: proposeName.trim(),
      nativeName: proposeName.trim(),
      languageFamily: proposeFamily.trim() || "Unclassified",
      country: proposeCountry.trim(),
      macroRegion: "South Asia",
      regionCategory: proposeCountry.toLowerCase().includes("india") ? "India" : "Global",
      statesOrRegions: [proposeCountry.trim()],
      scriptOrthography: proposeScript,
      scriptType: proposeScript.toLowerCase().includes("unwritten") ? "unwritten_oral" : "developing_orthography",
      lifecycleStage: "DISCOVERED",
      discoverySource: proposeSource.trim() || "Community Field Documentation",
      assessment: {
        speechDataAvailability: "none",
        digitalTextAvailability: "none",
        existingAsrNlpSupport: "none",
        scriptOrthographySupport: proposeScript.toLowerCase().includes("unwritten") ? "unwritten_pure_oral" : "developing",
        dialectDiversity: "moderate",
        communityParticipation: "in_dialogue",
        consentGovernance: "pending_formal_consent",
      },
      dialectsList: [],
      isScheduled8: false,
      isSppelListed: false,
      census2011Speakers: null,
      censusCitation: `Community submission: ${proposeSource.trim() || "Field Documentation"}`,
      classificationStatus: "NEEDS_ASSESSMENT",
      classificationLabel: "Needs assessment",
      classificationReason: "Newly proposed low-resource language. Awaiting linguistic audit and elder consent.",
      asrStatus: "not_available",
      ttsStatus: "not_available",
      translationStatus: "not_available",
      speechRecordingsStatus: "not_audited",
      verifiedTranscriptsStatus: "not_available",
      recordedHoursEstimate: "Pending field survey",
      verifiedTranscriptsCount: 0,
      testedModels: [],
      datasetLinks: [],
      lastAuditedDate: new Date().toISOString().split("T")[0],
      supportLimitationNotice: "Unverified community submission. Speech recognition is disabled until formal validation.",
    };

    setAllLanguages((prev) => [newLang, ...prev]);
    setProposeSuccess(true);
    setTimeout(() => {
      setIsProposeModalOpen(false);
      setProposeSuccess(false);
      setProposeName("");
      setProposeCode("");
      setProposeCountry("");
      setProposeFamily("");
      setProposeSource("");
      setProposeNotes("");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#071A13] pb-28 text-[#F5F3E9] font-sans selection:bg-[#A6C48A]/40 selection:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-12 px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        
        {/* =========================================================================
           HEADER: GLOBAL SCOPE & MISSION STATEMENT
           ========================================================================= */}
        <header className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A6C48A]/35 bg-[#102B20]/80 px-4 py-1.5 text-xs font-bold text-[#A6C48A] backdrop-blur-md">
            <Globe2 className="h-4 w-4 text-[#A6C48A]" />
            <span className="tracking-[0.18em] uppercase font-display">
              GLOBAL LOW-RESOURCE LANGUAGE ARCHITECTURE
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F5F3E9] font-serif font-serif-display leading-tight">
            Explore the World’s <span className="text-[#A6C48A] italic">Living Tongues.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#F5F3E9]/85 font-light leading-relaxed">
            Voice Roots is not restricted to any single language list or geographic boundary.
            Our platform provides an extensible, language-independent foundation for documenting,
            assessing, and digitally preserving low-resource oral languages across every continent.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsProposeModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F5138] hover:bg-[#477A50] text-sm font-bold text-[#F5F3E9] border border-[#A6C48A]/40 shadow-md transition"
            >
              <PlusCircle className="h-4 w-4 text-[#A6C48A]" />
              <span>Propose / Onboard a Language</span>
            </button>
            <Link
              href="/registry"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#A6C48A]/30 bg-black/40 hover:bg-[#102B20]/60 text-sm font-semibold text-[#A6C48A] hover:text-white transition"
            >
              <BookOpen className="h-4 w-4" />
              <span>Inspect Datasets Registry</span>
            </Link>
          </div>
        </header>

        {/* =========================================================================
           ARCHITECTURE DIAGRAM: 4-TIER DISCOVERY FLOW (Reference: Uploaded Diagram)
           ========================================================================= */}
        <section aria-label="Language Discovery Architecture" className="forest-glass-panel p-6 sm:p-8 rounded-[2rem] space-y-6">
          <div className="flex items-center justify-between border-b border-[#A6C48A]/20 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A6C48A] font-display">
                ARCHITECTURE BLUEPRINT
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#F5F3E9]">
                The Voice Roots Language Discovery & Preservation Pipeline
              </h2>
            </div>
            <span className="hidden sm:inline text-xs font-mono text-[#A6C48A]/70">
              Language-Independent AI & OCAP® Governance
            </span>
          </div>

          {/* Step 1: Global Registry Box */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#A6C48A]/40 bg-[#102B20] p-4 sm:p-5 text-center shadow-md">
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#F5F3E9] font-display">
                VOICE ROOTS GLOBAL LANGUAGE REGISTRY
              </h3>
              <p className="text-xs sm:text-sm text-[#A6C48A] mt-1 font-light">
                Dynamic, extensible, and language-independent
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#A6C48A]/20 text-left">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="block text-xs font-bold text-[#F5F3E9] uppercase">India Context</span>
                  <span className="block text-xs text-[#A6C48A]/80 mt-0.5">
                    Government language databases (Census 2011 C-16), CIIL SPPEL, Bhashini, and regional research institutes.
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="block text-xs font-bold text-[#F5F3E9] uppercase">Global Scope</span>
                  <span className="block text-xs text-[#A6C48A]/80 mt-0.5">
                    International repositories (Glottolog, UNESCO Atlas, ISO 639-3, OLAC, ELAR, Common Voice).
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-[#A6C48A]/40" />
            </div>

            {/* Step 2: Assessment Engine */}
            <div className="rounded-2xl border border-[#DCE9D7]/40 bg-[#F5F3E9] text-[#102B20] p-4 sm:p-5 text-center shadow-md">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#1F5138]">
                <Cpu className="h-4 w-4 text-[#1F5138]" />
                <span>Language Assessment Engine</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold font-serif text-[#102B20] mt-1">
                Rigorous Multi-Dimensional Evaluation
              </h4>
              <p className="text-xs sm:text-sm text-[#496354] mt-1 font-light max-w-2xl mx-auto">
                Assesses digital text corpora · Speech dataset availability · Script & orthography resources · Dialect diversity · Existing ASR support · Community participation · Customary consent permissions.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-[#A6C48A]/40" />
            </div>

            {/* Step 3: Community-Approved Profiles */}
            <div className="rounded-2xl border border-[#A6C48A]/40 bg-[#102B20] p-4 sm:p-5 text-center shadow-md">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#A6C48A]">
                <ShieldCheck className="h-4 w-4 text-[#A6C48A]" />
                <span>Community-Approved Language Profiles</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold font-serif text-[#F5F3E9] mt-1">
                Customary Elder Authority & First Nations OCAP® Sovereignty
              </h4>
              <p className="text-xs sm:text-sm text-[#A6C48A]/90 mt-1 font-light max-w-2xl mx-auto">
                Only onboarded when affirmative community consent and data-access permissions are formally satisfied. Sacred clan lore and restricted ceremonies remain shielded.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-0.5 h-6 bg-[#A6C48A]/40" />
            </div>

            {/* Step 4: Shared Multilingual AI Engine */}
            <div className="rounded-2xl border border-[#DCE9D7]/40 bg-[#F5F3E9] text-[#102B20] p-4 sm:p-5 text-center shadow-md">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#1F5138]">
                <Radio className="h-4 w-4 text-[#1F5138]" />
                <span>Shared Multilingual AI & Preservation Engine</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold font-serif text-[#102B20] mt-1">
                Unified Speech Recognition · Verification · Semantic Search · Lossless Archives
              </h4>
              <p className="text-xs sm:text-sm text-[#496354] mt-1 font-light max-w-2xl mx-auto">
                Zero separate hardcoded apps per language. Shared acoustic encoders with configurable language profiles and human elder peer review.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
           CRITICAL ARCHIVAL RULE BANNER: NEVER DISPLAY UNVERIFIED AS FULLY SUPPORTED
           ========================================================================= */}
        <section
          aria-label="Verification Transparency Protocol"
          className="p-5 sm:p-6 rounded-2xl border border-amber-500/40 bg-amber-950/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Core Archival Mandate: Never Display an Unverified Language as Fully Supported
            </h3>
            <p className="text-xs sm:text-sm text-amber-100/85 font-light leading-relaxed">
              Every tongue in Voice Roots carries an evidence-based assessment badge. When a language is discovered from census or international repositories, it is labeled as <strong className="text-white">Discovered</strong> or <strong className="text-white">Research-Assessed</strong> until real speech datasets, elder council approval, and verified acoustic models are operational.
            </p>
          </div>
        </section>

        {/* =========================================================================
           GLOBAL FILTER & DISCOVERY TOOLBAR
           ========================================================================= */}
        <section aria-label="Language Discovery Filters" className="space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#F5F3E9]">
                Global Language Catalog ({filteredLanguages.length} tongues)
              </h2>
              <p className="text-xs text-[#A6C48A]/80 mt-0.5">
                Filter across origin repositories, lifecycle stages, language families, and orthographies.
              </p>
            </div>

            {/* Origin Scope Switcher */}
            <div className="flex items-center rounded-full border border-[#A6C48A]/30 bg-[#102B20]/90 p-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedOrigin("ALL")}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  selectedOrigin === "ALL" ? "bg-[#A6C48A] text-[#071A13]" : "text-[#A6C48A]/80 hover:text-white"
                }`}
              >
                All Global Sources
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrigin("India")}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  selectedOrigin === "India" ? "bg-[#A6C48A] text-[#071A13]" : "text-[#A6C48A]/80 hover:text-white"
                }`}
              >
                India (Census/CIIL)
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrigin("Global")}
                className={`px-3 py-1.5 rounded-full font-semibold transition ${
                  selectedOrigin === "Global" ? "bg-[#A6C48A] text-[#071A13]" : "text-[#A6C48A]/80 hover:text-white"
                }`}
              >
                International (Glottolog/UNESCO)
              </button>
            </div>
          </div>

          {/* Search & Multi-Select Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6C48A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, code, dialect..."
                className="w-full min-h-[44px] rounded-xl border border-[#A6C48A]/30 bg-[#102B20]/60 pl-10 pr-4 text-xs text-[#F5F3E9] placeholder-[#A6C48A]/60 focus:outline-none focus:border-[#A6C48A]"
              />
            </div>

            {/* Macro-Region Filter */}
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#A6C48A]/30 bg-[#102B20]/80 px-3 text-xs text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A] appearance-none"
              >
                <option value="ALL">All Geographic Regions</option>
                {distinctRegions.map((reg) => (
                  <option key={reg} value={reg} className="bg-[#102B20]">
                    {reg}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A6C48A] pointer-events-none" />
            </div>

            {/* Language Family Filter */}
            <div className="relative">
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#A6C48A]/30 bg-[#102B20]/80 px-3 text-xs text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A] appearance-none"
              >
                <option value="ALL">All Language Families</option>
                {distinctFamilies.map((fam) => (
                  <option key={fam} value={fam} className="bg-[#102B20]">
                    {fam}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A6C48A] pointer-events-none" />
            </div>

            {/* Script & Orthography Filter */}
            <div className="relative">
              <select
                value={selectedScriptType}
                onChange={(e) => setSelectedScriptType(e.target.value as any)}
                className="w-full min-h-[44px] rounded-xl border border-[#A6C48A]/30 bg-[#102B20]/80 px-3 text-xs text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A] appearance-none"
              >
                <option value="ALL">All Writing Systems</option>
                <option value="unwritten_oral" className="bg-[#102B20]">
                  Unwritten (Pure Oral Traditions)
                </option>
                <option value="developing_orthography" className="bg-[#102B20]">
                  Developing Orthographies
                </option>
                <option value="standardized_script" className="bg-[#102B20]">
                  Standardized Scripts
                </option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A6C48A] pointer-events-none" />
            </div>
          </div>

          {/* Lifecycle Stage Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A6C48A] mr-2">
              Lifecycle Stage:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStage("ALL")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedStage === "ALL"
                  ? "bg-[#DCE9D7] text-[#071A13] shadow-sm font-bold"
                  : "border border-[#A6C48A]/30 text-[#F5F3E9] hover:bg-[#1F5138]/50"
              }`}
            >
              All Stages ({allLanguages.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("DISCOVERED")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedStage === "DISCOVERED"
                  ? "bg-blue-400 text-blue-950 font-bold"
                  : "border border-blue-400/30 text-blue-300 hover:bg-blue-900/30"
              }`}
            >
              🔍 Discovered
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("RESEARCH_ASSESSED")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedStage === "RESEARCH_ASSESSED"
                  ? "bg-purple-400 text-purple-950 font-bold"
                  : "border border-purple-400/30 text-purple-300 hover:bg-purple-900/30"
              }`}
            >
              🔬 Research-Assessed
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("COMMUNITY_APPROVED")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedStage === "COMMUNITY_APPROVED"
                  ? "bg-emerald-400 text-emerald-950 font-bold"
                  : "border border-emerald-400/30 text-emerald-300 hover:bg-emerald-900/30"
              }`}
            >
              🛡️ Community-Approved
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("DATASET_AVAILABLE")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedStage === "DATASET_AVAILABLE"
                  ? "bg-amber-400 text-amber-950 font-bold"
                  : "border border-amber-400/30 text-amber-300 hover:bg-amber-900/30"
              }`}
            >
              📦 Dataset Available
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("OPERATIONAL_ASR")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedStage === "OPERATIONAL_ASR"
                  ? "bg-emerald-500 text-emerald-950 font-bold"
                  : "border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40"
              }`}
            >
              ⚡ Operational ASR
            </button>
          </div>
        </section>

        {/* =========================================================================
           LANGUAGE CARDS GRID
           ========================================================================= */}
        <section aria-label="Languages Grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLanguages.map((lang) => {
              const isUnwritten = lang.scriptType === "unwritten_oral";
              return (
                <div
                  key={lang.languageCode}
                  className="forest-glass-panel p-6 rounded-3xl flex flex-col justify-between hover:border-[#A6C48A]/50 transition-all duration-300 group space-y-5"
                >
                  <div className="space-y-3">
                    {/* Top Row: Code, Country & Lifecycle Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#163B2C] border border-[#A6C48A]/30 text-[#A6C48A]">
                            ISO: {lang.languageCode}
                          </span>
                          <span className="text-xs text-[#A6C48A]/80 font-medium">
                            {lang.country} · {lang.macroRegion}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#F5F3E9] mt-1 group-hover:text-[#A6C48A] transition-colors">
                          {lang.languageName}
                        </h3>
                        <p className="text-xs text-[#A6C48A] font-medium mt-0.5">
                          {lang.nativeName}
                        </p>
                      </div>

                      {/* Unwritten Script Tag */}
                      {isUnwritten && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 uppercase tracking-wider shrink-0">
                          Oral Tradition
                        </span>
                      )}
                    </div>

                    {/* Stage Badge */}
                    <div className="pt-1">
                      {getStageBadge(lang.lifecycleStage)}
                    </div>

                    {/* Classification & Reason */}
                    <p className="text-xs text-[#F5F3E9]/80 font-light leading-relaxed line-clamp-3">
                      {lang.classificationReason}
                    </p>

                    {/* Orthography & Family Info */}
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#A6C48A]/75">Family:</span>
                        <span className="font-medium text-[#F5F3E9] text-right truncate max-w-[180px]">
                          {lang.languageFamily}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A6C48A]/75">Script:</span>
                        <span className="font-medium text-[#F5F3E9] text-right truncate max-w-[180px]">
                          {lang.scriptOrthography}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#A6C48A]/75">Acoustic Hours:</span>
                        <span className="font-mono text-[#A6C48A] font-bold">
                          {lang.recordedHoursEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Unverified Disclaimer Warning Notice */}
                    {lang.supportLimitationNotice && (
                      <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-[11px] text-amber-200/90 leading-tight">
                        <span className="font-bold text-amber-300 block mb-0.5">Verification Notice:</span>
                        {lang.supportLimitationNotice}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#A6C48A]/20 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveLanguageModal(lang)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#A6C48A] hover:text-white transition"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Assessment Audit</span>
                    </button>

                    <Link
                      href={`/record?lang=${encodeURIComponent(lang.languageName)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F5138] hover:bg-[#A6C48A] text-xs font-bold text-[#F5F3E9] hover:text-[#071A13] transition shadow-sm"
                    >
                      <Mic className="h-3 w-3" />
                      <span>Record Voice</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
           USER-RECORDED VOICES IN ACTIVE SESSION
           ========================================================================= */}
        {records.length > 0 && (
          <section aria-label="Session Recordings" className="space-y-4 pt-6 border-t border-[#A6C48A]/20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif text-[#F5F3E9] flex items-center gap-2">
                <TreePine className="h-5 w-5 text-[#A6C48A]" />
                <span>Locally Preserved Oral Recordings ({records.length})</span>
              </h2>
              <Link href="/dashboard" className="text-xs font-semibold text-[#A6C48A] hover:text-white transition">
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-[#102B20]/60 border border-[#A6C48A]/20 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#A6C48A]">{r.language}</span>
                    <span className="font-mono text-xs text-[#F5F3E9]/70">{r.duration}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#F5F3E9] truncate">{r.title}</h4>
                  <p className="text-xs text-[#A6C48A]/80 line-clamp-2">{r.culturalContext}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* =========================================================================
         DETAILED ASSESSMENT SCORECARD MODAL
         ========================================================================= */}
      {activeLanguageModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="forest-glass-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-[2rem] space-y-6 relative border border-[#A6C48A]/40 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveLanguageModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#163B2C] text-[#A6C48A]">
                  ISO 639-3: {activeLanguageModal.languageCode}
                </span>
                <span className="text-xs text-[#A6C48A]">
                  {activeLanguageModal.country} ({activeLanguageModal.macroRegion})
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#F5F3E9]">
                {activeLanguageModal.languageName}
              </h3>
              <p className="text-sm text-[#A6C48A]">{activeLanguageModal.nativeName}</p>
              <div>{getStageBadge(activeLanguageModal.lifecycleStage)}</div>
            </div>

            {/* Assessment Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6C48A]">
                Language Assessment Engine Scorecard
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[#A6C48A]/80 block text-[11px]">Speech Corpora</span>
                  <span className="font-bold text-[#F5F3E9] uppercase">{activeLanguageModal.assessment.speechDataAvailability}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[#A6C48A]/80 block text-[11px]">Digital Text</span>
                  <span className="font-bold text-[#F5F3E9] uppercase">{activeLanguageModal.assessment.digitalTextAvailability}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[#A6C48A]/80 block text-[11px]">ASR / NLP Readiness</span>
                  <span className="font-bold text-[#F5F3E9] uppercase">{activeLanguageModal.assessment.existingAsrNlpSupport}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[#A6C48A]/80 block text-[11px]">Orthography Status</span>
                  <span className="font-bold text-[#F5F3E9] uppercase">{activeLanguageModal.assessment.scriptOrthographySupport}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[#A6C48A]/80 block text-[11px]">Dialect Variance</span>
                  <span className="font-bold text-[#F5F3E9] uppercase">{activeLanguageModal.assessment.dialectDiversity}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[#A6C48A]/80 block text-[11px]">Governance Status</span>
                  <span className="font-bold text-[#F5F3E9] uppercase">{activeLanguageModal.assessment.consentGovernance}</span>
                </div>
              </div>
            </div>

            {/* Dialects List */}
            {activeLanguageModal.dialectsList.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A6C48A]">
                  Documented Dialect Varieties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeLanguageModal.dialectsList.map((d) => (
                    <span key={d} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#F5F3E9]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Citation & Provenance */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-xs text-[#A6C48A]/90 space-y-1">
              <span className="font-bold text-[#F5F3E9] block">Discovery & Census Source:</span>
              <p>{activeLanguageModal.censusCitation}</p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveLanguageModal(null)}
                className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-semibold hover:bg-white/10 transition"
              >
                Close
              </button>
              <Link
                href={`/record?lang=${encodeURIComponent(activeLanguageModal.languageName)}`}
                className="px-6 py-2.5 rounded-full bg-[#1F5138] hover:bg-[#A6C48A] text-xs font-bold text-[#F5F3E9] hover:text-[#071A13] transition shadow-md"
              >
                Start Archiving Voice
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         PROPOSE / ONBOARD A GLOBAL LANGUAGE MODAL
         ========================================================================= */}
      {isProposeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="forest-glass-panel max-w-xl w-full p-6 sm:p-8 rounded-[2rem] space-y-5 relative border border-[#A6C48A]/40 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsProposeModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#A6C48A]">
                COMMUNITY ONBOARDING
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#F5F3E9]">
                Propose a Low-Resource Language
              </h3>
              <p className="text-xs text-[#A6C48A]/85">
                Submit language metadata from government databases, academic linguistic surveys, or customary community councils.
              </p>
            </div>

            {proposeSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-500/50 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Language Profile Submitted</h4>
                <p className="text-xs text-emerald-200">
                  Added to the Discovered Languages stage. Our linguistic assessment pipeline will audit speech resources and community protocols.
                </p>
              </div>
            ) : (
              <form onSubmit={handleProposeSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#A6C48A] mb-1">Language Name *</label>
                  <input
                    type="text"
                    required
                    value={proposeName}
                    onChange={(e) => setProposeName(e.target.value)}
                    placeholder="e.g. Toda, Nahuatl, Juǀʼhoan"
                    className="w-full min-h-[40px] rounded-xl border border-[#A6C48A]/30 bg-black/40 px-3 text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#A6C48A] mb-1">ISO 639-3 Code</label>
                    <input
                      type="text"
                      value={proposeCode}
                      onChange={(e) => setProposeCode(e.target.value)}
                      placeholder="e.g. tcx, nhe, ktz"
                      className="w-full min-h-[40px] rounded-xl border border-[#A6C48A]/30 bg-black/40 px-3 text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#A6C48A] mb-1">Country / Territory *</label>
                    <input
                      type="text"
                      required
                      value={proposeCountry}
                      onChange={(e) => setProposeCountry(e.target.value)}
                      placeholder="e.g. India, Mexico, Namibia"
                      className="w-full min-h-[40px] rounded-xl border border-[#A6C48A]/30 bg-black/40 px-3 text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#A6C48A] mb-1">Language Family</label>
                    <input
                      type="text"
                      value={proposeFamily}
                      onChange={(e) => setProposeFamily(e.target.value)}
                      placeholder="e.g. Dravidian, Uto-Aztecan"
                      className="w-full min-h-[40px] rounded-xl border border-[#A6C48A]/30 bg-black/40 px-3 text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#A6C48A] mb-1">Script / Orthography</label>
                    <select
                      value={proposeScript}
                      onChange={(e) => setProposeScript(e.target.value)}
                      className="w-full min-h-[40px] rounded-xl border border-[#A6C48A]/30 bg-black/40 px-3 text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                    >
                      <option value="Unwritten (Pure Oral)">Unwritten (Pure Oral)</option>
                      <option value="Latin Alphabet">Latin Alphabet</option>
                      <option value="Devanagari">Devanagari</option>
                      <option value="Indigenous Script">Indigenous Script</option>
                      <option value="Developing Orthography">Developing Orthography</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#A6C48A] mb-1">Discovery Citation / Source</label>
                  <input
                    type="text"
                    value={proposeSource}
                    onChange={(e) => setProposeSource(e.target.value)}
                    placeholder="e.g. National Census, UNESCO Atlas, Academic Corpus"
                    className="w-full min-h-[40px] rounded-xl border border-[#A6C48A]/30 bg-black/40 px-3 text-[#F5F3E9] focus:outline-none focus:border-[#A6C48A]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProposeModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-white/20 text-xs font-semibold hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[#1F5138] hover:bg-[#A6C48A] text-xs font-bold text-[#F5F3E9] hover:text-[#071A13] transition shadow-md"
                  >
                    Submit Language Profile
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <AIAssistant />
    </div>
  );
}
