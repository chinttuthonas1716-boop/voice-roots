"use client";

import { useEffect, useState, useCallback } from "react";
import type { StoredVoiceRecord } from "./storage";

export interface OfflineQueueItem {
  clientOperationId: string;
  recordId: string;
  title: string;
  language: string;
  dialect?: string;
  durationSeconds: number;
  audioBlob?: Blob;
  audioFileName: string;
  originalTranscript: string;
  translations?: Record<string, string>;
  status: "pending" | "syncing" | "synced" | "failed";
  createdAt: string;
  lastAttemptAt?: string;
  errorDetails?: string;
  syncedAt?: string;
  retryCount: number;
}

const DB_NAME = "voice-roots-offline-sync";
const DB_VERSION = 1;
const STORE_NAME = "sync_queue";

function openSyncDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "clientOperationId" });
        store.createIndex("by_status", "status", { unique: false });
        store.createIndex("by_createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open sync database"));
  });
}

/** Enqueue a recording into the offline sync queue */
export async function enqueueOfflineRecording(
  record: StoredVoiceRecord,
  audioBlob?: Blob
): Promise<OfflineQueueItem> {
  const db = await openSyncDatabase();
  const clientOperationId = `op_${record.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const item: OfflineQueueItem = {
    clientOperationId,
    recordId: record.id,
    title: record.title,
    language: record.language,
    dialect: record.dialect,
    durationSeconds: record.durationSeconds,
    audioBlob: audioBlob,
    audioFileName: record.audioFileName,
    originalTranscript: record.originalTranscript,
    translations: record.translations as any,
    status: "pending",
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();

  notifyQueueUpdated();
  return item;
}

/** Retrieve all items in the offline sync queue */
export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  try {
    const db = await openSyncDatabase();
    const items = await new Promise<OfflineQueueItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    db.close();
    // Sort newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

/** Process and sync pending items using the idempotent sync endpoint */
export async function processOfflineSyncQueue(): Promise<{
  synced: number;
  failed: number;
  total: number;
}> {
  const queue = await getOfflineQueue();
  const pending = queue.filter((item) => item.status === "pending" || item.status === "failed");

  if (pending.length === 0) {
    return { synced: 0, failed: 0, total: queue.length };
  }

  const db = await openSyncDatabase();
  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pending) {
    // Mark as syncing
    item.status = "syncing";
    item.lastAttemptAt = new Date().toISOString();
    await updateQueueItem(db, item);
    notifyQueueUpdated();

    try {
      // Execute idempotent POST
      const res = await fetch("/api/sync/idempotent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientOperationId: item.clientOperationId,
          actionType: "SYNC_RECORDING",
          payload: {
            storyId: item.recordId,
            title: item.title,
            language: item.language,
            dialect: item.dialect,
            durationSeconds: item.durationSeconds,
            audioFileName: item.audioFileName,
            originalTranscript: item.originalTranscript,
            translations: item.translations,
          },
        }),
      });

      if (res.ok) {
        item.status = "synced";
        item.syncedAt = new Date().toISOString();
        item.errorDetails = undefined;
        syncedCount++;
      } else {
        const errorData = await res.json().catch(() => ({}));
        item.status = "failed";
        item.errorDetails = errorData.error || `HTTP ${res.status}`;
        item.retryCount = (item.retryCount || 0) + 1;
        failedCount++;
      }
    } catch (err: any) {
      item.status = "failed";
      item.errorDetails = err.message || "Network offline";
      item.retryCount = (item.retryCount || 0) + 1;
      failedCount++;
    }

    await updateQueueItem(db, item);
    notifyQueueUpdated();
  }

  db.close();
  return { synced: syncedCount, failed: failedCount, total: queue.length };
}

function updateQueueItem(db: IDBDatabase, item: OfflineQueueItem): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Clear all completed (synced) items from queue */
export async function clearSyncedItems(): Promise<void> {
  const queue = await getOfflineQueue();
  const db = await openSyncDatabase();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const item of queue) {
    if (item.status === "synced") {
      store.delete(item.clientOperationId);
    }
  }

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  notifyQueueUpdated();
}

const QUEUE_UPDATE_EVENT = "vr_offline_queue_update";
function notifyQueueUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(QUEUE_UPDATE_EVENT));
  }
}

/** React hook for managing the offline recording queue */
export function useOfflineSync() {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const reloadQueue = useCallback(async () => {
    const items = await getOfflineQueue();
    setQueue(items);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    reloadQueue();

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when back online
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = () => {
      reloadQueue();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener(QUEUE_UPDATE_EVENT, handleQueueChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(QUEUE_UPDATE_EVENT, handleQueueChange);
    };
  }, [reloadQueue]);

  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await processOfflineSyncQueue();
    } finally {
      setIsSyncing(false);
      reloadQueue();
    }
  };

  const pendingCount = queue.filter(
    (item) => item.status === "pending" || item.status === "syncing" || item.status === "failed"
  ).length;

  const syncedCount = queue.filter((item) => item.status === "synced").length;

  return {
    queue,
    pendingCount,
    syncedCount,
    isSyncing,
    isOnline,
    triggerSync,
    clearSynced: clearSyncedItems,
  };
}
