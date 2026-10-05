"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { RecordingCard, RecordingCardData } from "@/components/archive/RecordingCard";
import { Filter, Search, Sparkles, BookOpen, Mic } from "lucide-react";
import Link from "next/link";

const ALL_ARCHIVE_ITEMS: RecordingCardData[] = [
  {
    id: "vr-101",
    title: "Traditional Harvest & Rain Song",
    language: "Telugu",
    dialect: "Agency Hill Dialect",
    duration: "08:42",
    type: "song",
    community: "Agency Hill Clans",
    excerpt: "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట...",
    translationExcerpt: "Before the rains fall on our village, the elders perform Earth worship and sing this heirloom melody...",
    confidence: 0.94,
  },
  {
    id: "vr-102",
    title: "The Legend of the Mountain Spring",
    language: "Gondi",
    dialect: "Mandla Hill Variety",
    duration: "14:15",
    type: "story",
    community: "Pardhan Community",
    excerpt: "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक पुरानी कहानी है...",
    translationExcerpt: "Behind the perennial spring on the mountain peak lies an ancient tale of our ancestors...",
    confidence: 0.91,
  },
  {
    id: "vr-103",
    title: "Neem & Turmeric Traditional Medicine",
    language: "Koya",
    dialect: "Godavari Valley Variety",
    duration: "06:30",
    type: "traditional_knowledge",
    community: "Forest Dwellers Collective",
    excerpt: "అడవిలో దొరికే వేప, పసుపు వేర్లతో జ్వరాలు తగ్గించే సాంప్రదాయ వైద్య విధానం...",
    translationExcerpt: "How wild neem and indigenous turmeric roots are formulated into seasonal fever remedies...",
    confidence: 0.96,
  },
  {
    id: "vr-104",
    title: "Conversations on Traditional Handloom Weaving",
    language: "Santali",
    dialect: "Mayurbhanj Santali",
    duration: "11:20",
    type: "conversation",
    community: "Mayurbhanj Artisans",
    excerpt: "ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮᱧ ᱠᱟᱹᱢᱤ ᱟᱨ ᱱᱟᱜᱟᱢ ᱨᱮᱱᱟᱜ ᱠᱟᱛᱷᱟ...",
    translationExcerpt: "Weaving cotton yarn according to seasonal patterns passed from mothers to daughters...",
    confidence: 0.89,
  },
  {
    id: "vr-201",
    title: "Seed Preservation in Mud Granaries",
    language: "Telugu",
    dialect: "Rayalaseema",
    duration: "09:12",
    type: "traditional_knowledge",
    community: "Dryland Farming Collective",
    excerpt: "పాతకాలం నాటి విత్తనాలను మట్టి గాదెలలో భద్రపరిచే విధానం...",
    translationExcerpt: "Methods for storing heirloom millets in sun-baked clay vessels using neem leaf layers...",
    confidence: 0.95,
  },
  {
    id: "vr-202",
    title: "Herbal Remedies of the Northern Hills",
    language: "Bhili",
    dialect: "Southern Rajasthan",
    duration: "12:45",
    type: "traditional_knowledge",
    community: "Bhil Healers",
    excerpt: "जंगल की जड़ी-बूटियों से मौसमी बीमारियों का इलाज करने का तरीका...",
    translationExcerpt: "Forest apothecary practices for treating monsoon illnesses using bark extracts...",
    confidence: 0.92,
  },
  {
    id: "vr-203",
    title: "Cloud Reading & Wind Signs for Sowing",
    language: "Kannada",
    dialect: "Deccan Plateau",
    duration: "07:50",
    type: "traditional_knowledge",
    community: "Kaveri Farmers",
    excerpt: "ಮಳೆ ಬರುವ ಮುನ್ನ ಬೀಸುವ ಗಾಳಿಯ ದಿಕ್ಕು ಮತ್ತು ಮೋಡಗಳ ಚಲನೆಯನ್ನು ಗುರುತಿಸುವುದು...",
    translationExcerpt: "Reading seasonal wind shifts and thunder color to identify the exact morning for sowing ragi...",
    confidence: 0.93,
  },
  {
    id: "vr-301",
    title: "Grandmother's Eclipse Tale",
    language: "Telugu",
    dialect: "Coastal Krishna",
    duration: "05:18",
    type: "story",
    community: "Krishna Delta",
    excerpt: "సూర్యగ్రహణం సమయంలో పాము ఆకాశాన్ని చుట్టుముట్టినట్లు ఉండే పాత కథ...",
    translationExcerpt: "The coastal folklore describing astronomical eclipses through snake metaphors...",
    confidence: 0.93,
  },
];

export default function ArchivePage() {
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = ALL_ARCHIVE_ITEMS.filter((item) => {
    const matchesLang = selectedLanguage === "all" || item.language.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translationExcerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLang && matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-obsidian text-primary-text pb-24">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <span className="text-xs font-mono uppercase text-leaf-green">Living Language Repository</span>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-1">
              Digital Language Archive
            </h1>
            <p className="text-secondary-text text-sm max-w-xl mt-1">
              Browse 4,821 oral recordings preserved across 18 indigenous and regional linguistic traditions.
            </p>
          </div>

          <Link
            href="/record"
            className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-root-green text-obsidian font-semibold text-xs shadow-glow hover:scale-105 transition-all"
          >
            <Mic className="w-3.5 h-3.5 fill-current" />
            <span>Contribute Voice</span>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-surface p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword, title, village name, or translated phrase..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-secondary-text/50 focus:outline-none focus:border-root-green/50"
            />
          </div>

          {/* Language Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-mono text-secondary-text mr-1">Language:</span>
            {["all", "Telugu", "Gondi", "Koya", "Santali", "Bhili", "Kannada"].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedLanguage.toLowerCase() === lang.toLowerCase()
                    ? "bg-root-green text-obsidian font-semibold"
                    : "bg-white/5 text-secondary-text hover:text-white hover:bg-white/10"
                }`}
              >
                {lang === "all" ? "All Languages" : lang}
              </button>
            ))}
          </div>

          {/* Type Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-mono text-secondary-text mr-1">Category:</span>
            {[
              { id: "all", label: "All Types" },
              { id: "story", label: "Folk Stories" },
              { id: "song", label: "Songs & Chants" },
              { id: "traditional_knowledge", label: "Traditional Knowledge" },
              { id: "conversation", label: "Dialect Conversations" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedType === cat.id
                    ? "bg-leaf-green text-obsidian font-semibold"
                    : "bg-white/5 text-secondary-text hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs font-mono text-secondary-text">
          <span>Showing {filteredItems.length} preserved recordings</span>
          <span>Verified against UNESCO Endangerment criteria</span>
        </div>

        {/* Grid of Recordings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex">
              <RecordingCard item={item} />
            </div>
          ))}
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
