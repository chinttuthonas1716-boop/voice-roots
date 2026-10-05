"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Mic,
  Languages,
  User,
  Volume2,
  Play,
  Pause,
  Upload,
  Shield,
  Activity,
  Flame,
  Award,
  Users,
  TrendingUp,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { soundPlayer } from "@/lib/soundPlayer";

export default function MobileAppSimulatorPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "fitness_plus" | "translate" | "sharing">("summary");
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Audio Playback in Simulator
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  // Translate tab state in simulator
  const [targetLang, setTargetLang] = useState<string>("en");
  const [sourceText, setSourceText] = useState("బాగున్నారా? ఎలా ఉన్నారు?");
  const [translatedText, setTranslatedText] = useState("Greetings! How are you doing? Are you well?");
  const [isTranslating, setIsTranslating] = useState(false);

  // Sync with universal sound player
  useEffect(() => {
    const unsubscribe = soundPlayer.subscribe((state) => {
      setPlayingSongId(state.isPlaying ? state.activeId : null);
    });
    return () => unsubscribe();
  }, []);

  const handlePlayToggle = async (songId: string, url: string) => {
    await soundPlayer.toggle(songId, url);
  };

  const copyCloudflareLink = () => {
    navigator.clipboard.writeText("https://dee-arabia-gathered-drove.trycloudflare.com");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTranslate = (text: string, lang: string) => {
    setIsTranslating(true);
    setTimeout(() => {
      if (text.includes("బాగున్నారా")) {
        if (lang === "en") setTranslatedText("Greetings! How are you doing? Are you well?");
        else if (lang === "hi") setTranslatedText("नमस्ते! आप कैसे हैं? क्या सब कुशल-मंगल है?");
        else if (lang === "ta") setTranslatedText("வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்? நலமா?");
        else if (lang === "kn") setTranslatedText("ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ? ಕ್ಷೇಮವೇ?");
        else if (lang === "gondi") setTranslatedText("सेवा जोहार! నీవా రోన్ సుఖి మంతా?");
        else setTranslatedText(`[${lang.toUpperCase()}]: నమస్కారం! బాగున్నారా?`);
      } else if (text.includes("నీళ్ళు")) {
        if (lang === "en") setTranslatedText("Could you please give me some drinking water? I am thirsty.");
        else if (lang === "hi") setTranslatedText("कृपया मुझे पीने के लिए थोड़ा पानी देंगे? मुझे प्यास लगी है।");
        else if (lang === "kn") setTranslatedText("ದಯವಿಟ್ಟು ಕುಡಿಯಲು ಸ್ವಲ್ಪ ನೀರು ಕೊಡುತ್ತೀರಾ? ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ.");
        else setTranslatedText(`[${lang.toUpperCase()}]: మంచి నీళ్ళు ఇవ్వండి.`);
      } else {
        setTranslatedText(`[${lang.toUpperCase()} Translated]: "${text}" — Everyday conversational meaning.`);
      }
      setIsTranslating(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white pt-20 pb-16 px-4">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#1C1C1E] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3.5">
            {/* Apple Fitness Style Rings Icon */}
            <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 flex items-center justify-center p-1.5 shadow-[0_0_20px_rgba(250,17,79,0.4)]">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#FA114F" strokeWidth="3" opacity="0.9" />
                <circle cx="18" cy="18" r="10" fill="none" stroke="#A1FE05" strokeWidth="3" opacity="0.9" />
                <circle cx="18" cy="18" r="6" fill="none" stroke="#00D8F6" strokeWidth="3" opacity="0.9" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Voice Roots — Apple Fitness Edition
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#A1FE05]/20 text-[#A1FE05] border border-[#A1FE05]/40 uppercase">
                  iOS Fitness UI
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Authentic iPhone Apple Fitness experience with Move/Exercise/Explore Activity Rings, Oral Workout Sessions, and actual folk audio playback.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setDeviceFrame(!deviceFrame)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{deviceFrame ? "Hide iPhone Frame" : "Show iPhone Frame"}</span>
            </button>

            <button
              onClick={copyCloudflareLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#A1FE05] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(161,254,5,0.4)] hover:brightness-110 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copied!" : "Copy Mobile URL"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Interactive iPhone Hardware Shell */}
        <div
          className={`relative transition-all duration-500 ${
            deviceFrame
              ? "w-[390px] h-[810px] rounded-[55px] p-3.5 bg-gradient-to-b from-[#2d2d30] via-[#1a1a1c] to-[#0c0c0e] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_0_2px_#3d3d42,inset_0_0_3px_#ffffff40]"
              : "w-full max-w-md h-[780px]"
          }`}
        >
          {/* Inner OLED Display */}
          <div className="w-full h-full rounded-[45px] bg-[#000000] overflow-hidden flex flex-col relative border border-white/10">
            {/* iOS Dynamic Island */}
            <div className="pt-3 pb-1 flex justify-center z-40 bg-[#000000]">
              <div className="w-28 h-6 bg-black rounded-full border border-white/10 flex items-center justify-between px-2.5 shadow-md">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#A1FE05] animate-pulse" />
                  <span className="text-[8px] font-mono text-[#A1FE05] font-bold">RINGS ON</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
            </div>

            {/* Screen Content Scroll Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24 text-white">
              {/* TAB 1: APPLE FITNESS SUMMARY (సారాంశం) */}
              {activeTab === "summary" && (
                <div className="space-y-4">
                  {/* Apple Fitness Header */}
                  <div className="flex items-end justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase font-mono">
                        MONDAY, 6 OCT
                      </span>
                      <h2 className="text-2xl font-black text-white tracking-tight leading-none mt-0.5">
                        Summary
                      </h2>
                    </div>
                    {/* User Profile Avatar with Ring */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FA114F] via-[#A1FE05] to-[#00D8F6] p-[2px] shadow-lg">
                      <div className="w-full h-full rounded-full bg-[#1C1C1E] flex items-center justify-center text-xs font-bold text-white">
                        VR
                      </div>
                    </div>
                  </div>

                  {/* Iconic Apple Fitness Activity Rings Card */}
                  <div className="p-5 rounded-3xl bg-[#1C1C1E] border border-white/10 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Activity Rings
                      </h3>
                      <span className="text-[10px] font-bold text-[#A1FE05] flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>7-Day Streak</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      {/* Authentic 3 Concentric Glowing Rings SVG */}
                      <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          {/* Background Track Rings */}
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#FA114F" strokeWidth="10" opacity="0.18" />
                          <circle cx="60" cy="60" r="38" fill="none" stroke="#A1FE05" strokeWidth="10" opacity="0.18" />
                          <circle cx="60" cy="60" r="26" fill="none" stroke="#00D8F6" strokeWidth="10" opacity="0.18" />

                          {/* Outer Move Ring (Red: 88% filled) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#FA114F"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 50}
                            strokeDashoffset={2 * Math.PI * 50 * (1 - 0.88)}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_8px_rgba(250,17,79,0.8)]"
                          />

                          {/* Middle Exercise Ring (Green: 78% filled) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="38"
                            fill="none"
                            stroke="#A1FE05"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 38}
                            strokeDashoffset={2 * Math.PI * 38 * (1 - 0.78)}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_8px_rgba(161,254,5,0.8)]"
                          />

                          {/* Inner Explore Ring (Cyan: 65% filled) */}
                          <circle
                            cx="60"
                            cy="60"
                            r="26"
                            fill="none"
                            stroke="#00D8F6"
                            strokeWidth="10"
                            strokeDasharray={2 * Math.PI * 26}
                            strokeDashoffset={2 * Math.PI * 26 * (1 - 0.65)}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_8px_rgba(0,216,246,0.8)]"
                          />
                        </svg>

                        {/* Central Flame Glyph */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Flame className="w-5 h-5 text-[#FA114F]" />
                        </div>
                      </div>

                      {/* Right: Metrics Stack (Exact Apple Fitness typography) */}
                      <div className="space-y-2.5 flex-1">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#FA114F] font-mono leading-none">
                              1,840
                            </span>
                            <span className="text-[10px] font-bold text-neutral-400">/ 2,000</span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FA114F] block">
                            WORDS RECORDED
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#A1FE05] font-mono leading-none">
                              24
                            </span>
                            <span className="text-[10px] font-bold text-neutral-400">/ 30 MIN</span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#A1FE05] block">
                            ORAL LORE TIME
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#00D8F6] font-mono leading-none">
                              8
                            </span>
                            <span className="text-[10px] font-bold text-neutral-400">/ 12</span>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#00D8F6] block">
                            DIALECTS EXPLORED
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workouts -> "Oral Preservation Sessions" */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Preservation Sessions
                      </h3>
                      <button
                        onClick={() => setActiveTab("fitness_plus")}
                        className="text-[10px] font-bold text-[#A1FE05]"
                      >
                        Show More
                      </button>
                    </div>

                    {/* Workout Card 1 (Folk Song) with Play sound button */}
                    <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-2 hover:border-[#FA114F] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FA114F]/20 flex items-center justify-center text-[#FA114F]">
                            <Flame className="w-4 h-4 fill-current" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Harvest & Rain Folk Song</h4>
                            <p className="text-[10px] text-neutral-400">Telugu Agency • Elder Ramu</p>
                          </div>
                        </div>

                        {/* Play / Pause with REAL audio */}
                        <button
                          onClick={() => handlePlayToggle("vr-101", "/audio/harvest_song.wav")}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-bold shadow-md transition-transform hover:scale-105 ${
                            playingSongId === "vr-101" ? "bg-[#00D8F6] scale-105" : "bg-[#A1FE05]"
                          }`}
                        >
                          {playingSongId === "vr-101" ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10 text-neutral-300 font-mono">
                        <span>26 MINS</span>
                        <span className="text-[#FA114F] font-bold">1,240 WORDS</span>
                        <span className="text-[#00D8F6]">LOSSLESS WAV</span>
                      </div>
                    </div>

                    {/* Workout Card 2 (Mountain Spring Legend) */}
                    <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-2 hover:border-[#A1FE05] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#A1FE05]/20 flex items-center justify-center text-[#A1FE05]">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">The Mountain Spring Legend</h4>
                            <p className="text-[10px] text-neutral-400">Gondi Bastar Lore • Sacred Clan Chant</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePlayToggle("vr-102", "/audio/gondi_legend.wav")}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-bold shadow-md transition-transform hover:scale-105 ${
                            playingSongId === "vr-102" ? "bg-[#00D8F6] scale-105" : "bg-[#A1FE05]"
                          }`}
                        >
                          {playingSongId === "vr-102" ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/10 text-neutral-300 font-mono">
                        <span>14 MINS</span>
                        <span className="text-[#FA114F] font-bold">890 WORDS</span>
                        <span className="text-[#A1FE05]">SAVED</span>
                      </div>
                    </div>
                  </div>

                  {/* Apple Fitness Trends Section */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trends</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#FA114F]">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>WORDS / DAY</span>
                        </div>
                        <div className="text-sm font-black font-mono text-white">2.4k</div>
                        <span className="text-[9px] text-neutral-400">Above daily goal</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-white/10 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#A1FE05]">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>LISTENING</span>
                        </div>
                        <div className="text-sm font-black font-mono text-white">32 min</div>
                        <span className="text-[9px] text-neutral-400">Streak active</span>
                      </div>
                    </div>
                  </div>

                  {/* Apple Fitness Awards / Badges */}
                  <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Awards</h3>
                      <span className="text-[10px] text-neutral-400">4 Unlocked</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {[
                        { title: "7-Day", color: "text-[#FA114F]", sub: "Streak" },
                        { title: "10k Wds", color: "text-[#A1FE05]", sub: "Preserved" },
                        { title: "Folk Song", color: "text-[#00D8F6]", sub: "Guardian" },
                        { title: "All 3 Rings", color: "text-amber-400", sub: "Closed" },
                      ].map((award, i) => (
                        <div key={i} className="flex-1 p-2 rounded-xl bg-black/60 border border-white/5 text-center">
                          <Award className={`w-5 h-5 mx-auto mb-1 ${award.color}`} />
                          <span className="text-[9px] font-bold block text-white truncate">{award.title}</span>
                          <span className="text-[8px] text-neutral-400 block">{award.sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FITNESS+ / ORAL LORE SESSIONS */}
              {activeTab === "fitness_plus" && (
                <div className="space-y-4">
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-[#A1FE05] font-mono tracking-wider uppercase">
                      FITNESS+ ORAL ARCHIVE
                    </span>
                    <h2 className="text-xl font-black text-white">Audio Folk Workouts</h2>
                  </div>

                  {/* Workout Sessions with Audio */}
                  {[
                    {
                      id: "vr-101",
                      title: "Monsoon Harvest & Rain Song",
                      lang: "Telugu (Agency)",
                      dur: "26 MIN",
                      words: "1,240 Words",
                      url: "/audio/harvest_song.wav",
                    },
                    {
                      id: "vr-102",
                      title: "Mountain Spring Legend",
                      lang: "Gondi (Bastar)",
                      dur: "14 MIN",
                      words: "890 Words",
                      url: "/audio/gondi_legend.wav",
                    },
                    {
                      id: "vr-103",
                      title: "Wild Turmeric Herbal Knowledge",
                      lang: "Koya (Godavari)",
                      dur: "10 MIN",
                      words: "620 Words",
                      url: "/audio/koya_remedy.wav",
                    },
                    {
                      id: "vr-110",
                      title: "Nomadic Caravan Twilight Chants",
                      lang: "Lambadi (Deccan)",
                      dur: "18 MIN",
                      words: "940 Words",
                      url: "/audio/general_folk.wav",
                    },
                  ].map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/10 space-y-3 hover:border-[#A1FE05] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-[#00D8F6] uppercase font-mono">
                            {s.lang}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{s.title}</h4>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {s.dur} • {s.words}
                          </span>
                        </div>

                        <button
                          onClick={() => handlePlayToggle(s.id, s.url)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-black font-bold shadow-lg transition-transform hover:scale-105 ${
                            playingSongId === s.id ? "bg-[#00D8F6]" : "bg-[#A1FE05]"
                          }`}
                        >
                          {playingSongId === s.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      {/* Equalizer animation when playing */}
                      <div className="h-6 flex items-center gap-1 px-3 bg-black/60 rounded-xl">
                        {[40, 80, 50, 95, 60, 85, 45, 90, 70, 40, 85, 55].map((h, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full transition-all ${
                              playingSongId === s.id ? "bg-[#A1FE05] animate-pulse" : "bg-white/20"
                            }`}
                            style={{ height: playingSongId === s.id ? `${h}%` : "20%" }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: DAY-TO-DAY TRANSLATE */}
              {activeTab === "translate" && (
                <div className="space-y-4">
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-[#00D8F6] font-mono tracking-wider uppercase">
                      DAY-TO-DAY SPEECH
                    </span>
                    <h2 className="text-xl font-black text-white">Conversational Translator</h2>
                  </div>

                  {/* 12 Language Switcher Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#A1FE05] uppercase">
                      Translate to (12 Languages):
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {[
                        { code: "en", name: "English" },
                        { code: "te", name: "తెలుగు" },
                        { code: "hi", name: "हिन्दी" },
                        { code: "ta", name: "தமிழ்" },
                        { code: "kn", name: "ಕನ್ನಡ" },
                        { code: "ml", name: "മലയാളം" },
                        { code: "mr", name: "मराठी" },
                        { code: "gondi", name: "గోండి" },
                        { code: "koya", name: "కోయ" },
                        { code: "lambadi", name: "లంబాడీ" },
                      ].map((item) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            setTargetLang(item.code);
                            handleTranslate(sourceText, item.code);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                            targetLang === item.code
                              ? "bg-[#00D8F6] text-black shadow-[0_0_10px_#00D8F6]"
                              : "bg-[#1C1C1E] text-neutral-300 hover:text-white"
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Card */}
                  <div className="p-3.5 rounded-3xl bg-[#1C1C1E] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white">Daily Sentence:</span>
                      <button
                        onClick={() => {
                          const options = [
                            "బాగున్నారా? ఎలా ఉన్నారు?",
                            "తాగడానికి మంచి నీళ్ళు ఇవ్వండి",
                            "దీని ధర ఎంత? ఎంతకి ఇస్తారు?",
                            "సహాయం చేయండి, జ్వరంగా ఉంది",
                          ];
                          const random = options[Math.floor(Math.random() * options.length)];
                          setSourceText(random);
                          handleTranslate(random, targetLang);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A1FE05] text-black text-[10px] font-bold"
                      >
                        <Mic className="w-3 h-3" />
                        <span>Speak Daily</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={sourceText}
                      onChange={(e) => {
                        setSourceText(e.target.value);
                        handleTranslate(e.target.value, targetLang);
                      }}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#00D8F6]"
                    />

                    {/* Output */}
                    <div className="p-3 rounded-2xl bg-black/80 border border-[#00D8F6]/30 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#00D8F6]">
                        <span>TRANSLATION ({targetLang.toUpperCase()}):</span>
                        {isTranslating && <span className="text-[#A1FE05]">Translating...</span>}
                      </div>
                      <p className="text-xs font-semibold text-white">{translatedText}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SHARING */}
              {activeTab === "sharing" && (
                <div className="space-y-4">
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-[#FA114F] font-mono tracking-wider uppercase">
                      COMMUNITY SHARING
                    </span>
                    <h2 className="text-xl font-black text-white">Sharing Activity Rings</h2>
                  </div>

                  <div className="p-4 rounded-3xl bg-[#1C1C1E] border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black border border-white/20 flex items-center justify-center p-1">
                        <Users className="w-5 h-5 text-[#A1FE05]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Share Rings with Elders</h4>
                        <p className="text-[10px] text-neutral-400">Preserve voices together</p>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Compete with researchers, community schools, and oral historians to close all 3 rings every single day!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Apple Fitness Bottom Tab Bar (Iconic 4 Tabs) */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-40">
              {/* Tab 1: Summary */}
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "summary" ? "text-[#FA114F]" : "text-neutral-400 hover:text-white"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2.2]">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <span className="text-[9px] font-extrabold tracking-tight">Summary</span>
              </button>

              {/* Tab 2: Fitness+ / Lore */}
              <button
                onClick={() => setActiveTab("fitness_plus")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "fitness_plus" ? "text-[#A1FE05]" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="text-[9px] font-extrabold tracking-tight">Fitness+ Lore</span>
              </button>

              {/* Tab 3: Translate */}
              <button
                onClick={() => setActiveTab("translate")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "translate" ? "text-[#00D8F6]" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Languages className="w-4 h-4" />
                <span className="text-[9px] font-extrabold tracking-tight">Translate</span>
              </button>

              {/* Tab 4: Sharing */}
              <button
                onClick={() => setActiveTab("sharing")}
                className={`flex flex-col items-center gap-1 transition-all ${
                  activeTab === "sharing" ? "text-[#FA114F]" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[9px] font-extrabold tracking-tight">Sharing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Info: Apple Fitness Design Principles */}
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-[#A1FE05] uppercase tracking-wider">
              iPhone Fitness App Design Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Closing Rings for Endangered Languages
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Just like Apple Fitness tracks physical health, Voice Roots tracks <strong>Linguistic Health</strong> through the 3 Activity Rings.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#FA114F]/30 flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-[#FA114F] mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#FA114F]">Move Ring — Words Preserved</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Tracks how many spoken words of unwritten and endangered oral traditions are digitized each day.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#A1FE05]/30 flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-[#A1FE05] mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#A1FE05]">Exercise Ring — Oral Lore Minutes</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Tracks time spent recording elders, listening to lossless folk melodies, and validating transcripts.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#00D8F6]/30 flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-[#00D8F6] mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#00D8F6]">Explore Ring — Dialects Explored</h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Encourages learning across diverse linguistic families: Gondi, Koya, Lambadi, Khasi, Santali, and Bodo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
