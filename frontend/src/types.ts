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

// Milestone 10: Research Datasets, Digital Preservation & Model Evaluation

export interface DatasetSummary {
  id: string;
  name: string;
  title: string;
  version: string;
  status: string;
  release_date: string;
  license: string;
  languages_count: number;
  total_records?: number;
  maintainer: string;
}

export interface DatasetCard extends DatasetSummary {
  description: string;
  license_details?: Array<{ license: string; attribution_required: boolean; commercial_use: boolean }>;
  provenance: {
    primary_sources: Array<{ name: string; url?: string; license?: string; type?: string }>;
    curation_method: string;
    consent_protocol: string;
  };
  languages: Array<{ code: string; name: string; family?: string; dialect?: string; sample_count?: number }>;
  file_formats: string[];
  preprocessing_steps: string[];
  known_gaps_and_limitations: string[];
  quality_control: {
    human_verified_count?: number;
    community_verified_count?: number;
    qc_protocol: string;
  };
  responsible_maintainer: string;
}

export interface DatasetIntegrityReport {
  status: string;
  dataset_id: string;
  total_items_checked: number;
  intact_items: number;
  missing_items: number;
  corrupt_items: number;
  bit_level_health_percent: number;
  scan_duration_ms: number;
  timestamp: string;
  integrity_summary: string;
  details_sample?: Array<{
    id?: number;
    filename?: string;
    title?: string;
    status: 'intact' | 'missing' | 'corrupt';
    sha256?: string;
    expected_sha256?: string;
    actual_sha256?: string;
    size_bytes?: number;
    error?: string;
  }>;
}

export interface PreservationStatusResponse {
  status: string;
  preservation_architecture: {
    master_recording_policy: string;
    preservation_format: string;
    database_engine: string;
    search_vector_store: string;
    storage_cost: string;
    recommended_cold_storage_tier: string;
  };
  backup_telemetry: {
    total_backup_snapshots: number;
    latest_snapshot_file: string | null;
    latest_snapshot_size_bytes: number;
    backup_directory: string;
  };
  audio_storage_telemetry: {
    total_master_recordings: number;
    total_audio_bytes: number;
    storage_directory: string;
  };
  restoration_drill: {
    restoration_drill_status: string;
    tested_tables: string[];
    record_counts: Record<string, number>;
    error: string | null;
  };
  timestamp: string;
}

export interface ResearchEvaluationReport {
  report_id: string;
  title: string;
  status: string;
  generated_at: string;
  total_evaluation_duration_ms: number;
  methodology: {
    speech_metric_standards: string;
    translation_metric_standards: string;
    search_metric_standards: string;
    split_assignment: string;
    data_leakage_mitigation: string;
  };
  speech_recognition: {
    evaluation_name: string;
    split_evaluated: string;
    total_requested: number;
    evaluated_sample_size: number;
    failed_transcriptions_count: number;
    failed_rate: number;
    empty_transcriptions_count: number;
    empty_rate: number;
    languages: Record<string, {
      sample_size: number;
      dialects_represented: string[];
      acoustic_conditions: string[];
      average_wer: number;
      wer_standard_error?: number | null;
      average_cer: number;
      cer_standard_error?: number | null;
      average_chrf: number;
      is_oral_language: boolean;
      metric_recommendation: string;
      sample_size_caveat: string;
    }>;
    performance_by_acoustic_condition: Record<string, {
      sample_size: number;
      average_wer: number;
      average_cer: number;
    }>;
    primary_model: string;
  };
  translation_guardrails: {
    evaluation_name: string;
    elder_review_guardrail_status: {
      tested_oral_cases: number;
      guardrail_violations: number;
      compliance_percent: number;
      protected_tongues: string[];
      rationale: string;
    };
    persistent_translations_telemetry: {
      total_stored_translations: number;
      human_verified_count: number;
      human_verified_percent: number;
    };
  };
  search_and_discovery: {
    mean_reciprocal_rank: number;
    precision_at_1: number;
    precision_at_3: number;
    benchmark_queries_count: number;
    avg_latency_ms: number;
    validated_languages: string[];
  };
  operating_cost_telemetry: {
    external_api_charges_usd: number;
    inference_mode: string;
    compute_platform: string;
  };
  ethical_disclosure: string;
}

// ─── Milestone 12: Voice Assistant Interfaces ───

export interface VoiceAssistantSessionSummary {
  session_id: string;
  source_language: string;
  target_language: string;
  user_name: string;
  turn_count: number;
  max_turns: number;
  created_at: string;
  last_active: string;
  is_active: boolean;
  ephemeral_mode: boolean;
  privacy_notice: string;
}

export interface VoiceAssistantTurn {
  turn_id: string;
  speaker: string;
  original_transcript: string;
  source_language: string;
  target_language: string;
  translated_text?: string;
  transliteration?: string;
  pronunciation_guidance?: {
    text?: string;
    language?: string;
    transliteration?: string;
    word_count?: number;
    syllables_breakdown?: Array<{
      word: string;
      syllable_count: number;
      phonetic_hint: string;
    }>;
    pronunciation_tips?: string[];
    synthesis_supported?: boolean;
    disclaimer?: string;
  };
  latency_ms: number;
  guardrail_triggered: boolean;
  timestamp: string;
}

export interface SavedConversationSummary {
  id: number;
  session_id: string;
  user_name: string;
  source_language: string;
  target_language: string;
  turn_count: number;
  created_at: string;
  updated_at: string;
  conversation_data?: {
    turns: VoiceAssistantTurn[];
  };
}

