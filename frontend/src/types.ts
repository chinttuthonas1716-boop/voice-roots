// Pilot testing TypeScript interfaces

export interface PilotSubmissionCreate {
  transcript_id: number;
  tester_name: string;
  consent: boolean;
  notes?: string;
}

export interface PilotSubmissionResponse {
  id: number;
  transcript_id: number;
  tester_name: string;
  consent: number; // stored as INTEGER (0/1)
  notes?: string;
  withdrawn: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface PilotReviewCreate {
  submission_id: number;
  reviewer_name: string;
  approval: number; // 0 or 1
  uncertainty?: string;
  corrected_transcript?: string;
  corrected_translation?: string;
  review_notes?: string;
}

export interface PilotReviewResponse {
  id: number;
  submission_id: number;
  reviewer_name: string;
  approval: number;
  uncertainty?: string;
  corrected_transcript?: string;
  corrected_translation?: string;
  review_notes?: string;
  reviewed_at: string;
}

export interface PilotMetricCreate {
  language: string;
  dialect?: string;
  model: string;
  sample_size: number;
  wer?: number;
  cer?: number;
  bleu?: number;
  evaluation_date: string; // ISO date string
}

export interface PilotMetricResponse {
  id: number;
  language: string;
  dialect?: string;
  model: string;
  sample_size: number;
  wer?: number;
  cer?: number;
  bleu?: number;
  evaluation_date: string;
}

// Milestone 8: Contributor Portal & Human Verification interfaces

export type VerificationStatus =
  | 'draft'
  | 'submitted'
  | 'awaiting_review'
  | 'under_review'
  | 'changes_requested'
  | 'corrected'
  | 'verified'
  | 'published'
  | 'withdrawn_or_rejected';

export type ReviewerRole =
  | 'community_elder'
  | 'native_speaker_reviewer'
  | 'linguist'
  | 'moderator'
  | 'elder'
  | 'admin';

export type ReviewerUncertainty =
  | 'low'
  | 'medium'
  | 'high'
  | 'unclear_audio'
  | 'unknown_dialect';

export interface ContributionSubmission {
  id: number;
  uuid_id: string;
  title: string;
  audio_filename: string;
  audio_url: string;
  language: string;
  dialect?: string | null;
  transcript_text: string;
  machine_transcript_text?: string;
  status: string;
  duration_seconds?: number;
  created_at: string;
  updated_at: string;
  contributor_name?: string;
  contributor_role?: string;
  provenance_notes?: string;
  transliteration_text?: string;
  license?: string;
  privacy_level?: string;
  retention_policy?: string;
  verification_status: VerificationStatus;
  consent_private_storage: number;
  consent_community_access: number;
  consent_public_publication: number;
  consent_ai_training: number;
  is_anonymous: number;
  contextual_notes?: string | null;
  reviewer_uncertainty?: ReviewerUncertainty | null;
  verified_by?: string | null;
  verified_at?: string | null;
  review_notes?: string | null;
}

export interface ContributionDraftUpdateRequest {
  title?: string;
  dialect?: string;
  contextual_notes?: string;
  transcript_text?: string;
  transliteration_text?: string;
  submit?: boolean;
}

export interface VerificationReviewRequest {
  reviewer_name: string;
  reviewer_role: ReviewerRole;
  decision: 'verified' | 'changes_requested' | 'corrected' | 'withdrawn_or_rejected';
  corrected_transcript?: string;
  corrected_translation?: string;
  reviewer_uncertainty?: ReviewerUncertainty;
  review_notes?: string;
  admin_key?: string;
}

export interface VerificationHistoryRevision {
  id: number;
  target_type: string;
  target_id: number;
  version_number: number;
  previous_text: string;
  suggested_text: string;
  contributor_name: string;
  contributor_role: string;
  rationale?: string;
  status: string;
  consent_confirmed: number;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  reviewer_uncertainty?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationHistoryResponse {
  transcript_id: number;
  title: string;
  machine_transcript_text: string;
  current_transcript_text: string;
  verification_status: VerificationStatus;
  reviewer_uncertainty?: string;
  verified_by?: string;
  verified_at?: string;
  review_notes?: string;
  revisions: VerificationHistoryRevision[];
}
