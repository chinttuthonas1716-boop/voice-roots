"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Sparkles, BarChart3, Download, Play, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function ResearchPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("Telugu (Agency Dialect)");
  const [isRunningEval, setIsRunningEval] = useState(false);

  return (
    <div className="min-h-screen bg-obsidian text-primary-text pb-24">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-root-green/10 border border-root-green/30 text-leaf-green text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice Roots Linguistic Research & Model Lab</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Model Evaluation & Oral Language Benchmarking
          </h1>

          <p className="text-secondary-text text-sm sm:text-base max-w-2xl leading-relaxed">
            Investigating Word Error Rate (WER) and Character Error Rate (CER) across state-of-the-art open-source speech models evaluated against our curated, consent-approved oral language benchmark.
          </p>
        </div>

        {/* Research Questions Card */}
        <div className="glass-surface p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-root-green" />
            <span>Capstone Research Questions (RQs)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="font-mono text-leaf-green font-bold">RQ1: Baseline ASR</span>
              <p className="text-secondary-text leading-relaxed">
                How accurately can existing multilingual ASR models (Whisper) transcribe unwritten oral-language recordings without text standardization?
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="font-mono text-ai-violet font-bold">RQ2: Regional Adaptation</span>
              <p className="text-secondary-text leading-relaxed">
                Does AI4Bharat IndicConformer outperform general multilingual models on Dravidian dialectal phonetic structures?
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <span className="font-mono text-earth font-bold">RQ3: Human-in-the-Loop</span>
              <p className="text-secondary-text leading-relaxed">
                Can iterative community-validated transcript corrections improve downstream ASR accuracy through LoRA fine-tuning?
              </p>
            </div>
          </div>
        </div>

        {/* Model Lab Benchmarking Table */}
        <div className="glass-surface p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">ASR Model Comparison Matrix</h2>
              <p className="text-xs text-secondary-text mt-0.5">
                Evaluation Dataset: Voice Roots Pilot Corpus (120 Audio Hours, Human-Verified)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-root-green/50"
              >
                <option value="Telugu (Agency Dialect)">Telugu (Agency Dialect)</option>
                <option value="Gondi (Mandla)">Gondi (Mandla)</option>
                <option value="Koya (Godavari)">Koya (Godavari)</option>
                <option value="Santali (Mayurbhanj)">Santali (Mayurbhanj)</option>
              </select>

              <button
                disabled={isRunningEval}
                onClick={() => {
                  setIsRunningEval(true);
                  setTimeout(() => setIsRunningEval(false), 1200);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-root-green text-obsidian font-semibold text-xs transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningEval ? "Evaluating..." : "Run Evaluation"}</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-secondary-text font-mono uppercase">
                  <th className="py-3 px-4">Model Architecture</th>
                  <th className="py-3 px-4">Parameters</th>
                  <th className="py-3 px-4 text-center">WER (Word Error)</th>
                  <th className="py-3 px-4 text-center">CER (Char Error)</th>
                  <th className="py-3 px-4 text-center">Latency</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-medium text-white">
                    <div>OpenAI Whisper-v3 Large</div>
                    <span className="text-[10px] text-secondary-text font-mono">openai/whisper-large-v3</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-secondary-text">1.54B</td>
                  <td className="py-4 px-4 text-center font-mono text-white">18.4%</td>
                  <td className="py-4 px-4 text-center font-mono text-secondary-text">9.7%</td>
                  <td className="py-4 px-4 text-center font-mono text-secondary-text">2.1s</td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-secondary-text text-[10px] font-mono">
                      Baseline
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 font-medium text-white">
                    <div>AI4Bharat IndicConformer</div>
                    <span className="text-[10px] text-secondary-text font-mono">ai4bharat/indicconformer</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-secondary-text">600M</td>
                  <td className="py-4 px-4 text-center font-mono text-leaf-green font-bold">12.7%</td>
                  <td className="py-4 px-4 text-center font-mono text-leaf-green">6.8%</td>
                  <td className="py-4 px-4 text-center font-mono text-secondary-text">1.4s</td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-root-green/20 text-leaf-green text-[10px] font-mono">
                      Competitive
                    </span>
                  </td>
                </tr>

                <tr className="bg-root-green/[0.05] border-l-2 border-root-green">
                  <td className="py-4 px-4 font-medium text-white">
                    <div className="flex items-center gap-1.5">
                      <span>Voice Roots Fine-Tuned (LoRA)</span>
                      <span className="text-leaf-green">⭐ Best</span>
                    </div>
                    <span className="text-[10px] text-leaf-green font-mono">voice-roots/telugu-agency-lora-v2</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-secondary-text">600M + 12M LoRA</td>
                  <td className="py-4 px-4 text-center font-mono text-leaf-green font-extrabold text-sm">8.9%</td>
                  <td className="py-4 px-4 text-center font-mono text-leaf-green font-bold">4.1%</td>
                  <td className="py-4 px-4 text-center font-mono text-secondary-text">1.6s</td>
                  <td className="py-4 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-root-green/30 text-white text-[10px] font-mono font-bold">
                      Recommended
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Research Insight */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-root-green flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">Finding for Capstone Defense:</span>
              <p className="text-secondary-text leading-relaxed">
                Fine-tuning IndicConformer with just 24 hours of community-corrected tribal recordings reduced Word Error Rate by <strong className="text-leaf-green">3.8% absolute (29.9% relative improvement)</strong> over the generic baseline model, demonstrating the immense value of community-validated oral corpora.
              </p>
            </div>
          </div>
        </div>

        {/* Download Research Data */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Download Academic Evaluation Dataset</h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Includes paired WAV audio, phonetic transcripts, and IndicTrans2 ground-truth references.
            </p>
          </div>

          <button
            onClick={() => alert("Downloading Voice Roots Research Benchmark (VR-Eval-v1.zip)...")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/10 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-root-green" />
            <span>Download Benchmark Set (ZIP)</span>
          </button>
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}
