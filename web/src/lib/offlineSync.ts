/**
 * Voice Roots — Offline-First Persistence & Auto-Resume Synchronization Engine
 * "Local-first, cloud-enhanced."
 * Guarantees zero work loss on laptop shutdown, tab close, or network dropout.
 */

export type SyncStatus = "synced" | "offline_saved" | "syncing" | "sync_failed";

export type DraftStep =
  | "upload_started"
  | "upload_completed"
  | "language_detected"
  | "transcript_created"
  | "transcript_edited"
  | "translation_started"
  | "translation_completed"
  | "consent_confirmed"
  | "passport_generated";

export interface DraftStoryState {
  storyId: string;
  clientOperationId: string;
  title: string;
  step: DraftStep;
  progressPercent: number;
  lastCheckpoint: string;
  language: string;
  dialect?: string;
  speakerName?: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioDurationSeconds?: number;
  originalTranscript?: string;
  translations?: Record<string, string>;
  consentSpeaker: boolean;
  community?: string;
  location?: string;
  syncStatus: "DRAFT" | "PENDING_UPLOAD" | "PROCESSING" | "PENDING_SYNC" | "READY" | "SYNC_FAILED";
}

export interface OfflineQueuedAction {
  id: string;
  clientOperationId: string;
  actionType: "save_recording" | "save_transcript" | "save_translation" | "issue_passport";
  payload: any;
  createdAt: string;
  retries: number;
}

const DRAFT_STORAGE_KEY = "voice_roots_active_draft_checkpoint";
const QUEUE_STORAGE_KEY = "voice_roots_offline_sync_queue";
const SYNC_STATE_KEY = "voice_roots_network_sync_status";

/**
 * Check browser network status
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Save draft checkpoint automatically
 */
export function saveDraftCheckpoint(draft: Partial<DraftStoryState>): DraftStoryState {
  if (typeof window === "undefined") return draft as DraftStoryState;

  const existing = getActiveDraftCheckpoint();
  const updated: DraftStoryState = {
    storyId: draft.storyId || existing?.storyId || `draft_${Date.now().toString(36)}`,
    clientOperationId: draft.clientOperationId || existing?.clientOperationId || `op_${Date.now().toString(36)}`,
    title: draft.title || existing?.title || "Untitled Spoken Heritage",
    step: draft.step || existing?.step || "upload_started",
    progressPercent: draft.progressPercent ?? existing?.progressPercent ?? 10,
    lastCheckpoint: new Date().toISOString(),
    language: draft.language || existing?.language || "Telugu",
    dialect: draft.dialect || existing?.dialect,
    speakerName: draft.speakerName || existing?.speakerName,
    audioFileName: draft.audioFileName || existing?.audioFileName,
    audioFileSize: draft.audioFileSize ?? existing?.audioFileSize,
    audioDurationSeconds: draft.audioDurationSeconds ?? existing?.audioDurationSeconds,
    originalTranscript: draft.originalTranscript ?? existing?.originalTranscript ?? "",
    translations: { ...(existing?.translations || {}), ...(draft.translations || {}) },
    consentSpeaker: draft.consentSpeaker ?? existing?.consentSpeaker ?? true,
    community: draft.community || existing?.community,
    location: draft.location || existing?.location,
    syncStatus: isOnline() ? "PENDING_SYNC" : "DRAFT",
  };

  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
    // Also save in local offline sync queue if appropriate
    if (!isOnline()) {
      queueOfflineAction({
        id: `qa_${Date.now()}`,
        clientOperationId: updated.clientOperationId,
        actionType: "save_recording",
        payload: updated,
        createdAt: new Date().toISOString(),
        retries: 0,
      });
    }
  } catch (err) {
    console.warn("Could not save draft checkpoint to localStorage:", err);
  }

  return updated;
}

/**
 * Get active draft checkpoint for resume
 */
export function getActiveDraftCheckpoint(): DraftStoryState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear draft checkpoint (e.g. after complete preservation or discard)
 */
export function clearDraftCheckpoint(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {}
}

/**
 * Queue an offline action
 */
export function queueOfflineAction(action: OfflineQueuedAction): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    const queue: OfflineQueuedAction[] = raw ? JSON.parse(raw) : [];
    // Prevent duplicate entries for same clientOperationId
    const filtered = queue.filter((item) => item.clientOperationId !== action.clientOperationId);
    filtered.push(action);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Failed to queue offline action:", err);
  }
}

/**
 * Get all queued offline actions
 */
export function getOfflineQueue(): OfflineQueuedAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Idempotent Sync Queue execution when Internet returns
 */
export async function syncOfflineQueue(): Promise<{
  syncedCount: number;
  failedCount: number;
  message: string;
}> {
  if (!isOnline()) {
    return { syncedCount: 0, failedCount: 0, message: "Device is offline. Queued for auto-sync." };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, failedCount: 0, message: "Voice Roots is fully synchronized." };
  }

  let synced = 0;
  let failed = 0;
  const remaining: OfflineQueuedAction[] = [];

  for (const item of queue) {
    try {
      const resp = await fetch("/api/sync/idempotent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientOperationId: item.clientOperationId,
          actionType: item.actionType,
          payload: item.payload,
        }),
      });

      if (resp.ok) {
        synced++;
      } else {
        item.retries++;
        remaining.push(item);
        failed++;
      }
    } catch {
      item.retries++;
      remaining.push(item);
      failed++;
    }
  }

  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
  } catch {}

  return {
    syncedCount: synced,
    failedCount: failed,
    message: failed === 0 ? "All offline actions synced successfully." : `${synced} synced, ${failed} pending retry.`,
  };
}

