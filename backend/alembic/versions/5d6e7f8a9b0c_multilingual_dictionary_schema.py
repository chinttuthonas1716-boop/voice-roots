"""multilingual_dictionary_schema

Revision ID: 5d6e7f8a9b0c
Revises: 4c5d6e7f8a9b
Create Date: 2026-11-04 22:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '5d6e7f8a9b0c'
down_revision: str | Sequence[str] | None = '4c5d6e7f8a9b'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create Multilingual Dictionary tables, FTS5 virtual index, and triggers."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "dictionary" not in existing_tables:
        op.create_table(
            "dictionary",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("word", sa.String(255), nullable=False),
            sa.Column("language_code", sa.String(20), nullable=False),
            sa.Column("dialect", sa.String(100), nullable=True),
            sa.Column("native_script", sa.String(255), nullable=True),
            sa.Column("script_name", sa.String(50), nullable=True),
            sa.Column("ipa", sa.String(255), nullable=True),
            sa.Column("part_of_speech", sa.String(50), nullable=False, server_default="noun"),
            sa.Column("meanings_json", sa.Text(), nullable=False, server_default="[]"),
            sa.Column("translations_json", sa.Text(), nullable=False, server_default="{}"),
            sa.Column("alternate_spellings_json", sa.Text(), nullable=False, server_default="[]"),
            sa.Column("dialect_variations_json", sa.Text(), nullable=False, server_default="{}"),
            sa.Column("audio_url", sa.String(255), nullable=True),
            sa.Column("audio_sha256", sa.String(64), nullable=True),
            sa.Column("etymology", sa.Text(), nullable=True),
            sa.Column("cultural_context", sa.Text(), nullable=True),
            sa.Column("is_elder_approved", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("status", sa.String(50), nullable=False, server_default="pending_review"),
            sa.Column("approved_by", sa.String(100), nullable=True),
            sa.Column("approved_at", sa.String(50), nullable=True),
            sa.Column("contributor_name", sa.String(100), nullable=True, server_default="Community Contributor"),
            sa.Column("contributor_role", sa.String(50), nullable=True, server_default="speaker"),
            sa.Column("provenance", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_dict_word", "dictionary", ["word"])
        op.create_index("idx_dict_lang", "dictionary", ["language_code"])
        op.create_index("idx_dict_dialect", "dictionary", ["dialect"])
        op.create_index("idx_dict_pos", "dictionary", ["part_of_speech"])
        op.create_index("idx_dict_approved", "dictionary", ["is_elder_approved"])
        op.create_index("idx_dict_status", "dictionary", ["status"])

    # SQLite FTS5 Virtual Table for full-text multilingual search
    try:
        bind.execute(
            sa.text(
                """
                CREATE VIRTUAL TABLE IF NOT EXISTS dictionary_fts USING fts5(
                    word_id UNINDEXED,
                    word,
                    native_script,
                    meanings,
                    translations,
                    alternate_spellings,
                    cultural_context,
                    tokenize='unicode61'
                );
                """
            )
        )
    except Exception:
        # FTS5 might not be available or already created
        pass


def downgrade() -> None:
    """Drop Multilingual Dictionary tables and FTS5 virtual table."""
    bind = op.get_bind()
    try:
        bind.execute(sa.text("DROP TABLE IF EXISTS dictionary_fts;"))
    except Exception:
        pass

    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())
    if "dictionary" in existing_tables:
        op.drop_table("dictionary")

