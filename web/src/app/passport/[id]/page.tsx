"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Play, Pause, Printer, ArrowLeft, ShieldCheck } from "lucide-react";
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
    const found = all.find((item) => item.id.toLowerCase() === id.toLowerCase()) || all[0];
    if (found) {
      setRecord(found);
    }
  }, [id]);

  const togglePlay = () => {
    if (!record) return;
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

            <span className="text-xs font-mono font-bold text-[#94A3B8] print:text-black">
              {record.id.toUpperCase()}
            </span>
          </div>

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
                <div className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-300 print:text-black print:border-black">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 print:text-black" />
                  <span>{record.isUserUploaded ? "Waiting for review" : "Community Verified"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Play Button */}
          <div className="pt-2 print:hidden">
            <button
              type="button"
              onClick={togglePlay}
              className="btn-primary w-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              <span>{isPlaying ? "Pause voice recording" : "Listen to original voice recording"}</span>
            </button>
          </div>

          {/* QR Code Section */}
          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 print:border-black">
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC] print:text-black">
                Scan to verify and listen
              </p>
              <p className="text-xs text-[#94A3B8] print:text-gray-600 mt-0.5">
                Public digital record of oral heritage
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
