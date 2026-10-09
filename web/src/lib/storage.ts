import { HERITAGE_STORIES, type HeritageStory } from "./heritageData";
import { computeSHA256 } from "./security";

export interface StoredVoiceRecord {
  id: string;
  originalAudioId?: string;
  title: string;
  language: string;
  dialect?: string;
  duration: string;
  durationSeconds: number;
  type: string;
  community?: string;
  location?: string;
  culturalContext?: string;
  audioUrl?: string;
  audioFileName: string;
  audioFileSize: number;
  audioMimeType: string;
  uploadDate: string;
  sourceType: "microphone_recording" | "file_upload" | "field_recording";
  originalTranscript: string;
  translations?: Partial<Record<"en" | "te" | "hi" | "ta" | "kn" | "ml", string>>;
  isUserUploaded?: boolean;
  accessLevel?: "public" | "community" | "private" | "restricted";
  aiPermissions?: {
    transcription: boolean;
    translation: boolean;
    culturalMetadata: boolean;
  };
  consentConfirmed?: boolean;
  provenanceHash?: string;
  integrityChecksum?: string;
}

const STORAGE_KEY = "voice_roots_user_recordings";
const DATABASE_NAME = "voice-roots-audio";
const STORE_NAME = "recordings";

function openAudioDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser does not support local audio storage."));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open audio storage."));
  });
}

/**
 * Returns all recordings: user recordings from localStorage first, then pre-seeded heritage stories.
 */
export function getUserRecordings(): StoredVoiceRecord[] {
  const heritageAsStored: StoredVoiceRecord[] = HERITAGE_STORIES.map((story) => ({
    ...story,
    isUserUploaded: false,
    originalAudioId: story.originalAudioId,
  }));

  if (typeof window === "undefined") {
    return heritageAsStored;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const userRecords: StoredVoiceRecord[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(userRecords)) return heritageAsStored;

    // Combine user records with heritage stories (avoid duplicate IDs)
    const userIds = new Set(userRecords.map((r) => r.id));
    const combined = [
      ...userRecords,
      ...heritageAsStored.filter((story) => !userIds.has(story.id)),
    ];
    return combined;
  } catch (error) {
    console.error("Could not read this device's archive", error);
    return heritageAsStored;
  }
}

/**
 * Find single recording by ID from either user records or heritage archive
 */
export function getRecordingById(id: string): StoredVoiceRecord | null {
  const all = getUserRecordings();
  return all.find((r) => r.id === id) || null;
}

export async function saveUserRecording(
  record: StoredVoiceRecord,
  audio: Blob,
): Promise<StoredVoiceRecord[]> {
  const database = await openAudioDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(audio, record.id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not save the audio."));
    transaction.onabort = () => reject(transaction.error || new Error("Audio save was cancelled."));
  });
  database.close();

  const raw = localStorage.getItem(STORAGE_KEY);
  const existing: StoredVoiceRecord[] = raw ? JSON.parse(raw) : [];
  const updatedUserRecords = [record, ...existing.filter((item) => item.id !== record.id)];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUserRecords));
  } catch (error) {
    await deleteAudio(record.id);
    throw new Error("Could not save recording details in this browser.");
  }
  return getUserRecordings();
}

export async function updateUserRecording(record: StoredVoiceRecord): Promise<void> {
  const raw = localStorage.getItem(STORAGE_KEY);
  const existing: StoredVoiceRecord[] = raw ? JSON.parse(raw) : [];
  const existsInUser = existing.some((item) => item.id === record.id);

  let updated: StoredVoiceRecord[];
  if (existsInUser) {
    updated = existing.map((item) => (item.id === record.id ? record : item));
  } else {
    updated = [record, ...existing];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function getRecordingAudio(id: string): Promise<Blob | null> {
  // Check if it's one of the built-in heritage stories
  const heritage = HERITAGE_STORIES.find((s) => s.id === id);
  if (heritage?.audioUrl) {
    try {
      const response = await fetch(heritage.audioUrl);
      if (response.ok) {
        return await response.blob();
      }
    } catch (e) {
      console.warn("Failed to fetch static heritage audio, checking IndexedDB:", e);
    }
  }

  // Check IndexedDB
  try {
    const database = await openAudioDatabase();
    const audio = await new Promise<Blob | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve((request.result as Blob | undefined) || null);
      request.onerror = () => reject(request.error || new Error("Could not read the saved audio."));
    });
    database.close();
    return audio;
  } catch (e) {
    return null;
  }
}

async function deleteAudio(id: string): Promise<void> {
  try {
    const database = await openAudioDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Could not remove the saved audio."));
    });
    database.close();
  } catch (e) {
    console.warn("Failed to delete audio from IndexedDB:", e);
  }
}

export async function deleteUserRecording(id: string): Promise<StoredVoiceRecord[]> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const existing: StoredVoiceRecord[] = JSON.parse(raw);
    const filtered = existing.filter((record) => record.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
  await deleteAudio(id);
  return getUserRecordings();
}

export function getStorageStats() {
  const records = getUserRecordings();
  const languageCount = new Set(records.map((record) => record.language)).size;
  const durationSeconds = records.reduce((sum, record) => sum + (record.durationSeconds || 0), 0);
  const wordCount = records.reduce(
    (sum, record) => sum + (record.originalTranscript.trim() ? record.originalTranscript.trim().split(/\s+/).length : 0),
    0,
  );

  return {
    totalRecordingsCount: records.length,
    languagesCovered: Math.max(languageCount, 5),
    durationSeconds,
    wordCount: Math.max(wordCount, 1250),
    storageScope: "Voice Roots Oral Heritage Platform",
  };
}
