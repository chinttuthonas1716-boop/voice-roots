"""language_knowledge_graph_schema

Revision ID: c4820d491f21
Revises: b3910c28341a
Create Date: 2026-10-31 07:30:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c4820d491f21'
down_revision: str | Sequence[str] | None = 'b3910c28341a'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create Language Knowledge Graph tables, indexes, and full-text search."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "kg_nodes" not in existing_tables:
        op.create_table(
            "kg_nodes",
            sa.Column("node_id", sa.String(100), primary_key=True),
            sa.Column("entity_type", sa.String(50), nullable=False),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("native_name", sa.String(255), nullable=True),
            sa.Column("primary_language", sa.String(50), nullable=True),
            sa.Column("script", sa.String(100), nullable=True),
            sa.Column("category", sa.String(50), nullable=True),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("verification_status", sa.String(50), nullable=False, server_default="PROPOSED"),
            sa.Column("source_reference", sa.Text(), nullable=True),
            sa.Column("source_organization", sa.String(200), nullable=True),
            sa.Column("source_url", sa.Text(), nullable=True),
            sa.Column("dataset_version", sa.String(50), nullable=True),
            sa.Column("reviewed_by", sa.String(100), nullable=True),
            sa.Column("reviewed_at", sa.String(50), nullable=True),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
        )
        op.create_index("idx_kg_nodes_entity_type", "kg_nodes", ["entity_type"])
        op.create_index("idx_kg_nodes_language", "kg_nodes", ["primary_language"])
        op.create_index("idx_kg_nodes_verification", "kg_nodes", ["verification_status"])

    if "kg_relationships" not in existing_tables:
        op.create_table(
            "kg_relationships",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("source_id", sa.String(100), sa.ForeignKey("kg_nodes.node_id", ondelete="CASCADE"), nullable=False),
            sa.Column("target_id", sa.String(100), sa.ForeignKey("kg_nodes.node_id", ondelete="CASCADE"), nullable=False),
            sa.Column("relationship_type", sa.String(100), nullable=False),
            sa.Column("label", sa.String(100), nullable=True),
            sa.Column("verification_status", sa.String(50), nullable=False, server_default="PROPOSED"),
            sa.Column("source_reference", sa.Text(), nullable=True),
            sa.Column("confidence_score", sa.Float(), nullable=True, server_default="1.0"),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("created_at", sa.String(50), nullable=False),
            sa.Column("updated_at", sa.String(50), nullable=False),
            sa.UniqueConstraint("source_id", "target_id", "relationship_type", name="uq_kg_relationship_edge"),
        )
        op.create_index("idx_kg_rel_source", "kg_relationships", ["source_id"])
        op.create_index("idx_kg_rel_target", "kg_relationships", ["target_id"])
        op.create_index("idx_kg_rel_type", "kg_relationships", ["relationship_type"])
        op.create_index("idx_kg_rel_verification", "kg_relationships", ["verification_status"])

    if "kg_vocabulary_details" not in existing_tables:
        op.create_table(
            "kg_vocabulary_details",
            sa.Column("word_id", sa.String(100), sa.ForeignKey("kg_nodes.node_id", ondelete="CASCADE"), primary_key=True),
            sa.Column("language_code", sa.String(50), nullable=False),
            sa.Column("original_word", sa.String(255), nullable=False),
            sa.Column("script", sa.String(100), nullable=True),
            sa.Column("transliteration", sa.String(255), nullable=True),
            sa.Column("meaning", sa.Text(), nullable=False),
            sa.Column("grammatical_category", sa.String(50), nullable=True),
            sa.Column("cultural_context", sa.Text(), nullable=True),
            sa.Column("pronunciation_guide", sa.String(255), nullable=True),
            sa.Column("audio_transcript_id", sa.Integer(), nullable=True),
            sa.Column("audio_url", sa.Text(), nullable=True),
            sa.Column("review_status", sa.String(50), nullable=False, server_default="PROPOSED"),
        )
        op.create_index("idx_kg_vocab_lang", "kg_vocabulary_details", ["language_code"])

    # FTS5 Virtual Table for Unicode search across entities and vocabulary
    conn = op.get_bind()
    conn.execute(sa.text("""
        CREATE VIRTUAL TABLE IF NOT EXISTS kg_search_fts USING fts5(
            node_id UNINDEXED,
            name,
            native_name,
            summary,
            transliteration,
            cultural_context,
            primary_language,
            entity_type,
            tokenize='unicode61 remove_diacritics 0'
        );
    """))


def downgrade() -> None:
    """Drop Knowledge Graph tables, indexes, and full-text search."""
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS kg_search_fts;"))
    op.drop_table("kg_vocabulary_details")
    op.drop_table("kg_relationships")
    op.drop_table("kg_nodes")
