"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { RecordingCard, RecordingCardData } from "@/components/archive/RecordingCard";
import { Search, Mic } from "lucide-react";
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
    id: "vr-105",
    title: "Buffalo Chants and Sacred Dairy Rituals",
    language: "Toda",
    dialect: "Highland Pastoral Clan",
    duration: "09:40",
    type: "song",
    community: "Nilgiri Pastoralists",
    excerpt: "തോഡാ പാരമ്പര്യത്തിൽ കാട്ടുപോത്തുകളെയും പാൽശാലകളെയും പൂജിക്കുന്ന പാട്ടുകൾ...",
    translationExcerpt: "Sacred pastoral prayer chants sung inside conical dairy temples honoring heirloom water buffalo breeds...",
    confidence: 0.92,
  },
  {
    id: "vr-106",
    title: "Living Root Bridges Oral Engineering",
    language: "Khasi",
    dialect: "Sohra Variety",
    duration: "13:10",
    type: "traditional_knowledge",
    community: "Cherrapunji Forest Guardians",
    excerpt: "Ka jingshna ia ki jingkieng da ki thied dieng ha ki khlaw ba rben...",
    translationExcerpt: "Elders narrating how aerial Ficus elastica ficus roots are guided across roaring gorges over seventy years...",
    confidence: 0.95,
  },
  {
    id: "vr-107",
    title: "Paddofield Planting Rhythms (Bwisagu)",
    language: "Bodo",
    dialect: "Western Bodoland",
    duration: "07:25",
    type: "song",
    community: "Kokrajhar Cultivators",
    excerpt: "वैसागु बोथोरनि हाबा मावनाय आरो बारहुंखायाव मेथाय रोजाबनाय...",
    translationExcerpt: "Folk chorus sung during pre-monsoon transplantation celebrating the arrival of the spring winds...",
    confidence: 0.91,
  },
  {
    id: "vr-108",
    title: "Bhootada Kola Spirit Invocation",
    language: "Tulu",
    dialect: "Coastal Tulunadu",
    duration: "15:50",
    type: "song",
    community: "Paddana Chanters",
    excerpt: "ತುಳುನಾಡಿನ ಭೂತಾರಾಧನೆಯ ಸಂದರ್ಭದಲ್ಲಿ ಪಾಡುವ ಪುರಾತನ ಪಾಡ್ಡನಗಳು...",
    translationExcerpt: "Paddana epic recitations evoking regional guardian deities protecting the coconut groves...",
    confidence: 0.93,
  },
  {
    id: "vr-109",
    title: "Highland Barley Brewing Traditions",
    language: "Ladakhi",
    dialect: "Leh Valley",
    duration: "08:10",
    type: "traditional_knowledge",
    community: "Himalayan Village Guild",
    excerpt: "ལ་དྭགས་ཀྱི་སྲོལ་རྒྱུན་ནས་འབྲུ་ཆང་བཟོ་བའི་ལག་རྩལ།...",
    translationExcerpt: "Traditional micro-fermentation of high-altitude roasted barley (chhang) for winter solstice gatherings...",
    confidence: 0.90,
  },
  {
    id: "vr-110",
    title: "Nomadic Caravan Trade Chants",
    language: "Lambadi",
    dialect: "Banjara Tanda Variety",
    duration: "10:30",
    type: "song",
    community: "Banjara Tanda Elders",
    excerpt: "बंजारा तांडा में गाये जाने वाले पारंपरिक लोकगीत और बंजारा संस्कृति...",
    translationExcerpt: "Rhythmic travel ballads mapping seasonal cattle trails across the Deccan highlands...",
    confidence: 0.93,
  },
  {
    id: "vr-111",
    title: "Bamboo Grove Management Oral Laws",
    language: "Mizo",
    dialect: "Lushai Hills",
    duration: "12:05",
    type: "traditional_knowledge",
    community: "Aizawl Forest Council",
    excerpt: "Mautam leh rawthing enkawl dan chungchanga pi leh pute thurochhiah...",
    translationExcerpt: "Elder decrees tracking the 48-year mautam flowering cycle and sustainable harvest rotation...",
    confidence: 0.94,
  },
  {
    id: "vr-112",
    title: "Sacred Forest Grove Laws (Jaher Than)",
    language: "Mundari",
    dialect: "Khunti Variety",
    duration: "11:45",
    type: "traditional_knowledge",
    community: "Munda Forest Council",
    excerpt: "ᱡᱟᱦᱮᱨ ᱛᱷᱟᱱ ᱨᱮᱱᱟᱜ ᱵᱤᱨ ᱥᱟᱥᱚᱱ ᱟᱨ ᱥᱮᱨᱣᱟ ᱠᱟᱛᱷᱟ...",
    translationExcerpt: "Oral legal codes dictating zero timber felling within sacred community groves...",
    confidence: 0.95,
  },
];

const ALL_24_LANGUAGES = [
  "all",
  "Telugu",
  "Gondi",
  "Koya",
  "Tulu",
  "Toda",
  "Kurukh",
  "Kodava",
  "Badaga",
  "Santali",
  "Mundari",
  "Ho",
  "Khasi",
  "Garo",
  "Korku",
  "Bodo",
  "Mizo",
  "Meitei",
  "Lepcha",
  "Ladakhi",
  "Bhili",
  "Lambadi",
  "Halbi",
  "Shina",
  "Balti",
];

export default function ArchivePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const filteredItems = ALL_ARCHIVE_ITEMS.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translationExcerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.community.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage =
      selectedLanguage === "all" ||
      item.language.toLowerCase() === selectedLanguage.toLowerCase();

    const matchesType = selectedType === "all" || item.type === selectedType;

    return matchesSearch && matchesLanguage && matchesType;
  });

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-28">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-netflix-red font-bold tracking-wider">Living Oral Repository</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mt-1">
              Digital Language Archive
            </h1>
            <p className="text-netflix-gray text-sm sm:text-base max-w-2xl mt-1 leading-relaxed">
              Explore 4,821 oral recordings preserved across 24 indigenous and regional linguistic traditions.
            </p>
          </div>

          <Link
            href="/record"
            className="self-start sm:self-auto flex items-center gap-2 px-6 py-2.5 rounded-full ios27-button-primary text-xs shadow-netflix-glow"
          >
            <Mic className="w-3.5 h-3.5 fill-current text-white" />
            <span>Contribute Voice</span>
          </Link>
        </div>

        {/* Filter Controls Bar (Liquid Glass Capsule Bar) */}
        <div className="ios27-glass p-4 sm:p-6 rounded-3xl space-y-4 shadow-2xl border border-white/10">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-netflix-gray absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword, title, village name, ritual, or translated phrase..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-netflix-muted focus:outline-none focus:border-netflix-red/60 focus:ring-1 focus:ring-netflix-red/30 transition-all"
            />
          </div>

          {/* Language Pills (24 languages) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs py-1">
            <span className="text-[11px] font-mono text-netflix-gray mr-1">Language:</span>
            {ALL_24_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedLanguage.toLowerCase() === lang.toLowerCase()
                    ? "bg-netflix-red text-white font-bold shadow-netflix-glow scale-105"
                    : "ios27-pill text-netflix-light hover:text-white"
                }`}
              >
                {lang === "all" ? "All 24 Languages" : lang}
              </button>
            ))}
          </div>

          {/* Type Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="text-[11px] font-mono text-netflix-gray mr-1">Category:</span>
            {[
              { id: "all", label: "All Formats" },
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
                    ? "bg-white text-netflix-black font-bold shadow-md"
                    : "ios27-pill text-netflix-light hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs font-mono text-netflix-gray">
          <span>Showing {filteredItems.length} preserved oral recordings</span>
          <span className="text-netflix-red font-semibold">UNESCO Priority Preservation</span>
        </div>

        {/* Grid of Recordings (Netflix-style Hover Zoom) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
