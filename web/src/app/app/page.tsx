"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  QrCode,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Mic,
  Library,
  Languages,
  User,
  Volume2,
  Play,
  Pause,
  Upload,
  Shield,
  Layers,
  FileAudio,
  Radio,
  Share2,
} from "lucide-react";

export default function MobileAppSimulatorPage() {
  const [activeTab, setActiveTab] = useState<"home" | "archive" | "record" | "translate" | "profile">("home");
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Record Screen state in simulator
  const [recordMode, setRecordMode] = useState<"mic" | "upload">("upload");
  const [selectedLanguage, setSelectedLanguage] = useState("Gondi (గోండి)");
  const [targetLang, setTargetLang] = useState<"te" | "en" | "hi">("te");
  const [uploadedFile, setUploadedFile] = useState<string | null>("elder_gondi_forest_folklore.mp3");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Translate Screen state in simulator
  const [translateTarget, setTranslateTarget] = useState<"te" | "en" | "hi">("te");
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);

  const sampleOralPhrases = [
    {
      oral: "సేవా సేవా! మావా నాటే స్వాగతం.",
      lang: "Gondi",
      phonetic: "Sewa sewa! Mawa naate swagatam.",
      meaningTe: "నమస్కారం! మా గ్రామానికి హృదయపూర్వక స్వాగతం.",
      meaningEn: "Greetings! A warm welcome to our indigenous village.",
    },
    {
      oral: "కొండల నీళ్ళు తాగి, పెద్దల మాట విని బతకాలి.",
      lang: "Koya",
      phonetic: "Kondala neellu thaagi, peddala maata vini bathakali.",
      meaningTe: "కొండల సెలయేటి నీరు తాగుతూ, పెద్దల జ్ఞానోక్తులను ఆచరిస్తూ జీవించాలి.",
      meaningEn: "Drink from the hill springs and live by the wisdom of our elders.",
    },
    {
      oral: "Ki kti jong ngi ki tei ia ka jingkieng dieng.",
      lang: "Khasi",
      phonetic: "Ki kti jong ngi ki tei ia ka jingkieng dieng.",
      meaningTe: "తరతరాల జీవన వారధులు మా పూర్వీకుల చేతులతో అల్లబడ్డాయి.",
      meaningEn: "Generations of living root bridges were shaped by the hands of our ancestors.",
    },
  ];

  const copyCloudflareLink = () => {
    navigator.clipboard.writeText("https://dee-arabia-gathered-drove.trycloudflare.com");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-16 px-4">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141414]/90 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-netflix-red to-netflix-red-hover flex items-center justify-center text-white shadow-netflix-glow">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Voice Roots — Mobile App</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-netflix-red/20 text-netflix-red border border-netflix-red/30 uppercase">
                  iOS Spatial Glass
                </span>
              </div>
              <p className="text-xs text-netflix-light mt-0.5">
                Interactive preview of the React Native / Expo mobile application with Audio Upload, Instant Translation & 5 Liquid-Glass tabs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setDeviceFrame(!deviceFrame)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-cultural-gold" />
              <span>{deviceFrame ? "Full Mobile View" : "Device Frame View"}</span>
            </button>

            <button
              onClick={copyCloudflareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-netflix-red/20 hover:bg-netflix-red text-white border border-netflix-red/30 text-xs font-medium transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Copy Web App Link"}</span>
            </button>

            <a
              href="https://dee-arabia-gathered-drove.trycloudflare.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-netflix-red hover:bg-netflix-red-hover text-white text-xs font-semibold shadow-netflix-glow transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public App</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Container: Mobile Simulator + Side Guide */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Center: Interactive Mobile Phone Mockup */}
        <div className={`lg:col-span-7 flex justify-center ${!deviceFrame ? "w-full" : ""}`}>
          <div
            className={`w-full max-w-[400px] bg-[#141414] border border-white/15 rounded-[48px] p-3 shadow-2xl relative transition-all duration-300 ${
              deviceFrame ? "ring-8 ring-white/5 shadow-[0_25px_60px_-15px_rgba(229,9,20,0.3)]" : "rounded-2xl p-0 border-none"
            }`}
          >
            {/* iPhone Top Notch / Dynamic Island */}
            {deviceFrame && (
              <div className="pt-2 pb-1 px-4 flex justify-between items-center text-[10px] text-netflix-light">
                <span className="font-semibold text-white">9:41</span>
                {/* Dynamic Island Capsule */}
                <div className="h-6 px-3 rounded-full bg-black border border-white/20 flex items-center gap-2 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-netflix-red animate-pulse" />
                  <span className="text-[9px] font-semibold text-white tracking-wider">ARCHIVE LIVE</span>
                  <span className="text-[9px] text-netflix-light">•</span>
                  <span className="text-[9px] text-netflix-light">24 LANGS</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 rounded-sm border border-white/60 p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-xs" />
                  </div>
                </div>
              </div>
            )}

            {/* Inner Phone Screen Content */}
            <div className="bg-[#101010] rounded-[36px] overflow-hidden min-h-[680px] flex flex-col justify-between border border-white/5 relative">
              {/* Screen Content Body */}
              <div className="p-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10">
                {/* TAB 1: HOME */}
                {activeTab === "home" && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-cultural-gold">Indigenous Oral Heritage</span>
                        <h2 className="text-lg font-bold text-white leading-tight">Voice Roots</h2>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-netflix-red to-netflix-red-hover flex items-center justify-center text-white text-xs font-bold shadow-netflix-glow">
                        N
                      </div>
                    </div>

                    {/* Hero Liquid Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1e1e1e] via-[#161616] to-[#121212] border border-white/10 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      <div className="flex items-center gap-1.5 text-xs text-netflix-red font-semibold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Daily Oral Wisdom</span>
                      </div>
                      <p className="text-xs italic text-netflix-light mb-2">
                        &quot;మనుషులు మాట్లాడటం ఆపేస్తే భాష మరణిస్తుంది. పలకని మాట మట్టిలో కలిసిపోతుంది.&quot;
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-netflix-light">
                        <span>Elder Ramu Koya</span>
                        <span className="text-cultural-gold">కోయ తెగ (Koya)</span>
                      </div>
                    </div>

                    {/* Quick Action Matrix */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setActiveTab("record")}
                        className="p-3 rounded-xl bg-netflix-red/10 border border-netflix-red/30 hover:border-netflix-red text-left transition-all group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-netflix-red/20 flex items-center justify-center text-netflix-red mb-2 group-hover:scale-110 transition-transform">
                          <Mic className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-white">Record & Upload</h3>
                        <p className="text-[10px] text-netflix-light">Capture or upload audio</p>
                      </button>

                      <button
                        onClick={() => setActiveTab("translate")}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cultural-gold/40 text-left transition-all group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-cultural-gold/20 flex items-center justify-center text-cultural-gold mb-2 group-hover:scale-110 transition-transform">
                          <Languages className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-white">Translate</h3>
                        <p className="text-[10px] text-netflix-light">Gondi/Koya to Telugu</p>
                      </button>
                    </div>

                    {/* Endangered Languages Spotlight */}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                        <span>Endangered Oral Languages</span>
                        <span className="text-[10px] text-netflix-red font-semibold">24 Preserved</span>
                      </h4>
                      <div className="space-y-1.5">
                        {[
                          { name: "గోండి (Gondi)", speakers: "2.9M Speakers", status: "Vulnerable", color: "text-amber-400" },
                          { name: "కోయ (Koya)", speakers: "450K Speakers", status: "Endangered", color: "text-red-400" },
                          { name: "ఖాసి (Khasi)", speakers: "1.4M Oral Lore", status: "Preserved", color: "text-emerald-400" },
                          { name: "నిహాలి (Nihali)", speakers: "< 2,000 Speakers", status: "Critically Endangered", color: "text-red-500" },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                            <span className="font-medium text-white">{item.name}</span>
                            <div className="text-right">
                              <span className={`text-[10px] font-bold block ${item.color}`}>{item.status}</span>
                              <span className="text-[9px] text-netflix-light">{item.speakers}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ARCHIVE */}
                {activeTab === "archive" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-1">
                      <h2 className="text-base font-bold text-white">Story Vault Archive</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-netflix-light">
                        4,821 Oral Records
                      </span>
                    </div>

                    {/* Oral Audio Card */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-cultural-gold uppercase">గోండి అటవీ మూలికల కథ</span>
                          <h3 className="text-xs font-bold text-white mt-0.5">Forest Medicinal Herbs Lore</h3>
                          <p className="text-[10px] text-netflix-light">Recorded by Elder Laxman • Adilabad</p>
                        </div>
                        <button
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="w-8 h-8 rounded-full bg-netflix-red hover:bg-netflix-red-hover flex items-center justify-center text-white shadow-netflix-glow"
                        >
                          {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      </div>

                      {/* Mock Waveform */}
                      <div className="flex items-center gap-1 h-6 px-2 rounded-lg bg-black/40">
                        {[40, 75, 90, 60, 100, 30, 85, 45, 95, 70, 50, 80, 65, 90, 40, 85, 55].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${
                              isPlayingAudio ? "bg-netflix-red animate-pulse" : "bg-white/20"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>

                      {/* Instant Translation Box */}
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] space-y-1">
                        <div className="text-[10px] font-bold text-netflix-red flex items-center gap-1">
                          <Languages className="w-3 h-3" />
                          <span>తెలుగు అనువాదం:</span>
                        </div>
                        <p className="text-white">
                          &quot;అడవిలో పెరిగే నల్ల మద్ది చెట్టు బెరడు జ్వరానికి మరియు కడుపు నొప్పులకు అద్భుతమైన సంజీవని.&quot;
                        </p>
                      </div>
                    </div>

                    {/* Secondary Record */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-[10px] font-semibold text-cultural-gold uppercase">కోయ పండుగల పాట</span>
                      <h3 className="text-xs font-bold text-white">Bhimana Pandum Oral Chant</h3>
                      <p className="text-[10px] text-netflix-light">
                        భీమన పండుగ సమయంలో పంటల సంరక్షణ కొరకు పాడే పురాతన మౌఖిక శ్లోకం.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: RECORD & UPLOAD */}
                {activeTab === "record" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-1">
                      <h2 className="text-base font-bold text-white">Record & Translate</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        AI Ready
                      </span>
                    </div>

                    {/* Mode Selector Toggle */}
                    <div className="flex p-1 rounded-xl bg-black/50 border border-white/10">
                      <button
                        onClick={() => setRecordMode("upload")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          recordMode === "upload" ? "bg-netflix-red text-white shadow-netflix-glow" : "text-netflix-light hover:text-white"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>ఆడియో అప్‌లోడ్</span>
                      </button>
                      <button
                        onClick={() => setRecordMode("mic")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          recordMode === "mic" ? "bg-netflix-red text-white shadow-netflix-glow" : "text-netflix-light hover:text-white"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>లైవ్ మైక్</span>
                      </button>
                    </div>

                    {/* Language Selector */}
                    <div>
                      <label className="text-[10px] text-netflix-light uppercase font-semibold block mb-1">
                        ఆడియో భాష (Source Oral Language)
                      </label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full text-xs p-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-netflix-red"
                      >
                        <option value="Gondi (గోండి)">గోండి (Gondi) - Adilabad</option>
                        <option value="Koya (కోయ)">కోయ (Koya) - Bhadrachalam</option>
                        <option value="Khasi (ఖాసి)">ఖాసి (Khasi) - Meghalaya</option>
                      </select>
                    </div>

                    {/* Upload Box / Mic Box */}
                    {recordMode === "upload" ? (
                      <div className="p-4 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 text-center space-y-2">
                        <FileAudio className="w-8 h-8 text-netflix-red mx-auto animate-bounce" />
                        <div className="text-xs font-bold text-white">ఆడియో ఫైల్ ఎంచుకోండి</div>
                        <p className="text-[10px] text-netflix-light">.MP3, .WAV, .M4A, .AAC ఫైల్స్ సపోర్ట్ చేయబడతాయి</p>
                        <div className="pt-1">
                          <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 text-white font-medium inline-block">
                            {uploadedFile}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-netflix-red/20 border-2 border-netflix-red flex items-center justify-center mx-auto text-netflix-red shadow-netflix-glow">
                          <Mic className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="text-xs font-bold text-white">రికార్డింగ్ ప్రారంభించండి</div>
                        <p className="text-[10px] text-netflix-light">లక్షణమైన మౌఖిక కథనాన్ని రికార్డ్ చేయండి</p>
                      </div>
                    )}

                    {/* Target Translation Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] text-netflix-light uppercase font-semibold">
                          అనువాద భాష (Target Language)
                        </label>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setTargetLang("te")}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              targetLang === "te" ? "bg-netflix-red text-white" : "bg-white/10 text-netflix-light"
                            }`}
                          >
                            తెలుగు
                          </button>
                          <button
                            onClick={() => setTargetLang("en")}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              targetLang === "en" ? "bg-netflix-red text-white" : "bg-white/10 text-netflix-light"
                            }`}
                          >
                            English
                          </button>
                          <button
                            onClick={() => setTargetLang("hi")}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              targetLang === "hi" ? "bg-netflix-red text-white" : "bg-white/10 text-netflix-light"
                            }`}
                          >
                            हिन्दी
                          </button>
                        </div>
                      </div>

                      {/* Instant Translation Output Card */}
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-netflix-red">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI ఇన్‌స్టంట్ అనువాదం (Instant Output)</span>
                          </span>
                          <span className="text-emerald-400">98.4% Accuracy</span>
                        </div>

                        <div className="text-xs text-white leading-relaxed p-2 rounded-xl bg-black/40 border border-white/5">
                          {targetLang === "te" && (
                            <p>&quot;పూర్వీకుల కాలం నుండి మేము కొండల లోయలలోని ఔషధ మూలికలతో ప్రజల ఆరోగ్యాన్ని కాపాడుతున్నాము.&quot;</p>
                          )}
                          {targetLang === "en" && (
                            <p>&quot;Since ancient ancestral times, we have guarded community health using sacred herbal roots from deep mountain valleys.&quot;</p>
                          )}
                          {targetLang === "hi" && (
                            <p>&quot;पूर्वजों के समय से, हम गहरी घाटी की जड़ी-बूटियों से समुदाय के स्वास्थ्य की रक्षा कर रहे हैं।&quot;</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: TRANSLATE */}
                {activeTab === "translate" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-1">
                      <h2 className="text-base font-bold text-white">దైనందిన అనువాదం (Daily Translate)</h2>
                      <span className="text-[10px] text-cultural-gold font-semibold">2-Way AI</span>
                    </div>

                    {/* Target Selector */}
                    <div className="flex p-1 rounded-xl bg-black/50 border border-white/10">
                      <button
                        onClick={() => setTranslateTarget("te")}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                          translateTarget === "te" ? "bg-netflix-red text-white" : "text-netflix-light"
                        }`}
                      >
                        తెలుగు (Telugu)
                      </button>
                      <button
                        onClick={() => setTranslateTarget("en")}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                          translateTarget === "en" ? "bg-netflix-red text-white" : "text-netflix-light"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setTranslateTarget("hi")}
                        className={`flex-1 py-1 text-xs font-semibold rounded-lg ${
                          translateTarget === "hi" ? "bg-netflix-red text-white" : "text-netflix-light"
                        }`}
                      >
                        हिन्दी
                      </button>
                    </div>

                    {/* Interactive Oral Phrases */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-netflix-light uppercase font-semibold block">
                        దైనందిన మౌఖిక వాక్యాలు (Daily Oral Lore)
                      </label>

                      {sampleOralPhrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActivePhraseIndex(idx)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            activePhraseIndex === idx
                              ? "bg-white/10 border-netflix-red shadow-lg"
                              : "bg-white/5 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-cultural-gold font-bold mb-1">
                            <span>{phrase.lang} Lore</span>
                            <span className="text-[9px] text-netflix-light">{phrase.phonetic}</span>
                          </div>
                          <p className="text-xs font-bold text-white mb-1.5">{phrase.oral}</p>

                          <div className="p-2 rounded-xl bg-black/40 text-[11px] text-netflix-light border border-white/5">
                            <span className="text-netflix-red font-bold block text-[10px] mb-0.5">అనువాదం:</span>
                            {translateTarget === "te" ? phrase.meaningTe : phrase.meaningEn}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: PROFILE */}
                {activeTab === "profile" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-1">
                      <h2 className="text-base font-bold text-white">Cultural Custodian Profile</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cultural-gold/20 text-cultural-gold border border-cultural-gold/30">
                        Elder Tier
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-netflix-red to-cultural-gold flex items-center justify-center text-white text-xl font-bold mx-auto shadow-netflix-glow">
                        VR
                      </div>
                      <h3 className="text-sm font-bold text-white">Harsha • Community Custodian</h3>
                      <p className="text-[10px] text-netflix-light">Adilabad & Godavari Basin Heritage Circle</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-netflix-light block">Vault Storage</span>
                        <span className="text-xs font-bold text-white">2.14 GB / 50 GB</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-netflix-light block">Oral Recordings</span>
                        <span className="text-xs font-bold text-white">4,821 Audios</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                      <span className="text-netflix-light">AES-256 Vault Encryption</span>
                      <span className="text-emerald-400 font-bold text-[10px]">ACTIVE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom iOS 27 Liquid Glass Floating Capsule Bar */}
              <div className="p-3 pt-0">
                <div className="h-14 rounded-full bg-[#181818]/90 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-around px-2 relative">
                  <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                  {/* Home Tab */}
                  <button
                    onClick={() => setActiveTab("home")}
                    className={`flex flex-col items-center justify-center flex-1 transition-all ${
                      activeTab === "home" ? "text-netflix-red scale-105" : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-[9px] font-medium mt-0.5">Home</span>
                  </button>

                  {/* Archive Tab */}
                  <button
                    onClick={() => setActiveTab("archive")}
                    className={`flex flex-col items-center justify-center flex-1 transition-all ${
                      activeTab === "archive" ? "text-netflix-red scale-105" : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    <Library className="w-4 h-4" />
                    <span className="text-[9px] font-medium mt-0.5">Archive</span>
                  </button>

                  {/* Central Elevated Record Button */}
                  <button
                    onClick={() => setActiveTab("record")}
                    className="relative -top-3 w-11 h-11 rounded-full bg-gradient-to-tr from-netflix-red via-netflix-red-hover to-netflix-red-dark border border-white/30 flex items-center justify-center text-white shadow-netflix-glow hover:scale-110 transition-transform"
                    title="Record Voice & Upload"
                  >
                    <Mic className="w-5 h-5 fill-current animate-pulse" />
                  </button>

                  {/* Translate Tab */}
                  <button
                    onClick={() => setActiveTab("translate")}
                    className={`flex flex-col items-center justify-center flex-1 transition-all ${
                      activeTab === "translate" ? "text-netflix-red scale-105" : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    <Languages className="w-4 h-4" />
                    <span className="text-[9px] font-medium mt-0.5">Translate</span>
                  </button>

                  {/* Profile Tab */}
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex flex-col items-center justify-center flex-1 transition-all ${
                      activeTab === "profile" ? "text-netflix-red scale-105" : "text-[#8e8e93] hover:text-white"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-[9px] font-medium mt-0.5">Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Links & Mobile App Native Launch Guide */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Access Card */}
          <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-netflix-red" />
              <span>1. Live Websites (Web App)</span>
            </h2>

            <div className="space-y-2 text-xs">
              <a
                href="https://dee-arabia-gathered-drove.trycloudflare.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-netflix-red hover:bg-white/10 transition-all group"
              >
                <div>
                  <span className="font-bold text-white block group-hover:text-netflix-red transition-colors">
                    Global Cloudflare Website
                  </span>
                  <span className="text-[11px] text-netflix-light">Open worldwide on any device (No login needed)</span>
                </div>
                <ExternalLink className="w-4 h-4 text-netflix-light group-hover:text-white" />
              </a>

              <a
                href="https://dee-arabia-gathered-drove.trycloudflare.com/translate"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-netflix-red hover:bg-white/10 transition-all group"
              >
                <div>
                  <span className="font-bold text-white block group-hover:text-netflix-red transition-colors">
                    Day-to-Day Oral Translator
                  </span>
                  <span className="text-[11px] text-netflix-light">Instant Telugu/English/Hindi translations</span>
                </div>
                <ExternalLink className="w-4 h-4 text-netflix-light group-hover:text-white" />
              </a>

              <a
                href="https://dee-arabia-gathered-drove.trycloudflare.com/record"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-netflix-red hover:bg-white/10 transition-all group"
              >
                <div>
                  <span className="font-bold text-white block group-hover:text-netflix-red transition-colors">
                    Recording & Audio Upload Studio
                  </span>
                  <span className="text-[11px] text-netflix-light">Upload audio files or record voice</span>
                </div>
                <ExternalLink className="w-4 h-4 text-netflix-light group-hover:text-white" />
              </a>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-netflix-light space-y-1">
                <span className="text-cultural-gold font-semibold block">Local Wi-Fi Network Address:</span>
                <code className="text-white bg-white/10 px-2 py-0.5 rounded text-[11px]">http://192.168.1.3:3000</code>
                <p className="text-[10px] text-netflix-light pt-0.5">Open this URL directly in Chrome or Safari on your phone connected to the same Wi-Fi.</p>
              </div>
            </div>
          </div>

          {/* Native Mobile App Instructions */}
          <div className="p-6 rounded-3xl bg-[#141414] border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cultural-gold" />
              <span>2. Native Mobile App (React Native / Expo)</span>
            </h2>

            <p className="text-xs text-netflix-light leading-relaxed">
              The native mobile app is built with <strong>React Native + Expo</strong> and styled with the <strong>iOS Spatial Liquid-Glass</strong> design language.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5 font-mono text-[11px]">
                <span className="text-cultural-gold block font-sans font-bold text-xs">Run on Phone or Simulator:</span>
                <div className="text-netflix-light"># Navigate to mobile directory</div>
                <div className="text-white">cd mobile</div>
                <div className="text-netflix-light"># Start Expo Metro Bundler</div>
                <div className="text-netflix-red font-semibold">npx expo start</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-netflix-light space-y-1">
                <span className="text-white font-semibold block">How to open on your phone:</span>
                <ol className="list-decimal list-inside space-y-1 text-netflix-light">
                  <li>Install <strong>Expo Go</strong> from the App Store (iOS) or Play Store (Android).</li>
                  <li>Scan the terminal QR code using your phone camera.</li>
                  <li>The app opens immediately with instant audio recording and translations!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
