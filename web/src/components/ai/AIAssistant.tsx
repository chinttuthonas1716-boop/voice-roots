"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, Search, Sparkles, X, BookOpen, Layers } from "lucide-react";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";
import { useAppLanguage } from "@/lib/languageContext";
import { GlassAIButton, GlassBadge, GlassButton } from "@/components/ui/glass";

type Match = { record: StoredVoiceRecord; excerpt: string };

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const { appLanguage } = useAppLanguage();
  const localeName = useMemo(
    () =>
      ({
        en: "English",
        te: "తెలుగు",
        hi: "हिन्दी",
        ta: "தமிழ்",
        kn: "ಕನ್ನಡ",
        ml: "മലയാളം",
      }[appLanguage] || "English"),
    [appLanguage]
  );

  const searchArchive = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    const found = getUserRecordings()
      .flatMap((record) => {
        const haystack = [
          record.title,
          record.language,
          record.dialect,
          record.community,
          record.location,
          record.originalTranscript,
          record.culturalContext,
          ...Object.values(record.translations || {}),
        ]
          .filter(Boolean)
          .join(" ");
        const normalized = haystack.toLocaleLowerCase();
        if (!words.some((word) => normalized.includes(word))) return [];
        const selectedTranslation = record.translations?.[appLanguage];
        return [
          {
            record,
            excerpt:
              selectedTranslation ||
              record.originalTranscript ||
              record.culturalContext ||
              record.title,
          },
        ];
      })
      .slice(0, 5);
    setMatches(found);
  };

  return (
    <>
      {!isOpen && <GlassAIButton onClick={() => setIsOpen(true)} />}

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm sm:hidden"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-title"
            className="fixed inset-x-3 bottom-20 sm:bottom-8 sm:right-8 sm:inset-auto z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900/90 shadow-[0_24px_64px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:h-[min(620px,calc(100vh-4rem))] sm:w-[min(440px,calc(100vw-2rem))] animate-in zoom-in-95 duration-200"
          >
            {/* Specular sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

            {/* Header */}
            <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600/30 to-teal-500/20 border border-violet-400/30 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="assistant-title"
                    className="text-sm font-bold text-white tracking-tight"
                  >
                    Voice Roots Cultural AI
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[11px] text-slate-400">
                      Context Language: {localeName}
                    </p>
                  </div>
                </div>
              </div>
              <GlassButton
                variant="icon"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-lg"
              >
                <X className="w-4 h-4 text-slate-400" />
              </GlassButton>
            </header>

            {/* Conversation / Search Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-slate-300 space-y-2">
                <p className="font-medium text-slate-200">
                  Welcome! Ask about any recorded story, elder chant, or cultural context.
                </p>
                <p className="text-slate-400">
                  This engine semantically queries genuine transcripts and community metadata on this device with strict OCAP privacy.
                </p>
              </div>

              {matches &&
                (matches.length ? (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                      Archival Matches ({matches.length})
                    </p>
                    {matches.map(({ record, excerpt }) => (
                      <Link
                        key={record.id}
                        href={`/recordings/${record.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block rounded-2xl border border-amber-500/20 bg-white/[0.03] hover:bg-white/[0.07] p-3.5 transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                            {record.title}
                          </span>
                          <GlassBadge variant="amber" size="sm">
                            {record.language}
                          </GlassBadge>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          "{excerpt}"
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                          Open Story Record →
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 p-4 text-xs text-slate-400 text-center">
                    No matching narrative found. Try searching for "harvest", "forest", or a language name.
                  </div>
                ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={searchArchive}
              className="flex items-center gap-2 border-t border-white/10 bg-white/[0.02] p-3.5"
            >
              <input
                id="archive-question"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask or search oral stories…"
                className="h-11 flex-1 rounded-xl border border-white/12 bg-white/[0.05] px-4 text-xs text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60 transition-colors"
              />
              <GlassButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={!query.trim()}
                aria-label="Submit search"
                className="h-11 px-4"
              >
                <Search className="w-4 h-4" />
              </GlassButton>
            </form>
          </section>
        </>
      )}
    </>
  );
}
