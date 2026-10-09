"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, MapPin, Clock } from "lucide-react";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { GlassCard, GlassBadge, GlassButton } from "@/components/ui/glass";
import { StoryCardAudioButton } from "@/components/audio/StoryCardAudioButton";

export function FeaturedOralHeritage() {
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);

  useEffect(() => {
    setRecords(getUserRecordings());
  }, []);

  // Visual emoji glyphs for stories based on theme
  const getCoverIcon = (title: string, language: string) => {
    if (title.toLowerCase().includes("harvest") || title.toLowerCase().includes("paddy")) return "🌾";
    if (title.toLowerCase().includes("remedy") || title.toLowerCase().includes("forest")) return "🌿";
    if (title.toLowerCase().includes("legend") || title.toLowerCase().includes("ancestor")) return "🔥";
    if (title.toLowerCase().includes("river") || title.toLowerCase().includes("monsoon")) return "🌊";
    return "📜";
  };

  return (
    <section id="featured-heritage" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <GlassBadge variant="amber" icon={<Sparkles className="h-3.5 w-3.5" />}>
            Curated Oral Tradition Library
          </GlassBadge>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
            Featured Spoken Heritage
          </h2>
          <p className="mt-2 text-sm text-slate-300 sm:text-base max-w-2xl font-light">
            Genuine elder chants, folklore, and medicinal wisdom preserved directly in their native acoustic tongues.
          </p>
        </div>
        <Link href="/archive">
          <GlassButton
            variant="secondary"
            size="md"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Explore All Archives
          </GlassButton>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {records.slice(0, 6).map((record) => {
          const coverIcon = getCoverIcon(record.title, record.language);

          return (
            <GlassCard
              key={record.id}
              variant="interactive"
              className="group p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-4">
                {/* Cover & Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-white/[0.05] to-teal-500/20 border border-white/15 flex items-center justify-center text-2xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300">
                    {coverIcon}
                  </div>
                  <div className="flex items-center gap-2">
                    <GlassBadge variant="amber" size="sm">
                      {record.language}
                    </GlassBadge>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      {record.duration}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <Link href={`/story/${record.id}`}>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {record.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-2 font-light">
                    {record.culturalContext || "Sacred oral transmission preserved by community elders."}
                  </p>
                </div>
              </div>

              {/* Footer Metadata & Play Action */}
              <div className="space-y-4 border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <BookOpen className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                    <span className="truncate">{record.community || "Heritage Custodians"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 truncate text-slate-400">
                    <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="truncate">{record.location}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-1">
                  <StoryCardAudioButton record={record} />

                  <Link
                    href={`/story/${record.id}`}
                    className="min-h-[40px] inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] px-3.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                  >
                    <span>View Story</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
