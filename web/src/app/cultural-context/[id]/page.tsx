"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  MapPin,
  Users,
  Compass,
  Edit3,
  Check,
} from "lucide-react";
import { WorkflowGuard } from "@/components/workflow/WorkflowGuard";
import { transitionStory, type PreservationWorkflow } from "@/lib/workflow";
import type { UserProfile } from "@/lib/auth";

export default function CulturalContextPage() {
  const params = useParams();
  const storyId = (params?.id as string) || "VR-DRAFT";
  const router = useRouter();

  const [background, setBackground] = useState<string>("");
  const [significance, setSignificance] = useState<string>("");
  const [community, setCommunity] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <WorkflowGuard
      route="/cultural-context"
      storyId={storyId}
      currentPhaseNumber={5}
    >
      {(workflow: PreservationWorkflow, user: UserProfile) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const ctx = workflow.culturalContext;
          setBackground(
            ctx?.background ||
              "Ancient river basin hymn sung by agrarian elders at the onset of the Rohini monsoon nakshatra. The melody invokes subterranean aquifer spirits and the blessing of fertile silt across black cotton soil."
          );
          setSignificance(
            ctx?.significance ||
              "Celebrates the communion between agrarian toil and ecological rains, marking the beginning of the traditional plowing season."
          );
          setCommunity(ctx?.community || workflow.detectedDialect || "Godavari Basin Agrarian Custodians");
          setLocation(ctx?.location || "Telangana & Deccan River Basin");
        }, [workflow]);

        const handleContinue = () => {
          transitionStory(
            storyId,
            {
              type: "SAVE_CULTURAL_CONTEXT",
              context: {
                background,
                significance,
                community,
                location,
                terms: [
                  { term: "Rohini", meaning: "Monsoon agricultural constellation" },
                  { term: "Godavari", meaning: "Sacred perennial river sustaining fertile riverbed villages" },
                ],
              },
            },
            user
          );
          router.push(`/consent/${storyId}`);
        };

        return (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Phase 05 — Cultural Context & Ethnobotanical Lore</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Contextualize Indigenous Narrative
              </h1>
              <p className="text-sm text-[#A9AEC5] mt-1 max-w-2xl">
                Oral traditions are deeply bound to seasonal cycles, sacred geography, and community memory.
              </p>
            </div>

            {/* AI Warning Disclaimer Card (Mandatory Requirement) */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-[#F9B17A] shrink-0 mt-0.5" />
              <div className="text-xs text-[#D9D9E2] leading-relaxed">
                <strong className="text-white font-semibold block mb-0.5">
                  AI-ASSISTED CULTURAL CONTEXT
                </strong>
                The cultural notes below are synthesized with linguistic AI models and community knowledge graphs. They provide ethnographic framing but must never replace living elder verification.
              </div>
            </div>

            {/* Context Dossier Card */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F9B17A]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Contextual Dossier Fields
                  </h2>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#F9B17A]" />
                  <span>{isEditing ? "Done Editing" : "Edit Metadata"}</span>
                </button>
              </div>

              {/* Editable or Display Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A9AEC5] mb-1.5">
                    Story Background & Tradition
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-[#2D3250] p-3.5 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm text-white bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                      {background}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A9AEC5] mb-1.5">
                    Cultural & Ecological Significance
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={significance}
                      onChange={(e) => setSignificance(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-[#2D3250] p-3.5 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm text-[#D9D9E2] bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                      {significance}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A9AEC5] mb-1.5 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#F9B17A]" /> Community Custodians
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#2D3250] px-3.5 py-2 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                      />
                    ) : (
                      <div className="text-xs text-white bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/5">
                        {community}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A9AEC5] mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F9B17A]" /> Geographic Region
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#2D3250] px-3.5 py-2 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                      />
                    ) : (
                      <div className="text-xs text-white bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/5">
                        {location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/10">
                <Link
                  href={`/translate/${storyId}`}
                  className="text-xs text-[#A9AEC5] hover:text-white transition"
                >
                  ← Back to Translation
                </Link>

                <button
                  onClick={handleContinue}
                  className="vr-button vr-button-primary !py-3 !px-7 text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#F9B17A]/25"
                >
                  <span>Continue to Consent & Governance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      }}
    </WorkflowGuard>
  );
}

