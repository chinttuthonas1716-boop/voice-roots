"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  BookOpen,
  Mic,
  Cpu,
  Volume2,
  Languages,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import {
  getAllLanguageResourceStatuses,
  getAllDatasetEntries,
  type LanguageResourceStatus,
  type LanguageClassificationStatus,
  type ResourceAuditStatus,
  type DatasetEntry,
} from "@/lib/datasetRegistry";

const CLASSIFICATION_FILTERS: { id: LanguageClassificationStatus | "ALL"; label: string; count?: number; color: string }[] = [
  { id: "ALL", label: "All Languages", color: "border-white/20 text-white" },
  { id: "DIGITAL_RESOURCES_AVAILABLE", label: "Digital Resources Available", color: "border-emerald-500/40 text-emerald-300" },
  { id: "LIMITED_DIGITAL_RESOURCES", label: "Limited Digital Resources", color: "border-amber-500/40 text-amber-300" },
  { id: "COMMUNITY_PRESERVATION_NEEDED", label: "Community Preservation Needed", color: "border-rose-500/40 text-rose-300" },
  { id: "NEEDS_ASSESSMENT", label: "Needs Assessment", color: "border-blue-500/40 text-blue-300" },
];

export default function LanguageRegistryPage() {
  const [languages] = useState<LanguageResourceStatus[]>(getAllLanguageResourceStatuses());
  const [datasets] = useState<DatasetEntry[]>(getAllDatasetEntries());

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LanguageClassificationStatus | "ALL">("ALL");
  const [taskFilter, setTaskFilter] = useState<"all" | "asr" | "tts" | "translation">("all");
  const [familyFilter, setFamilyFilter] = useState<string>("all");
  const [activeDatasetModal, setActiveDatasetModal] = useState<DatasetEntry | null>(null);

  // Distinct language families
  const languageFamilies = useMemo(() => {
    const set = new Set(languages.map((l) => l.languageFamily));
    return Array.from(set);
  }, [languages]);

  // Filtered language list
  const filteredLanguages = useMemo(() => {
    return languages.filter((l) => {
      // 1. Status Filter
      if (selectedStatus !== "ALL" && l.classificationStatus !== selectedStatus) {
        return false;
      }

      // 2. Task Filter
      if (taskFilter === "asr" && l.asrStatus !== "available") return false;
      if (taskFilter === "tts" && l.ttsStatus !== "available") return false;
      if (taskFilter === "translation" && l.translationStatus !== "available") return false;

      // 3. Family Filter
      if (familyFilter !== "all" && l.languageFamily !== familyFilter) return false;

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = l.languageName.toLowerCase().includes(q);
        const matchesNative = l.nativeName.toLowerCase().includes(q);
        const matchesCode = l.languageCode.toLowerCase().includes(q);
        const matchesRegion = l.statesOrRegions.some((r) => r.toLowerCase().includes(q));
        const matchesFamily = l.languageFamily.toLowerCase().includes(q);
        return matchesName || matchesNative || matchesCode || matchesRegion || matchesFamily;
      }

      return true;
    });
  }, [languages, selectedStatus, taskFilter, familyFilter, searchQuery]);

  const getStatusBadge = (status: LanguageClassificationStatus) => {
    switch (status) {
      case "DIGITAL_RESOURCES_AVAILABLE":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Digital resources available
          </span>
        );
      case "LIMITED_DIGITAL_RESOURCES":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <AlertCircle className="h-3 w-3" /> Limited digital resources
          </span>
        );
      case "COMMUNITY_PRESERVATION_NEEDED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
            <Mic className="h-3 w-3" /> Community preservation needed
          </span>
        );
      case "NEEDS_ASSESSMENT":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
            <HelpCircle className="h-3 w-3" /> Needs assessment
          </span>
        );
      case "OFFICIALLY_DOCUMENTED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            <Info className="h-3 w-3" /> Officially documented
          </span>
        );
    }
  };

  const getResourceAuditBadge = (status: ResourceAuditStatus, label: string) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            ✓ {label}
          </span>
        );
      case "limited":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            ~ {label} (limited)
          </span>
        );
      case "not_available":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-medium text-white/50">
            ✕ {label} (none)
          </span>
        );
      case "not_audited":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-300">
            ? {label} (unaudited)
          </span>
        );
    }
  };

  return (
    <div className="vr-app pb-28">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-10 px-4 pt-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              NATIONAL LANGUAGE REGISTRY · DIGITAL RESOURCE ASSESSMENT
            </span>
            <span className="rounded-full border border-[#F9B17A]/30 bg-[#F9B17A]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#F9B17A]">
              CENSUS 2011 & SPPEL BASELINE
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            India Language Registry & Digital Resource Status
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-[#D9D9E2] sm:text-base">
            Tracking what is officially documented, what digital speech resources actually exist, and which oral languages require community preservation work. Grounded in the official <strong>Census of India 2011 C-16 report</strong> and government endangered-language publications.
          </p>
        </header>

        {/* Informational Methodology Banner */}
        <div className="rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-5 text-xs text-[#D9D9E2] space-y-3">
          <div className="flex items-center gap-2 text-[#F9B17A] font-bold text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>Voice Roots Evidence-Based Resource Classification Protocol</span>
          </div>
          <p className="leading-relaxed">
            A language being officially recognized in the Eighth Schedule does not guarantee digital speech resources, nor does endangered status mean zero recordings exist. We audit five discrete evidence tiers: <strong>Speech-to-Text (ASR)</strong>, <strong>Text-to-Speech (TTS)</strong>, <strong>Translation Datasets</strong>, <strong>Living Community Audio</strong>, and <strong>Human-Verified Transcripts</strong>.
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-[11px] text-white/70">
            <span>• Population Baseline: Census 2011 (Table C-16)</span>
            <span>• Endangered Programme: SPPEL Phase I (117 languages)</span>
            <span>• Public Benchmarks: IndicVoices, Kathbath, Vistaar, Common Voice, Indic-TTS</span>
          </div>
        </div>

        {/* Filter Controls */}
        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9AEC5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language, native name, state, family..."
                className="w-full rounded-full border border-white/15 bg-[#1C1512] pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#A9AEC5] outline-none focus:border-[#F9B17A]"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value as any)}
                className="min-h-9 rounded-xl border border-white/15 bg-[#1C1512] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
              >
                <option value="all">All AI Tasks</option>
                <option value="asr">ASR (Speech-to-Text) Available</option>
                <option value="tts">TTS (Text-to-Speech) Available</option>
                <option value="translation">Translation Available</option>
              </select>

              <select
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className="min-h-9 rounded-xl border border-white/15 bg-[#1C1512] px-3 text-xs text-white outline-none focus:border-[#F9B17A]"
              >
                <option value="all">All Language Families</option>
                {languageFamilies.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {CLASSIFICATION_FILTERS.map((f) => {
              const active = selectedStatus === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedStatus(f.id)}
                  className={`min-h-9 rounded-full px-4 text-xs font-semibold transition border ${
                    active
                      ? "bg-[#F9B17A] text-[#242942] border-[#F9B17A] font-bold shadow-sm"
                      : `${f.color} hover:bg-white/5`
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-[#A9AEC5] px-1">
          <span>
            Showing <strong>{filteredLanguages.length}</strong> of {languages.length} audited languages
          </span>
          <span className="text-[11px] text-white/50">
            Click any card to inspect dataset licenses, models, or contribute community recordings
          </span>
        </div>

        {/* Language Registry Grid */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
          {filteredLanguages.map((item) => (
            <article
              key={item.languageCode}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#242942]/60 p-5 transition hover:border-[#F9B17A]/40 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Title, Native Script & Badge */}
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">
                        {item.languageName}
                      </h2>
                      <span className="font-serif text-sm text-[#F9B17A]">
                        {item.nativeName}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A9AEC5] mt-0.5">
                      {item.languageFamily} · {item.statesOrRegions.join(", ")}
                    </p>
                  </div>

                  {getStatusBadge(item.classificationStatus)}
                </div>

                {/* Census 2011 Baseline Information */}
                <div className="rounded-xl border border-white/5 bg-black/30 p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[#A9AEC5]">
                    <span className="font-semibold text-white/90">Census 2011 Population:</span>
                    <span className="font-mono font-bold text-[#F9B17A]">
                      {item.census2011Speakers !== null
                        ? item.census2011Speakers.toLocaleString("en-IN")
                        : "Documentation Intake"}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-tight">
                    {item.censusCitation} (Historical 2011 baseline; not current estimate)
                  </p>
                </div>

                {/* Classification Rationale */}
                <p className="text-xs text-[#D9D9E2] leading-relaxed">
                  {item.classificationReason}
                </p>

                {/* 5-Resource Audit Grid */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-[#A9AEC5] uppercase tracking-wider block">
                    Digital Resource Audit:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {getResourceAuditBadge(item.asrStatus, "Speech-to-Text (ASR)")}
                    {getResourceAuditBadge(item.ttsStatus, "Text-to-Speech (TTS)")}
                    {getResourceAuditBadge(item.translationStatus, "Neural Translation")}
                    {getResourceAuditBadge(item.speechRecordingsStatus, "Community Audio")}
                    {getResourceAuditBadge(item.verifiedTranscriptsStatus, "Verified Transcripts")}
                  </div>
                </div>

                {/* Linked Datasets & Tested Models */}
                {item.datasetLinks.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5 text-[11px]">
                    <span className="text-[#A9AEC5] font-semibold">Linked Public Datasets:</span>
                    <div className="flex flex-wrap gap-2">
                      {item.datasetLinks.map((ds, idx) => (
                        <a
                          key={idx}
                          href={ds.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2 py-0.5 text-blue-300 hover:text-blue-200 transition"
                        >
                          <span>{ds.name}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 mt-2">
                <Link
                  href={`/upload?language=${item.languageCode}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#F9B17A] px-4 py-2 text-xs font-bold text-[#242942] hover:bg-[#ffc599] transition shadow-sm"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>Preserve an Oral Story</span>
                </Link>

                <Link
                  href={`/archive?language=${item.languageName.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#F9B17A]" />
                  <span>View Living Archive</span>
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Public Speech Datasets Registry Table Section */}
        <section className="space-y-5 rounded-2xl border border-white/10 bg-[#242942]/40 p-6">
          <header className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-[#F9B17A]" />
              <span>Public Indian Speech Datasets & Licensing Matrix</span>
            </h2>
            <p className="text-xs text-[#A9AEC5]">
              Overview of public speech corpora evaluated for transfer learning. Checked for licensing, attribution conditions, and access restrictions before use.
            </p>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#D9D9E2]">
              <thead className="border-b border-white/10 bg-black/30 text-[#A9AEC5] font-semibold">
                <tr>
                  <th className="p-3">Dataset Name</th>
                  <th className="p-3">Primary Task</th>
                  <th className="p-3">License Terms</th>
                  <th className="p-3">Languages / Hours</th>
                  <th className="p-3">Source & Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {datasets.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-white">
                      <div>{d.name}</div>
                      <div className="text-[10px] text-[#A9AEC5]">{d.source}</div>
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono">
                        {d.task}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-amber-200/90 font-mono">
                        {d.license}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>{d.totalHoursEstimate}</div>
                      <div className="text-[10px] text-[#A9AEC5]">
                        {d.languagesCovered.slice(0, 3).join(", ")}
                        {d.languagesCovered.length > 3 && ` +${d.languagesCovered.length - 3} more`}
                      </div>
                    </td>
                    <td className="p-3">
                      <a
                        href={d.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <span>Access Dataset</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
