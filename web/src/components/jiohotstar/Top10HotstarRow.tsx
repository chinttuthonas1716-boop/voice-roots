"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Bookmark, Sparkles, Volume2 } from "lucide-react";
import Link from "next/link";
import { soundPlayer } from "@/lib/soundPlayer";

export interface Top10Item {
  rank: number;
  id: string;
  title: string;
  teluguTitle: string;
  language: string;
  dialect: string;
  duration: string;
  type: string;
  community: string;
  excerpt: string;
  audioUrl: string;
}

const TOP_10_ITEMS: Top10Item[] = [
  {
    rank: 1,
    id: "vr-101",
    title: "Harvest & Rain Song",
    teluguTitle: "వరి పంట సంప్రదాయ పాట",
    language: "Telugu",
    dialect: "Agency Hill Variety",
    duration: "08:42",
    type: "Folk Song",
    community: "Agency Hill Clans",
    excerpt: "మా పల్లెలో వర్షాలు కురవకముందు పెద్దలు భూమి పూజ చేసి పాడుకునే సంప్రదాయ పాట...",
    audioUrl: "/audio/harvest_song.wav",
  },
  {
    rank: 2,
    id: "vr-102",
    title: "The Mountain Spring Legend",
    teluguTitle: "పర్వత శిఖర ఊట కథ",
    language: "Gondi",
    dialect: "Mandla Hill Variety",
    duration: "14:15",
    type: "Oral Tale",
    community: "Pardhan Community",
    excerpt: "पहाड़ की चोटी पर बहने वाले झरने के पीछे हमारे पुरखों की एक पुरानी कहानी है...",
    audioUrl: "/audio/gondi_legend.wav",
  },
  {
    rank: 3,
    id: "vr-103",
    title: "Wild Turmeric Medicinal Lore",
    teluguTitle: "అడవి పసుపు సాంప్రదాయ వైద్యం",
    language: "Koya",
    dialect: "Godavari Valley Variety",
    duration: "06:30",
    type: "Traditional Knowledge",
    community: "Forest Dwellers Collective",
    excerpt: "అడవిలో దొరికే వేప, పసుపు వేర్లతో జ్వరాలు తగ్గించే సాంప్రదాయ వైద్య విధానం...",
    audioUrl: "/audio/koya_remedy.wav",
  },
  {
    rank: 4,
    id: "vr-110",
    title: "Nomadic Caravan Trade Chants",
    teluguTitle: "బంజారా తాండా పశువుల పాట",
    language: "Lambadi",
    dialect: "Banjara Tanda Variety",
    duration: "10:30",
    type: "Travel Ballad",
    community: "Banjara Tanda Elders",
    excerpt: "बंजारा तांडा में गाये जाने वाले पारंपरिक लोकगीत और बंजारा संस्कृति...",
    audioUrl: "/audio/general_folk.wav",
  },
  {
    rank: 5,
    id: "vr-106",
    title: "Living Root Bridges Oral Engineering",
    teluguTitle: "సజీవ వేరు వంతెనల ఖాసీ ఇంజనీరింగ్",
    language: "Khasi",
    dialect: "Sohra Variety",
    duration: "13:10",
    type: "Traditional Knowledge",
    community: "Cherrapunji Forest Guardians",
    excerpt: "Ka jingshna ia ki jingkieng da ki thied dieng ha ki khlaw ba rben...",
    audioUrl: "/audio/harvest_song.wav",
  },
  {
    rank: 6,
    id: "vr-104",
    title: "Handloom Weaving Oral History",
    teluguTitle: "చేనేత మగ్గం పూర్వీకుల కథ",
    language: "Santali",
    dialect: "Mayurbhanj Santali",
    duration: "11:20",
    type: "Oral History",
    community: "Mayurbhanj Artisans",
    excerpt: "ᱥᱟᱱᱛᱟᱲᱤ ᱛᱮᱧ ᱠᱟᱹᱢᱤ ᱟᱨ ᱱᱟᱜᱟᱢ ᱨᱮᱱᱟᱜ ᱠᱟᱛᱷᱟ᱾...",
    audioUrl: "/audio/gondi_legend.wav",
  },
  {
    rank: 7,
    id: "vr-107",
    title: "Paddofield Planting Rhythms (Bwisagu)",
    teluguTitle: "వరి నాట్ల వసంత పాటలు",
    language: "Bodo",
    dialect: "Western Bodoland",
    duration: "07:25",
    type: "Folk Song",
    community: "Kokrajhar Cultivators",
    excerpt: "वैसागु बोथोरनि हाबा मावनाय आरो बारहुंखायाव मेथाय रोजाबनाय...",
    audioUrl: "/audio/koya_remedy.wav",
  },
  {
    rank: 8,
    id: "vr-108",
    title: "Bhootada Kola Spirit Invocation",
    teluguTitle: "భూత కోల పవిత్ర సంభాషణ",
    language: "Tulu",
    dialect: "Coastal Tulunadu",
    duration: "15:50",
    type: "Sacred Chant",
    community: "Paddana Chanters",
    excerpt: "ತುಳುನಾಡಿನ ಭೂತಾರಾಧನೆಯ ಸಂದರ್ಭದಲ್ಲಿ ಪಾಡುವ ಪುರಾತನ ಪಾಡ್ಡನಗಳು...",
    audioUrl: "/audio/harvest_song.wav",
  },
  {
    rank: 9,
    id: "vr-201",
    title: "Seed Storage in Mud Granaries",
    teluguTitle: "మట్టి గాదెలలో విత్తనాల భద్రత",
    language: "Telugu",
    dialect: "Rayalaseema Variety",
    duration: "09:12",
    type: "Farming Lore",
    community: "Dryland Farming Collective",
    excerpt: "పాతకాలం నాటి విత్తనాలను మట్టి గాదెలలో భద్రపరిచే విధానం...",
    audioUrl: "/audio/general_folk.wav",
  },
  {
    rank: 10,
    id: "vr-109",
    title: "Highland Barley Brewing Traditions",
    teluguTitle: "హిమాలయాల ప్రాచీన పానీయ విజ్ఞానం",
    language: "Ladakhi",
    dialect: "Leh Valley",
    duration: "08:10",
    type: "Traditional Knowledge",
    community: "Himalayan Village Guild",
    excerpt: "ལ་དྭགས་ཀྱི་སྲོལ་རྒྱུན་ནས་འབྲུ་ཆང་བཟོ་བའི་ལག་རྩལ།...",
    audioUrl: "/audio/harvest_song.wav",
  },
];

export function Top10HotstarRow() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = soundPlayer.subscribe((state) => {
      setActivePlayingId(state.isPlaying ? state.activeId : null);
    });
    return () => unsubscribe();
  }, []);

  const checkScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  const handlePlayToggle = async (item: Top10Item) => {
    await soundPlayer.toggle(item.id, item.audioUrl);
  };

  return (
    <div className="space-y-4 py-4 relative group/tray">
      {/* Header with Hotstar Style Tag */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-[#0063e5] shadow-[0_0_12px_#0063e5]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Top 10 Oral Masterworks in India Today</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#f5c518]/20 border border-[#f5c518]/40 text-[#f5c518] font-bold">
                JIOHOTSTAR RANKINGS
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 pl-3.5">
            The most listened, transcribed, and celebrated spoken heritage narratives this week.
          </p>
        </div>

        {/* Navigation Chevrons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-2 rounded-full bg-white/10 hover:bg-[#0063e5] text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-2 rounded-full bg-white/10 hover:bg-[#0063e5] text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Tray */}
      <div className="relative">
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-8 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-6 pt-2"
        >
          {TOP_10_ITEMS.map((item) => {
            const isPlaying = activePlayingId === item.id;
            return (
              <div
                key={item.id}
                className="flex items-end flex-shrink-0 group/card cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                {/* Giant JioHotstar Number Badge */}
                <div className="relative -mr-6 sm:-mr-8 z-10 select-none pointer-events-none">
                  <span
                    className="text-8xl sm:text-9xl font-black font-mono leading-none tracking-tighter"
                    style={{
                      WebkitTextStroke: "2px rgba(255, 255, 255, 0.4)",
                      color: "#0f1014",
                      textShadow: "0 0 20px rgba(0, 99, 229, 0.5)",
                    }}
                  >
                    {item.rank}
                  </span>
                </div>

                {/* Hotstar Card Body */}
                <div className="w-64 sm:w-72 h-80 rounded-2xl bg-[#16181f] border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden group-hover/card:border-[#0063e5] transition-all shadow-xl">
                  {/* Subtle Top Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0063e5]/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Content Top */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-[#0063e5]/20 border border-[#0063e5]/40 text-[#00d8f6] text-[10px] font-bold font-mono">
                        {item.language}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.duration}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover/card:text-[#00d8f6] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#f5c518] font-semibold line-clamp-1">
                      {item.teluguTitle}
                    </p>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  {/* Content Bottom / Action */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
                    <button
                      onClick={() => handlePlayToggle(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${
                        isPlaying
                          ? "bg-[#00d8f6] text-black shadow-[0_0_15px_#00d8f6] scale-105"
                          : "bg-white text-black hover:bg-[#0063e5] hover:text-white"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>{isPlaying ? "Playing" : "Play Lore"}</span>
                    </button>

                    <Link
                      href={`/recordings/${item.id}`}
                      className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
