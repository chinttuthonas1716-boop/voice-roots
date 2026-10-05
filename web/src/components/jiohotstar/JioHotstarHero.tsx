"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Plus,
  Check,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Languages,
  BookOpen,
  Share2,
} from "lucide-react";
import { soundPlayer } from "@/lib/soundPlayer";

export interface HeroSlide {
  id: string;
  title: string;
  teluguTitle: string;
  badge: string;
  topRank?: number;
  language: string;
  region: string;
  duration: string;
  genres: string[];
  description: string;
  indicTranscript: string;
  translation: string;
  bgGradient: string;
  accentColor: string;
  audioUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "vr-101",
    title: "Traditional Harvest & Rain Song",
    teluguTitle: "వరి పంట సంప్రదాయ పాట",
    badge: "JIOHOTSTAR SPECIAL",
    topRank: 1,
    language: "Telugu (Agency)",
    region: "Northern Andhra Agency Hills",
    duration: "08:42",
    genres: ["UNESCO Masterwork", "Sacred Soil Ritual", "Folk Melody", "Monsoon Hymn"],
    description:
      "Recorded antiphonally with elders in the northern Agency tract prior to the first monsoon shower to invoke soil fertility, crop prosperity, and seed regeneration.",
    indicTranscript:
      "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట ఇది. ఆకాశంలో మబ్బులు కనిపించగానే విత్తనాలు చల్లుతారు.",
    translation:
      "This is a traditional melody our village elders sing before monsoon rains arrive, performing the Earth worship ritual and sowing heirloom seeds.",
    bgGradient: "from-[#0f1014] via-[#121c2e] to-[#0a1628]",
    accentColor: "#00d8f6",
    audioUrl: "/audio/harvest_song.wav",
  },
  {
    id: "vr-102",
    title: "The Legend of the Mountain Spring",
    teluguTitle: "కొండ శిఖరం ఊట కథ & గీతం",
    badge: "ORIGINAL ORAL LORE",
    topRank: 2,
    language: "Gondi (Bastar)",
    region: "Bastar Plateau & Mandla Hills",
    duration: "14:15",
    genres: ["Gondi Saga Clan", "Rain Invocation", "Ancient Myth", "Oral Epic"],
    description:
      "Behind the perennial spring flowing on the Bastar mountain peak lies an ancient tale of the Gond clans. Village elders sing this sacred chant to invoke the rain deity during severe droughts.",
    indicTranscript:
      "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक पुरानी कहानी है। जब सूखा पड़ता था, तो हमारे गाँव के बुजुर्ग इस गीत को गाकर वर्षा देव को प्रसन्न करते थे।",
    translation:
      "Whenever drought descended, the village elders would gather at the mountain peak and sing this sacred chant to invoke the ancestral rain guardians.",
    bgGradient: "from-[#0f1014] via-[#1f1628] to-[#160a28]",
    accentColor: "#e5a93c",
    audioUrl: "/audio/gondi_legend.wav",
  },
  {
    id: "vr-103",
    title: "Wild Turmeric & Forest Medicine",
    teluguTitle: "అడవి పసుపు & సాంప్రదాయ వైద్యం",
    badge: "HERITAGE PHARMACOPOEIA",
    topRank: 3,
    language: "Koya (Godavari)",
    region: "Papikondalu River Valley",
    duration: "06:30",
    genres: ["Ethnobotanical", "Clan Healers", "Wild Remedies", "Seasonal Health"],
    description:
      "Elders describe the sacred formulation of wild neem and mountain turmeric roots into remedies for monsoon fevers, passed down unbroken across 18 generations.",
    indicTranscript:
      "అడవిలో దొరికే వేప, పసుపు వేర్లతో జ్వరాలు తగ్గించే సాంప్రదాయ వైద్య విధానం. ఈ మూలికలను వర్షాకాలంలో సేకరించి ఎండబెట్టి భద్రపరుస్తాము.",
    translation:
      "Wild herbs are gathered with prayer protocols during early monsoon downpours and dried to treat seasonal illnesses across the forest settlements.",
    bgGradient: "from-[#0f1014] via-[#0d221c] to-[#071a14]",
    accentColor: "#10b981",
    audioUrl: "/audio/koya_remedy.wav",
  },
  {
    id: "vr-110",
    title: "Nomadic Caravan Trade Chants",
    teluguTitle: "బంజారా తాండా పశువుల దారి పాటలు",
    badge: "POPULAR BALLAD",
    topRank: 4,
    language: "Lambadi (Banjara)",
    region: "Deccan Highlands",
    duration: "10:30",
    genres: ["Caravan Ballad", "Highland Trails", "Banjara Lore", "Oral Map"],
    description:
      "Rhythmic travel ballads sung by Banjara caravan leaders mapping waterholes, safe mountain passes, and cattle trading trails across the Deccan highlands.",
    indicTranscript:
      "बंजारा तांडा में गाये जाने वाले पारंपरिक लोकगीत और बंजारा संस्कृति। రాం రాం! ఘర్ మ బోలేవాలొ సాదో బాత్.",
    translation:
      "Oral geographic navigation chants recited rhythmically during twilight journeys to ensure caravan safety across unknown territories.",
    bgGradient: "from-[#0f1014] via-[#2a1b12] to-[#1f1109]",
    accentColor: "#f59e0b",
    audioUrl: "/audio/general_folk.wav",
  },
];

export function JioHotstarHero() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Sync with universal sound player
  useEffect(() => {
    const unsubscribe = soundPlayer.subscribe((state) => {
      setIsPlayingAudio(state.isPlaying && state.activeId === currentSlide.id);
    });
    return () => unsubscribe();
  }, [currentSlide.id]);

  // Auto-slide every 7 seconds unless playing audio or user is interacting
  useEffect(() => {
    if (isPlayingAudio || isPausedByUser) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlayingAudio, isPausedByUser]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePlayToggle = async () => {
    await soundPlayer.toggle(currentSlide.id, currentSlide.audioUrl);
  };

  return (
    <div
      className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden select-none transition-colors duration-1000"
      style={{
        background: `linear-gradient(135deg, #0f1014 0%, ${
          currentSlideIndex === 0
            ? "#121e33"
            : currentSlideIndex === 1
            ? "#211530"
            : currentSlideIndex === 2
            ? "#0f261f"
            : "#2b190f"
        } 50%, #0f1014 100%)`,
      }}
      onMouseEnter={() => setIsPausedByUser(true)}
      onMouseLeave={() => setIsPausedByUser(false)}
    >
      {/* Background Cinematic Atmosphere Glows */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-35 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: currentSlide.accentColor }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/65 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/80 to-transparent pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Billboard Metadata & Actions */}
          <div className="lg:col-span-8 space-y-5">
            {/* Top Badges (JioHotstar Special & Top 10) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-md bg-[#0063e5] text-white text-[11px] font-extrabold tracking-wider uppercase shadow-[0_0_15px_rgba(0,99,229,0.6)]">
                {currentSlide.badge}
              </span>

              {currentSlide.topRank && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#f5c518]/15 border border-[#f5c518]/40 text-[#f5c518] text-xs font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>#{currentSlide.topRank} in Oral Lore Today</span>
                </div>
              )}

              <span className="text-xs font-medium text-slate-300 bg-white/10 px-2.5 py-1 rounded">
                {currentSlide.duration}
              </span>

              <span className="text-xs font-medium text-slate-300 bg-white/10 px-2.5 py-1 rounded">
                48kHz Lossless
              </span>
            </div>

            {/* Cinematic Big Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
                {currentSlide.title}
              </h1>
              <p className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00d8f6] via-white to-[#f5c518]">
                {currentSlide.teluguTitle}
              </p>
            </div>

            {/* Language & Genre Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white font-semibold border border-white/15">
                {currentSlide.language}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">{currentSlide.region}</span>
              <span className="text-slate-400">•</span>
              {currentSlide.genres.map((g, idx) => (
                <span key={idx} className="text-slate-400">
                  {g}{idx < currentSlide.genres.length - 1 ? " •" : ""}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {currentSlide.description}
            </p>

            {/* IndicTrans2 Translation Quote Box */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 max-w-2xl space-y-1.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#00d8f6]">
                <Languages className="w-3.5 h-3.5" />
                <span>ORIGINAL ORAL CHANT (స్వాభావిక వాక్కు):</span>
              </div>
              <p className="text-xs italic text-white/90 font-serif">
                &ldquo;{currentSlide.indicTranscript}&rdquo;
              </p>
            </div>

            {/* JioHotstar Style Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Big Watch / Listen Now Button */}
              <button
                onClick={handlePlayToggle}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#0063e5] via-[#007cf0] to-[#00d8f6] hover:brightness-110 text-white font-extrabold text-sm shadow-[0_0_30px_rgba(0,124,240,0.55)] transition-all hover:scale-105 active:scale-95"
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
                <span>{isPlayingAudio ? "Pause Audio" : "Listen Masterwork Now"}</span>
              </button>

              {/* Add to Watchlist */}
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                  isSaved
                    ? "bg-[#00d8f6]/20 border-[#00d8f6] text-[#00d8f6]"
                    : "bg-white/10 border-white/15 text-white hover:bg-white/20"
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isSaved ? "Saved in List" : "Add to Vault"}</span>
              </button>

              {/* Day-to-Day Translator Quick Access */}
              <Link
                href="/translate"
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-[#0063e5]/30 border border-white/15 text-white text-sm font-semibold transition-all hover:scale-105"
              >
                <Languages className="w-4 h-4 text-[#00d8f6]" />
                <span>Day-to-Day Translator (12 Langs)</span>
              </Link>

              {/* Volume Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00d8f6]" />}
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic JioHotstar Acoustic Visualizer Card */}
          <div className="lg:col-span-4 flex flex-col justify-center items-center">
            <div className="w-full max-w-sm p-6 rounded-3xl bg-black/70 border border-white/15 shadow-2xl backdrop-blur-2xl space-y-4 relative overflow-hidden group">
              <div
                className="absolute inset-0 opacity-15 blur-xl transition-all duration-700"
                style={{ backgroundColor: currentSlide.accentColor }}
              />

              <div className="flex items-center justify-between relative z-10">
                <span className="text-[11px] font-mono font-bold text-[#00d8f6] tracking-wider uppercase">
                  ● JioHotstar Acoustic 48kHz
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5c518]/20 text-[#f5c518]">
                  UHD SOUND
                </span>
              </div>

              {/* Animated Equalizer Waveform */}
              <div className="h-28 flex items-center justify-center gap-1.5 px-3 py-2 bg-black/80 rounded-2xl border border-white/10 relative z-10">
                {[35, 75, 45, 90, 60, 100, 85, 40, 95, 65, 80, 50, 90, 70, 45, 85, 60, 30].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full transition-all duration-300"
                      style={{
                        height: isPlayingAudio ? `${h}%` : "15%",
                        backgroundColor:
                          i % 3 === 0 ? "#0063e5" : i % 3 === 1 ? "#00d8f6" : "#f5c518",
                        opacity: isPlayingAudio ? 1 : 0.35,
                      }}
                    />
                  )
                )}
              </div>

              <div className="text-center space-y-1 relative z-10">
                <h4 className="text-sm font-bold text-white">{currentSlide.title}</h4>
                <p className="text-xs text-slate-400">
                  {isPlayingAudio
                    ? "Currently Playing Master Recording..."
                    : "Tap 'Listen Masterwork Now' to stream audio"}
                </p>
              </div>

              {/* Slide Navigation Chevrons inside card */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-lg bg-white/10 hover:bg-[#0063e5] text-white transition-colors"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentSlideIndex === idx
                          ? "w-6 bg-[#00d8f6]"
                          : "w-1.5 bg-white/30 hover:bg-white/60"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg bg-white/10 hover:bg-[#0063e5] text-white transition-colors"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JioHotstar Bottom Slide Indicators & Direct Slide Switcher */}
      <div className="absolute bottom-6 right-8 z-20 hidden md:flex items-center gap-3">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`text-left p-2 rounded-xl transition-all border ${
              currentSlideIndex === idx
                ? "bg-white/15 border-[#00d8f6] shadow-[0_0_15px_rgba(0,216,246,0.3)] scale-105"
                : "bg-black/50 border-white/10 opacity-60 hover:opacity-100"
            }`}
          >
            <div className="text-[10px] font-bold text-[#00d8f6]">0{idx + 1}</div>
            <div className="text-xs font-semibold text-white max-w-[120px] truncate">{s.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
