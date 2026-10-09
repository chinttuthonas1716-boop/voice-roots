"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Lock, Home, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { WorkflowStepper } from "@/components/workflow/WorkflowStepper";
import { getCurrentUser, type UserProfile } from "@/lib/auth";
import {
  canAccessRoute,
  getWorkflow,
  getNextValidRoute,
  type PreservationWorkflow,
  type WorkflowStatus,
} from "@/lib/workflow";

interface WorkflowGuardProps {
  route: string;
  storyId: string;
  currentPhaseNumber: number;
  children: (workflow: PreservationWorkflow, user: UserProfile) => React.ReactNode;
}

export function WorkflowGuard({
  route,
  storyId,
  currentPhaseNumber,
  children,
}: WorkflowGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workflow, setWorkflow] = useState<PreservationWorkflow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const activeUser = getCurrentUser();
    setUser(activeUser);

    const activeWorkflow = getWorkflow(storyId);
    setWorkflow(activeWorkflow);

    setIsLoaded(true);
  }, [storyId, route]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#2D3250] flex items-center justify-center text-white">
        <div className="animate-pulse text-sm text-[#A9AEC5]">Validating workflow state…</div>
      </div>
    );
  }

  // 1. Authentication Check
  if (!user) {
    return (
      <div className="min-h-screen bg-[#2D3250] text-white selection:bg-[#F9B17A] selection:text-[#242942]">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 pt-32 pb-20 text-center">
          <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-8 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A]">
              <Lock className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Authentication Required
            </h1>
            <p className="text-sm text-[#A9AEC5] mb-6 leading-relaxed">
              Preserving and verifying indigenous oral traditions requires an authenticated community or custodian account to ensure data sovereignty.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="vr-button vr-button-primary !py-3 !px-6 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Sign In to Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-[#D9D9E2] hover:bg-white/10 transition"
              >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </Link>
            </div>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  // 2. Route Access Check
  const accessCheck = canAccessRoute(route, storyId, user);

  if (!accessCheck.allowed || !workflow) {
    return (
      <div className="min-h-screen bg-[#2D3250] text-white selection:bg-[#F9B17A] selection:text-[#242942]">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 pt-32 pb-20 text-center">
          <div className="rounded-3xl border border-[#F9B17A]/30 bg-[#242942]/95 p-8 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#F9B17A]/10 blur-3xl pointer-events-none" />

            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#F9B17A]/15 border border-[#F9B17A]/30 text-[#F9B17A]">
              <AlertCircle className="h-8 w-8 stroke-[2.2]" />
            </div>

            <span className="inline-block rounded-full bg-[#F9B17A]/20 border border-[#F9B17A]/30 px-3 py-1 text-xs font-bold text-[#F9B17A] mb-3 uppercase tracking-wider">
              Step Prerequisite Incomplete
            </span>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              You&apos;re not ready for this step yet
            </h1>

            <p className="text-sm text-[#D9D9E2] mb-6 leading-relaxed">
              {accessCheck.reason || "Please complete the required previous workflow stages before continuing."}
            </p>

            {workflow && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="text-xs text-[#A9AEC5] mb-1">Current Story Record</div>
                <div className="text-sm font-bold text-white mb-2">{workflow.title || storyId}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#A9AEC5]">Status:</span>
                  <span className="font-mono bg-[#42476C] px-2 py-0.5 rounded text-[#F9B17A] font-semibold text-[11px]">
                    {workflow.status}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={accessCheck.redirectUrl}
                className="vr-button vr-button-primary !py-3 !px-6 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#F9B17A]/20"
              >
                <span>Continue Where I Left Off</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-[#D9D9E2] hover:bg-white/10 transition"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  // Allowed: Render Stepper + Children
  return (
    <div className="min-h-screen bg-[#2D3250] text-white selection:bg-[#F9B17A] selection:text-[#242942] pb-28 md:pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        <WorkflowStepper
          currentPhaseNumber={currentPhaseNumber}
          currentStatus={workflow.status}
          storyId={storyId}
        />

        {children(workflow, user)}
      </main>

      <MobileBottomNav />
    </div>
  );
}

