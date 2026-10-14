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

// Existing types for reference (exported elsewhere)

