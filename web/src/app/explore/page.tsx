"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Globe2, 
  Sparkles, 
  MapPin, 
  AudioLines, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  Users, 
  Filter,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { 
  getAllLanguages, 
  getAllStates, 
  getMotherTonguesByLanguage,
  formatCardMetadata,
  type Language,
  type StateUT,
  type MotherTongue
} from "@/lib/indiaGeoData";
import { StoryCardAudioButton } from "@/components/audio/StoryCardAudioButton";

const REGIONS = [
  { name: "Telangana & Godavari Basin", language: "Telugu", count: 24, description: "Monsoon agricultural invocations, river folklore, and agrarian ballads" },
  { name: "Bastar & Utnoor Forests", language: "Gondi", count: 18, description: "Primordial Ghotul clan lore, sacred hill legends, and mahua tree rituals" },
  { name: "Papikonda Hill Range & Maredumilli", language: "Koya", count: 12, description: "Ethnobotanical medicinal chant traditions, wild turmeric roots lore" },
  { name: "Coastal Tulunadu & Western Ghats", language: "Tulu", count: 16, description: "Koti-Chennaya heroic Paddana epics and spirit worship chants" },
  { name: "Deccan Plateau & Tanda Hamlets", language: "Lambadi", count: 14, description: "Caravan migration trade routes, twilight ballads, and nomadic wisdom" },
  { name: "Kaveri Delta & Tamil Country", language: "Tamil", count: 20, description: "Village deity folklore, harvest festival oral lyrics, and temple lore" },
];

export default function ExplorePage() {
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [allStates, setAllStates] = useState<StateUT[]>([]);
  
  // Filtering states
  const [activeTab, setActiveTab] = useState<"recorded" | "all" | "scheduled" | "nonscheduled">("recorded");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedLanguageForModal, setSelectedLanguageForModal] = useState<Language | null>(null);

  useEffect(() => {
    setRecords(getUserRecordings());
    setAllLanguages(getAllLanguages());
    setAllStates(getAllStates());
  }, []);

  // Filter languages based on tab, query, and state
  const filteredLanguages = useMemo(() => {
    let list = allLanguages;

    if (activeTab === "recorded") {
      list = list.filter((l) => l.hasRecording);
    } else if (activeTab === "scheduled") {
      list = list.filter((l) => l.isScheduled || l.officialStatus === "SCHEDULED_8");
    } else if (activeTab === "nonscheduled") {
      list = list.filter((l) => !l.isScheduled && l.officialStatus !== "SCHEDULED_8");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.censusName.toLowerCase().includes(q) ||
          (l.censusCode && l.censusCode.includes(q)) ||
          l.languageFamily.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allLanguages, activeTab, searchQuery]);

  // Mother tongues for selected language
  const currentMotherTongues = useMemo(() => {
    if (!selectedLanguageForModal) return [];
    return getMotherTonguesByLanguage(selectedLanguageForModal.censusCode || selectedLanguageForModal.name);
  }, [selectedLanguageForModal]);

  // Heritage records for selected language
  const currentLanguageRecords = useMemo(() => {
    if (!selectedLanguageForModal) return [];
    const name = selectedLanguageForModal.name.toLowerCase();
    return records.filter((r) => r.language.toLowerCase() === name || (name === "hindi" && r.language.toLowerCase() === "lambadi"));
  }, [selectedLanguageForModal, records]);

  return (
    <div className="vr-app pb-28">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-10 px-4 pt-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="space-y-3">
          <span className="eyebrow">
            LINGUISTIC & CULTURAL GEOGRAPHY · CENSUS C-16 EXPLORER
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Language Explorer
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-[#D9D9E2] sm:text-base">
            Discover India’s authentic spoken traditions. Grounded in the official <strong>Census of India 2011 C-16 reference catalogue</strong> (121 languages, 355 rationalized mother tongues), paired with living, community-contributed oral recordings.
          </p>
        </header>

        {/* Hierarchy Breadcrumb Banner */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.3)] p-4 text-xs font-mono text-[#D9D9E2]">
          <span className="font-bold text-[#F9B17A] flex items-center gap-1">
            <Globe2 className="h-4 w-4" /> INDIA
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <span className="text-white/80">35 States & UTs</span>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <span className="text-white/80">121 Languages (22 Sched + 99 Non-Sched)</span>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <span className="text-white/80">355 Mother Tongues</span>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <span className="text-emerald-400 font-semibold">Living Oral Recordings 🎙️</span>
        </div>

        {/* Tab Filters */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("recorded")}
                className={`min-h-10 rounded-full px-5 text-xs font-semibold transition ${
                  activeTab === "recorded"
                    ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                    : "border border-white/10 text-[#A9AEC5] hover:text-white hover:bg-white/5"
                }`}
              >
                🎙️ Living Recordings Available ({allLanguages.filter(l => l.hasRecording).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`min-h-10 rounded-full px-5 text-xs font-semibold transition ${
                  activeTab === "all"
                    ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                    : "border border-white/10 text-[#A9AEC5] hover:text-white hover:bg-white/5"
                }`}
              >
                All Census Languages ({allLanguages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("scheduled")}
                className={`min-h-10 rounded-full px-5 text-xs font-semibold transition ${
                  activeTab === "scheduled"
                    ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                    : "border border-white/10 text-[#A9AEC5] hover:text-white hover:bg-white/5"
                }`}
              >
                22 Scheduled Languages
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("nonscheduled")}
                className={`min-h-10 rounded-full px-5 text-xs font-semibold transition ${
                  activeTab === "nonscheduled"
                    ? "bg-[#F9B17A] text-[#242942] font-bold shadow-sm"
                    : "border border-white/10 text-[#A9AEC5] hover:text-white hover:bg-white/5"
                }`}
              >
                99 Non-Scheduled & Tribal
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9AEC5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language, census code, family..."
                className="w-full rounded-full border border-white/10 bg-[#42476C]/60 pl-10 pr-4 py-2 text-xs text-white placeholder-[#A9AEC5] outline-none focus:border-[#F9B17A]"
              />
            </div>
          </div>
        </section>

        {/* Language Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {activeTab === "recorded" ? "Languages with Authentic Spoken Recordings" : "Official Language Catalogue"}
            </h2>
            <span className="text-xs text-[#A9AEC5] font-mono">
              Showing {filteredLanguages.length} languages
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredLanguages.map((lang) => (
              <div
                key={lang.id}
                className={`flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                  lang.hasRecording
                    ? "border-[#F9B17A]/40 bg-[rgba(66,71,108,0.35)] hover:border-[#F9B17A]"
                    : "border-white/10 bg-[rgba(66,71,108,0.2)] hover:border-white/20"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-[#A9AEC5]">
                      CENSUS #{lang.censusCode || "REF"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        lang.isScheduled
                          ? "bg-purple-900/50 text-purple-300 border border-purple-500/30"
                          : "bg-amber-900/40 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {lang.isScheduled ? "Scheduled (8th)" : "Non-Scheduled"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      {lang.name}
                    </h3>
                    <p className="text-xs font-mono text-[#F9B17A] mt-0.5">
                      {lang.nativeName} · {lang.languageFamily}
                    </p>
                  </div>

                  {lang.population_2011 && (
                    <div className="rounded-xl bg-black/20 p-2.5 text-[11px] font-mono text-[#D9D9E2] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#A9AEC5]">Census 2011 Speakers:</span>
                        <span className="font-bold text-white">{lang.population_2011.toLocaleString()}</span>
                      </div>
                      {lang.rural_population_2011 && (
                        <div className="flex justify-between text-[10px] text-[#A9AEC5]">
                          <span>Rural: {lang.rural_population_2011.toLocaleString()}</span>
                          <span>Urban: {lang.urban_population_2011?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-[#D9D9E2] line-clamp-2">
                    {lang.description}
                  </p>
                </div>

                <div className="mt-5 space-y-3 border-t border-white/10 pt-3">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {lang.hasRecording ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Spoken Recording Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#A9AEC5]">
                        <Info className="h-3.5 w-3.5" /> Reference only — No recording yet
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguageForModal(lang)}
                      className="text-xs font-bold text-[#F9B17A] hover:underline inline-flex items-center gap-1"
                    >
                      Explore Hierarchy <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    {lang.hasRecording && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                        VERIFIED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected Language Detail Modal */}
        {selectedLanguageForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#242942] p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#F9B17A] uppercase tracking-wider">
                      C-16 OFFICIAL CATALOGUE ENTRY
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-white">
                      Code: {selectedLanguageForModal.censusCode}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    {selectedLanguageForModal.name} ({selectedLanguageForModal.nativeName})
                  </h2>
                  <p className="text-xs text-[#A9AEC5] mt-0.5">
                    Family: {selectedLanguageForModal.languageFamily} · Classification: {selectedLanguageForModal.officialStatus}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLanguageForModal(null)}
                  className="rounded-full p-2 text-[#A9AEC5] hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Provenance Box */}
              <div className="rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.25)] p-4 text-xs space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-[#F9B17A]" /> Official Provenance: Census of India 2011 Table C-16
                </div>
                <p className="text-[#D9D9E2] leading-relaxed">
                  Published by the <em>Office of the Registrar General & Census Commissioner, India</em> (Ref: PC11_C16-00). Total recorded speakers in 2011: <strong>{selectedLanguageForModal.population_2011?.toLocaleString()}</strong>.
                </p>
              </div>

              {/* Mother Tongues under this Language */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Rationalized Mother Tongues under {selectedLanguageForModal.name} ({currentMotherTongues.length})
                </h3>
                {currentMotherTongues.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
                    {currentMotherTongues.map((mt) => (
                      <div
                        key={mt.mother_tongue_id}
                        className="rounded-xl border border-white/5 bg-black/20 p-2.5 text-xs flex justify-between items-center"
                      >
                        <span className="font-semibold text-white">{mt.name}</span>
                        <span className="font-mono text-[11px] text-[#A9AEC5]">
                          {mt.population_2011.toLocaleString()} speakers
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#A9AEC5]">No separate sub-mother tongues listed in Statement 1.</p>
                )}
              </div>

              {/* Heritage Recordings Section */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center justify-between">
                  <span>Living Heritage Recordings</span>
                  <span className="text-xs text-[#F9B17A] font-mono">{currentLanguageRecords.length} records found</span>
                </h3>

                {currentLanguageRecords.length > 0 ? (
                  <div className="space-y-3">
                    {currentLanguageRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.3)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-white text-base">{rec.title}</h4>
                          <p className="text-xs text-[#A9AEC5] line-clamp-1 mt-1">{rec.culturalContext}</p>
                          <span className="inline-block mt-2 font-mono text-[10px] text-[#F9B17A] uppercase">
                            {formatCardMetadata(rec)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <StoryCardAudioButton record={rec} />
                          <Link
                            href={`/story/${rec.id}`}
                            className="rounded-xl border border-[#F9B17A] px-3 py-1.5 text-xs font-semibold text-[#F9B17A] hover:bg-[#F9B17A] hover:text-[#242942] transition"
                          >
                            View Story →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-center space-y-3">
                    <p className="text-xs text-[#A9AEC5] max-w-md mx-auto">
                      <strong>Reference available — no community recording yet.</strong><br />
                      This language is documented in the national census catalogue, but Voice Roots does not currently hold a living spoken recording from community speakers.
                    </p>
                    <Link
                      href="/record"
                      className="inline-flex items-center gap-2 rounded-full bg-[#F9B17A] px-5 py-2 text-xs font-bold text-[#242942] shadow-sm hover:opacity-90"
                    >
                      🎙️ Contribute Recording for {selectedLanguageForModal.name}
                    </Link>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLanguageForModal(null)}
                  className="rounded-full border border-white/20 px-6 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Close Explorer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cultural Geographic Landscapes */}
        <section className="space-y-5 pt-6 border-t border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Geographic Heritage Clusters</h2>
            <p className="text-xs text-[#A9AEC5] mt-1">
              Oral literature clusters shaped by river basins, forest tracts, and mountain ranges.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((reg) => (
              <div
                key={reg.name}
                className="rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.2)] p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F9B17A]">
                    <MapPin className="h-3.5 w-3.5" /> {reg.language} Cluster
                  </span>
                  <span className="text-[11px] font-mono text-[#A9AEC5]">{reg.count} lore records</span>
                </div>
                <h3 className="text-base font-bold text-white">{reg.name}</h3>
                <p className="text-xs text-[#A9AEC5] leading-relaxed">{reg.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AIAssistant />
    </div>
  );
}
