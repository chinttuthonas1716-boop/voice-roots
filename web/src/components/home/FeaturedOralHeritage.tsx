"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, BookOpen, Mic, Play, Pause, Volume2, Sparkles } from "lucide-react";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

export function FeaturedOralHeritage() {
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRecords(getUserRecordings());
  }, []);

  const togglePlayAudio = (record: StoredVoiceRecord, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const audioSource = record.audioUrl || `/audio/${record.audioFileName}`;

    if (activeAudioId === record.id) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioSource);
      audioRef.current = audio;
      setActiveAudioId(record.id);
      setIsPlaying(true);

      audio.play().catch((err) => {
        console.warn("Audio playback error:", err);
        setIsPlaying(false);
      });

      audio.onended = () => {
        setIsPlaying(false);
        setActiveAudioId(null);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <section id="featured-heritage" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-root-green/30 bg-root-green/10 px-3 py-1 text-xs font-medium text-leaf-green">
            <Sparkles className="h-3.5 w-3.5" /> Curated Oral Archives
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Featured Oral Heritage
          </h2>
          <p className="mt-1 text-sm text-secondary-text sm:text-base">
            Listen to genuine spoken accounts, indigenous folk chants, and oral traditions preserved in their native tongues.
          </p>
        </div>
        <Link
          href="/archive"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm font-semibold text-leaf-green transition hover:border-root-green/40 hover:bg-root-green/10"
        >
          Explore All Archives <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {records.slice(0, 6).map((record) => {
          const isCurrentActive = activeAudioId === record.id;
          const isCurrentlyPlaying = isCurrentActive && isPlaying;

          return (
            <div
              key={record.id}
              className="glass-card group relative flex min-h-[290px] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-root-green/40 hover:bg-white/[0.06] hover:shadow-2xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full border border-root-green/30 bg-root-green/15 px-3 py-1 font-medium text-leaf-green">
                    {record.language}
                  </span>
                  <span className="font-mono text-secondary-text">
                    {record.duration}
                  </span>
                </div>

                <div>
                  <Link href={`/recordings/${record.id}`}>
                    <h3 className="line-clamp-2 text-lg font-bold text-white transition group-hover:text-leaf-green">
                      {record.title}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-secondary-text">
                    {record.culturalContext || "Sacred oral transmission preserved by community elders."}
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-xs text-secondary-text">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <BookOpen className="h-3.5 w-3.5 text-leaf-green shrink-0" />
                    <span className="truncate">{record.community || "Heritage Custodians"}</span>
                  </span>
                  <span className="truncate text-[11px] text-white/50">{record.location}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => togglePlayAudio(record, e)}
                    className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition ${
                      isCurrentlyPlaying
                        ? "bg-leaf-green text-obsidian shadow-glow"
                        : "bg-root-green/20 text-leaf-green hover:bg-root-green/30 border border-root-green/30"
                    }`}
                  >
                    {isCurrentlyPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-current" />
                        <span>Playing Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Listen to Original Recording</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/recordings/${record.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/15 px-3 text-xs font-medium text-white transition hover:bg-white/10"
                    title="View transcript, translation, and cultural context"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
