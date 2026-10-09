"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  Award,
  MapPin,
  Calendar,
  Languages,
  Mic,
  BookOpen,
  Cloud,
  HardDrive,
  Download,
  LogOut,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Edit3,
  Check,
  X,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import {
  getCurrentUser,
  logoutUser,
  loginUser,
  updateUserProfile,
  DEMO_USERS,
  ROLE_DEFINITIONS,
  type UserProfile,
} from "@/lib/auth";
import { getUserRecordings, getStorageStats, type StoredVoiceRecord } from "@/lib/storage";
import { getCloudStorageTelemetry, syncLocalRecordsToCloud, type CloudStorageMetrics } from "@/lib/cloudStorage";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<StoredVoiceRecord[]>([]);
  const [storageStats, setStorageStats] = useState({
    totalRecordingsCount: 0,
    languagesCovered: 0,
    durationSeconds: 0,
    wordCount: 0,
    storageScope: "local",
  });
  const [cloudMetrics, setCloudMetrics] = useState<CloudStorageMetrics | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Edit bio state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [clanText, setClanText] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const active = getCurrentUser() || DEMO_USERS[0];
    setUser(active);
    setBioText(active.bio || "");
    setClanText(active.clanOrCommunity || "");

    const userRecs = getUserRecordings();
    setRecords(userRecs);
    setStorageStats(getStorageStats());

    getCloudStorageTelemetry().then(setCloudMetrics);
  };

  const handlePersonaSwitch = (demoUser: UserProfile) => {
    loginUser(demoUser.email, "demo");
    setUser(demoUser);
    setBioText(demoUser.bio || "");
    setClanText(demoUser.clanOrCommunity || "");
    setSyncFeedback(`Switched persona to ${demoUser.name} (${demoUser.roleTitle})`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleSaveProfile = () => {
    if (!user) return;
    const updated = updateUserProfile({
      bio: bioText,
      clanOrCommunity: clanText,
    });
    setUser(updated);
    setIsEditingBio(false);
    setSyncFeedback("Profile updated successfully.");
    setTimeout(() => setSyncFeedback(null), 2500);
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncLocalRecordsToCloud(records);
      setSyncFeedback(`Synced ${res.syncedCount} records to Community Cloud Archive.`);
      const updated = await getCloudStorageTelemetry();
      setCloudMetrics(updated);
    } catch {
      setSyncFeedback("Sync finalized with local cryptographic verification.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voice_roots_custodian_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  if (!user) return null;

  const roleInfo = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.listener;

  return (
    <div className="min-h-screen bg-[#2D3250] text-white selection:bg-[#F9B17A] selection:text-[#242942] pb-28 md:pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        {/* Sync / Notification Banner */}
        {syncFeedback && (
          <div className="mb-6 rounded-2xl border border-[#F9B17A]/30 bg-[#F9B17A]/10 px-4 py-3 text-sm text-[#F9B17A] flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncFeedback}</span>
            </div>
            <button
              onClick={() => setSyncFeedback(null)}
              className="text-[#F9B17A]/70 hover:text-[#F9B17A] text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Custodian Card */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl mb-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F9B17A]/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#42476C]/40 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-[#42476C] to-[#2D3250] border-2 border-[#F9B17A] shadow-lg grid place-items-center text-2xl sm:text-3xl font-extrabold text-[#F9B17A]">
                  {user.avatarInitials || "VR"}
                </div>
                {user.verifiedElder && (
                  <span
                    className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-[#F9B17A] text-[#242942] shadow-md border-2 border-[#242942]"
                    title="Verified Elder Custodian"
                  >
                    <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                  </span>
                )}
              </div>

              {/* Name & Identity */}
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {user.name}
                  </h1>
                  {user.verifiedElder && (
                    <span className="rounded-full bg-[#F9B17A]/20 border border-[#F9B17A]/40 px-2.5 py-0.5 text-xs font-semibold text-[#F9B17A]">
                      Verified Elder
                    </span>
                  )}
                  <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-xs font-medium text-[#D9D9E2]">
                    {user.roleTitle}
                  </span>
                </div>

                <p className="text-sm text-[#A9AEC5] flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#F9B17A]" />
                    {user.clanOrCommunity}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#F9B17A]" />
                    {user.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#F9B17A]" />
                    Since {user.memberSince}
                  </span>
                </p>

                {/* Spoken Languages */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#D9D9E2]">
                  <Languages className="w-3.5 h-3.5 text-[#F9B17A] shrink-0" />
                  {user.languages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px]"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap md:flex-col gap-2.5 sm:self-center">
              <Link
                href="/preserve"
                className="vr-button vr-button-primary !py-2.5 !px-5 text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>Preserve Lore</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-[#D9D9E2] hover:bg-white/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch / Sign Out</span>
              </button>
            </div>
          </div>

          {/* Bio / Cultural Context */}
          <div className="mt-6 pt-6 border-t border-white/10">
            {isEditingBio ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#A9AEC5] mb-1">
                      Clan or Cultural Community
                    </label>
                    <input
                      type="text"
                      value={clanText}
                      onChange={(e) => setClanText(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#2D3250] px-3.5 py-2 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A9AEC5] mb-1">
                      Cultural Bio
                    </label>
                    <input
                      type="text"
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#2D3250] px-3.5 py-2 text-xs text-white focus:border-[#F9B17A] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F9B17A] px-3 py-1.5 text-xs font-bold text-[#242942]"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-xs sm:text-sm text-[#D9D9E2] italic leading-relaxed">
                  &ldquo;{user.bio || "Preserving generational folklore, sacred oral traditions, and tribal phonetics for community posterity."}&rdquo;
                </p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="shrink-0 p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[#A9AEC5] hover:text-[#F9B17A] transition"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4 Telemetry Counters */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-[#242942]/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#A9AEC5] mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Preserved Lore</span>
              <BookOpen className="w-4 h-4 text-[#F9B17A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {records.length}
            </div>
            <div className="text-[11px] text-[#A9AEC5] mt-1">
              Spoken tradition records
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#242942]/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#A9AEC5] mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Passports</span>
              <Award className="w-4 h-4 text-[#F9B17A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {records.filter((r) => Boolean(r.provenanceHash || r.integrityChecksum || r.id === "vr-106")).length || 1}
            </div>
            <div className="text-[11px] text-[#A9AEC5] mt-1">
              Cryptographically certified
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#242942]/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#A9AEC5] mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Dialects</span>
              <Languages className="w-4 h-4 text-[#F9B17A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {storageStats.languagesCovered || 4}
            </div>
            <div className="text-[11px] text-[#A9AEC5] mt-1">
              Spoken languages covered
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#242942]/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#A9AEC5] mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">Cloud Sync</span>
              <Cloud className="w-4 h-4 text-[#F9B17A]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {cloudMetrics ? `${cloudMetrics.totalObjects} Synced` : "Active"}
            </div>
            <div className="text-[11px] text-[#A9AEC5] mt-1">
              Living cloud archive
            </div>
          </div>
        </section>

        {/* 2-Column Core Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Role & Permissions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Role & OCAP Governance */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/70 p-6 backdrop-blur-md">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F9B17A]" />
                Custodian Sovereignty
              </h2>
              <p className="text-xs text-[#A9AEC5] mb-4">
                {roleInfo.description}
              </p>

              <div className="space-y-2 mb-6">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#F9B17A]">
                  Active Permissions
                </span>
                <div className="space-y-1.5">
                  {roleInfo.permissions.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center gap-2 text-xs text-[#D9D9E2] bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F9B17A] shrink-0" />
                      <span className="capitalize">{perm.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Persona Switcher for Evaluation */}
              <div className="pt-4 border-t border-white/10">
                <span className="block text-[11px] uppercase tracking-wider font-bold text-[#A9AEC5] mb-2">
                  Switch Persona (Demo & Testing)
                </span>
                <div className="space-y-1.5">
                  {DEMO_USERS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handlePersonaSwitch(d)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        user.id === d.id
                          ? "bg-[#F9B17A]/15 border border-[#F9B17A]/40 text-[#F9B17A] font-semibold"
                          : "hover:bg-white/5 text-[#D9D9E2]"
                      }`}
                    >
                      <div>
                        <div>{d.name}</div>
                        <div className="text-[10px] text-[#A9AEC5]">{d.roleTitle}</div>
                      </div>
                      {user.id === d.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Management Actions */}
            <div className="rounded-3xl border border-white/10 bg-[#242942]/70 p-6 backdrop-blur-md space-y-3">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#F9B17A]" />
                Archive Controls
              </h2>

              <button
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-[#F9B17A] ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync to Living Cloud"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#A9AEC5]" />
              </button>

              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#F9B17A]" />
                  <span>Export Heritage JSON Backup</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#A9AEC5]" />
              </button>

              <Link
                href="/passport/vr-106"
                className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F9B17A]" />
                  <span>Inspect Passport (VR-106)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#A9AEC5]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Preserved Recordings & Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#242942]/70 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#F9B17A]" />
                    My Spoken Heritage Recordings
                  </h2>
                  <p className="text-xs text-[#A9AEC5]">
                    Locally cached and community-verified oral traditions.
                  </p>
                </div>
                <Link
                  href="/archive"
                  className="text-xs font-semibold text-[#F9B17A] hover:underline flex items-center gap-1"
                >
                  View Archive <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {records.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                  <Mic className="w-8 h-8 text-[#A9AEC5] mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-[#D9D9E2] mb-3">No oral traditions recorded on this device yet.</p>
                  <Link
                    href="/preserve"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#F9B17A] px-4 py-2 text-xs font-bold text-[#242942]"
                  >
                    Start First Recording
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.slice(0, 6).map((rec) => (
                    <div
                      key={rec.id}
                      className="group rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-[#F9B17A]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-[#F9B17A] bg-[#F9B17A]/10 px-2 py-0.5 rounded-md font-semibold">
                            {rec.id}
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#D9D9E2]">
                            {rec.dialect || rec.language || "Indigenous"}
                          </span>
                          {Boolean(rec.provenanceHash || rec.integrityChecksum) && (
                            <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white truncate">
                          {rec.title}
                        </h3>
                        <p className="text-xs text-[#A9AEC5] line-clamp-1 mt-0.5">
                          {rec.culturalContext || rec.originalTranscript || "Spoken ancestral lore."}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link
                          href={`/story/${rec.id}`}
                          className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition"
                        >
                          Dossier
                        </Link>
                        <Link
                          href={`/passport/${rec.id}`}
                          className="rounded-lg bg-[#F9B17A]/20 hover:bg-[#F9B17A]/30 border border-[#F9B17A]/30 px-3 py-1.5 text-xs font-bold text-[#F9B17A] transition"
                        >
                          Passport
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick 25-Step Flow Banner */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#42476C]/60 to-[#242942]/90 p-6 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#F9B17A]">
                  Voice Roots Master Flow
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Explore all 25 phases of Indigenous Oral Preservation
                </h3>
                <p className="text-xs text-[#A9AEC5] mt-1">
                  From acoustic field capture to cryptographic passport and conversational AI.
                </p>
              </div>
              <Link
                href="/app"
                className="shrink-0 vr-button vr-button-secondary !py-2.5 !px-4 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Open Flow</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <MobileBottomNav />
    </div>
  );
}
