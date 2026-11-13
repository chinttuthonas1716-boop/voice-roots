"""institutional_research_api_and_interoperability

Revision ID: 4c5d6e7f8a9b
Revises: 2a8b3c4d5e6f
Create Date: 2026-11-01 19:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '4c5d6e7f8a9b'
down_revision: str | Sequence[str] | None = '2a8b3c4d5e6f'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create Institutional Research API credentials and access logs."""
    bind = op.get_bind()
    try:
        inspector = sa.inspect(bind)
        existing_tables = set(inspector.get_table_names())
    except Exception:
        inspector = None
        existing_tables = set()

    if "research_api_keys" not in existing_tables:
        op.create_table(
            "research_api_keys",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("key_id", sa.String(100), unique=True, nullable=False),
            sa.Column("api_key_hash", sa.String(64), nullable=False),
            sa.Column("organization_name", sa.String(255), nullable=False),
            sa.Column("contact_email", sa.String(255), nullable=False),
            sa.Column("scopes_json", sa.Text(), nullable=False),
            sa.Column("rate_limit_per_minute", sa.Integer(), nullable=False, server_default="60"),
            sa.Column("is_active", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("expires_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_research_key_hash", "research_api_keys", ["api_key_hash"])
        op.create_index("idx_research_key_active", "research_api_keys", ["is_active"])

    if "research_access_logs" not in existing_tables:
        op.create_table(
            "research_access_logs",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("key_id", sa.String(100), nullable=False),
            sa.Column("endpoint", sa.String(255), nullable=False),
            sa.Column("method", sa.String(20), nullable=False),
            sa.Column("status_code", sa.Integer(), nullable=False),
            sa.Column("accessed_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_research_log_key", "research_access_logs", ["key_id"])
        op.create_index("idx_research_log_time", "research_access_logs", ["accessed_at"])


def downgrade() -> None:
    """Drop Institutional Research API tables."""
    bind = op.get_bind()
    try:
        inspector = sa.inspect(bind)
        existing_tables = set(inspector.get_table_names())
    except Exception:
        inspector = None
        existing_tables = set()

    if "research_access_logs" in existing_tables:
        op.drop_table("research_access_logs")
    if "research_api_keys" in existing_tables:
        op.drop_table("research_api_keys")
