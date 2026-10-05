"use client";

import React from "react";
import Link from "next/link";
import { Mic, Globe, Play, Sparkles, Shield, ArrowRight, BookOpen, Layers, Users } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { ContentRow } from "@/components/archive/ContentRow";
import { AIAssistant } from "@/components/ai/AIAssistant";

// Mock datasets for Netflix-style discovery rows
const FEATURED_STORIES = [
  {
    id: "vr-101",
    title: "Traditional Harvest & Rain Song",
    language: "Telugu (Tribal Dialect)",
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
    language: "Gondi (Madhya Pradesh)",
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
    language: "Koya (Godavari Valley)",
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
    language: "Santali (Jharkhand)",
    duration: "11:20",
    type: "conversation",
    community: "Mayurbhanj Artisans",
    excerpt: "ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮᱧ ᱠᱟᱹᱢᱤ ᱟᱨ ᱱᱟᱜᱟᱢ ᱨᱮᱱᱟᱜ ᱠᱟᱛᱷᱟ...",
    translationExcerpt: "Weaving cotton yarn according to seasonal patterns passed from mothers to daughters...",
    confidence: 0.89,
  },
];

const TRADITIONAL_KNOWLEDGE = [
  {
    id: "vr-201",
    title: "Seed Preservation in Mud Granaries",
    language: "Telugu (Rayalaseema)",
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
    language: "Bhili (Rajasthan)",
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
    language: "Kannada (Deccan Plateau)",
    duration: "07:50",
    type: "traditional_knowledge",
    community: "Kaveri Farmers",
    excerpt: "ಮಳೆ ಬರುವ ಮುನ್ನ ಬೀಸುವ ಗಾಳಿಯ ದಿಕ್ಕು ಮತ್ತು ಮೋಡಗಳ ಚಲನೆಯನ್ನು ಗುರುತಿಸುವುದು...",
    translationExcerpt: "Reading seasonal wind shifts and thunder color to identify the exact morning for sowing ragi...",
    confidence: 0.93,
  },
];

const POPULAR_STORIES = [
  {
    id: "vr-301",
    title: "Grandmother's Eclipse Tale",
    language: "Telugu (Coastal)",
    duration: "05:18",
    type: "story",
    community: "Krishna Delta",
    excerpt: "సూర్యగ్రహణం సమయంలో పాము ఆకాశాన్ని చుట్టుముట్టినట్లు ఉండే పాత కథ...",
    translationExcerpt: "The coastal folklore describing astronomical eclipses through snake metaphors...",
    confidence: 0.93,
  },
  {
    id: "vr-302",
    title: "Clan Genealogies & Praise Chants",
    language: "Gondi (Bastar)",
    duration: "16:40",
    type: "song",
    community: "Dandami Maria",
    excerpt: "बस्तर के गोंड कबीलों की वंशावली और पारंपरिक गीतों का संकलन...",
    translationExcerpt: "Sacred chanted genealogies reciting twelve generations of village guardians...",
    confidence: 0.88,
  },
  {
    id: "vr-303",
    title: "The Craft of Bamboo Fish Traps",
    language: "Koya (Papikondalu)",
    duration: "08:15",
    type: "traditional_knowledge",
    community: "River Fisherfolk",
    excerpt: "వెదురు బొంగులతో నదిలో చేపలు పట్టేందుకు గూళ్ళు అల్లే పద్ధతి...",
    translationExcerpt: "Intricate splitting and weaving of highland bamboo into river traps for monsoon fish runs...",
    confidence: 0.94,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-obsidian text-primary-text pb-24">
      <Navbar />

      {/* Hero Section — Cinematic & Spatial */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-root-green/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-ai-violet/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-leaf-green text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-root-green animate-pulse" />
            <span>AI-Driven Indigenous & Oral Language Preservation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.1]">
            Rooting Oral Languages in <span className="text-transparent bg-clip-text bg-gradient-to-r from-leaf-green via-root-green to-ai-violet">Digital Text</span> with AI.
          </h1>

          <p className="text-base sm:text-lg text-secondary-text max-w-2xl leading-relaxed">
            Preserve voices. Grow languages. Transform spoken stories, conversations, dialects, and traditional knowledge into structured, searchable digital archives — without ever erasing the original human voice.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/record"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-root-green text-obsidian font-semibold text-sm hover:bg-leaf-green transition-all shadow-glow hover:scale-105 active:scale-95"
            >
              <Mic className="w-4 h-4 fill-current" />
              <span>Start Recording</span>
            </Link>

            <Link
              href="/explore"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full glass-card hover:bg-white/10 text-white font-medium text-sm transition-all hover:scale-105"
            >
              <Globe className="w-4 h-4 text-leaf-green" />
              <span>Explore 18 Languages</span>
            </Link>
          </div>
        </div>

        {/* Featured Title Banner (Netflix-inspired cinematic hero card) */}
        <div className="mt-12 glass-surface p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-glass">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-root-green/20 border border-root-green/40 text-leaf-green text-xs font-mono">
                  FEATURED ORAL NARRATIVE
                </span>
                <span className="text-xs font-mono text-secondary-text">Telugu Tribal Dialect • 08:42</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                Traditional Harvest & Rain Song (వరి పంట సంప్రదాయ పాట)
              </h2>
              <p className="text-sm text-secondary-text leading-relaxed line-clamp-2">
                Recorded with community elders in the northern Agency tract. Sung antiphonally before the arrival of the monsoon season to invoke fertility and soil health.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/recordings/vr-101"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-obsidian font-semibold text-xs transition-transform hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Listen to Recording</span>
                </Link>
                <Link
                  href="/recordings/vr-101"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full glass-card hover:bg-white/10 text-white text-xs font-medium"
                >
                  <BookOpen className="w-3.5 h-3.5 text-root-green" />
                  <span>View Verified Transcript</span>
                </Link>
              </div>
            </div>

            {/* Visualizer Art Snippet */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center p-6 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-1.5 h-16 w-full justify-center">
                {[40, 65, 30, 85, 95, 60, 45, 75, 90, 50, 70, 35, 80, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-root-green to-leaf-green rounded-full animate-wave-live"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-secondary-text">Immutable High-Fidelity Audio + Word Timings</span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Preservation Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="glass-card p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white block">18</span>
            <span className="text-xs text-secondary-text">Languages Preserved</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-leaf-green block">4,821</span>
            <span className="text-xs text-secondary-text">Recordings Archived</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-earth block">1.2M</span>
            <span className="text-xs text-secondary-text">Words Digitized</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-white/5 text-center">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-ai-violet block">682</span>
            <span className="text-xs text-secondary-text">Community Contributors</span>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-white/5 text-center col-span-2 sm:col-span-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white block">347h</span>
            <span className="text-xs text-secondary-text">Audio Preserved</span>
          </div>
        </div>
      </section>

      {/* Netflix-style Content Rows */}
      <section className="space-y-10 py-8">
        <ContentRow
          title="Voices of the Village"
          subtitle="Recent community-contributed oral narratives and seasonal stories"
          items={FEATURED_STORIES}
        />

        <ContentRow
          title="Traditional Knowledge & Ethno-Ecology"
          subtitle="Agricultural wisdom, seed conservation, and native botanical remedies"
          items={TRADITIONAL_KNOWLEDGE}
        />

        <ContentRow
          title="Folk Stories & Chants"
          subtitle="Ancient oral mythologies and genealogies passed through speech"
          items={POPULAR_STORIES}
        />
      </section>

      {/* How Voice Roots Works (4-Step Pipeline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono uppercase text-leaf-green">The Preservation Pipeline</span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            How Voice Roots Works
          </h2>
          <p className="text-secondary-text text-sm max-w-xl mx-auto">
            A responsible, community-centered workflow that combines state-of-the-art open-source AI with strict human verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-root-green/20 border border-root-green/40 flex items-center justify-center text-leaf-green font-mono font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-white text-lg">Speak & Consent</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              Record dialect conversations or folk narratives directly in the browser or mobile app. Speakers retain full consent and copyright control.
            </p>
          </div>

          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-ai-violet/20 border border-ai-violet/40 flex items-center justify-center text-ai-violet font-mono font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-white text-lg">Understand</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              Open speech models (Whisper + IndicConformer) perform voice activity detection, language ID, and speech-to-text with speaker separation.
            </p>
          </div>

          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-earth/20 border border-earth/40 flex items-center justify-center text-earth font-mono font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-white text-lg">Preserve</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              Original voice audio is preserved immutably alongside the AI transcript, human corrections, and IndicTrans2 multilingual translations.
            </p>
          </div>

          <div className="glass-surface p-6 rounded-3xl border border-white/5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-leaf-green/20 border border-leaf-green/40 flex items-center justify-center text-leaf-green font-mono font-bold text-sm">
              04
            </div>
            <h3 className="font-semibold text-white text-lg">Connect & Search</h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              Semantic vector embeddings allow natural language search across meanings, while the RAG assistant answers cultural queries grounded in real transcripts.
            </p>
          </div>
        </div>
      </section>

      {/* Model Lab Highlight for Researchers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-surface p-8 rounded-3xl border border-root-green/30 bg-gradient-to-r from-surface to-surface-raised flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-leaf-green">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Capstone & Linguistic Research Track</span>
            </div>
            <h3 className="text-2xl font-semibold text-white">Voice Roots Model Lab</h3>
            <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
              Benchmark multilingual ASR models against consent-verified oral language datasets. Inspect real WER/CER error rates across Whisper, IndicConformer, and fine-tuned community checkpoints.
            </p>
          </div>

          <Link
            href="/research"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs whitespace-nowrap border border-white/15 transition-transform hover:scale-105"
          >
            <span>Open Model Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Floating AI Assistant */}
      <AIAssistant />
    </div>
  );
}
