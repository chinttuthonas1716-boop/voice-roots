"""language_learning_and_education_schema

Revision ID: 2a8b3c4d5e6f
Revises: 9eb5cd35b326
Create Date: 2026-11-01 19:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '2a8b3c4d5e6f'
down_revision: str | Sequence[str] | None = '9eb5cd35b326'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create Language Learning & Practice tables and indexes."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "learning_collections" not in existing_tables:
        op.create_table(
            "learning_collections",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("collection_id", sa.String(100), unique=True, nullable=False),
            sa.Column("language", sa.String(100), nullable=False),
            sa.Column("variety", sa.String(100), nullable=True),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("proficiency_level", sa.String(50), nullable=False, server_default="BEGINNER"),
            sa.Column("is_published", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_learning_col_lang", "learning_collections", ["language"])
        op.create_index("idx_learning_col_level", "learning_collections", ["proficiency_level"])

    if "learning_modules" not in existing_tables:
        op.create_table(
            "learning_modules",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("module_id", sa.String(100), unique=True, nullable=False),
            sa.Column("collection_id", sa.String(100), sa.ForeignKey("learning_collections.collection_id", ondelete="CASCADE"), nullable=False),
            sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("module_type", sa.String(50), nullable=False),
            sa.Column("prompt_native_script", sa.String(255), nullable=True),
            sa.Column("prompt_latin", sa.String(255), nullable=False),
            sa.Column("prompt_translation", sa.String(255), nullable=False),
            sa.Column("audio_url", sa.String(500), nullable=True),
            sa.Column("options_json", sa.Text(), nullable=False),
            sa.Column("correct_answer", sa.String(255), nullable=False),
            sa.Column("cultural_note", sa.Text(), nullable=True),
            sa.Column("consent_educational_reuse", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("created_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_learning_mod_col", "learning_modules", ["collection_id"])
        op.create_index("idx_learning_mod_type", "learning_modules", ["module_type"])
        op.create_index("idx_learning_mod_consent", "learning_modules", ["consent_educational_reuse"])

    if "learner_progress" not in existing_tables:
        op.create_table(
            "learner_progress",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("learner_id", sa.String(100), nullable=False),
            sa.Column("module_id", sa.String(100), sa.ForeignKey("learning_modules.module_id", ondelete="CASCADE"), nullable=False),
            sa.Column("status", sa.String(50), nullable=False, server_default="NOT_STARTED"),
            sa.Column("score", sa.Float(), nullable=False, server_default="0.0"),
            sa.Column("attempts_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("last_attempt_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_learner_progress_learner", "learner_progress", ["learner_id"])
        op.create_index("idx_learner_progress_module", "learner_progress", ["learner_id", "module_id"], unique=True)


def downgrade() -> None:
    """Drop Language Learning tables."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "learner_progress" in existing_tables:
        op.drop_table("learner_progress")
    if "learning_modules" in existing_tables:
        op.drop_table("learning_modules")
    if "learning_collections" in existing_tables:
        op.drop_table("learning_collections")
