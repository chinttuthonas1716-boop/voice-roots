"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Globe, ArrowRight, Sparkles, Filter, ShieldCheck } from "lucide-react";
import Link from "next/link";

export interface LanguageItem {
  name: string;
  nativeName: string;
  family: "Dravidian" | "Austroasiatic" | "Tibeto-Burman" | "Indo-Aryan";
  region: string;
  status: string;
  recordings: number;
  words: string;
  hours: string;
  dialects: string[];
}

const LANGUAGES_DATA: LanguageItem[] = [
  // ─── Dravidian Languages ───────────────────────────────────────────────
  {
    name: "Telugu",
    nativeName: "తెలుగు",
    family: "Dravidian",
    region: "Andhra Pradesh & Telangana",
    status: "Active (Rich Dialects)",
    recordings: 1248,
    words: "84.9K",
    hours: "78.4h",
    dialects: ["Agency Hill", "Rayalaseema", "North Telangana", "Coastal"],
  },
  {
    name: "Gondi",
    nativeName: "గోండీ / गोंडी",
    family: "Dravidian",
    region: "Central India (MP, Chhattisgarh, Telangana)",
    status: "Vulnerable / Under-resourced",
    recordings: 890,
    words: "42.1K",
    hours: "64.2h",
    dialects: ["Mandla", "Bastar Dandami", "Adilabad Raj Gond"],
  },
  {
    name: "Koya",
    nativeName: "కోయ",
    family: "Dravidian",
    region: "Godavari River Valley & Agency",
    status: "Endangered",
    recordings: 614,
    words: "31.5K",
    hours: "48.1h",
    dialects: ["Dora Koya", "Gutta Koya"],
  },
  {
    name: "Tulu",
    nativeName: "ತುಳು",
    family: "Dravidian",
    region: "Coastal Karnataka & Northern Kerala (Tulunadu)",
    status: "Vulnerable Oral Tradition",
    recordings: 430,
    words: "28.6K",
    hours: "34.5h",
    dialects: ["Common Tulu", "Brahmin Tulu", "Jain Tulu"],
  },
  {
    name: "Toda",
    nativeName: "തോഡാ / Thōda",
    family: "Dravidian",
    region: "Nilgiri Hills, Tamil Nadu",
    status: "Critically Endangered",
    recordings: 185,
    words: "12.4K",
    hours: "18.2h",
    dialects: ["Highland Pastoral Clan Variety"],
  },
  {
    name: "Kurukh (Oraon)",
    nativeName: "कुड़ुख़ / ᱳᱨᱟᱶ",
    family: "Dravidian",
    region: "Chhota Nagpur Plateau (Jharkhand, Odisha, Chhattisgarh)",
    status: "Vulnerable",
    recordings: 340,
    words: "22.8K",
    hours: "27.4h",
    dialects: ["Ranchi Kurukh", "Sambalpur Kurukh"],
  },
  {
    name: "Kodava",
    nativeName: "ಕೊಡವ ತಕ್ಕ್",
    family: "Dravidian",
    region: "Coorg (Kodagu), Karnataka",
    status: "Endangered Oral Language",
    recordings: 260,
    words: "19.3K",
    hours: "22.8h",
    dialects: ["Madikeri", "Virajpet"],
  },
  {
    name: "Badaga",
    nativeName: "ಬಡಗ / Baḍaga",
    family: "Dravidian",
    region: "Nilgiris, Tamil Nadu",
    status: "Endangered",
    recordings: 210,
    words: "16.1K",
    hours: "19.0h",
    dialects: ["Kotagiri", "Coonoor"],
  },
  {
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    family: "Dravidian",
    region: "Karnataka",
    status: "Active",
    recordings: 412,
    words: "35.1K",
    hours: "32.8h",
    dialects: ["Kundagannada", "Havyaka", "Arebhashe"],
  },
  {
    name: "Tamil",
    nativeName: "தமிழ்",
    family: "Dravidian",
    region: "Tamil Nadu & Puducherry",
    status: "Active (Rich Dialects)",
    recordings: 520,
    words: "41.0K",
    hours: "39.2h",
    dialects: ["Kongu", "Tirunelveli", "Madurai Rural"],
  },

  // ─── Austroasiatic / Munda Languages ──────────────────────────────────
  {
    name: "Santali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",
    family: "Austroasiatic",
    region: "Jharkhand, Odisha, West Bengal, Assam",
    status: "Recognized Indigenous",
    recordings: 532,
    words: "38.2K",
    hours: "42.0h",
    dialects: ["Mayurbhanj", "Dumka", "Chhota Nagpur"],
  },
  {
    name: "Ho",
    nativeName: "ᱦᱳ / Ho",
    family: "Austroasiatic",
    region: "Kolhan Region (Jharkhand & Odisha)",
    status: "Vulnerable",
    recordings: 310,
    words: "21.4K",
    hours: "26.1h",
    dialects: ["Chaibasa", "Singhbhum"],
  },
  {
    name: "Mundari",
    nativeName: "ᱢᱩᱱᱰᱟᱨᱤ",
    family: "Austroasiatic",
    region: "Jharkhand, Odisha, Bihar",
    status: "Vulnerable",
    recordings: 295,
    words: "20.1K",
    hours: "24.6h",
    dialects: ["Hasada", "Naguri", "Tamar"],
  },
  {
    name: "Khasi",
    nativeName: "Ka Ktien Khasi",
    family: "Austroasiatic",
    region: "Khasi & Jaintia Hills, Meghalaya",
    status: "Vulnerable Oral Tradition",
    recordings: 380,
    words: "25.7K",
    hours: "31.2h",
    dialects: ["Sohra", "Maram", "War"],
  },
  {
    name: "Korku",
    nativeName: "कोरकू / Korku",
    family: "Austroasiatic",
    region: "Satpura Range & Melghat (MP, Maharashtra)",
    status: "Endangered Isolate Pocket",
    recordings: 195,
    words: "14.2K",
    hours: "17.8h",
    dialects: ["Muwasi", "Bawaria"],
  },

  // ─── Tibeto-Burman Languages ──────────────────────────────────────────
  {
    name: "Bodo",
    nativeName: "बर'/बड़ो",
    family: "Tibeto-Burman",
    region: "Bodoland, Assam & Northeast",
    status: "Recognized Indigenous",
    recordings: 410,
    words: "29.8K",
    hours: "33.4h",
    dialects: ["Western Bodo", "Eastern Chhatgari"],
  },
  {
    name: "Garo",
    nativeName: "A·chik Ku·sik",
    family: "Tibeto-Burman",
    region: "Garo Hills, Meghalaya & Assam",
    status: "Vulnerable",
    recordings: 320,
    words: "22.5K",
    hours: "28.0h",
    dialects: ["Ambeng", "Matchi", "Chibok"],
  },
  {
    name: "Ao Naga",
    nativeName: "Ao O",
    family: "Tibeto-Burman",
    region: "Mokokchung District, Nagaland",
    status: "Vulnerable Oral Tradition",
    recordings: 245,
    words: "17.9K",
    hours: "21.5h",
    dialects: ["Chungli", "Mongsen"],
  },
  {
    name: "Mizo",
    nativeName: "Mizo ṭawng",
    family: "Tibeto-Burman",
    region: "Mizoram, Manipur, Tripura",
    status: "Active Indigenous",
    recordings: 390,
    words: "28.1K",
    hours: "32.0h",
    dialects: ["Lushai Standard", "Ralte", "Hmar"],
  },
  {
    name: "Lepcha",
    nativeName: "ᰛᰩᰵᰛᰧᰵ / Róng",
    family: "Tibeto-Burman",
    region: "Sikkim & Darjeeling Hills",
    status: "Endangered Indigenous",
    recordings: 165,
    words: "11.8K",
    hours: "15.4h",
    dialects: ["Dzongu Forest Clan", "Ilam"],
  },
  {
    name: "Ladakhi",
    nativeName: "ལ་དྭགས་སྐད་ / Bhoti",
    family: "Tibeto-Burman",
    region: "Ladakh (Highland Himalayas)",
    status: "Vulnerable",
    recordings: 275,
    words: "18.6K",
    hours: "23.2h",
    dialects: ["Central Ladakhi", "Nubra", "Changthang"],
  },

  // ─── Indo-Aryan & Contact Oral Traditions ─────────────────────────────
  {
    name: "Bhili",
    nativeName: "भीली",
    family: "Indo-Aryan",
    region: "Rajasthan, Gujarat, MP, Maharashtra",
    status: "Under-resourced Tribal",
    recordings: 472,
    words: "29.4K",
    hours: "38.5h",
    dialects: ["Wagdi", "Rathavi", "Ahirani"],
  },
  {
    name: "Lambadi (Banjara)",
    nativeName: "गोर बोली / गोरमाटी",
    family: "Indo-Aryan",
    region: "Telangana, Andhra Pradesh, Karnataka, Maharashtra",
    status: "Endangered Nomadic Oral",
    recordings: 360,
    words: "24.7K",
    hours: "29.8h",
    dialects: ["Telangana Tanda", "Karnataka Tanda"],
  },
  {
    name: "Halbi",
    nativeName: "हल्बी / Halbi",
    family: "Indo-Aryan",
    region: "Bastar & Dandakaranya, Chhattisgarh",
    status: "Tribal Contact Language",
    recordings: 315,
    words: "21.0K",
    hours: "25.6h",
    dialects: ["Bastar Halbi", "Kanker"],
  },
];

export default function ExplorePage() {
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const filteredLanguages = LANGUAGES_DATA.filter((lang) => {
    const matchesFamily = selectedFamily === "all" || lang.family === selectedFamily;
    const matchesSearch =
      searchFilter === "" ||
      lang.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchFilter.toLowerCase()) ||
      lang.dialects.some((d) => d.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesFamily && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-28">
      <Navbar />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ios27-pill text-netflix-red text-xs font-mono font-semibold">
            <Globe className="w-3.5 h-3.5 text-netflix-red" />
            <span>24 Preserved Indigenous & Oral Linguistic Traditions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Explore Oral Linguistic Heritage
          </h1>

          <p className="text-netflix-gray text-sm sm:text-base max-w-3xl leading-relaxed">
            Every linguistic tradition contains verified oral speech samples, unwritten dialects, seasonal folklore, and native speaker contributions across four distinct language families.
          </p>
        </div>

        {/* Filter Controls (Liquid Glass Capsule Bar) */}
        <div className="ios27-glass p-4 sm:p-5 rounded-2xl space-y-4 shadow-2xl border border-white/10">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by language, script, region (e.g. Bastar, Nilgiris, Ladakh, Agency)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-netflix-muted focus:outline-none focus:border-netflix-red/60 focus:ring-1 focus:ring-netflix-red/30 transition-all"
            />
          </div>

          {/* Language Family Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs py-1">
            <span className="text-[11px] font-mono text-netflix-gray mr-1">Family:</span>
            {[
              { id: "all", label: "All 24 Traditions" },
              { id: "Dravidian", label: "Dravidian (10)" },
              { id: "Austroasiatic", label: "Austroasiatic / Munda (5)" },
              { id: "Tibeto-Burman", label: "Tibeto-Burman (6)" },
              { id: "Indo-Aryan", label: "Indo-Aryan Tribal (3)" },
            ].map((fam) => (
              <button
                key={fam.id}
                onClick={() => setSelectedFamily(fam.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedFamily === fam.id
                    ? "bg-netflix-red text-white font-bold shadow-netflix-glow scale-105"
                    : "ios27-pill text-netflix-light hover:text-white"
                }`}
              >
                {fam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Languages Count & Grid */}
        <div className="flex items-center justify-between text-xs font-mono text-netflix-gray">
          <span>Showing {filteredLanguages.length} documented oral languages</span>
          <span className="text-netflix-red font-semibold">Informed Consent Protocol Enforced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLanguages.map((lang) => (
            <div
              key={lang.name}
              className="netflix-card-wrapper"
            >
              <div className="netflix-card-surface p-6 flex flex-col justify-between h-full space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">{lang.name}</h3>
                      <span className="text-[11px] font-mono text-netflix-red font-semibold">{lang.family} Family</span>
                    </div>
                    <span className="text-lg font-serif text-white">{lang.nativeName}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-netflix-gray">
                      <span>Region:</span>
                      <span className="text-white text-right max-w-[65%] truncate">{lang.region}</span>
                    </div>
                    <div className="flex justify-between text-netflix-gray">
                      <span>UNESCO Status:</span>
                      <span className="text-cultural-gold font-mono">{lang.status}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-mono uppercase text-netflix-muted block mb-1">
                      Documented Dialects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lang.dialects.map((d, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-netflix-light border border-white/10"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="grid grid-cols-3 text-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-white block">{lang.recordings}</span>
                      <span className="text-[10px] text-netflix-muted">Voices</span>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-netflix-red block">{lang.words}</span>
                      <span className="text-[10px] text-netflix-muted">Words</span>
                    </div>
                    <div>
                      <span className="font-mono font-bold text-cultural-gold block">{lang.hours}</span>
                      <span className="text-[10px] text-netflix-muted">Audio</span>
                    </div>
                  </div>

                  <Link
                    href={`/archive`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl ios27-pill hover:bg-netflix-red hover:text-white text-xs font-semibold text-white transition-all group shadow-sm hover:shadow-netflix-glow"
                  >
                    <span>Browse {lang.name} Archive</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
