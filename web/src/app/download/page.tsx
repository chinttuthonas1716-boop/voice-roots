"use client";

import Link from "next/link";
import { Download, CheckCircle2, ShieldCheck, FileArchive, Terminal, ExternalLink, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#071A13] text-[#F5F3E9] pb-24 pt-20">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F5138]/60 border border-[#A6C48A]/30 text-xs font-semibold text-[#A6C48A]">
            <FileArchive className="h-3.5 w-3.5" />
            <span>Official Source Distribution Package · v2.0.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F3E9]">
            Download Voice Roots Source Archive
          </h1>
          <p className="text-sm sm:text-base text-[#DCE9D7]/80 max-w-2xl mx-auto leading-relaxed">
            Download the complete, audited production distribution package including the FastAPI backend, Next.js 14 frontend, dynamic language registry, and Multilingual Translation Engine.
          </p>
        </div>

        {/* Primary Download Card */}
        <div className="rounded-3xl border border-[#A6C48A]/30 bg-[#102B20]/90 backdrop-blur-xl p-8 sm:p-10 space-y-6 shadow-2xl shadow-black/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#A6C48A]/15">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#F5F3E9] flex items-center gap-2">
                <span>voice-roots-v2.0-audited-source.zip</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Production Release
                </span>
              </h2>
              <p className="text-xs text-[#DCE9D7]/70">
                134 MB · 4,525 audited files · Zero secrets · Zero private database binaries
              </p>
            </div>

            <a
              href="/voice-roots-v2.0-audited-source.zip"
              download="voice-roots-v2.0-audited-source.zip"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold bg-[#A6C48A] text-[#071A13] hover:bg-[#DCE9D7] transition flex items-center justify-center gap-2.5 shadow-lg shadow-[#A6C48A]/20"
            >
              <Download className="h-5 w-5" />
              <span>Download ZIP Archive</span>
            </a>
          </div>

          {/* Verification Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#071A13]/80 border border-[#A6C48A]/15 space-y-1.5">
              <p className="font-semibold text-[#A6C48A] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Audited & Verified</span>
              </p>
              <p className="text-[#DCE9D7]/70 leading-relaxed">
                434 passing backend pytest tests + 33 Playwright E2E browser tests verified.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#071A13]/80 border border-[#A6C48A]/15 space-y-1.5">
              <p className="font-semibold text-[#A6C48A] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#A6C48A]" />
                <span>OCAP® Sovereignty</span>
              </p>
              <p className="text-[#DCE9D7]/70 leading-relaxed">
                Indigenous Data Sovereignty protocol compliance with elder review barriers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#071A13]/80 border border-[#A6C48A]/15 space-y-1.5">
              <p className="font-semibold text-[#A6C48A] flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-[#A6C48A]" />
                <span>Local Quickstart</span>
              </p>
              <p className="text-[#DCE9D7]/70 leading-relaxed">
                Pre-configured for local dual-server development (FastAPI :8000 + Next.js :3000).
              </p>
            </div>
          </div>

          {/* Quickstart Instructions */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-[#F5F3E9] uppercase tracking-wider">
              Quickstart Deployment Commands
            </h3>
            <div className="rounded-2xl bg-[#071A13] p-4 font-mono text-xs text-[#A6C48A] space-y-2 border border-[#A6C48A]/20 overflow-x-auto">
              <p className="text-[#DCE9D7]/50"># 1. Extract archive</p>
              <p className="text-[#F5F3E9]">unzip voice-roots-v2.0-audited-source.zip -d voice-roots && cd voice-roots</p>
              <p className="text-[#DCE9D7]/50"># 2. Start FastAPI Backend (Port 8000)</p>
              <p className="text-[#F5F3E9]">python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000</p>
              <p className="text-[#DCE9D7]/50"># 3. Start Next.js Frontend (Port 3000)</p>
              <p className="text-[#F5F3E9]">API_BASE_URL=http://localhost:8000 npm run start --prefix web</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#A6C48A]/15 text-xs text-[#A6C48A]">
            <Link href="/translate" className="hover:text-[#DCE9D7] flex items-center gap-1">
              <span>Try Multilingual Translator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/docs" className="hover:text-[#DCE9D7] flex items-center gap-1">
              <span>View Interactive Swagger API Docs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://github.com/chinttuthonas1716-boop/voice-roots"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#DCE9D7] flex items-center gap-1"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
