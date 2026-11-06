"use client";

import React, { useEffect } from "react";
import { useOfflineSync } from "@/lib/offlineQueue";
import { RefreshCw, WifiOff } from "lucide-react";

export function ServiceWorkerRegister() {
  const { pendingCount, isSyncing, isOnline, triggerSync } = useOfflineSync();

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          // Service worker registered successfully
        })
        .catch((err) => {
          console.debug("Service worker registration ignored:", err);
        });
    }
  }, []);

  if (pendingCount === 0 && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-50 animate-in fade-in slide-in-from-bottom-2">
      <div className="glass-card px-3.5 py-2 flex items-center gap-2.5 shadow-xl border-amber-500/30 text-xs">
        {!isOnline ? (
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <WifiOff className="h-3.5 w-3.5" />
            <span>Offline ({pendingCount} queued)</span>
          </div>
        ) : pendingCount > 0 ? (
          <button
            type="button"
            onClick={() => triggerSync()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-amber-400" : ""}`} />
            <span>
              {isSyncing ? "Syncing recording queue..." : `${pendingCount} pending sync — Sync now`}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
