"""advanced_speech_and_pronunciation_schema

Revision ID: 9eb5cd35b326
Revises: e7193b58f012
Create Date: 2026-11-01 18:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9eb5cd35b326'
down_revision: str | Sequence[str] | None = 'e7193b58f012'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create Advanced Speech Intelligence and Pronunciation tables and indexes."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "speech_alignments" not in existing_tables:
        op.create_table(
            "speech_alignments",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("transcript_id", sa.Integer(), sa.ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False),
            sa.Column("word_index", sa.Integer(), nullable=False),
            sa.Column("word_text", sa.String(100), nullable=False),
            sa.Column("start_time", sa.Float(), nullable=False),
            sa.Column("end_time", sa.Float(), nullable=False),
            sa.Column("confidence", sa.Float(), nullable=False, server_default="1.0"),
            sa.Column("phonetic_tokens", sa.String(255), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_speech_align_transcript", "speech_alignments", ["transcript_id"])
        op.create_index("idx_speech_align_time", "speech_alignments", ["transcript_id", "start_time"])

    if "speech_acoustic_metrics" not in existing_tables:
        op.create_table(
            "speech_acoustic_metrics",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("transcript_id", sa.Integer(), sa.ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=True),
            sa.Column("audio_filename", sa.String(255), nullable=False),
            sa.Column("duration_seconds", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("speaking_rate_wpm", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("articulation_rate", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("total_silence_seconds", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("pause_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("average_pause_duration", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("waveform_peaks_json", sa.Text(), nullable=True),
            sa.Column("pitch_mean_hz", sa.Float(), nullable=True),
            sa.Column("energy_db", sa.Float(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_speech_metrics_transcript", "speech_acoustic_metrics", ["transcript_id"])
        op.create_index("idx_speech_metrics_audio", "speech_acoustic_metrics", ["audio_filename"])

    if "pronunciation_exercises" not in existing_tables:
        op.create_table(
            "pronunciation_exercises",
            sa.Column("exercise_id", sa.String(100), primary_key=True),
            sa.Column("language", sa.String(50), nullable=False),
            sa.Column("variety", sa.String(100), nullable=True),
            sa.Column("exercise_type", sa.String(50), nullable=False, server_default="MINIMAL_PAIR"),
            sa.Column("target_text", sa.String(255), nullable=False),
            sa.Column("target_native_script", sa.String(255), nullable=True),
            sa.Column("phonetic_target_ipa", sa.String(255), nullable=True),
            sa.Column("minimal_pair_with", sa.String(255), nullable=True),
            sa.Column("minimal_pair_ipa", sa.String(255), nullable=True),
            sa.Column("distinction_note", sa.Text(), nullable=True),
            sa.Column("difficulty_level", sa.String(20), nullable=False, server_default="BEGINNER"),
            sa.Column("reference_audio_filename", sa.String(255), nullable=True),
            sa.Column("is_sacred", sa.Boolean(), nullable=False, server_default="0"),
            sa.Column("verification_status", sa.String(50), nullable=False, server_default="VERIFIED"),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_pron_ex_lang", "pronunciation_exercises", ["language"])
        op.create_index("idx_pron_ex_type", "pronunciation_exercises", ["exercise_type"])
        op.create_index("idx_pron_ex_status", "pronunciation_exercises", ["verification_status"])

    if "pronunciation_attempts" not in existing_tables:
        op.create_table(
            "pronunciation_attempts",
            sa.Column("attempt_id", sa.String(100), primary_key=True),
            sa.Column("exercise_id", sa.String(100), sa.ForeignKey("pronunciation_exercises.exercise_id", ondelete="CASCADE"), nullable=False),
            sa.Column("user_id", sa.String(100), nullable=False, server_default="anonymous"),
            sa.Column("audio_filename", sa.String(255), nullable=True),
            sa.Column("acoustic_similarity_score", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("phonetic_accuracy_score", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("pause_pattern_score", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("elder_review_score", sa.Float(), nullable=True),
            sa.Column("reviewer_name", sa.String(200), nullable=True),
            sa.Column("status", sa.String(50), nullable=False, server_default="PENDING_REVIEW"),
            sa.Column("feedback_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("reviewed_at", sa.String(50), nullable=True),
        )
        op.create_index("idx_pron_att_exercise", "pronunciation_attempts", ["exercise_id"])
        op.create_index("idx_pron_att_user", "pronunciation_attempts", ["user_id"])
        op.create_index("idx_pron_att_status", "pronunciation_attempts", ["status"])


def downgrade() -> None:
    """Drop Advanced Speech Intelligence and Pronunciation tables."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "pronunciation_attempts" in existing_tables:
        op.drop_table("pronunciation_attempts")
    if "pronunciation_exercises" in existing_tables:
        op.drop_table("pronunciation_exercises")
    if "speech_acoustic_metrics" in existing_tables:
        op.drop_table("speech_acoustic_metrics")
    if "speech_alignments" in existing_tables:
        op.drop_table("speech_alignments")
