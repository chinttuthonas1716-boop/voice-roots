"use client";

import { getRecordingAudio } from "./storage";

export type PlaybackStatus = "IDLE" | "LOADING" | "PLAYING" | "PAUSED" | "ENDED" | "ERROR" | "UNAVAILABLE";

type Listener = (state: { activeId: string | null; status: PlaybackStatus; error?: string }) => void;

class CardAudioPlayerManager {
  private audio: HTMLAudioElement | null = null;
  private activeId: string | null = null;
  private status: PlaybackStatus = "IDLE";
  private error?: string;
  private listeners = new Set<Listener>();
  private currentObjectUrl: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
      this.audio.preload = "none";

      this.audio.addEventListener("playing", () => {
        this.status = "PLAYING";
        this.notify();
      });

      this.audio.addEventListener("pause", () => {
        if (this.status !== "ENDED") {
          this.status = "PAUSED";
          this.notify();
        }
      });

      this.audio.addEventListener("ended", () => {
        this.status = "ENDED";
        this.notify();
      });

      this.audio.addEventListener("error", (e) => {
        console.error("Voice Roots audio playback error:", {
          recordingId: this.activeId,
          error: this.audio?.error,
        });
        this.status = "ERROR";
        this.error = "Unable to play this recording. Please try again.";
        this.notify();
      });
    }
  }

  private notify() {
    this.listeners.forEach((l) => l({ activeId: this.activeId, status: this.status, error: this.error }));
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener({ activeId: this.activeId, status: this.status, error: this.error });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState() {
    return { activeId: this.activeId, status: this.status, error: this.error };
  }

  public async playRecord(record: {
    id: string;
    audioUrl?: string;
    audioFileName?: string;
    isUserUploaded?: boolean;
    language?: string;
  }) {
    if (!this.audio) return;

    // 1. If same record is currently playing, toggle pause
    if (this.activeId === record.id && this.status === "PLAYING") {
      this.audio.pause();
      return;
    }

    // 2. If same record is paused, resume
    if (this.activeId === record.id && (this.status === "PAUSED" || this.status === "ENDED")) {
      try {
        await this.audio.play();
      } catch (err) {
        console.error("Voice Roots audio resume error:", { recordingId: record.id, error: err });
        this.status = "ERROR";
        this.notify();
      }
      return;
    }

    // 3. Stop previous audio
    this.audio.pause();
    this.audio.currentTime = 0;
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    this.activeId = record.id;
    this.status = "LOADING";
    this.error = undefined;
    this.notify();

    let resolvedUrl: string | null = null;

    // 4. Resolve exact audio URL based on user-uploaded vs static heritage recording
    if (record.isUserUploaded) {
      try {
        const blob = await getRecordingAudio(record.id);
        if (blob && blob.size > 0) {
          resolvedUrl = URL.createObjectURL(blob);
          this.currentObjectUrl = resolvedUrl;
        }
      } catch (err) {
        console.warn("Could not retrieve user audio from IndexedDB:", err);
      }
    }

    if (!resolvedUrl && record.audioUrl) {
      resolvedUrl = record.audioUrl;
    }

    // 5. If audio does not exist, explicitly mark UNAVAILABLE
    if (!resolvedUrl) {
      this.status = "UNAVAILABLE";
      this.error = "Audio has not been uploaded for this heritage record.";
      this.notify();
      return;
    }

    try {
      this.audio.src = resolvedUrl;
      this.audio.load();
      await this.audio.play();
    } catch (err: any) {
      console.error("Voice Roots audio playback error:", {
        recordingId: record.id,
        audioUrl: resolvedUrl,
        error: err?.message || err,
      });
      this.status = "ERROR";
      this.error = "Unable to play this recording. Please try again.";
      this.notify();
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.activeId = null;
      this.status = "IDLE";
      this.notify();
    }
  }
}

export const cardAudioPlayer = typeof window !== "undefined" ? new CardAudioPlayerManager() : (null as any);
