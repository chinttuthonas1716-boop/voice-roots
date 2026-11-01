"""cultural_archives_schema

Revision ID: e7193b58f012
Revises: c4820d491f21
Create Date: 2026-11-01 13:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'e7193b58f012'
down_revision: str | Sequence[str] | None = 'c4820d491f21'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create Interactive Cultural and Oral History Archives tables and indexes."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "archive_collections" not in existing_tables:
        op.create_table(
            "archive_collections",
            sa.Column("collection_id", sa.String(100), primary_key=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("primary_language", sa.String(50), nullable=False),
            sa.Column("category", sa.String(100), nullable=False, server_default="Oral History"),
            sa.Column("cover_image_url", sa.Text(), nullable=True),
            sa.Column("creator_organization_id", sa.String(100), nullable=True),
            sa.Column("creator_name", sa.String(200), nullable=False, server_default="Community Elder Council"),
            sa.Column("provenance_details", sa.Text(), nullable=True),
            sa.Column("access_classification", sa.String(50), nullable=False, server_default="PUBLIC"),
            sa.Column("traditional_knowledge_label", sa.String(100), nullable=True, server_default="TK Notice (Open)"),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_archive_coll_lang", "archive_collections", ["primary_language"])
        op.create_index("idx_archive_coll_access", "archive_collections", ["access_classification"])
        op.create_index("idx_archive_coll_cat", "archive_collections", ["category"])

    if "cultural_stories" not in existing_tables:
        op.create_table(
            "cultural_stories",
            sa.Column("story_id", sa.String(100), primary_key=True),
            sa.Column("collection_id", sa.String(100), sa.ForeignKey("archive_collections.collection_id", ondelete="SET NULL"), nullable=True),
            sa.Column("transcript_id", sa.Integer(), sa.ForeignKey("transcripts.id", ondelete="SET NULL"), nullable=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("native_title", sa.String(255), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("primary_language", sa.String(50), nullable=False),
            sa.Column("dialect_variety", sa.String(100), nullable=True),
            sa.Column("transliteration", sa.Text(), nullable=True),
            sa.Column("translation_text", sa.Text(), nullable=True),
            sa.Column("audio_reference", sa.Text(), nullable=True),
            sa.Column("audio_duration_seconds", sa.Float(), nullable=True, server_default="0.0"),
            sa.Column("audio_sha256", sa.String(64), nullable=True),
            sa.Column("recording_date", sa.String(50), nullable=True),
            sa.Column("location_name", sa.String(200), nullable=True),
            sa.Column("contributor_name", sa.String(200), nullable=False, server_default="Community Contributor"),
            sa.Column("attribution_preference", sa.String(100), nullable=False, server_default="BY_NAME"),
            sa.Column("access_classification", sa.String(50), nullable=False, server_default="PUBLIC"),
            sa.Column("review_status", sa.String(50), nullable=False, server_default="APPROVED"),
            sa.Column("reviewed_by", sa.String(100), nullable=True),
            sa.Column("reviewed_at", sa.String(50), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_cultural_story_coll", "cultural_stories", ["collection_id"])
        op.create_index("idx_cultural_story_lang", "cultural_stories", ["primary_language"])
        op.create_index("idx_cultural_story_access", "cultural_stories", ["access_classification"])
        op.create_index("idx_cultural_story_review", "cultural_stories", ["review_status"])

    if "cultural_submissions" not in existing_tables:
        op.create_table(
            "cultural_submissions",
            sa.Column("submission_id", sa.String(100), primary_key=True),
            sa.Column("collection_id", sa.String(100), sa.ForeignKey("archive_collections.collection_id", ondelete="SET NULL"), nullable=True),
            sa.Column("contributor_name", sa.String(200), nullable=False),
            sa.Column("contributor_email", sa.String(200), nullable=True),
            sa.Column("language", sa.String(50), nullable=False),
            sa.Column("variety", sa.String(100), nullable=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("original_audio_path", sa.Text(), nullable=True),
            sa.Column("audio_sha256", sa.String(64), nullable=True),
            sa.Column("transcript_draft", sa.Text(), nullable=True),
            sa.Column("translation_draft", sa.Text(), nullable=True),
            sa.Column("attribution_preference", sa.String(100), nullable=False, server_default="BY_NAME"),
            sa.Column("consent_matrix_json", sa.Text(), nullable=False),
            sa.Column("status", sa.String(50), nullable=False, server_default="SUBMITTED"),
            sa.Column("review_notes", sa.Text(), nullable=True),
            sa.Column("reviewed_by", sa.String(100), nullable=True),
            sa.Column("reviewed_at", sa.String(50), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_cultural_sub_status", "cultural_submissions", ["status"])
        op.create_index("idx_cultural_sub_lang", "cultural_submissions", ["language"])

    # FTS5 Virtual Table for Unicode search across cultural stories
    conn = op.get_bind()
    conn.execute(sa.text("""
        CREATE VIRTUAL TABLE IF NOT EXISTS cultural_stories_fts USING fts5(
            story_id UNINDEXED,
            title,
            native_title,
            description,
            transliteration,
            translation_text,
            primary_language,
            location_name,
            tokenize='unicode61 remove_diacritics 0'
        );
    """))


def downgrade() -> None:
    """Drop Cultural Archives tables, indexes, and full-text search."""
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS cultural_stories_fts;"))
    op.drop_table("cultural_submissions")
    op.drop_table("cultural_stories")
    op.drop_table("archive_collections")

