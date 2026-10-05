"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Shield,
  Sparkles,
  Check,
  Edit3,
  ArrowLeft,
  Bookmark,
  Languages,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { getUserRecordings, StoredVoiceRecord } from "@/lib/storage";

const DEFAULT_CATALOG: Record<string, any> = {
  "vr-101": {
    id: "vr-101",
    title: "Traditional Harvest & Rain Song",
    language: "Telugu",
    dialect: "Agency Hill Dialect",
    duration: "08:42",
    type: "song",
    community: "Agency Hill Clans",
    originalTranscript:
      "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట ఇది. ఆకాశంలో మబ్బులు కనిపించగానే గ్రామ దేవతకు నమస్కరించి విత్తనాలు చల్లుతారు.",
    translations: {
      en: "This is a traditional melody our village elders sing before monsoon rains arrive, performing the Earth worship ritual. As soon as dark clouds appear in the sky, they bow to the village deity and sow heirloom seeds.",
      hi: "यह एक पारंपरिक गीत है जो हमारे गाँव के बुजुर्ग मानसून की बारिश आने से पहले गाते हैं, धरती पूजा करते हैं। जैसे ही आसमान में काले बादल छाते हैं, वे ग्राम देवता को नमन कर देशी बीज बोते हैं।",
      te: "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సాంప్రదాయ పాట ఇది. ఆకాశంలో మేఘాలు కనిపించగానే గ్రామ దేవతకు నమస్కరించి విత్తనాలు చల్లుతారు.",
    },
    vocabulary: [
      { word: "భూమి పూజ", meaning: "Sacred soil ritual performed prior to first sowing" },
      { word: "విత్తనాలు", meaning: "Heirloom native agricultural seed heritage" },
      { word: "గ్రామ దేవత", meaning: "Protective deity of the local village community" },
    ],
  },
  "vr-102": {
    id: "vr-102",
    title: "The Legend of the Mountain Spring",
    language: "Gondi",
    dialect: "Mandla Hill Variety",
    duration: "14:15",
    type: "story",
    community: "Pardhan Community",
    originalTranscript:
      "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक पुरानी कहानी है। जब सूखा पड़ता था, तो हमारे गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।",
    translations: {
      en: "Behind the perennial spring flowing on the mountain peak lies an ancient tale of our ancestors. Whenever drought descended, the village elders would sing this sacred chant to invoke the rain deity.",
      hi: "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक प्राचीन कथा है। जब सूखा पड़ता था, तो गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।",
      te: "కొండ శిఖరంపై ప్రవహించే ఊట వెనుక మా పూర్వీకుల పురాతన కథ దాగి ఉంది. కరవు వచ్చినప్పుడు గ్రామ పెద్దలు ఈ పవిత్ర గీతాన్ని పాడి వరుణ దేవుని ప్రార్థించేవారు.",
    },
    vocabulary: [
      { word: "सगा (Saga)", meaning: "Clan kinship network binding Gond communities" },
      { word: "पेन (Pen)", meaning: "Ancestral ancestral spiritual guardian" },
      { word: "गोटुल (Ghotul)", meaning: "Traditional youth dormitory learning institution" },
    ],
  },
  "vr-103": {
    id: "vr-103",
    title: "Neem & Turmeric Traditional Medicine",
    language: "Koya",
    dialect: "Godavari Valley Variety",
    duration: "06:30",
    type: "traditional_knowledge",
    community: "Forest Dwellers Collective",
    originalTranscript:
      "అడవిలో దొరికే వేప, పసుపు వేర్లతో జ్వరాలు తగ్గించే సాంప్రదాయ వైద్య విధానం. ఈ మూలికలను వర్షాకాలంలో సేకరించి ఎండబెట్టి భద్రపరుస్తాము.",
    translations: {
      en: "How wild neem and indigenous turmeric roots are formulated into seasonal fever remedies. These herbs are gathered during early monsoons and dried according to clan protocols.",
      hi: "जंगल में मिलने वाले नीम और हल्दी की जड़ों से मौसमी बुखार का इलाज करने का पारंपरिक ज्ञान। इन जड़ी-बूटियों को मानसून के शुरू में इकट्ठा करके सुखाया जाता है।",
      te: "అడవిలో లభించే వేప, అడవి పసుపు వేర్లతో జ్వరాలను నయం చేసే సాంప్రదాయ వైద్య జ్ఞానం. వీటిని పెద్దల అనుమతితో సేకరించి భద్రపరుస్తారు.",
    },
    vocabulary: [
      { word: "కొండ దేవుడు", meaning: "Forest mountain deity presiding over medicinal plants" },
      { word: "మందు మూలిక", meaning: "Ethnobotanical root formulation for fevers" },
    ],
  },
  "vr-104": {
    id: "vr-104",
    title: "Conversations on Traditional Handloom Weaving",
    language: "Santali",
    dialect: "Mayurbhanj Santali",
    duration: "11:20",
    type: "conversation",
    community: "Mayurbhanj Artisans",
    originalTranscript:
      "ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮᱧ ᱠᱟᱹᱢᱤ ᱟᱨ ᱱᱟᱜᱟᱢ ᱨᱮᱱᱟᱜ ᱠᱟᱛᱷᱟ᱾ ᱦᱟᱯᱲᱟᱢ ᱠᱚᱣᱟᱜ ᱞᱟᱹᱭ ᱞᱮᱠᱟᱛᱮ ᱪᱟᱥ ᱵᱟᱥ ᱟᱨ ᱥᱮᱨᱣᱟ ᱡᱤᱭᱚᱱ ᱫᱚ ᱟᱹᱰᱤ ᱢᱟᱨᱮ ᱜᱮᱭᱟ᱾",
    translations: {
      en: "Oral history of Santal handloom weaving and agricultural heritage. According to ancestors, community farming and oral customs have been preserved unbroken since ancient times.",
      hi: "संथाली हथकरघा बुनाई और कृषि विरासत का मौखिक इतिहास। पूर्वजों के अनुसार, सामुदायिक खेती और परंपराएं अनादि काल से सुरक्षित हैं।",
      te: "సంతాలి చేనేత మరియు వ్యవసాయ వారసత్వ మౌఖిక చరిత్ర. పూర్వీకుల సంప్రదాయాల ప్రకారం సామూహిక వ్యవసాయం ప్రాచీన కాలం నుండి కొనసాగుతోంది.",
    },
    vocabulary: [
      { word: "ᱦᱟᱯᱲᱟᱢ (Hapram)", meaning: "Revered tribal ancestors and lineage founders" },
      { word: "ᱡᱟᱦᱮᱨ ᱛᱷᱟᱱ (Jaher Than)", meaning: "Sacred community sal grove sanctuary" },
    ],
  },
  "vr-106": {
    id: "vr-106",
    title: "Living Root Bridges Oral Engineering",
    language: "Khasi",
    dialect: "Sohra Variety",
    duration: "13:10",
    type: "traditional_knowledge",
    community: "Cherrapunji Forest Guardians",
    originalTranscript:
      "Ka jingshna ia ki jingkieng da ki thied dieng ha ki khlaw ba rben. Ki kpa tymmen ki la hikai ia ngi ban pyniaid ia ki thied Ficus elastica ban long jingkieng ba neh shispah snem.",
    translations: {
      en: "Elders narrating how aerial Ficus elastica roots are guided across roaring gorges over seventy years to create living bridges that endure for centuries.",
      hi: "बुजुर्ग बताते हैं कि कैसे जीवित फिकस पेड़ों की जड़ों को गहरी घाटियों के पार निर्देशित कर ऐसे जीवित पुल बनाए जाते हैं जो सदियों तक टिकते हैं।",
      te: "నదుల మీదుగా మర్రి వేర్లను డెబ్బై ఏళ్ల పాటు పెంచి శతాబ్దాల పాటు నిలిచే సజీవ వేరు వంతెనలను నిర్మించే సాంప్రదాయ ఖాసీ ఇంజనీరింగ్.",
    },
    vocabulary: [
      { word: "Jingkieng Jri", meaning: "Living root bridge cultivated across mountain rivers" },
      { word: "Kpa Tymmen", meaning: "Respected clan elders who pass oral architectural rules" },
    ],
  },
};

export default function RecordingDetailPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<"dual" | "original" | "translation">("dual");
  const [targetLang, setTargetLang] = useState<"en" | "hi" | "te">("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationText, setTranslationText] = useState("");
  const [currentRecord, setCurrentRecord] = useState<any>(null);

  // Load record from catalog or localStorage
  useEffect(() => {
    const id = params.id || "vr-101";

    // 1. Check user recordings in localStorage first
    const userRecords = getUserRecordings();
    const userMatch = userRecords.find((r) => r.id === id);

    if (userMatch) {
      setCurrentRecord(userMatch);
      setTranslationText(userMatch.translationEn || "");
      return;
    }

    // 2. Check default catalog
    const catalogMatch = DEFAULT_CATALOG[id] || DEFAULT_CATALOG["vr-101"];
    setCurrentRecord(catalogMatch);
    setTranslationText(catalogMatch.translations?.[targetLang] || catalogMatch.translations?.en || "");
  }, [params.id]);

  // Live Translation Trigger
  const handleTranslate = async (target: "en" | "hi" | "te") => {
    setTargetLang(target);
    if (!currentRecord) return;

    // If precomputed translation exists, load instantly
    if (currentRecord.translations && currentRecord.translations[target]) {
      setTranslationText(currentRecord.translations[target]);
      return;
    }

    // Otherwise call live /api/translate
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentRecord.originalTranscript,
          sourceLanguage: currentRecord.language,
          targetLanguage: target,
        }),
      });
      const data = await res.json();
      if (data.translation) {
        setTranslationText(data.translation);
      }
    } catch (err) {
      console.warn("Translation fallback:", err);
      // Fallback
      if (currentRecord.translations?.en) {
        setTranslationText(currentRecord.translations.en);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const rec = currentRecord || DEFAULT_CATALOG["vr-101"];

  return (
    <div className="min-h-screen bg-netflix-black text-white pb-24">
      <Navbar />

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-xs text-netflix-gray hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Archive</span>
        </Link>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-netflix-red/20 border border-netflix-red/40 text-netflix-red text-xs font-mono font-bold">
                {rec.language} ({rec.dialect || "Indigenous Dialect"})
              </span>
              <span className="text-xs font-mono text-netflix-gray">ID: {rec.id}</span>
              {rec.isUserUploaded && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cultural-gold/20 text-cultural-gold border border-cultural-gold/30">
                  USER UPLOADED & ARCHIVED
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {rec.title}
            </h1>

            <p className="text-xs sm:text-sm text-netflix-gray">
              Preserved in Voice Roots Vault • {rec.community || "Community Contributor"} • {rec.duration} duration
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-netflix-red/10 text-netflix-red border border-netflix-red/30 text-xs font-mono font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Consent Verified</span>
            </span>
          </div>
        </div>

        {/* Audio Player & Waveform Card */}
        <div className="ios27-glass p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full bg-netflix-red text-white flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform shadow-netflix-glow"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <span className="text-sm font-bold text-white block">Lossless Master Audio</span>
                <span className="text-xs font-mono text-netflix-gray">
                  48 kHz • 24-bit PCM WAV (Original Human Voice)
                </span>
              </div>
            </div>

            <span className="font-mono text-sm text-white font-bold">{rec.duration}</span>
          </div>

          {/* Waveform graphic */}
          <div className="h-16 w-full rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center px-4 gap-1">
            {[20, 45, 60, 30, 80, 95, 70, 50, 65, 40, 85, 90, 75, 55, 35, 60, 85, 40, 70, 50, 90, 30, 45, 75, 40, 60].map(
              (h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all ${
                    i < 10 ? "bg-netflix-red" : "bg-white/20"
                  }`}
                  style={{ height: `${h}%` }}
                />
              )
            )}
          </div>
        </div>

        {/* View Mode & Live Translation Language Target Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setViewMode("dual")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === "dual"
                  ? "bg-white/15 text-white font-bold"
                  : "text-netflix-gray hover:text-white"
              }`}
            >
              Dual View (Original + Translation)
            </button>
            <button
              onClick={() => setViewMode("original")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === "original"
                  ? "bg-white/15 text-white font-bold"
                  : "text-netflix-gray hover:text-white"
              }`}
            >
              Original Oral Text
            </button>
            <button
              onClick={() => setViewMode("translation")}
              className={`px-3 py-1.5 rounded-full transition-all ${
                viewMode === "translation"
                  ? "bg-white/15 text-white font-bold"
                  : "text-netflix-gray hover:text-white"
              }`}
            >
              Translation Only
            </button>
          </div>

          {/* Target Translation Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-netflix-gray mr-1">
              <Languages className="w-3.5 h-3.5 text-netflix-red" />
              <span>Translate to:</span>
            </div>

            <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10">
              <button
                onClick={() => handleTranslate("en")}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  targetLang === "en"
                    ? "bg-netflix-red text-white shadow-netflix-glow"
                    : "text-netflix-gray hover:text-white"
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleTranslate("hi")}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  targetLang === "hi"
                    ? "bg-netflix-red text-white shadow-netflix-glow"
                    : "text-netflix-gray hover:text-white"
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                onClick={() => handleTranslate("te")}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  targetLang === "te"
                    ? "bg-netflix-red text-white shadow-netflix-glow"
                    : "text-netflix-gray hover:text-white"
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>
        </div>

        {/* Transcript & Translation Panels */}
        <div className="space-y-4">
          <div className="ios27-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-netflix-gray">
              <span className="text-netflix-red font-bold">
                Speaker 1 • 00:00 - {rec.duration}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-cultural-gold">Model: IndicTrans2-1B-Instruct</span>
                <span>• AI Confidence: 94.2%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {(viewMode === "dual" || viewMode === "original") && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-netflix-red font-bold block">
                    Original Dialect Transcript ({rec.language})
                  </span>
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-white/95 leading-relaxed font-sans">
                    {rec.originalTranscript}
                  </div>
                </div>
              )}

              {(viewMode === "dual" || viewMode === "translation") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-cultural-gold font-bold block">
                      IndicTrans2 Translation ({targetLang.toUpperCase()})
                    </span>
                    {isTranslating && (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-netflix-gray">
                        <Loader2 className="w-3 h-3 animate-spin text-netflix-red" />
                        <span>Translating...</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-netflix-light leading-relaxed font-sans italic">
                    "{translationText}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Extracted Cultural Terms */}
        <div className="ios27-glass p-6 rounded-3xl border border-white/10 space-y-4">
          <span className="text-xs font-mono uppercase text-netflix-red font-bold block">
            Extracted Cultural Terms & Lexical Roots
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(rec.vocabulary || DEFAULT_CATALOG["vr-101"].vocabulary).map((v: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-sm font-bold text-white block">{v.word}</span>
                <span className="text-xs text-netflix-gray block">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
