"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  History
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

interface DatasetStatus {
  sourceName: string;
  datasetName: string;
  datasetYear: number;
  datasetVersion: string;
  sourceUrl: string;
  checksum: string;
  fileSizeBytes: number;
  lastCheckedAt: string;
  nextScheduledCheck: string;
  totalLanguages: number;
  scheduledLanguages: number;
  nonScheduledLanguages: number;
  motherTonguesCount: number;
  statesCount: number;
  status: string;
}

interface VersionItem {
  id: string;
  sourceName: string;
  datasetName: string;
  datasetYear: number;
  datasetVersion: string;
  checksum: string;
  importedAt: string;
  recordCount: number;
  status: string;
  changeSummary: string;
}

export default function AdminDataUpdatesPage() {
  const [data, setData] = useState<DatasetStatus | null>(null);
  const [history, setHistory] = useState<VersionItem[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/data-updates");
      const json = await res.json();
      if (json.success) {
        setData(json.currentDataset);
        setHistory(json.versionHistory || []);
      }
    } catch (e) {
      console.error("Failed to load admin data status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManualCheck = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      const res = await fetch("/api/admin/data-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check" }),
      });
      const json = await res.json();
      if (json.success) {
        setCheckResult(json.message);
        await fetchStatus();
      }
    } catch (e) {
      setCheckResult("Official update check failed: Network timeout or portal unreachable.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="vr-app pb-28">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-8 px-4 pt-10 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#A9AEC5]">
          <Link href="/dashboard" className="hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span>/</span>
          <span className="text-[#F9B17A]">Admin Official Data Updates</span>
        </div>

        {/* Header */}
        <header className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="eyebrow flex items-center gap-1 text-[#F9B17A]">
                <ShieldCheck className="h-4 w-4" /> AUTHORITATIVE DATA GOVERNANCE · 15-DAY AUTOMATED AUDIT
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mt-1">
                Official Language Data Updates
              </h1>
            </div>

            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#F9B17A] px-5 py-3 text-xs font-bold text-[#242942] shadow-lg transition hover:opacity-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? "Checking Census Portal..." : "Check for Official Updates Now"}
            </button>
          </div>
          <p className="max-w-3xl text-xs sm:text-sm text-[#D9D9E2] leading-relaxed">
            Voice Roots connects directly to official Registrar General & Census of India data catalogs. Every 15 days, the backend automatically audits the official repository for revised language datasets, validates checksums, computes differentials, and requires administrator approval before any reference update is committed.
          </p>
        </header>

        {checkResult && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{checkResult}</span>
          </div>
        )}

        {/* Current Dataset Overview Card */}
        {data && (
          <div className="rounded-3xl border border-white/10 bg-[rgba(66,71,108,0.3)] p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    STATUS: {data.status}
                  </span>
                  <span className="font-mono text-xs text-[#A9AEC5]">
                    Version: {data.datasetVersion}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">{data.datasetName}</h2>
                <p className="text-xs text-[#A9AEC5] mt-0.5">{data.sourceName}</p>
              </div>

              <div className="text-right font-mono text-xs text-[#A9AEC5]">
                <div>Last Audited: <span className="text-white">{new Date(data.lastCheckedAt).toLocaleDateString()}</span></div>
                <div className="text-[11px] text-[#F9B17A] mt-1">
                  Next Check: {new Date(data.nextScheduledCheck).toLocaleDateString()} (15-Day Cycle)
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl bg-black/20 p-4 text-center">
                <span className="block text-2xl font-black text-white">{data.totalLanguages}</span>
                <span className="text-[11px] text-[#A9AEC5] font-mono">Languages (Census C-16)</span>
              </div>
              <div className="rounded-2xl bg-black/20 p-4 text-center">
                <span className="block text-2xl font-black text-purple-400">{data.scheduledLanguages}</span>
                <span className="text-[11px] text-[#A9AEC5] font-mono">8th Schedule Languages</span>
              </div>
              <div className="rounded-2xl bg-black/20 p-4 text-center">
                <span className="block text-2xl font-black text-amber-400">{data.nonScheduledLanguages}</span>
                <span className="text-[11px] text-[#A9AEC5] font-mono">Non-Scheduled & Tribal</span>
              </div>
              <div className="rounded-2xl bg-black/20 p-4 text-center">
                <span className="block text-2xl font-black text-emerald-400">{data.motherTonguesCount}</span>
                <span className="text-[11px] text-[#A9AEC5] font-mono">Rationalized Mother Tongues</span>
              </div>
            </div>

            {/* Provenance & Cryptographic Integrity */}
            <div className="rounded-2xl border border-white/5 bg-black/30 p-4 font-mono text-xs text-[#D9D9E2] space-y-2">
              <div className="flex items-center justify-between text-[#A9AEC5]">
                <span>Dataset SHA-256 Checksum:</span>
                <span className="text-white truncate max-w-xs">{data.checksum}</span>
              </div>
              <div className="flex items-center justify-between text-[#A9AEC5]">
                <span>Raw Source File:</span>
                <span className="text-[#F9B17A]">backend/data/raw/DDW-C16-STMT-MDDS-0000.xlsx ({Math.round(data.fileSizeBytes / 1024)} KB)</span>
              </div>
              <div className="flex items-center justify-between text-[#A9AEC5]">
                <span>Official Download Portal:</span>
                <a 
                  href={data.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#F9B17A] hover:underline inline-flex items-center gap-1"
                >
                  censusindia.gov.in <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Version History Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#F9B17A]" />
            <h2 className="text-lg font-bold text-white">Immutable Dataset Version History</h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(66,71,108,0.2)]">
            <table className="w-full text-left text-xs text-[#D9D9E2]">
              <thead className="border-b border-white/10 bg-black/20 font-mono text-[11px] text-[#A9AEC5] uppercase">
                <tr>
                  <th className="p-4">Version ID</th>
                  <th className="p-4">Dataset</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Records</th>
                  <th className="p-4">Import Timestamp</th>
                  <th className="p-4">Change Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {history.map((ver) => (
                  <tr key={ver.id} className="hover:bg-white/5 transition">
                    <td className="p-4 font-bold text-white">{ver.datasetVersion}</td>
                    <td className="p-4 text-[#A9AEC5]">{ver.datasetName} ({ver.datasetYear})</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                        {ver.status}
                      </span>
                    </td>
                    <td className="p-4 text-white font-bold">{ver.recordCount.toLocaleString()}</td>
                    <td className="p-4 text-[#A9AEC5]">{new Date(ver.importedAt).toLocaleDateString()}</td>
                    <td className="p-4 text-xs font-sans text-[#D9D9E2]">{ver.changeSummary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Protection Guarantee Notice */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-xs text-amber-200/90 leading-relaxed space-y-2">
          <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
            <AlertTriangle className="h-4 w-4" /> Living Community Audio Protection Guarantee
          </div>
          <p>
            Official reference dataset updates modify the <em>linguistic catalogue layer only</em>. Under Voice Roots architectural isolation, official updates <strong>never overwrite</strong> living audio recordings, community self-identifications, elder transcripts, or community consent records. The original human voice remains the permanent, immutable source of truth.
          </p>
        </div>
      </main>
    </div>
  );
}
