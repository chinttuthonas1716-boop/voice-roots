"""community_verification_and_roles

Revision ID: b3910c28341a
Revises: 8a13948f3a26
Create Date: 2026-10-28 14:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3910c28341a'
down_revision: Union[str, Sequence[str], None] = '8a13948f3a26'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Safely apply community verification, multi-tier consent, and reviewer role columns."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {col["name"] for col in inspector.get_columns("transcripts")}

    columns_to_add = [
        ("verification_status", sa.String(50), "submitted"),
        ("consent_private_storage", sa.Integer(), 1),
        ("consent_community_access", sa.Integer(), 1),
        ("consent_public_publication", sa.Integer(), 0),
        ("consent_ai_training", sa.Integer(), 0),
        ("is_anonymous", sa.Integer(), 0),
        ("contextual_notes", sa.Text(), None),
        ("reviewer_uncertainty", sa.String(50), None),
        ("verified_by", sa.String(100), None),
        ("verified_at", sa.String(50), None),
        ("review_notes", sa.Text(), None),
    ]

    for col_name, col_type, default_val in columns_to_add:
        if col_name not in existing_columns:
            server_default = None
            if default_val is not None:
                if isinstance(default_val, str):
                    server_default = sa.text(f"'{default_val}'")
                else:
                    server_default = sa.text(str(default_val))
            op.add_column(
                "transcripts",
                sa.Column(
                    col_name,
                    col_type,
                    nullable=True,
                    server_default=server_default,
                ),
            )

    # Index on verification_status for review queue queries
    existing_indexes = {idx["name"] for idx in inspector.get_indexes("transcripts")}
    if "idx_transcripts_verification_status" not in existing_indexes:
        op.create_index(
            "idx_transcripts_verification_status",
            "transcripts",
            ["verification_status"],
            unique=False,
        )


def downgrade() -> None:
    """Safely remove community verification columns and indexes."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_indexes = {idx["name"] for idx in inspector.get_indexes("transcripts")}

    if "idx_transcripts_verification_status" in existing_indexes:
        op.drop_index("idx_transcripts_verification_status", table_name="transcripts")

