"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Music, Volume2, Sparkles } from "lucide-react";
import { soundPlayer } from "@/lib/soundPlayer";

export interface FolkSongCard {
  id: string;
  title: string;
  teluguTitle: string;
  language: string;
  region: string;
  duration: string;
  community: string;
  ritualContext: string;
  audioUrl: string;
  colorScheme: string;
}

const FOLK_SONGS: FolkSongCard[] = [
  {
    id: "vr-101",
    title: "Monsoon Earth Worship Song",
    teluguTitle: "వరి పంట సంప్రదాయ పాట (భూమి పూజ)",
    language: "Telugu (Agency)",
    region: "Northern Coastal Agency",
    duration: "08:42",
    community: "Agency Hill Clans",
    ritualContext: "Sung prior to early monsoon seed sowing to invoke soil fertility",
    audioUrl: "/audio/harvest_song.wav",
    colorScheme: "from-blue-600/30 to-cyan-500/10",
  },
  {
    id: "vr-102",
    title: "Mountain Rain Deity Chant",
    teluguTitle: "పర్వత శిఖర వర్ష దేవ ప్రార్థన",
    language: "Gondi",
    region: "Bastar & Mandla Plateau",
    duration: "14:15",
    community: "Pardhan Community",
    ritualContext: "Clan gathering chant invoked atop hills to alleviate village drought",
    audioUrl: "/audio/gondi_legend.wav",
    colorScheme: "from-purple-600/30 to-pink-500/10",
  },
  {
    id: "vr-103",
    title: "Forest Healers Root Song",
    teluguTitle: "అడవి పసరు మందుల కోయ గీతం",
    language: "Koya",
    region: "Godavari River Valley",
    duration: "06:30",
    community: "Forest Dwellers Collective",
    ritualContext: "Sung during the sacred gathering of medicinal neem and turmeric roots",
    audioUrl: "/audio/koya_remedy.wav",
    colorScheme: "from-emerald-600/30 to-teal-500/10",
  },
  {
    id: "vr-107",
    title: "Paddofield Planting Rhythms (Bwisagu)",
    teluguTitle: "బోడో వసంత నాట్ల పాట (బైసాగు)",
    language: "Bodo",
    region: "Western Bodoland",
    duration: "07:25",
    community: "Kokrajhar Cultivators",
    ritualContext: "Choral call-and-response rhythm during pre-monsoon transplantation",
    audioUrl: "/audio/koya_remedy.wav",
    colorScheme: "from-amber-600/30 to-orange-500/10",
  },
  {
    id: "vr-108",
    title: "Bhootada Kola Spirit Invocation",
    teluguTitle: "తుళునాడు భూత కోల సంప్రదాయ పాడ్డన",
    language: "Tulu",
    region: "Coastal Tulunadu",
    duration: "15:50",
    community: "Paddana Chanters",
    ritualContext: "Paddana epic sung to evoke regional protector deities of groves",
    audioUrl: "/audio/harvest_song.wav",
    colorScheme: "from-red-600/30 to-rose-500/10",
  },
  {
    id: "vr-110",
    title: "Nomadic Caravan Twilight Ballad",
    teluguTitle: "బంజారా సంధ్యా సమయ తాండా పాట",
    language: "Lambadi",
    region: "Deccan Highlands",
    duration: "10:30",
    community: "Banjara Tanda Elders",
    ritualContext: "Evening campfire ballad sung while tending cattle on nomadic trails",
    audioUrl: "/audio/general_folk.wav",
    colorScheme: "from-yellow-600/30 to-amber-500/10",
  },
];

export function FolkSongsSliderRow() {
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

  const handlePlay = async (song: FolkSongCard) => {
    await soundPlayer.toggle(song.id, song.audioUrl);
  };

  return (
    <div className="space-y-4 py-4 relative group/tray">
      {/* Header */}
      <div className="flex items-end justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-[#00d8f6] shadow-[0_0_12px_#00d8f6]" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Oral Folk Songs & Sacred Chants (పవిత్ర గీతాలు)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#0063e5]/20 border border-[#0063e5]/40 text-[#00d8f6] font-bold">
                LOSSLESS AUDIO
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 pl-3.5">
            Click &ldquo;Play Song&rdquo; on any card to stream genuine heirloom acoustic recordings directly through your speakers.
          </p>
        </div>

        {/* Scroll Chevrons */}
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

      {/* Sliding Cards Tray */}
      <div className="relative">
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-5 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-6 pt-2"
        >
          {FOLK_SONGS.map((song) => {
            const isPlaying = activePlayingId === song.id;
            return (
              <div
                key={song.id}
                className="w-72 sm:w-80 flex-shrink-0 rounded-2xl bg-[#16181f] border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#00d8f6] transition-all duration-300 hover:scale-105 shadow-xl cursor-pointer"
              >
                {/* Background Atmosphere */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${song.colorScheme} opacity-40 pointer-events-none group-hover:opacity-70 transition-opacity`}
                />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-white text-[10px] font-bold font-mono">
                      {song.language}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                      {song.duration}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#00d8f6] transition-colors line-clamp-1">
                      {song.title}
                    </h3>
                    <p className="text-xs text-[#f5c518] font-bold mt-0.5 line-clamp-1">
                      {song.teluguTitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {song.ritualContext}
                  </p>

                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Community: </span>
                    <span className="text-slate-200">{song.community}</span>
                  </div>
                </div>

                {/* Animated Equalizer Waveform while playing */}
                <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between relative z-10">
                  <button
                    onClick={() => handlePlay(song)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-lg ${
                      isPlaying
                        ? "bg-[#00d8f6] text-black shadow-[0_0_20px_#00d8f6] scale-105"
                        : "bg-gradient-to-r from-[#0063e5] to-[#00d8f6] text-white hover:brightness-110"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span>{isPlaying ? "Pause Song" : "Play Song"}</span>
                  </button>

                  {/* Equalizer animation */}
                  <div className="flex items-center gap-1 h-5">
                    {[40, 75, 90, 50, 85].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying ? "bg-[#00d8f6] animate-pulse" : "bg-white/20"
                        }`}
                        style={{ height: isPlaying ? `${h}%` : "30%" }}
                      />
                    ))}
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
