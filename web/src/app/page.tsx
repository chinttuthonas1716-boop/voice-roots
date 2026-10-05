"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mic, Globe, Play, Pause, Sparkles, Shield, ArrowRight, BookOpen, Volume2, Radio, Share2, Languages } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { ContentRow } from "@/components/archive/ContentRow";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { ShareModal } from "@/components/ui/ShareModal";

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
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-28">
      <Navbar />

      {/* Hero Section — Netflix Cinematic Billboard */}
      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Dynamic Status Capsule */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full ios27-pill shadow-lg text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-netflix-red animate-pulse" />
            <span className="text-netflix-red font-bold">Archive Live</span>
            <span className="text-netflix-muted">•</span>
            <span className="text-netflix-light">4,821 Oral Narratives Digitized</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Rooting Oral Languages in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-netflix-red via-netflix-red-hover to-white">
              Digital Text
            </span>{" "}
            with AI.
          </h1>

          <p className="text-sm sm:text-lg text-netflix-gray max-w-2xl mx-auto leading-relaxed">
            Preserve voices. Grow languages. Transform spoken stories, tribal dialects, and elder memory into structured, searchable digital archives — without ever erasing the original human voice.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/translate"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-netflix-red via-netflix-red-hover to-cultural-gold text-white font-bold text-sm shadow-netflix-glow hover:scale-105 transition-all"
            >
              <Languages className="w-4 h-4 text-white" />
              <span>Day-to-Day Translator (నిత్య జీవిత సంభాషణలు)</span>
            </Link>

            <Link
              href="/record"
              className="flex items-center gap-2 px-6 py-3 rounded-full ios27-button-primary text-sm shadow-netflix-glow"
            >
              <Mic className="w-4 h-4 fill-current text-white" />
              <span>Record a Voice</span>
            </Link>

            <Link
              href="/explore"
              className="flex items-center gap-2 px-6 py-3 rounded-full ios27-pill hover:bg-white/10 text-white font-medium text-sm transition-all"
            >
              <Globe className="w-4 h-4 text-netflix-red" />
              <span>Explore 24 Languages</span>
            </Link>

            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-netflix-red/30 border border-white/15 text-white font-medium text-sm transition-all hover:scale-105"
            >
              <Share2 className="w-4 h-4 text-cultural-gold" />
              <span>Share with Friends</span>
            </button>
          </div>
        </div>

        {/* Netflix-style Cinematic Billboard Hero Feature Card */}
        <div className="mt-12 rounded-3xl ios27-glass p-6 sm:p-10 relative overflow-hidden border border-white/10 shadow-2xl">
          {/* Ambient Netflix Red backlight */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-netflix-red/25 via-netflix-red-dark/15 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cultural-gold/10 to-transparent blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-netflix-red/20 border border-netflix-red/40 text-netflix-red text-xs font-mono font-bold tracking-wider uppercase">
                  Featured Masterwork
                </span>
                <span className="text-xs font-mono text-netflix-gray">
                  Telugu Tribal Dialect • 08:42 Duration • UNESCO Priority
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
                Traditional Harvest & Rain Song (వరి పంట సంప్రదాయ పాట)
              </h2>

              <p className="text-sm sm:text-base text-netflix-light leading-relaxed max-w-2xl">
                Recorded with elders in the northern Agency tract. Sung antiphonally prior to the first monsoon shower to invoke soil fertility and seed regeneration.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsPlayingHero(!isPlayingHero)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-netflix-black font-bold text-xs transition-transform hover:scale-105 active:scale-95 shadow-lg hover:bg-netflix-red hover:text-white"
                >
                  {isPlayingHero ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingHero ? "Pause Playback" : "Play Audio Recording"}</span>
                </button>

                <Link
                  href="/recordings/vr-101"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full ios27-pill hover:bg-white/10 text-white text-xs font-medium"
                >
                  <BookOpen className="w-3.5 h-3.5 text-netflix-red" />
                  <span>View Verified Transcript</span>
                </Link>

                <button
                  onClick={() => setIsShareOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-netflix-light hover:text-white text-xs font-medium transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-cultural-gold" />
                  <span>Share Story</span>
                </button>
              </div>
            </div>

            {/* Spatial Visualizer Art Frame */}
            <div className="lg:col-span-4 flex flex-col justify-center items-center p-6 rounded-2xl bg-black/60 border border-white/10 space-y-4">
              <span className="text-[11px] font-mono text-netflix-red uppercase tracking-wider font-semibold">
                Live Acoustic Waveform
              </span>

              {/* Animated Equalizer Wave Bars (Netflix Red) */}
              <div className="flex items-center gap-1.5 h-20 w-full justify-center">
                {[35, 60, 25, 80, 95, 55, 40, 75, 90, 45, 65, 30, 85, 50, 70, 90, 35].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="w-1.5 eq-bar animate-equalizer-1"
                      style={{
                        height: isPlayingHero ? `${h}%` : "20%",
                        animationDuration: `${0.8 + (i % 4) * 0.3}s`,
                        animationPlayState: isPlayingHero ? "running" : "paused",
                      }}
                    />
                  )
                )}
              </div>

              <span className="text-[11px] font-mono text-netflix-gray text-center">
                Lossless 48kHz / 24-bit PCM Archive Master
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Statistics Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="ios27-glass p-4 rounded-2xl text-center">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-netflix-red block">24</span>
            <span className="text-xs text-netflix-gray">Languages Preserved</span>
          </div>
          <div className="ios27-glass p-4 rounded-2xl text-center">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">4,821</span>
            <span className="text-xs text-netflix-gray">Recordings Archived</span>
          </div>
          <div className="ios27-glass p-4 rounded-2xl text-center">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cultural-gold block">1.2M</span>
            <span className="text-xs text-netflix-gray">Words Digitized</span>
          </div>
          <div className="ios27-glass p-4 rounded-2xl text-center">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-netflix-red block">682</span>
            <span className="text-xs text-netflix-gray">Community Contributors</span>
          </div>
          <div className="ios27-glass p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">347h</span>
            <span className="text-xs text-netflix-gray">Audio Preserved</span>
          </div>
        </div>
      </section>

      {/* Dedicated Day-to-Day Translation Showcase Section */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-netflix-red to-cultural-gold flex items-center justify-center text-white shadow-netflix-glow">
                <Languages className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    దైనందిన సంభాషణల అనువాదం (Day-to-Day Translation)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-netflix-red/20 text-netflix-red border border-netflix-red/30 text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-netflix-light mt-0.5">
                  పాటలు కాకుండా, నిజజీవితంలో ప్రతిరోజూ మాట్లాడుకునే సాధారణ సంభాషణల అనువాదం (Telugu, English, Hindi, Tamil, Kannada, Malayalam, Marathi, Odia, Bengali, Gondi, Koya, Lambadi).
                </p>
              </div>
            </div>

            <Link
              href="/translate"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-netflix-red hover:bg-netflix-red-hover text-white font-bold text-xs shadow-netflix-glow transition-all hover:scale-105"
            >
              <span>పూర్తి ట్రాన్స్‌లేటర్‌ని తెరవండి (Open Full Translator)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Real-life Everyday Phrases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {[
              {
                q: "నమస్కారం! బాగున్నారా?",
                en: "Greetings! How are you doing? Are you well?",
                cat: "పరిచయాలు (Greetings)",
              },
              {
                q: "తాగడానికి మంచి నీళ్ళు ఇవ్వండి",
                en: "Could you please give me drinking water? I am thirsty.",
                cat: "దాహం & నీళ్ళు (Water)",
              },
              {
                q: "దీని ధర ఎంత? ఎంతకి ఇస్తారు?",
                en: "How much does this cost? Can you reduce the price?",
                cat: "సంత & ధరలు (Market)",
              },
              {
                q: "సహాయం చేయండి, జ్వరంగా ఉంది",
                en: "Please help me! I am feeling unwell with a fever.",
                cat: "వైద్యం & సాయం (Health)",
              },
            ].map((p, idx) => (
              <Link
                key={idx}
                href="/translate"
                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-netflix-red/60 hover:bg-white/10 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cultural-gold block">{p.cat}</span>
                  <span className="text-[10px] text-netflix-light group-hover:text-netflix-red transition-colors">అనువదించు →</span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-netflix-red transition-colors">{p.q}</p>
                <p className="text-xs text-netflix-light italic">{p.en}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Netflix Horizontal Discovery Rows with Zoom Animation */}
      <section className="space-y-12 py-8">
        <ContentRow
          title="Voices of the Village"
          subtitle="Community oral narratives, seasonal celebrations, and elder songs"
          items={FEATURED_STORIES}
        />

        <ContentRow
          title="Traditional Knowledge & Ethno-Ecology"
          subtitle="Indigenous agricultural wisdom, seed conservation, and native botanical remedies"
          items={TRADITIONAL_KNOWLEDGE}
        />

        <ContentRow
          title="Folk Stories & Chants"
          subtitle="Sacred spoken mythologies and oral genealogies passed down across generations"
          items={POPULAR_STORIES}
        />
      </section>

      {/* Model Lab Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="ios27-glass p-8 sm:p-10 rounded-3xl border border-netflix-red/30 bg-gradient-to-r from-netflix-card via-netflix-surface to-netflix-card flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-netflix-red font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice Roots Model Lab & Linguistic Research Track</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Benchmarking Open-Source Multilingual Models
            </h3>
            <p className="text-xs sm:text-sm text-netflix-gray leading-relaxed">
              Evaluating Word Error Rate (WER) and Character Error Rate (CER) across OpenAI Whisper, AI4Bharat IndicConformer, and fine-tuned community checkpoints.
            </p>
          </div>

          <Link
            href="/research"
            className="flex items-center gap-2 px-6 py-3 rounded-full ios27-button-primary text-xs whitespace-nowrap self-start md:self-auto shadow-netflix-glow"
          >
            <span>Open Model Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Floating Grounded AI Assistant */}
      <AIAssistant />

      {/* Share Sheet Modal */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}
