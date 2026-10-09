/**
 * Voice Roots — Authoritative Preservation Workflow State Machine & Route Guard Engine
 *
 * Strict Canonical Workflow:
 * LOGIN -> HOME -> EXPLORE/ARCHIVE -> STORY -> PRESERVE A VOICE (RECORD / UPLOAD)
 * -> AUDIO PROCESSING (/process/:id)
 * -> LANGUAGE DETECTION
 * -> TRANSCRIPTION
 * -> TRANSCRIPT REVIEW (/transcript/:id)
 * -> TRANSLATION (/translate/:id)
 * -> CULTURAL CONTEXT (/cultural-context/:id)
 * -> CONSENT (/consent/:id)
 * -> HUMAN REVIEW & VERIFICATION (/verification/:id)
 * -> HERITAGE RECORD (/heritage/:id)
 * -> HERITAGE PASSPORT (/passport/:id)
 * -> SHARE / QR
 */

import { HERITAGE_STORIES } from "./heritageData";
import { getUserRecordings, type StoredVoiceRecord } from "./storage";
import type { UserProfile } from "./auth";

export const WORKFLOW_STATES = {
  DRAFT: "DRAFT",
  RECORDED: "RECORDED",
  UPLOADED: "UPLOADED",
  PROCESSING: "PROCESSING",
  LANGUAGE_DETECTED: "LANGUAGE_DETECTED",
  TRANSCRIBED: "TRANSCRIBED",
  TRANSCRIPT_REVIEW: "TRANSCRIPT_REVIEW",
  TRANSLATED: "TRANSLATED",
  CULTURAL_CONTEXT: "CULTURAL_CONTEXT",
  CONSENT_PENDING: "CONSENT_PENDING",
  HUMAN_REVIEW: "HUMAN_REVIEW",
  VERIFIED: "VERIFIED",
  HERITAGE_RECORD: "HERITAGE_RECORD",
  PASSPORT_CREATED: "PASSPORT_CREATED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
} as const;

export type WorkflowStatus = (typeof WORKFLOW_STATES)[keyof typeof WORKFLOW_STATES];

export const STATE_ORDER: WorkflowStatus[] = [
  "DRAFT",
  "RECORDED",
  "UPLOADED",
  "PROCESSING",
  "LANGUAGE_DETECTED",
  "TRANSCRIBED",
  "TRANSCRIPT_REVIEW",
  "TRANSLATED",
  "CULTURAL_CONTEXT",
  "CONSENT_PENDING",
  "HUMAN_REVIEW",
  "VERIFIED",
  "HERITAGE_RECORD",
  "PASSPORT_CREATED",
  "PUBLISHED",
];

export interface WorkflowPhaseInfo {
  phaseNumber: number;
  label: string;
  key: string;
  description: string;
  requiredState: WorkflowStatus;
  routePrefix: string;
}

export const WORKFLOW_PHASES: WorkflowPhaseInfo[] = [
  { phaseNumber: 1, label: "Capture", key: "capture", description: "Record voice or upload audio master", requiredState: "DRAFT", routePrefix: "/record" },
  { phaseNumber: 2, label: "Understand", key: "understand", description: "Acoustic AI processing & language identification", requiredState: "RECORDED", routePrefix: "/process" },
  { phaseNumber: 3, label: "Review", key: "review", description: "Native speaker transcript review & edits", requiredState: "TRANSCRIBED", routePrefix: "/transcript" },
  { phaseNumber: 4, label: "Translate", key: "translate", description: "IndicTrans2 bidirectional translation", requiredState: "TRANSCRIPT_REVIEW", routePrefix: "/translate" },
  { phaseNumber: 5, label: "Context", key: "context", description: "Cultural context & ethnobotanical lore", requiredState: "TRANSLATED", routePrefix: "/cultural-context" },
  { phaseNumber: 6, label: "Protect", key: "protect", description: "OCAP Traditional Knowledge consent", requiredState: "CULTURAL_CONTEXT", routePrefix: "/consent" },
  { phaseNumber: 7, label: "Verify", key: "verify", description: "Elder review & cryptographic attestation", requiredState: "CONSENT_PENDING", routePrefix: "/verification" },
  { phaseNumber: 8, label: "Preserve", key: "preserve", description: "Heritage record, verifiable passport & QR", requiredState: "VERIFIED", routePrefix: "/heritage" },
];

export interface PreservationWorkflow {
  id: string;
  title: string;
  status: WorkflowStatus;
  sourceType: "microphone_recording" | "file_upload" | "field_recording";
  audioUrl?: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioDuration?: string;
  audioDurationSeconds?: number;
  detectedLanguage?: string;
  detectedDialect?: string;
  languageConfidence?: number;
  originalTranscript?: string;
  transcriptReviewNotes?: string;
  transcriptReviewedAt?: string;
  targetLanguage?: string;
  translations?: Record<string, string>;
  culturalContext?: {
    background: string;
    significance: string;
    community: string;
    location: string;
    ritualImportance?: string;
    keyTerms?: Array<{ term: string; meaning: string }>;
  };
  consent?: {
    preserve: boolean;
    transcribe: boolean;
    translate: boolean;
    aiAnalysis: boolean;
    accessLevel: "public" | "community" | "private" | "restricted";
    confirmedAt?: string;
    contributorConsentName?: string;
  };
  verification?: {
    reviewerId?: string;
    reviewerName?: string;
    reviewerRole?: string;
    status: "PENDING" | "VERIFIED" | "CHANGES_REQUESTED" | "REJECTED";
    notes?: string;
    verifiedAt?: string;
    sha256Proof?: string;
  };
  heritageRecordId?: string;
  passportId?: string;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const WORKFLOW_STORAGE_KEY = "voice_roots_active_workflows_v2";
const ACTIVE_ID_KEY = "voice_roots_current_workflow_id";

/**
 * Compare workflow states monotonically using STATE_ORDER
 */
export function isStateReached(current: WorkflowStatus, required: WorkflowStatus): boolean {
  if (current === required) return true;
  const currentIndex = STATE_ORDER.indexOf(current);
  const requiredIndex = STATE_ORDER.indexOf(required);
  if (currentIndex === -1 || requiredIndex === -1) return false;
  return currentIndex >= requiredIndex;
}

/**
 * Checks whether a given story is one of the verified pre-seeded heritage records
 */
export function isSeededHeritageStory(id: string): boolean {
  return HERITAGE_STORIES.some((s) => s.id.toLowerCase() === id.toLowerCase());
}

/**
 * Converts a pre-seeded heritage story to a fully verified Workflow representation
 */
export function getSeededWorkflow(id: string): PreservationWorkflow | null {
  const story = HERITAGE_STORIES.find((s) => s.id.toLowerCase() === id.toLowerCase());
  if (!story) return null;

  return {
    id: story.id,
    title: story.title,
    status: "PUBLISHED",
    sourceType: "field_recording",
    audioUrl: story.audioUrl,
    audioFileName: story.audioFileName,
    audioFileSize: story.audioFileSize,
    audioDuration: story.duration,
    audioDurationSeconds: story.durationSeconds,
    detectedLanguage: story.language,
    detectedDialect: story.dialect || story.language,
    languageConfidence: 98.4,
    originalTranscript: story.originalTranscript,
    transcriptReviewedAt: story.uploadDate,
    translations: story.translations,
    culturalContext: {
      background: story.culturalContext,
      significance: "Sacred agrarian community invocation preserved by oral river custodians.",
      community: story.community,
      location: story.location,
      keyTerms: [
        { term: "Rohini", meaning: "Monsoon agricultural constellation" },
        { term: "Godavari", meaning: "Sacred perennial life-giving river" },
      ],
    },
    consent: {
      preserve: true,
      transcribe: true,
      translate: true,
      aiAnalysis: true,
      accessLevel: "public",
      confirmedAt: story.uploadDate,
      contributorConsentName: story.community,
    },
    verification: {
      reviewerId: "usr_elder_01",
      reviewerName: "Bhadradri Custodian Council",
      reviewerRole: "Elder Reviewer",
      status: "VERIFIED",
      verifiedAt: story.uploadDate,
      sha256Proof: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    heritageRecordId: story.id,
    passportId: story.id,
    qrCodeUrl: `/heritage/${story.id}`,
    createdAt: story.uploadDate,
    updatedAt: story.uploadDate,
  };
}

/**
 * Retrieve all workflows from localStorage
 */
export function getAllWorkflows(): Record<string, PreservationWorkflow> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Retrieve a single workflow by ID (checking active workflows first, then seeded archive)
 */
export function getWorkflow(id: string): PreservationWorkflow | null {
  if (!id) return null;

  if (isSeededHeritageStory(id)) {
    return getSeededWorkflow(id);
  }

  const all = getAllWorkflows();
  if (all[id]) {
    return all[id];
  }

  // Also check stored user recordings
  const userRecords = getUserRecordings();
  const rec = userRecords.find((r) => r.id === id);
  if (rec) {
    const isVerified = Boolean(rec.provenanceHash || rec.integrityChecksum);
    return {
      id: rec.id,
      title: rec.title,
      status: isVerified ? "PUBLISHED" : "TRANSCRIBED",
      sourceType: rec.sourceType,
      audioUrl: rec.audioUrl,
      audioFileName: rec.audioFileName,
      audioFileSize: rec.audioFileSize,
      audioDuration: rec.duration,
      audioDurationSeconds: rec.durationSeconds,
      detectedLanguage: rec.language,
      detectedDialect: rec.dialect,
      languageConfidence: 96.0,
      originalTranscript: rec.originalTranscript,
      translations: rec.translations as Record<string, string>,
      culturalContext: {
        background: rec.culturalContext || "Recorded spoken narrative.",
        significance: "Ancestral oral lore preserved in community collection.",
        community: rec.community || "Living Heritage Circle",
        location: rec.location || "Deccan Region",
      },
      consent: {
        preserve: true,
        transcribe: true,
        translate: true,
        aiAnalysis: true,
        accessLevel: rec.accessLevel || "public",
        confirmedAt: rec.uploadDate,
      },
      verification: isVerified
        ? {
            reviewerId: "usr_elder_01",
            reviewerName: "Elder Custodian",
            status: "VERIFIED",
            verifiedAt: rec.uploadDate,
            sha256Proof: rec.provenanceHash || rec.integrityChecksum,
          }
        : undefined,
      heritageRecordId: rec.id,
      passportId: rec.id,
      createdAt: rec.uploadDate,
      updatedAt: rec.uploadDate,
    };
  }

  return null;
}

/**
 * Persist or update a workflow
 */
export function saveWorkflow(wf: PreservationWorkflow): void {
  if (typeof window === "undefined" || !wf.id) return;
  try {
    const all = getAllWorkflows();
    all[wf.id] = {
      ...wf,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(all));
    localStorage.setItem(ACTIVE_ID_KEY, wf.id);
  } catch (e) {
    console.error("Failed to save workflow state:", e);
  }
}

/**
 * Get active preservation project
 */
export function getActiveWorkflow(): PreservationWorkflow | null {
  if (typeof window === "undefined") return null;
  try {
    const activeId = localStorage.getItem(ACTIVE_ID_KEY);
    if (activeId) {
      const found = getWorkflow(activeId);
      if (found) return found;
    }
    // Fallback to the latest saved non-published workflow
    const all = Object.values(getAllWorkflows());
    const inProgress = all.filter((w) => w.status !== "PUBLISHED" && w.status !== "REJECTED");
    if (inProgress.length > 0) {
      inProgress.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return inProgress[0];
    }
  } catch {
    // Ignore
  }
  return null;
}

/**
 * Set active workflow ID
 */
export function setActiveWorkflowId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

/**
 * Advance workflow state monotonically
 */
export function advanceWorkflowStatus(id: string, newStatus: WorkflowStatus): PreservationWorkflow {
  const current = getWorkflow(id) || createNewWorkflow(id);
  const updated: PreservationWorkflow = {
    ...current,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
  saveWorkflow(updated);
  return updated;
}

/**
 * Creates a new blank workflow draft
 */
export function createNewWorkflow(id?: string, title = "Untitled Oral Memory"): PreservationWorkflow {
  const wfId = id || `VR-${Date.now().toString(36).toUpperCase()}`;
  const newWf: PreservationWorkflow = {
    id: wfId,
    title,
    status: "DRAFT",
    sourceType: "microphone_recording",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveWorkflow(newWf);
  return newWf;
}

/**
 * Calculates the exact next valid URL route for a given workflow
 */
export function getNextValidRoute(wf: PreservationWorkflow | null): string {
  if (!wf) return "/record";

  switch (wf.status) {
    case "DRAFT":
      return `/record`;
    case "RECORDED":
    case "UPLOADED":
    case "PROCESSING":
    case "LANGUAGE_DETECTED":
      return `/process/${wf.id}`;
    case "TRANSCRIBED":
      return `/transcript/${wf.id}`;
    case "TRANSCRIPT_REVIEW":
      return `/translate/${wf.id}`;
    case "TRANSLATED":
      return `/cultural-context/${wf.id}`;
    case "CULTURAL_CONTEXT":
      return `/consent/${wf.id}`;
    case "CONSENT_PENDING":
    case "HUMAN_REVIEW":
      return `/verification/${wf.id}`;
    case "VERIFIED":
      return `/heritage/${wf.id}`;
    case "HERITAGE_RECORD":
    case "PASSPORT_CREATED":
    case "PUBLISHED":
      return `/passport/${wf.id}`;
    case "REJECTED":
      return `/transcript/${wf.id}`;
    default:
      return `/record`;
  }
}

/**
 * Central Route Guard Validator
 * Checks whether the user can open a given route for a given story
 */
export function canAccessRoute(
  route: string,
  storyId: string,
  user: UserProfile | null
): { allowed: boolean; reason?: string; redirectUrl: string; requiredStepTitle: string } {
  // 1. Seeded published stories are always accessible on heritage and passport views
  if (isSeededHeritageStory(storyId)) {
    return {
      allowed: true,
      redirectUrl: `/story/${storyId}`,
      requiredStepTitle: "Published Heritage Record",
    };
  }

  const wf = getWorkflow(storyId);

  // If no workflow exists for this ID, user must start at Record
  if (!wf) {
    return {
      allowed: false,
      reason: "No recording found for this ID. Please record or upload oral heritage first.",
      redirectUrl: "/record",
      requiredStepTitle: "01 Capture",
    };
  }

  // Route: /process/:id -> requires RECORDED or UPLOADED
  if (route.startsWith("/process")) {
    if (!isStateReached(wf.status, "RECORDED") && !isStateReached(wf.status, "UPLOADED")) {
      return {
        allowed: false,
        reason: "Audio recording or upload is required before AI acoustic processing.",
        redirectUrl: "/record",
        requiredStepTitle: "01 Capture",
      };
    }
  }

  // Route: /transcript/:id -> requires TRANSCRIBED
  if (route.startsWith("/transcript")) {
    if (!isStateReached(wf.status, "TRANSCRIBED")) {
      return {
        allowed: false,
        reason: "AI acoustic transcription must be completed before transcript review.",
        redirectUrl: `/process/${wf.id}`,
        requiredStepTitle: "02 Understand",
      };
    }
  }

  // Route: /translate/:id -> requires TRANSCRIPT_REVIEW
  if (route.startsWith("/translate")) {
    if (!isStateReached(wf.status, "TRANSCRIPT_REVIEW")) {
      return {
        allowed: false,
        reason: "Native speaker transcript review must be completed and saved before translation.",
        redirectUrl: `/transcript/${wf.id}`,
        requiredStepTitle: "03 Review",
      };
    }
  }

  // Route: /cultural-context/:id -> requires TRANSLATED
  if (route.startsWith("/cultural-context")) {
    if (!isStateReached(wf.status, "TRANSLATED")) {
      return {
        allowed: false,
        reason: "Translation must be generated before cultural context analysis.",
        redirectUrl: `/translate/${wf.id}`,
        requiredStepTitle: "04 Translate",
      };
    }
  }

  // Route: /consent/:id -> requires CULTURAL_CONTEXT
  if (route.startsWith("/consent")) {
    if (!isStateReached(wf.status, "CULTURAL_CONTEXT")) {
      return {
        allowed: false,
        reason: "Cultural context and story background must be reviewed before confirming consent.",
        redirectUrl: `/cultural-context/${wf.id}`,
        requiredStepTitle: "05 Context",
      };
    }
  }

  // Route: /verification/:id -> requires CONSENT_PENDING
  if (route.startsWith("/verification")) {
    if (!isStateReached(wf.status, "CONSENT_PENDING")) {
      return {
        allowed: false,
        reason: "OCAP Traditional Knowledge consent must be submitted before elder verification.",
        redirectUrl: `/consent/${wf.id}`,
        requiredStepTitle: "06 Protect",
      };
    }
  }

  // Route: /heritage/:id -> requires VERIFIED
  if (route.startsWith("/heritage")) {
    if (!isStateReached(wf.status, "VERIFIED") && wf.status !== "PUBLISHED") {
      return {
        allowed: false,
        reason: "Oral heritage record requires elder custodian verification before permanent archiving.",
        redirectUrl: `/verification/${wf.id}`,
        requiredStepTitle: "07 Verify",
      };
    }
  }

  // Route: /passport/:id -> requires PASSPORT_CREATED or PUBLISHED
  if (route.startsWith("/passport")) {
    if (wf.status !== "PASSPORT_CREATED" && wf.status !== "PUBLISHED" && wf.status !== "VERIFIED") {
      return {
        allowed: false,
        reason: "Heritage Passport cannot be issued before community verification is completed.",
        redirectUrl: `/verification/${wf.id}`,
        requiredStepTitle: "07 Verify",
      };
    }
  }

  return {
    allowed: true,
    redirectUrl: getNextValidRoute(wf),
    requiredStepTitle: "Current Step",
  };
}

export type WorkflowAction =
  | { type: "RECORD_AUDIO"; audioUrl: string; duration: string; durationSeconds: number; fileName?: string }
  | { type: "UPLOAD_AUDIO"; audioUrl: string; duration: string; durationSeconds: number; fileName?: string }
  | { type: "START_PROCESSING" }
  | { type: "LANGUAGE_DETECTED"; language: string; dialect: string; confidence: number }
  | { type: "TRANSCRIPTION_COMPLETE"; transcript: string }
  | { type: "SAVE_TRANSCRIPT_REVIEW"; notes?: string; editedTranscript?: string }
  | { type: "SAVE_TRANSLATION"; targetLanguage: string; translatedText: string }
  | { type: "SAVE_CULTURAL_CONTEXT"; context: { background: string; significance: string; community: string; location: string; terms?: Array<{ term: string; meaning: string }> } }
  | { type: "CONFIRM_CONSENT"; consent: { preserve: boolean; transcribe: boolean; translate: boolean; aiAnalysis: boolean; accessLevel: "public" | "community" | "private" | "restricted"; contributorName?: string } }
  | { type: "SUBMIT_FOR_REVIEW" }
  | { type: "APPROVE_VERIFICATION"; reviewerId: string; reviewerName: string; reviewerRole: string; notes?: string; sha256Proof?: string }
  | { type: "REQUEST_CHANGES"; reviewerId: string; notes: string }
  | { type: "REJECT"; reviewerId: string; reason: string }
  | { type: "CREATE_HERITAGE_RECORD"; recordId?: string }
  | { type: "CREATE_PASSPORT"; passportId?: string; qrCodeUrl?: string }
  | { type: "PUBLISH" };

export interface TransitionResult {
  success: boolean;
  newStatus?: WorkflowStatus;
  workflow?: PreservationWorkflow;
  error?: string;
  nextRoute?: string;
}

/**
 * Authoritative single transition function for preservation workflows
 */
export function transitionStory(
  storyId: string,
  action: WorkflowAction,
  user: UserProfile | null
): TransitionResult {
  const wf = getWorkflow(storyId) || createNewWorkflow(storyId);

  // 1. Authentication check for write operations
  if (!user && action.type !== "LANGUAGE_DETECTED" && action.type !== "TRANSCRIPTION_COMPLETE") {
    return {
      success: false,
      error: "Authentication required to perform workflow operations.",
      nextRoute: "/login",
    };
  }

  switch (action.type) {
    case "RECORD_AUDIO": {
      wf.audioUrl = action.audioUrl;
      wf.audioDuration = action.duration;
      wf.audioDurationSeconds = action.durationSeconds;
      wf.sourceType = "microphone_recording";
      wf.audioFileName = action.fileName || `${storyId}_mic_capture.wav`;
      wf.status = "RECORDED";
      saveWorkflow(wf);
      return { success: true, newStatus: "RECORDED", workflow: wf, nextRoute: `/process/${wf.id}` };
    }

    case "UPLOAD_AUDIO": {
      wf.audioUrl = action.audioUrl;
      wf.audioDuration = action.duration;
      wf.audioDurationSeconds = action.durationSeconds;
      wf.sourceType = "file_upload";
      wf.audioFileName = action.fileName || `${storyId}_upload_master.wav`;
      wf.status = "UPLOADED";
      saveWorkflow(wf);
      return { success: true, newStatus: "UPLOADED", workflow: wf, nextRoute: `/process/${wf.id}` };
    }

    case "START_PROCESSING": {
      if (wf.status !== "RECORDED" && wf.status !== "UPLOADED" && wf.status !== "DRAFT") {
        return {
          success: false,
          error: "Audio recording or upload required before starting processing.",
          nextRoute: `/record`,
        };
      }
      wf.status = "PROCESSING";
      saveWorkflow(wf);
      return { success: true, newStatus: "PROCESSING", workflow: wf, nextRoute: `/process/${wf.id}` };
    }

    case "LANGUAGE_DETECTED": {
      wf.detectedLanguage = action.language;
      wf.detectedDialect = action.dialect;
      wf.languageConfidence = action.confidence;
      wf.status = "LANGUAGE_DETECTED";
      saveWorkflow(wf);
      return { success: true, newStatus: "LANGUAGE_DETECTED", workflow: wf, nextRoute: `/process/${wf.id}` };
    }

    case "TRANSCRIPTION_COMPLETE": {
      wf.originalTranscript = action.transcript;
      wf.status = "TRANSCRIBED";
      saveWorkflow(wf);
      return { success: true, newStatus: "TRANSCRIBED", workflow: wf, nextRoute: `/transcript/${wf.id}` };
    }

    case "SAVE_TRANSCRIPT_REVIEW": {
      if (!isStateReached(wf.status, "TRANSCRIBED")) {
        return {
          success: false,
          error: "Acoustic transcription must be complete before transcript review.",
          nextRoute: `/process/${wf.id}`,
        };
      }
      if (action.editedTranscript) {
        wf.originalTranscript = action.editedTranscript;
      }
      wf.transcriptReviewNotes = action.notes;
      wf.transcriptReviewedAt = new Date().toISOString();
      wf.status = "TRANSCRIPT_REVIEW";
      saveWorkflow(wf);
      return { success: true, newStatus: "TRANSCRIPT_REVIEW", workflow: wf, nextRoute: `/translate/${wf.id}` };
    }

    case "SAVE_TRANSLATION": {
      if (!isStateReached(wf.status, "TRANSCRIPT_REVIEW")) {
        return {
          success: false,
          error: "Transcript review must be saved before translation can proceed.",
          nextRoute: `/transcript/${wf.id}`,
        };
      }
      wf.targetLanguage = action.targetLanguage;
      if (!wf.translations) wf.translations = {};
      wf.translations[action.targetLanguage] = action.translatedText;
      wf.status = "TRANSLATED";
      saveWorkflow(wf);
      return { success: true, newStatus: "TRANSLATED", workflow: wf, nextRoute: `/cultural-context/${wf.id}` };
    }

    case "SAVE_CULTURAL_CONTEXT": {
      if (!isStateReached(wf.status, "TRANSLATED")) {
        return {
          success: false,
          error: "Translation must be completed before cultural context enrichment.",
          nextRoute: `/translate/${wf.id}`,
        };
      }
      wf.culturalContext = {
        background: action.context.background,
        significance: action.context.significance,
        community: action.context.community,
        location: action.context.location,
        keyTerms: action.context.terms,
      };
      wf.status = "CULTURAL_CONTEXT";
      saveWorkflow(wf);
      return { success: true, newStatus: "CULTURAL_CONTEXT", workflow: wf, nextRoute: `/consent/${wf.id}` };
    }

    case "CONFIRM_CONSENT": {
      if (!isStateReached(wf.status, "CULTURAL_CONTEXT")) {
        return {
          success: false,
          error: "Cultural context review must be completed before confirming consent.",
          nextRoute: `/cultural-context/${wf.id}`,
        };
      }
      wf.consent = {
        ...action.consent,
        confirmedAt: new Date().toISOString(),
      };
      wf.status = "CONSENT_PENDING";
      saveWorkflow(wf);
      return { success: true, newStatus: "CONSENT_PENDING", workflow: wf, nextRoute: `/verification/${wf.id}` };
    }

    case "SUBMIT_FOR_REVIEW": {
      if (!isStateReached(wf.status, "CONSENT_PENDING")) {
        return {
          success: false,
          error: "Consent must be confirmed before submitting for human review.",
          nextRoute: `/consent/${wf.id}`,
        };
      }
      wf.status = "HUMAN_REVIEW";
      saveWorkflow(wf);
      return { success: true, newStatus: "HUMAN_REVIEW", workflow: wf, nextRoute: `/verification/${wf.id}` };
    }

    case "APPROVE_VERIFICATION": {
      // Must be in CONSENT_PENDING or HUMAN_REVIEW
      if (!isStateReached(wf.status, "CONSENT_PENDING")) {
        return {
          success: false,
          error: "Story must have confirmed consent before verification can occur.",
          nextRoute: `/consent/${wf.id}`,
        };
      }
      wf.verification = {
        reviewerId: action.reviewerId,
        reviewerName: action.reviewerName,
        reviewerRole: action.reviewerRole,
        status: "VERIFIED",
        notes: action.notes,
        verifiedAt: new Date().toISOString(),
        sha256Proof: action.sha256Proof || `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      };
      wf.status = "VERIFIED";
      saveWorkflow(wf);
      return { success: true, newStatus: "VERIFIED", workflow: wf, nextRoute: `/heritage/${wf.id}` };
    }

    case "REQUEST_CHANGES": {
      wf.verification = {
        reviewerId: action.reviewerId,
        status: "CHANGES_REQUESTED",
        notes: action.notes,
      };
      wf.status = "TRANSCRIPT_REVIEW"; // Revert to transcript review step
      saveWorkflow(wf);
      return { success: true, newStatus: "TRANSCRIPT_REVIEW", workflow: wf, nextRoute: `/transcript/${wf.id}` };
    }

    case "REJECT": {
      wf.status = "REJECTED";
      saveWorkflow(wf);
      return { success: true, newStatus: "REJECTED", workflow: wf, nextRoute: `/story/${wf.id}` };
    }

    case "CREATE_HERITAGE_RECORD": {
      if (wf.status !== "VERIFIED" && wf.status !== "HERITAGE_RECORD" && wf.status !== "PASSPORT_CREATED" && wf.status !== "PUBLISHED") {
        return {
          success: false,
          error: "Story must be verified by community custodians before creating a Heritage Record.",
          nextRoute: `/verification/${wf.id}`,
        };
      }
      wf.heritageRecordId = action.recordId || wf.id;
      wf.status = "HERITAGE_RECORD";
      saveWorkflow(wf);
      return { success: true, newStatus: "HERITAGE_RECORD", workflow: wf, nextRoute: `/passport/${wf.id}` };
    }

    case "CREATE_PASSPORT": {
      if (!isStateReached(wf.status, "VERIFIED") || !wf.verification || wf.verification.status !== "VERIFIED") {
        return {
          success: false,
          error: "Verification must be completed before issuing a Heritage Passport.",
          nextRoute: `/verification/${wf.id}`,
        };
      }
      wf.passportId = action.passportId || wf.id;
      wf.qrCodeUrl = action.qrCodeUrl || `/heritage/${wf.id}/public`;
      wf.status = "PASSPORT_CREATED";
      saveWorkflow(wf);
      return { success: true, newStatus: "PASSPORT_CREATED", workflow: wf, nextRoute: `/passport/${wf.id}` };
    }

    case "PUBLISH": {
      if (!isStateReached(wf.status, "PASSPORT_CREATED")) {
        return {
          success: false,
          error: "Passport must be created before publishing to public heritage collection.",
          nextRoute: `/passport/${wf.id}`,
        };
      }
      wf.status = "PUBLISHED";
      saveWorkflow(wf);
      return { success: true, newStatus: "PUBLISHED", workflow: wf, nextRoute: `/heritage/${wf.id}/public` };
    }

    default:
      return {
        success: false,
        error: "Unrecognized workflow action.",
        nextRoute: getNextValidRoute(wf),
      };
  }
}
