"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe2, Sparkles, MapPin, AudioLines, BookOpen } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

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
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  useEffect(() => {
    setRecords(getUserRecordings());
  }, []);

  const languageCounts = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.language] = (acc[record.language] || 0) + 1;
    return acc;
  }, {});

  const displayedRecords = selectedLanguage === "all"
    ? records
    : records.filter((r) => r.language.toLowerCase() === selectedLanguage.toLowerCase());

  return (
    <div className="min-h-screen bg-obsidian pb-28 text-primary-text">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-10 px-4 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-root-green/30 bg-root-green/10 px-3.5 py-1 text-xs font-semibold text-leaf-green">
            <Globe2 className="h-4 w-4" /> Linguistic & Cultural Geography
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Explore Oral Roots
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-secondary-text sm:text-base">
            Discover spoken heritages by indigenous language, dialect family, or geographic cultural landscape across South Asia.
          </p>
        </header>

        {/* Language Filter Bar */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-secondary-text">
            Filter by Spoken Language
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedLanguage("all")}
              className={`min-h-10 rounded-full px-5 text-xs font-semibold transition ${
                selectedLanguage === "all"
                  ? "bg-root-green text-obsidian shadow-glow"
                  : "border border-white/10 text-secondary-text hover:text-white hover:bg-white/5"
              }`}
            >
              All Languages ({records.length})
            </button>
            {Object.entries(languageCounts).map(([lang, count]) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`min-h-10 rounded-full px-5 text-xs font-semibold transition ${
                  selectedLanguage === lang
                    ? "bg-root-green text-obsidian shadow-glow"
                    : "border border-white/10 text-secondary-text hover:text-white hover:bg-white/5"
                }`}
              >
                {lang} ({count})
              </button>
            ))}
          </div>
        </section>

        {/* Stories in Selected Language */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {selectedLanguage === "all" ? "All Oral Recordings" : `${selectedLanguage} Oral Lore`}
            </h2>
            <span className="text-xs text-secondary-text">{displayedRecords.length} recordings found</span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayedRecords.map((record) => (
              <Link
                key={record.id}
                href={`/recordings/${record.id}`}
                className="glass-card group flex min-h-[240px] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-root-green/40 hover:bg-white/[0.06] hover:shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-secondary-text">
                    <span className="rounded-full border border-root-green/30 bg-root-green/15 px-3 py-1 font-semibold text-leaf-green">
                      {record.language}
                    </span>
                    <span className="font-mono">{record.duration}</span>
                  </div>
                  <h3 className="line-clamp-2 text-lg font-bold text-white group-hover:text-leaf-green transition">
                    {record.title}
                  </h3>
                  <p className="line-clamp-2 text-xs text-secondary-text">
                    {record.culturalContext}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-secondary-text">
                  <span className="truncate">{record.location || "Deccan Plateau"}</span>
                  <span className="text-leaf-green font-semibold">Listen & View →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Cultural Geographic Landscapes */}
        <section className="space-y-5 pt-6 border-t border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Geographic Heritage Clusters</h2>
            <p className="text-xs text-secondary-text mt-1">
              Oral literature clusters shaped by river basins, forest tracts, and mountain ranges.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REGIONS.map((reg) => (
              <div
                key={reg.name}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-leaf-green">
                    <MapPin className="h-3.5 w-3.5" /> {reg.language} Cluster
                  </span>
                  <span className="text-[11px] font-mono text-secondary-text">{reg.count} lore records</span>
                </div>
                <h3 className="text-base font-bold text-white">{reg.name}</h3>
                <p className="text-xs text-secondary-text leading-relaxed">{reg.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AIAssistant />
    </div>
  );
}
