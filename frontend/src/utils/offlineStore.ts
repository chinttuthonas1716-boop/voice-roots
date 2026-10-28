/**
 * Voice Roots: Offline-First IndexedDB Store & Sync Engine
 * ========================================================
 * Provides offline audio recording persistence, draft caching, storage quota
 * auditing, and idempotent background synchronization.
 *
 * PRIVACY & DISCLOSURE:
 * - Recordings are stored locally inside the client's sandboxed IndexedDB.
 * - Clearly discloses that audio capture operates offline, while AI speech-to-text
 *   and translation require connection to the Voice Roots server.
 */

export interface OfflineRecordingItem {
  client_uuid: string;
  audio_blob: Blob;
  audio_filename: string;
  title: string;
  language: string;
  dialect?: string | null;
  contextual_notes?: string | null;
  speaker_consent: boolean;
  file_size_bytes: number;
  created_at: string;
  sync_status: 'local' | 'uploading' | 'synced' | 'failed';
  remote_id?: number | null;
  error_message?: string | null;
}

const DB_NAME = 'voice_roots_offline_db';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'offline_recordings';
const DRAFTS_STORE = 'offline_drafts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
        db.createObjectStore(RECORDINGS_STORE, { keyPath: 'client_uuid' });
      }
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE, { keyPath: 'draft_key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Save an audio recording into local browser IndexedDB storage */
export async function saveOfflineRecording(
  audioBlob: Blob,
  metadata: {
    title: string;
    language: string;
    dialect?: string | null;
    contextual_notes?: string | null;
    speaker_consent: boolean;
  }
): Promise<OfflineRecordingItem> {
  const db = await openDB();
  const client_uuid = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const audio_filename = `${client_uuid}.webm`;

  const item: OfflineRecordingItem = {
    client_uuid,
    audio_blob: audioBlob,
    audio_filename,
    title: metadata.title.trim() || 'Untitled Offline Recording',
    language: metadata.language,
    dialect: metadata.dialect || null,
    contextual_notes: metadata.contextual_notes || null,
    speaker_consent: metadata.speaker_consent,
    file_size_bytes: audioBlob.size,
    created_at: new Date().toISOString(),
    sync_status: 'local',
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
    const store = tx.objectStore(RECORDINGS_STORE);
    const req = store.put(item);

    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

/** List all offline recordings stored locally */
export async function listOfflineRecordings(): Promise<OfflineRecordingItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, 'readonly');
      const store = tx.objectStore(RECORDINGS_STORE);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/** Delete an offline recording permanently from local storage */
export async function deleteOfflineRecording(client_uuid: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
      const store = tx.objectStore(RECORDINGS_STORE);
      const req = store.delete(client_uuid);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return false;
  }
}

/** Wipe all offline recordings (for logout or privacy reset) */
export async function clearAllOfflineData(): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([RECORDINGS_STORE, DRAFTS_STORE], 'readwrite');
      tx.objectStore(RECORDINGS_STORE).clear();
      tx.objectStore(DRAFTS_STORE).clear();

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}

/** Estimate browser storage quota and available space */
export async function getStorageQuotaEstimate(): Promise<{
  quotaBytes: number;
  usageBytes: number;
  usagePercent: number;
  isAvailable: boolean;
}> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const percent = quota > 0 ? (usage / quota) * 100 : 0;
      return {
        quotaBytes: quota,
        usageBytes: usage,
        usagePercent: Math.round(percent * 10) / 10,
        isAvailable: true,
      };
    } catch {
      // fallback
    }
  }
  return { quotaBytes: 0, usageBytes: 0, usagePercent: 0, isAvailable: false };
}

/** Update sync status of a local recording item */
export async function updateRecordingSyncStatus(
  client_uuid: string,
  status: 'local' | 'uploading' | 'synced' | 'failed',
  remoteId?: number | null,
  errorMessage?: string | null
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDINGS_STORE, 'readwrite');
    const store = tx.objectStore(RECORDINGS_STORE);
    const getReq = store.get(client_uuid);

    getReq.onsuccess = () => {
      const item: OfflineRecordingItem = getReq.result;
      if (item) {
        item.sync_status = status;
        if (remoteId !== undefined) item.remote_id = remoteId;
        if (errorMessage !== undefined) item.error_message = errorMessage;
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/** Idempotently synchronize a single offline recording to the backend */
export async function syncSingleRecording(
  item: OfflineRecordingItem,
  apiBaseUrl: string = ''
): Promise<{ success: boolean; remoteId?: number; error?: string }> {
  await updateRecordingSyncStatus(item.client_uuid, 'uploading');

  const formData = new FormData();
  formData.append('audio', item.audio_blob, item.audio_filename);
  formData.append('title', item.title);
  formData.append('language', item.language);
  if (item.dialect) formData.append('dialect', item.dialect);
  if (item.contextual_notes) formData.append('contextual_notes', item.contextual_notes);
  formData.append('consent', item.speaker_consent ? 'true' : 'false');
  formData.append('client_uuid', item.client_uuid); // Idempotency key

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/transcripts/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      const msg = err.detail || `Server returned ${res.status}`;
      await updateRecordingSyncStatus(item.client_uuid, 'failed', null, msg);
      return { success: false, error: msg };
    }

    const data = await res.json();
    const remoteId = data.id || data.transcript_id;
    await updateRecordingSyncStatus(item.client_uuid, 'synced', remoteId, null);
    return { success: true, remoteId };
  } catch (e: any) {
    const msg = e.message || 'Network loss during synchronization';
    await updateRecordingSyncStatus(item.client_uuid, 'failed', null, msg);
    return { success: false, error: msg };
  }
}

/** Synchronize all pending offline recordings (idempotent, skips already synced) */
export async function syncAllPendingRecordings(
  apiBaseUrl: string = '',
  onProgress?: (synced: number, total: number) => void
): Promise<{ total: number; synced: number; failed: number }> {
  const items = await listOfflineRecordings();
  const pending = items.filter((i) => i.sync_status === 'local' || i.sync_status === 'failed');

  let synced = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    const res = await syncSingleRecording(item, apiBaseUrl);
    if (res.success) {
      synced++;
    } else {
      failed++;
    }
    if (onProgress) {
      onProgress(synced, pending.length);
    }
  }

  return { total: pending.length, synced, failed };
}
