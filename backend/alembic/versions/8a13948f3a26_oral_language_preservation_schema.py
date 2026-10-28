"""oral_language_preservation_schema

Revision ID: 8a13948f3a26
Revises: 
Create Date: 2026-10-28 13:35:07.341239

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a13948f3a26'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Safely apply oral language metadata columns and performance indexes."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {col["name"] for col in inspector.get_columns("transcripts")}

    columns_to_add = [
        ("contributor_name", sa.String(200), "Community Contributor"),
        ("contributor_role", sa.String(100), "speaker"),
        ("provenance_notes", sa.Text(), None),
        ("transliteration_text", sa.Text(), None),
        ("license", sa.String(100), "CC BY-NC 4.0"),
        ("privacy_level", sa.String(50), "public"),
        ("retention_policy", sa.String(100), "indefinite"),
        ("storage_backend", sa.String(50), "local"),
    ]

    for col_name, col_type, default_val in columns_to_add:
        if col_name not in existing_columns:
            op.add_column(
                "transcripts",
                sa.Column(
                    col_name,
                    col_type,
                    nullable=True,
                    server_default=sa.text(f"'{default_val}'") if default_val else None,
                ),
            )

    # Performance and query optimization indexes
    existing_indexes = {idx["name"] for idx in inspector.get_indexes("transcripts")}
    indexes_to_create = [
        ("idx_transcripts_archived", ["archived_at"]),
        ("idx_transcripts_language", ["language"]),
        ("idx_transcripts_created", ["created_at"]),
        ("idx_transcripts_status", ["status"]),
        ("idx_transcripts_sha256", ["audio_sha256"]),
        ("idx_transcripts_privacy", ["privacy_level"]),
    ]
    for idx_name, col_names in indexes_to_create:
        if idx_name not in existing_indexes:
            op.create_index(idx_name, "transcripts", col_names, unique=False)


def downgrade() -> None:
    """Safely remove added oral language columns and indexes."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_indexes = {idx["name"] for idx in inspector.get_indexes("transcripts")}

    for idx_name in [
        "idx_transcripts_privacy",
        "idx_transcripts_sha256",
        "idx_transcripts_status",
        "idx_transcripts_created",
        "idx_transcripts_language",
        "idx_transcripts_archived",
    ]:
        if idx_name in existing_indexes:
            op.drop_index(idx_name, table_name="transcripts")
