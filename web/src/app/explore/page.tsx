"use client";

import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Globe, ArrowRight, Mic, BookOpen, Volume2 } from "lucide-react";
import Link from "next/link";

const LANGUAGES_DATA = [
  {
    name: "Telugu",
    nativeName: "తెలుగు",
    family: "Dravidian",
    region: "Andhra Pradesh & Telangana",
    status: "Active (Rich Dialectal Variation)",
    recordings: 1248,
    words: "84.9K",
    hours: "78.4h",
    dialects: ["Agency Hill", "Rayalaseema", "North Telangana", "Coastal"],
  },
  {
    name: "Gondi",
    nativeName: "గోండీ / गोंडी",
    family: "South-Central Dravidian",
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
    name: "Santali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",
    family: "Austroasiatic (Munda)",
    region: "Jharkhand, Odisha, West Bengal",
    status: "Official Recognized",
    recordings: 532,
    words: "38.2K",
    hours: "42.0h",
    dialects: ["Mayurbhanj", "Dumka"],
  },
  {
    name: "Bhili",
    nativeName: "भीली",
    family: "Indo-Aryan",
    region: "Rajasthan, Gujarat, MP, Maharashtra",
    status: "Under-resourced",
    recordings: 472,
    words: "29.4K",
    hours: "38.5h",
    dialects: ["Wagdi", "Rathavi", "Ahirani"],
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
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-obsidian text-primary-text pb-24">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-root-green/10 border border-root-green/30 text-leaf-green text-xs font-mono">
            <Globe className="w-3.5 h-3.5" />
            <span>Preserved Language Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Explore Oral Linguistic Traditions
          </h1>

          <p className="text-secondary-text text-sm sm:text-base max-w-2xl leading-relaxed">
            Every language page contains verified folk recordings, acoustic speech samples, dialectal lexical terms, and native speaker contributions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANGUAGES_DATA.map((lang) => (
            <div
              key={lang.name}
              className="glass-card p-6 rounded-3xl border border-white/5 hover:border-root-green/30 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{lang.name}</span>
                  <span className="text-lg font-serif text-leaf-green">{lang.nativeName}</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-secondary-text">
                    <span>Language Family:</span>
                    <span className="text-white">{lang.family}</span>
                  </div>
                  <div className="flex justify-between text-secondary-text">
                    <span>Geographic Region:</span>
                    <span className="text-white text-right max-w-[60%] truncate">{lang.region}</span>
                  </div>
                  <div className="flex justify-between text-secondary-text">
                    <span>Status:</span>
                    <span className="text-earth font-mono">{lang.status}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-mono uppercase text-secondary-text block mb-1">
                    Recorded Dialects:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lang.dialects.map((d, dIdx) => (
                      <span
                        key={dIdx}
                        className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-secondary-text border border-white/5"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-white block">{lang.recordings}</span>
                    <span className="text-[10px] text-secondary-text">Recordings</span>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-leaf-green block">{lang.words}</span>
                    <span className="text-[10px] text-secondary-text">Words</span>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-earth block">{lang.hours}</span>
                    <span className="text-[10px] text-secondary-text">Audio</span>
                  </div>
                </div>

                <Link
                  href={`/archive`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-root-green/20 hover:text-leaf-green text-xs font-semibold text-white transition-all"
                >
                  <span>Explore {lang.name} Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
