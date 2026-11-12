"""initial_schema

Revision ID: 4385e5315767
Revises: 
Create Date: 2026-10-28 13:30:59.557574

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '4385e5315767'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create foundational tables and indexes across SQLite and PostgreSQL."""
    bind = op.get_bind()
    try:
        inspector = sa.inspect(bind)
        existing_tables = set(inspector.get_table_names())
    except Exception:
        inspector = None
        existing_tables = set()

    # 1. users
    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(100), primary_key=True),
            sa.Column("username", sa.String(100), unique=True, nullable=False),
            sa.Column("email", sa.String(255), unique=True, nullable=False),
            sa.Column("hashed_password", sa.String(255), nullable=False),
            sa.Column("full_name", sa.String(200), nullable=False),
            sa.Column("role", sa.String(50), nullable=False, server_default="contributor"),
            sa.Column("is_active", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("is_verified", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("avatar_url", sa.Text(), nullable=True),
            sa.Column("bio", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_users_username", "users", ["username"])
        op.create_index("idx_users_email", "users", ["email"])
        op.create_index("idx_users_role", "users", ["role"])

    # 2. user_sessions
    if "user_sessions" not in existing_tables:
        op.create_table(
            "user_sessions",
            sa.Column("id", sa.String(100), primary_key=True),
            sa.Column("user_id", sa.String(100), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("token_hash", sa.String(255), nullable=False),
            sa.Column("ip_address", sa.String(100), nullable=True),
            sa.Column("user_agent", sa.Text(), nullable=True),
            sa.Column("expires_at", sa.String(50), nullable=False),
            sa.Column("created_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_user_sessions_user_id", "user_sessions", ["user_id"])

    # 3. transcripts
    if "transcripts" not in existing_tables:
        op.create_table(
            "transcripts",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("uuid_id", sa.String(64), unique=True, nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("audio_filename", sa.String(255), nullable=False),
            sa.Column("audio_url", sa.String(500), nullable=False),
            sa.Column("language", sa.String(50), nullable=False),
            sa.Column("dialect", sa.String(100), nullable=True),
            sa.Column("transcript_text", sa.Text(), nullable=False),
            sa.Column("status", sa.String(50), nullable=False),
            sa.Column("duration_seconds", sa.Float(), nullable=True, server_default="0.0"),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
            sa.Column("audio_sha256", sa.String(64), nullable=True),
            sa.Column("file_size_bytes", sa.Integer(), nullable=True),
            sa.Column("consent_at", sa.String(50), nullable=True),
            sa.Column("consent_version", sa.String(50), nullable=True),
            sa.Column("archived_at", sa.String(50), nullable=True),
            sa.Column("machine_transcript_text", sa.Text(), nullable=False, server_default=""),
            sa.Column("transcription_status", sa.String(50), nullable=False, server_default="not_requested"),
            sa.Column("transcription_provider", sa.String(100), nullable=True),
            sa.Column("transcription_model", sa.String(100), nullable=True),
            sa.Column("transcription_error", sa.Text(), nullable=True),
            sa.Column("transcription_consent_at", sa.String(50), nullable=True),
            sa.Column("transcription_consent_version", sa.String(50), nullable=True),
            sa.Column("transcribed_at", sa.String(50), nullable=True),
        )

    # 4. translations
    if "translations" not in existing_tables:
        op.create_table(
            "translations",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("transcript_id", sa.Integer(), sa.ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False),
            sa.Column("source_language", sa.String(50), nullable=False),
            sa.Column("target_language", sa.String(50), nullable=False),
            sa.Column("source_text", sa.Text(), nullable=False),
            sa.Column("translated_text", sa.Text(), nullable=False),
            sa.Column("provider", sa.String(100), nullable=False),
            sa.Column("model", sa.String(100), nullable=True),
            sa.Column("verified", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("limitation_note", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_translations_transcript_id", "translations", ["transcript_id"])

    # 5. corrections
    if "corrections" not in existing_tables:
        op.create_table(
            "corrections",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("target_type", sa.String(50), nullable=False),
            sa.Column("target_id", sa.Integer(), nullable=False),
            sa.Column("version_number", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("previous_text", sa.Text(), nullable=False),
            sa.Column("suggested_text", sa.Text(), nullable=False),
            sa.Column("contributor_name", sa.String(200), nullable=True, server_default="Community Contributor"),
            sa.Column("contributor_role", sa.String(100), nullable=True, server_default="community_member"),
            sa.Column("rationale", sa.Text(), nullable=True),
            sa.Column("status", sa.String(50), nullable=False, server_default="pending_review"),
            sa.Column("consent_confirmed", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("reviewed_by", sa.String(100), nullable=True),
            sa.Column("reviewed_at", sa.String(50), nullable=True),
            sa.Column("review_notes", sa.Text(), nullable=True),
            sa.Column("reviewer_uncertainty", sa.String(50), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_corrections_target", "corrections", ["target_type", "target_id"])

    # 6. resource_submissions
    if "resource_submissions" not in existing_tables:
        op.create_table(
            "resource_submissions",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("submission_type", sa.String(50), nullable=False),
            sa.Column("language_code", sa.String(20), nullable=False),
            sa.Column("language_name", sa.String(100), nullable=False),
            sa.Column("dialect", sa.String(100), nullable=True),
            sa.Column("term_or_text", sa.Text(), nullable=False),
            sa.Column("translation_text", sa.Text(), nullable=True),
            sa.Column("cultural_context", sa.Text(), nullable=True),
            sa.Column("contributor_name", sa.String(200), nullable=True, server_default="Community Contributor"),
            sa.Column("contributor_affiliation", sa.String(200), nullable=True),
            sa.Column("license", sa.String(50), nullable=False, server_default="CC BY 4.0"),
            sa.Column("attribution", sa.String(255), nullable=False),
            sa.Column("source_url", sa.String(500), nullable=True),
            sa.Column("speaker_consent_given", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("is_sacred_or_restricted", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("status", sa.String(50), nullable=False, server_default="pending_verification"),
            sa.Column("reviewer_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_submissions_status", "resource_submissions", ["status"])

    # 7. pilot_submissions
    if "pilot_submissions" not in existing_tables:
        op.create_table(
            "pilot_submissions",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("transcript_id", sa.Integer(), sa.ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False),
            sa.Column("tester_name", sa.String(200), nullable=False),
            sa.Column("consent", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("withdrawn", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_pilot_submissions_transcript", "pilot_submissions", ["transcript_id"])

    # 8. pilot_reviews
    if "pilot_reviews" not in existing_tables:
        op.create_table(
            "pilot_reviews",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("submission_id", sa.Integer(), sa.ForeignKey("pilot_submissions.id", ondelete="CASCADE"), nullable=False),
            sa.Column("reviewer_name", sa.String(200), nullable=False),
            sa.Column("approval", sa.String(50), nullable=True),
            sa.Column("uncertainty", sa.String(50), nullable=True),
            sa.Column("corrected_transcript", sa.Text(), nullable=True),
            sa.Column("corrected_translation", sa.Text(), nullable=True),
            sa.Column("review_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_pilot_reviews_submission", "pilot_reviews", ["submission_id"])

    # 9. pilot_metrics
    if "pilot_metrics" not in existing_tables:
        op.create_table(
            "pilot_metrics",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("sample_size", sa.Integer(), nullable=False),
            sa.Column("bleu", sa.Float(), nullable=False),
            sa.Column("evaluation_date", sa.String(50), nullable=False),
            sa.Column("created_at", sa.String(50), nullable=False),
        )

    # 10. assistant_conversations
    if "assistant_conversations" not in existing_tables:
        op.create_table(
            "assistant_conversations",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("session_id", sa.String(100), nullable=False),
            sa.Column("query_text", sa.Text(), nullable=False),
            sa.Column("response_text", sa.Text(), nullable=False),
            sa.Column("source_citations_json", sa.Text(), nullable=False, server_default="[]"),
            sa.Column("verified_only", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_assistant_session", "assistant_conversations", ["session_id"])

    # 11. learning SRS tables
    if "learning_srs_cards" not in existing_tables:
        op.create_table(
            "learning_srs_cards",
            sa.Column("card_id", sa.String(100), primary_key=True),
            sa.Column("learner_id", sa.String(100), nullable=False),
            sa.Column("language", sa.String(50), nullable=False),
            sa.Column("variety", sa.String(100), nullable=True),
            sa.Column("front_prompt", sa.Text(), nullable=False),
            sa.Column("front_audio_url", sa.Text(), nullable=True),
            sa.Column("back_meaning", sa.Text(), nullable=False),
            sa.Column("back_ipa", sa.Text(), nullable=True),
            sa.Column("cultural_context", sa.Text(), nullable=True),
            sa.Column("repetition_number", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("ease_factor", sa.Float(), nullable=True, server_default="2.5"),
            sa.Column("interval_days", sa.Integer(), nullable=True, server_default="1"),
            sa.Column("leitner_box", sa.Integer(), nullable=True, server_default="1"),
            sa.Column("due_date", sa.String(50), nullable=False),
            sa.Column("last_reviewed_at", sa.String(50), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_srs_cards_learner", "learning_srs_cards", ["learner_id"])
        op.create_index("idx_srs_cards_due", "learning_srs_cards", ["due_date"])

    if "learning_srs_reviews" not in existing_tables:
        op.create_table(
            "learning_srs_reviews",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("card_id", sa.String(100), sa.ForeignKey("learning_srs_cards.card_id", ondelete="CASCADE"), nullable=False),
            sa.Column("learner_id", sa.String(100), nullable=False),
            sa.Column("grade", sa.Integer(), nullable=False),
            sa.Column("ease_factor_after", sa.Float(), nullable=False),
            sa.Column("interval_after", sa.Integer(), nullable=False),
            sa.Column("leitner_box_after", sa.Integer(), nullable=False),
            sa.Column("reviewed_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_srs_reviews_card", "learning_srs_reviews", ["card_id"])

    if "learning_formant_benchmarks" not in existing_tables:
        op.create_table(
            "learning_formant_benchmarks",
            sa.Column("benchmark_id", sa.String(100), primary_key=True),
            sa.Column("language", sa.String(50), nullable=False),
            sa.Column("phoneme_or_word", sa.String(100), nullable=False),
            sa.Column("ipa", sa.String(100), nullable=False),
            sa.Column("target_f0", sa.Float(), nullable=False),
            sa.Column("target_f1", sa.Float(), nullable=False),
            sa.Column("target_f2", sa.Float(), nullable=False),
            sa.Column("articulatory_guide", sa.Text(), nullable=False),
        )

    if "learning_sentence_drills" not in existing_tables:
        op.create_table(
            "learning_sentence_drills",
            sa.Column("drill_id", sa.String(100), primary_key=True),
            sa.Column("language", sa.String(50), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("cultural_context", sa.Text(), nullable=False),
            sa.Column("target_sentence", sa.Text(), nullable=False),
            sa.Column("target_audio_url", sa.Text(), nullable=True),
            sa.Column("tokens_json", sa.Text(), nullable=False),
            sa.Column("correct_order_json", sa.Text(), nullable=False),
            sa.Column("syntax_pattern", sa.String(255), nullable=False),
            sa.Column("translation_english", sa.Text(), nullable=False),
        )

    if "learning_listening_quizzes" not in existing_tables:
        op.create_table(
            "learning_listening_quizzes",
            sa.Column("quiz_id", sa.String(100), primary_key=True),
            sa.Column("language", sa.String(50), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("audio_prompt_url", sa.Text(), nullable=False),
            sa.Column("audio_duration_seconds", sa.Float(), nullable=False),
            sa.Column("question_text", sa.Text(), nullable=False),
            sa.Column("options_json", sa.Text(), nullable=False),
            sa.Column("cultural_note", sa.Text(), nullable=False),
        )


def downgrade() -> None:
    """Drop foundational tables."""
    for table_name in [
        "learning_listening_quizzes",
        "learning_sentence_drills",
        "learning_formant_benchmarks",
        "learning_srs_reviews",
        "learning_srs_cards",
        "assistant_conversations",
        "pilot_metrics",
        "pilot_reviews",
        "pilot_submissions",
        "resource_submissions",
        "corrections",
        "translations",
        "transcripts",
        "user_sessions",
        "users",
    ]:
        op.drop_table(table_name)
