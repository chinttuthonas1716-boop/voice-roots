"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  Globe,
  Lock,
  Bell,
  HardDrive,
  Trash2,
  Download,
  ShieldCheck,
  Check,
  User,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { getCurrentUser, logoutUser, type UserProfile } from "@/lib/auth";
import { useAppLanguage, SUPPORTED_LANGUAGES, type SupportedLanguageCode } from "@/lib/languageContext";
import { getUserRecordings, getStorageStats } from "@/lib/storage";

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { appLanguage, setAppLanguage } = useAppLanguage();
  const [storageStats, setStorageStats] = useState({ totalRecordingsCount: 0, languagesCovered: 0 });
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const stats = getStorageStats();
    setStorageStats({
      totalRecordingsCount: stats.totalRecordingsCount,
      languagesCovered: stats.languagesCovered,
    });
  }, []);

  const handleExportData = () => {
    const records = getUserRecordings();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `voice_roots_complete_backup_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
    setSaveFeedback("Archive backup downloaded successfully.");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleClearLocalCache = () => {
    if (confirm("Clear local IndexedDB audio cache? Unsynced drafts will be removed.")) {
      localStorage.removeItem("voice_roots_active_workflows_v2");
      localStorage.removeItem("voice_roots_current_workflow_id");
      setSaveFeedback("Local cache cleared.");
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3250] text-white selection:bg-[#F9B17A] selection:text-[#242942] pb-28 md:pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F9B17A] mb-1">
            <SettingsIcon className="w-4 h-4" />
            <span>Platform Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Custodian Settings & Sovereignty
          </h1>
          <p className="text-sm text-[#A9AEC5] mt-1">
            Manage your account, preferred UI language, local cache, and community data sovereignty policies.
          </p>
        </div>

        {saveFeedback && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}

        {/* 1. Interface Language */}
        <section className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#F9B17A]" />
            <h2 className="text-base font-bold text-white">Application Interface Language</h2>
          </div>
          <p className="text-xs text-[#A9AEC5]">
            Choose your preferred display language for the Voice Roots discovery portal.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguageCode, { name: string; nativeName: string; flag: string }][]).map(([code, info]) => (
              <button
                key={code}
                onClick={() => setAppLanguage(code)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition ${
                  appLanguage === code
                    ? "border-[#F9B17A] bg-[#F9B17A]/15 text-[#F9B17A]"
                    : "border-white/10 bg-white/5 text-[#D9D9E2] hover:bg-white/10"
                }`}
              >
                <span>{info.flag} {info.nativeName}</span>
                {appLanguage === code && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Privacy & OCAP Data Sovereignty */}
        <section className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#F9B17A]" />
            <h2 className="text-base font-bold text-white">Traditional Knowledge Sovereignty</h2>
          </div>
          <p className="text-xs text-[#A9AEC5]">
            Voice Roots enforces OCAP® principles: Ownership, Control, Access, and Possession.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white">Automatic Local Draft Persistence</div>
                <div className="text-[11px] text-[#A9AEC5]">Save field audio captures in browser storage before sync.</div>
              </div>
              <input
                type="checkbox"
                checked={offlineSyncEnabled}
                onChange={(e) => setOfflineSyncEnabled(e.target.checked)}
                className="accent-[#F9B17A] h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="text-xs font-bold text-white">Elder Review & Attestation Notifications</div>
                <div className="text-[11px] text-[#A9AEC5]">Notify when a peer reviewer signs your oral passport.</div>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="accent-[#F9B17A] h-4 w-4"
              />
            </div>
          </div>
        </section>

        {/* 3. Local Cache & Data Management */}
        <section className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-[#F9B17A]" />
            <h2 className="text-base font-bold text-white">Local Data & Export Controls</h2>
          </div>
          <p className="text-xs text-[#A9AEC5]">
            Cached Records on this device: <strong className="text-white">{storageStats.totalRecordingsCount} recordings</strong> ({storageStats.languagesCovered} dialects).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <Download className="w-4 h-4 text-[#F9B17A]" />
              <span>Export Full JSON Archive Backup</span>
            </button>

            <button
              onClick={handleClearLocalCache}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Local Cache</span>
            </button>
          </div>
        </section>

        {/* 4. Account Profile */}
        {user && (
          <section className="rounded-3xl border border-white/10 bg-[#242942]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#F9B17A]" />
                <h2 className="text-base font-bold text-white">Active Custodian Account</h2>
              </div>
              <Link href="/profile" className="text-xs font-semibold text-[#F9B17A] hover:underline">
                View Profile →
              </Link>
            </div>
            <p className="text-xs text-[#D9D9E2]">
              Signed in as <strong className="text-white">{user.name}</strong> ({user.email}) • Role: {user.roleTitle}
            </p>
          </section>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}

