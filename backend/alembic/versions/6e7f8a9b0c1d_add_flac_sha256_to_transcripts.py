"""add_flac_sha256_to_transcripts

Revision ID: 6e7f8a9b0c1d
Revises: 5d6e7f8a9b0c
Create Date: 2026-11-05 23:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '6e7f8a9b0c1d'
down_revision: str | Sequence[str] | None = '5d6e7f8a9b0c'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add flac_sha256 column and index to transcripts table."""
    bind = op.get_bind()
    try:
        inspector = sa.inspect(bind)
        columns = {c["name"] for c in inspector.get_columns("transcripts")}
    except Exception:
        columns = set()

    if "flac_sha256" not in columns:
        op.add_column("transcripts", sa.Column("flac_sha256", sa.String(64), nullable=True))

    try:
        if inspector:
            indexes = {idx["name"] for idx in inspector.get_indexes("transcripts")}
        else:
            indexes = set()
    except Exception:
        indexes = set()

    if "idx_transcripts_flac_sha256" not in indexes:
        try:
            op.create_index("idx_transcripts_flac_sha256", "transcripts", ["flac_sha256"])
        except Exception:
            pass


def downgrade() -> None:
    """Drop flac_sha256 column and index from transcripts table."""
    try:
        op.drop_index("idx_transcripts_flac_sha256", table_name="transcripts")
    except Exception:
        pass
    try:
        op.drop_column("transcripts", "flac_sha256")
    except Exception:
        pass
