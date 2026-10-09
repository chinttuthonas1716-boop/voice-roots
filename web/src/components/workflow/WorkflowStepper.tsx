"use client";

import React from "react";
import Link from "next/link";
import { Check, Mic, Cpu, FileText, Languages, BookOpen, ShieldCheck, Award, Sparkles } from "lucide-react";
import { WORKFLOW_PHASES, isStateReached, type WorkflowStatus } from "@/lib/workflow";

interface WorkflowStepperProps {
  currentPhaseNumber: number;
  currentStatus: WorkflowStatus;
  storyId: string;
}

const PHASE_ICONS = [
  Mic,
  Cpu,
  FileText,
  Languages,
  BookOpen,
  ShieldCheck,
  Award,
  Sparkles,
];

export function WorkflowStepper({
  currentPhaseNumber,
  currentStatus,
  storyId,
}: WorkflowStepperProps) {
  return (
    <div className="w-full mb-8">
      {/* Mobile Header summary */}
      <div className="md:hidden flex items-center justify-between px-3 py-2.5 rounded-2xl border border-white/10 bg-[#242942]/80 backdrop-blur-md mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F9B17A] text-[11px] font-black text-[#242942]">
            {currentPhaseNumber}
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {WORKFLOW_PHASES[currentPhaseNumber - 1]?.label || "Workflow"}
          </span>
        </div>
        <span className="text-[11px] text-[#A9AEC5] font-medium">
          Step {currentPhaseNumber} of {WORKFLOW_PHASES.length}
        </span>
      </div>

      {/* Desktop & Tablet Progress Bar */}
      <nav aria-label="Preservation Progress" className="hidden md:block">
        <ol className="grid grid-cols-8 gap-2 p-3 rounded-2xl border border-white/10 bg-[#242942]/80 backdrop-blur-md">
          {WORKFLOW_PHASES.map((phase, idx) => {
            const Icon = PHASE_ICONS[idx] || Sparkles;
            const isCompleted = isStateReached(currentStatus, phase.requiredState) && currentPhaseNumber > phase.phaseNumber;
            const isCurrent = currentPhaseNumber === phase.phaseNumber;
            const isUpcoming = !isCompleted && !isCurrent;

            return (
              <li key={phase.key} className="relative">
                <div
                  className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${
                    isCurrent
                      ? "bg-[#F9B17A]/15 border border-[#F9B17A]/40 text-[#F9B17A]"
                      : isCompleted
                      ? "text-[#D9D9E2] opacity-90"
                      : "text-[#6F76A0] opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full mb-1 text-xs font-bold ${
                      isCurrent
                        ? "bg-[#F9B17A] text-[#242942] shadow-sm"
                        : isCompleted
                        ? "bg-white/10 border border-white/20 text-[#F9B17A]"
                        : "bg-white/5 text-[#6F76A0]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : (
                      <span>{phase.phaseNumber}</span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
                    {phase.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

