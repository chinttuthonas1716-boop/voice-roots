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

// Milestone 14: Community Partnerships & Language Governance
export interface PartnerOrganization {
  id: number;
  slug: string;
  name: string;
  org_type: string;
  description?: string;
  website_url?: string;
  contact_email: string;
  lead_coordinator_name: string;
  target_languages: string[];
  verification_status: 'verified_partner' | 'pending_accreditation' | 'suspended';
  accreditation_notes?: string;
  created_at: string;
  updated_at: string;
  projects?: PartnershipProject[];
  reviewers?: ExpertReviewer[];
}

export interface PartnershipProject {
  id: number;
  org_id: number;
  project_name: string;
  slug: string;
  target_languages: string[];
  collection_goal?: string;
  license_policy: string;
  tk_labels: string[];
  status: 'active' | 'review_phase' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  org_name?: string;
  org_slug?: string;
}

export interface ExpertReviewer {
  id: number;
  reviewer_name: string;
  reviewer_role: string;
  org_id?: number;
  languages_qualified: string[];
  accreditation_status: 'accredited' | 'pending' | 'revoked';
  accredited_by?: string;
  accredited_at?: string;
  total_reviews_completed: number;
  created_at: string;
  updated_at: string;
  org_name?: string;
}

export interface ReviewAssignment {
  id: number;
  transcript_id: number;
  reviewer_id: number;
  assigned_by: string;
  project_id?: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'reassigned';
  due_date?: string;
  created_at: string;
  transcript_title?: string;
  transcript_language?: string;
  reviewer_name?: string;
  reviewer_role?: string;
}

export interface GovernanceDispute {
  id: number;
  target_type: string;
  target_id: number;
  dispute_type: string;
  filed_by_name: string;
  filed_by_role: string;
  description: string;
  suggested_resolution?: string;
  status: 'open' | 'under_elder_review' | 'resolved' | 'dismissed';
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GovernanceTelemetry {
  timestamp: string;
  partnerships_summary: {
    verified_partner_organizations: number;
    pending_accreditations: number;
    active_partnership_projects: number;
    accredited_expert_reviewers: number;
    completed_review_assignments: number;
  };
  disputes_and_appeals: {
    open_disputes: number;
    resolved_disputes: number;
    appeal_mechanism_active: boolean;
  };
  verified_language_preservation_records: Record<string, number>;
  ethical_principles: {
    non_competitive_reporting: string;
    attribution_preference: string;
    ocap_compliance: string;
  };
}

// ==============================================================================
// Milestone 16: Language Knowledge Graph Interfaces
// ==============================================================================

export type KGEntityType =
  | 'language'
  | 'variety'
  | 'script'
  | 'vocabulary'
  | 'phrase'
  | 'story'
  | 'transcript'
  | 'translation'
  | 'resource'
  | 'dataset';

export type KGRelationshipType =
  | 'LANGUAGE_HAS_VARIETY'
  | 'LANGUAGE_USES_SCRIPT'
  | 'WORD_BELONGS_TO_LANGUAGE'
  | 'WORD_HAS_MEANING'
  | 'WORD_TRANSLATED_AS'
  | 'STORY_RECORDED_IN_LANGUAGE'
  | 'STORY_HAS_TRANSCRIPT'
  | 'TRANSCRIPT_HAS_TRANSLATION'
  | 'RESOURCE_DOCUMENTS_LANGUAGE'
  | 'DATASET_CONTAINS_RECORDS';

export type KGVerificationStatus =
  | 'VERIFIED'
  | 'COMMUNITY_REVIEWED'
  | 'UNVERIFIED'
  | 'PROPOSED'
  | 'AI_GENERATED'
  | 'REJECTED';

export interface KGNode {
  node_id: string;
  entity_type: KGEntityType;
  name: string;
  native_name?: string | null;
  primary_language?: string | null;
  script?: string | null;
  category?: string | null;
  summary?: string | null;
  verification_status: KGVerificationStatus;
  source_reference?: string | null;
  source_organization?: string | null;
  source_url?: string | null;
  dataset_version?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface KGRelationship {
  id: number;
  source_id: string;
  target_id: string;
  relationship_type: KGRelationshipType;
  label?: string | null;
  verification_status: KGVerificationStatus;
  weight?: number;
  confidence_score?: number;
  provenance?: string | null;
  source_reference?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  source_name?: string;
  source_type?: string;
  source_native?: string;
  target_name?: string;
  target_type?: string;
  target_native?: string;
}

export interface KGVocabularyDetail {
  word_id: string;
  language_code: string;
  original_word: string;
  script?: string | null;
  transliteration?: string | null;
  meaning: string;
  grammatical_category?: string | null;
  cultural_context?: string | null;
  pronunciation_guide?: string | null;
  audio_transcript_id?: number | null;
  audio_url?: string | null;
  review_status: string;
}

export interface KGOverviewResponse {
  status: string;
  total_nodes: number;
  total_relationships: number;
  languages_represented: number;
  node_counts_by_type: Record<string, number>;
  relationship_counts_by_type: Record<string, number>;
  verification_status_counts: Record<string, number>;
  verified_ratio: number;
}

export interface KGSubgraphResponse {
  nodes: KGNode[];
  edges: KGRelationship[];
  total_nodes: number;
  total_edges: number;
}

export interface KGNodeDetailResponse {
  node: KGNode;
  vocabulary_details?: KGVocabularyDetail | null;
  outgoing_relationships: KGRelationship[];
  incoming_relationships: KGRelationship[];
  connected_edges_count: number;
}

// =========================================================================
// Milestone 17: Interactive Cultural and Oral History Archives Interfaces
// =========================================================================

export interface ArchiveCollection {
  collection_id: string;
  title: string;
  description?: string | null;
  primary_language: string;
  category: string;
  cover_image_url?: string | null;
  creator_organization_id?: string | null;
  creator_name: string;
  provenance_details?: string | null;
  access_classification: "PUBLIC" | "COMMUNITY_RESTRICTED" | "SACRED_ELDER_ONLY" | "RESEARCH_ONLY";
  traditional_knowledge_label?: string | null;
  created_at: string;
  updated_at: string;
  story_count?: number;
  stories?: CulturalStory[];
}

export interface CulturalStory {
  story_id: string;
  collection_id?: string | null;
  transcript_id?: number | null;
  title: string;
  native_title?: string | null;
  description?: string | null;
  primary_language: string;
  dialect_variety?: string | null;
  transliteration?: string | null;
  translation_text?: string | null;
  raw_transcript_text?: string | null;
  audio_reference?: string | null;
  audio_duration_seconds?: number;
  audio_sha256?: string | null;
  recording_date?: string | null;
  location_name?: string | null;
  contributor_name: string;
  attribution_preference: "BY_NAME" | "ANONYMOUS" | "COMMUNITY_CLAN";
  access_classification: "PUBLIC" | "COMMUNITY_RESTRICTED" | "SACRED_ELDER_ONLY" | "RESEARCH_ONLY";
  review_status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  collection_title?: string | null;
  collection_category?: string | null;
  traditional_knowledge_label?: string | null;
}

// User Authentication & Role-Based Access Control
export interface AuthUser {
  id: string | number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'researcher' | 'reviewer' | 'contributor';
  is_active: boolean;
  is_verified: boolean;
  bio?: string;
}

// Synchronized Bilingual Audio-Text Segment
export interface BilingualSegment {
  id: number;
  vernacularText: string;
  nativeScriptText?: string;
  translatedText: string;
  startTime: number;
  endTime: number;
}

export interface CulturalConsentMatrix {
  consent_recording: boolean;
  consent_transcription: boolean;
  consent_translation: boolean;
  consent_public_display: boolean;
  consent_research_reuse: boolean;
  consent_educational_reuse: boolean;
}

export interface CulturalSubmission {
  submission_id: string;
  collection_id?: string | null;
  contributor_name: string;
  contributor_email?: string | null;
  language: string;
  variety?: string | null;
  title: string;
  description?: string | null;
  original_audio_path?: string | null;
  audio_sha256?: string | null;
  transcript_draft?: string | null;
  translation_draft?: string | null;
  attribution_preference: string;
  consent_matrix_json: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  created_story_id?: string | null;
}

export interface CulturalArchiveOverview {
  total_collections: number;
  total_stories: number;
  total_audio_duration_seconds: number;
  languages_represented: Array<{ language: string; story_count: number }>;
  categories: Array<{ category: string; collection_count: number }>;
  submissions_by_status: Record<string, number>;
  status: string;
}

// Milestone 18: Advanced Speech & Pronunciation Intelligence
export interface SpeechTranscriptItem {
  id: number;
  uuid_id?: string;
  title: string;
  audio_filename?: string;
  audio_url: string;
  language: string;
  dialect?: string | null;
  transcript_text?: string;
  status?: string;
  duration_seconds?: number;
  created_at?: string;
}

export interface SpeechAlignment {
  word_index: number;
  word_text: string;
  start_time: number;
  end_time: number;
  confidence: number;
  phonetic_tokens: string;
}

export interface SpeechAcousticMetrics {
  id?: number;
  transcript_id: number;
  audio_filename: string;
  duration_seconds: number;
  speaking_rate_wpm: number;
  articulation_rate: number;
  total_silence_seconds: number;
  pause_count: number;
  average_pause_duration: number;
  waveform_peaks: number[];
  created_at: string;
}

export interface PronunciationExercise {
  id?: number;
  exercise_id: string;
  language: string;
  variety?: string | null;
  exercise_type: string;
  target_text: string;
  target_native_script?: string | null;
  phonetic_target_ipa: string;
  minimal_pair_with?: string | null;
  minimal_pair_ipa?: string | null;
  distinction_note?: string | null;
  difficulty_level: string;
  cultural_context?: string | null;
  audio_reference_url?: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface PronunciationAttempt {
  id: number;
  exercise_id: string;
  learner_id: string;
  audio_path?: string | null;
  acoustic_score: number;
  phoneme_accuracy: number;
  status: "PENDING_REVIEW" | "VERIFIED" | "RETRY_SUGGESTED";
  elder_review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

// Milestone 19: Language Learning & Interactive Practice
export interface LearningCollection {
  id?: number;
  collection_id: string;
  language: string;
  variety?: string | null;
  title: string;
  description: string;
  proficiency_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  is_published: boolean;
  created_at?: string;
  modules?: LearningModule[];
  module_count?: number;
}

export interface LearningModule {
  id?: number;
  module_id: string;
  collection_id: string;
  order_index: number;
  title: string;
  module_type: "VOCABULARY" | "LISTENING_COMPREHENSION" | "PHRASE_BUILDER" | "CULTURAL_DIALOGUE";
  prompt_native_script?: string | null;
  prompt_latin: string;
  prompt_translation: string;
  audio_url?: string | null;
  options: string[];
  correct_answer: string;
  cultural_note?: string | null;
  consent_educational_reuse: boolean;
}

export interface LearnerProgressRecord {
  id?: number;
  learner_id: string;
  module_id: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "MASTERED";
  score: number;
  attempts_count: number;
  last_attempt_at: string;
}

// Milestone 20: Institutional Research API & Interoperability
export interface ResearchApiKey {
  id?: number;
  key_id: string;
  organization_name: string;
  contact_email: string;
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}

export interface ResearchCorpusManifest {
  corpus_version: string;
  total_languages: number;
  total_transcripts: number;
  total_audio_hours: number;
  license: string;
  ocap_compliance: boolean;
  generated_at: string;
  download_url?: string;
  languages: Array<{
    language: string;
    transcript_count: number;
    hours: number;
    variety_count: number;
  }>;
}


