"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, Pause, Printer, ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/ui/Navbar";
import { getUserRecordings, type StoredVoiceRecord } from "@/lib/storage";

export default function HeritagePassportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [record, setRecord] = useState<StoredVoiceRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    const all = getUserRecordings();
    const found = all.find((item) => item.id.toLowerCase() === id.toLowerCase());
    if (found) {
      setRecord(found);
    }

    // Also verify against server passport endpoint for remote/withdrawn state
    fetch(`/api/v1/passport/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.is_withdrawn) {
          setRecord((prev) => ({
            ...(prev || {
              id: data.id ? String(data.id) : id,
              title: data.title || "Voice Roots Recording",
              language: data.language || "Indigenous Tongue",
              duration: "0:00",
              durationSeconds: 0,
              type: "Oral Archive",
              audioFileName: "",
              audioFileSize: 0,
              audioMimeType: "audio/wav",
              uploadDate: data.upload_date || new Date().toISOString(),
              sourceType: "field_recording",
              originalTranscript: "[Consent Withdrawn]",
            }),
            isWithdrawn: true,
            status: "withdrawn",
            withdrawnAt: data.withdrawn_at,
          }));
        } else if (data && !found) {
          setRecord({
            id: String(data.id),
            title: data.title,
            language: data.language,
            dialect: data.dialect,
            community: data.community,
            duration: "0:00",
            durationSeconds: 0,
            type: "Oral Archive",
            audioFileName: "",
            audioFileSize: 0,
            audioMimeType: "audio/wav",
            uploadDate: data.upload_date,
            sourceType: "field_recording",
            originalTranscript: "",
            isWithdrawn: false,
            status: data.status,
          });
        }
      })
      .catch(() => {});
  }, [id]);

  const togglePlay = () => {
    if (!record || record.isWithdrawn || record.status === "withdrawn") return;
    const src = record.audioUrl || `/audio/${record.audioFileName}`;

    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!record) {
    return (
      <div className="min-h-screen pb-24 pt-20">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-16 text-center space-y-4">
          <p className="text-base text-[#94A3B8]">Loading passport details...</p>
          <Link href="/dashboard" className="btn-glass">
            Back to My recordings
          </Link>
        </main>
      </div>
    );
  }

  const isWithdrawn = Boolean(record.isWithdrawn || record.status === "withdrawn" || record.status === "Consent Withdrawn");

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    typeof window !== "undefined" ? window.location.href : `https://voice-roots.onrender.com/passport/${record.id}`
  )}`;

  const formatDate = (isoString?: string): string => {
    if (!isoString) return "October 2026";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return "October 2026";
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-20 print:p-0 print:m-0 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="mx-auto max-w-xl px-4 py-8 space-y-6">
        {/* Back Link & Print Button */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to recordings</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-[#F8FAFC] hover:bg-white/10 transition"
          >
            <Printer className="h-4 w-4 text-[#F59E0B]" />
            <span>Print passport</span>
          </button>
        </div>

        {/* The One Heritage Passport Glass Card */}
        <div className="glass-card p-6 sm:p-8 space-y-6 print:border-black print:bg-white print:p-6 print:text-black print:shadow-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-4 print:border-black">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-base">
                🌱
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] print:text-black">
                  Voice Roots
                </p>
                <h1 className="text-xl font-bold text-[#F8FAFC] print:text-black">
                  Heritage Passport
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isWithdrawn && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Withdrawn
                </span>
              )}
              <span className="text-xs font-mono font-bold text-[#94A3B8] print:text-black">
                {String(record.id).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Withdrawn Notice Banner */}
          {isWithdrawn && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200 space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-rose-200">
                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Recording Purged under Indigenous Data Sovereignty</span>
              </div>
              <p className="text-rose-300/90">
                The speaker or community has exercised their inalienable right to withdraw consent.
                Under OCAP protocols, the audio master recording, machine transcripts, translations,
                and vector embeddings have been permanently purged from all storage and indexes.
              </p>
              {record.withdrawnAt && (
                <p className="font-mono text-[11px] text-rose-400">
                  Withdrawal timestamp: {formatDate(record.withdrawnAt)}
                </p>
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-[#94A3B8] print:text-gray-600">Story Title</p>
              <h2 className="text-lg font-bold text-[#F8FAFC] print:text-black mt-0.5">
                {record.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[#94A3B8] print:text-gray-600">Speaker / Community</p>
                <p className="text-base font-semibold text-[#F8FAFC] print:text-black mt-0.5">
                  {record.community || "Heritage Custodians"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-[#94A3B8] print:text-gray-600">Spoken Language</p>
                <p className="text-base font-semibold text-[#F8FAFC] print:text-black mt-0.5">
                  {record.language} {record.dialect ? `(${record.dialect})` : ""}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-[#94A3B8] print:text-gray-600">Recording Date</p>
                <p className="text-base font-semibold text-[#F8FAFC] print:text-black mt-0.5">
                  {formatDate(record.uploadDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-[#94A3B8] print:text-gray-600">Verification Status</p>
                {isWithdrawn ? (
                  <div className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-300 print:text-black print:border-black">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400 print:text-black" />
                    <span>Consent Withdrawn (OCAP)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-300 print:text-black print:border-black">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 print:text-black" />
                    <span>{record.isUserUploaded ? "Waiting for review" : "Community Verified"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audio Play Button or Purged Status */}
          <div className="pt-2 print:hidden">
            {isWithdrawn ? (
              <button
                type="button"
                disabled
                className="btn-glass w-full opacity-60 cursor-not-allowed text-rose-300 border-rose-500/30"
              >
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span>Master Audio Permanently Purged</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={togglePlay}
                className="btn-primary w-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                <span>{isPlaying ? "Pause voice recording" : "Listen to original voice recording"}</span>
              </button>
            )}
          </div>

          {/* QR Code Section */}
          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 print:border-black">
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC] print:text-black">
                {isWithdrawn ? "Public Provenance Record" : "Scan to verify and listen"}
              </p>
              <p className="text-xs text-[#94A3B8] print:text-gray-600 mt-0.5">
                {isWithdrawn
                  ? "Verifiable proof of consent withdrawal and data purging"
                  : "Public digital record of oral heritage"}
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white border border-white/20 print:border-black shrink-0">
              <Image
                src={qrUrl}
                alt={`QR Code for story ${record.id}`}
                width={120}
                height={120}
                className="w-28 h-28"
                unoptimized
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
