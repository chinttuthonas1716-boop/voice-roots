"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Globe,
  Play,
  Pause,
  Sparkles,
  Shield,
  ArrowRight,
  BookOpen,
  Volume2,
  Radio,
  Share2,
  Languages,
  Smartphone,
  Upload,
} from "lucide-react";
import { JioHotstarNavbar } from "@/components/jiohotstar/JioHotstarNavbar";
import { JioHotstarHero } from "@/components/jiohotstar/JioHotstarHero";
import { Top10HotstarRow } from "@/components/jiohotstar/Top10HotstarRow";
import { FolkSongsSliderRow } from "@/components/jiohotstar/FolkSongsSliderRow";
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
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1014] text-white pb-28 selection:bg-[#0063e5] selection:text-white">
      {/* JioHotstar Top Navigation */}
      <JioHotstarNavbar />

      {/* JioHotstar Cinematic Hero Carousel Billboard (with slide animation & real sound) */}
      <section className="pt-16">
        <JioHotstarHero />
      </section>

      {/* JioHotstar Live Stats Pill Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-[#16181f] border border-white/10 text-center hover:border-[#00d8f6] transition-colors">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#00d8f6] block">24</span>
            <span className="text-xs text-slate-400">Languages Preserved</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#16181f] border border-white/10 text-center hover:border-[#0063e5] transition-colors">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">4,821</span>
            <span className="text-xs text-slate-400">Recordings Streamed</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#16181f] border border-white/10 text-center hover:border-[#f5c518] transition-colors">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#f5c518] block">1.2M</span>
            <span className="text-xs text-slate-400">Words Digitized</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#16181f] border border-white/10 text-center hover:border-[#00d8f6] transition-colors">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#00d8f6] block">682</span>
            <span className="text-xs text-slate-400">Community Elders</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#16181f] border border-white/10 text-center col-span-2 sm:col-span-1 hover:border-white transition-colors">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white block">347h</span>
            <span className="text-xs text-slate-400">Lossless Master Audio</span>
          </div>
        </div>
      </section>

      {/* JioHotstar Top 10 in India Sliding Row */}
      <Top10HotstarRow />

      {/* Oral Folk Songs & Sacred Chants Sliding Row (Plays real audio on click!) */}
      <FolkSongsSliderRow />

      {/* JioHotstar Day-to-Day Conversational Translation Showcase */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#16181f] via-[#10192a] to-[#16181f] border border-[#0063e5]/40 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0063e5]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0063e5] to-[#00d8f6] flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,124,240,0.6)]">
                <Languages className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    దైనందిన సంభాషణల అనువాదం (Day-to-Day Translation)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00d8f6]/20 text-[#00d8f6] border border-[#00d8f6]/40 text-[10px] font-bold">
                    12 LANGUAGES ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  పాటలు కాకుండా, నిజజీవితంలో ప్రతిరోజూ మాట్లాడుకునే సాధారణ సంభాషణల అనువాదం (Telugu, English, Hindi, Tamil, Kannada, Malayalam, Marathi, Odia, Bengali, Gondi, Koya, Lambadi).
                </p>
              </div>
            </div>

            <Link
              href="/translate"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0063e5] to-[#00d8f6] hover:brightness-110 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(0,124,240,0.5)] transition-all hover:scale-105"
            >
              <span>పూర్తి ట్రాన్స్‌లేటర్‌ని తెరవండి (Open Full Translator)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Real-life Everyday Phrases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 relative z-10">
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
                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00d8f6] hover:bg-white/10 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#f5c518] block">{p.cat}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-[#00d8f6] transition-colors">అనువదించు →</span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-[#00d8f6] transition-colors">{p.q}</p>
                <p className="text-xs text-slate-300 italic">{p.en}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* JioHotstar Horizontal Discovery Rows with Smooth Slide Navigation */}
      <section className="space-y-10 py-6">
        <ContentRow
          title="Voices of the Village & Spoken Stories"
          subtitle="Community oral narratives, seasonal celebrations, and elder wisdom"
          items={FEATURED_STORIES}
        />

        <ContentRow
          title="Traditional Knowledge & Ethno-Ecology"
          subtitle="Indigenous agricultural wisdom, seed conservation, and native botanical remedies"
          items={TRADITIONAL_KNOWLEDGE}
        />

        <ContentRow
          title="Folk Stories & Ancient Chants"
          subtitle="Sacred spoken mythologies and oral genealogies passed down across generations"
          items={POPULAR_STORIES}
        />
      </section>

      {/* iPhone Fitness App & Model Lab Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-8 sm:p-10 rounded-3xl border border-[#0063e5]/40 bg-gradient-to-r from-[#16181f] via-[#101b2b] to-[#16181f] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00d8f6] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apple Fitness Style Mobile Companion App Available</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Track Your Spoken Language Activity Rings on iPhone
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Experience the 3 Activity Rings (Words Recorded, Oral Lore Time, Dialects Explored) just like Apple Fitness, with workout-style audio recordings and instant day-to-day speech translation.
            </p>
          </div>

          <Link
            href="/app"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0063e5] to-[#00d8f6] text-white font-extrabold text-xs whitespace-nowrap self-start md:self-auto shadow-[0_0_25px_rgba(0,124,240,0.6)] hover:scale-105 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open iPhone Fitness Simulator</span>
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
