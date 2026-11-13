#!/usr/bin/env python3
"""Voice Roots — Production SQLite to PostgreSQL Data Migration Script (T1.3)

Migrates relational database records from the local SQLite master database
to production PostgreSQL (e.g. Render paid persistent Postgres, Neon, or Supabase).

Features:
- Preserves primary keys, foreign key relationships, and UUID identifiers.
- Runs Alembic migrations automatically on target PostgreSQL before migration.
- Respects topological foreign key dependencies to avoid constraint violations.
- Resets PostgreSQL auto-increment sequences (SERIAL / IDENTITY) after data load.
- Provides dry-run validation and row-count comparison reports.
"""

from __future__ import annotations

import argparse
import logging
import os
import sqlite3
import sys
from typing import Any

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sqlite_to_postgres")

# Default paths
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SQLITE_PATH = os.environ.get(
    "VOICE_ROOTS_DB_PATH", os.path.join(REPO_ROOT, "backend", "voice_roots.db")
)
ALEMBIC_INI_PATH = os.path.join(REPO_ROOT, "backend", "alembic.ini")

# Ordered table list to respect foreign key constraints
TABLE_MIGRATION_ORDER = [
    # Auth & Sessions
    "users",
    "user_sessions",
    # Core Transcripts & Translations
    "transcripts",
    "translations",
    "corrections",
    "resource_submissions",
    "pilot_submissions",
    "pilot_reviews",
    "pilot_metrics",
    "assistant_conversations",
    # Community & Governance
    "organizations",
    "partnership_projects",
    "expert_reviewers",
    "review_assignments",
    "governance_disputes",
    "governance_audit_logs",
    # Knowledge Graph
    "kg_nodes",
    "kg_relationships",
    "kg_vocabulary_details",
    # Cultural Archives
    "archive_collections",
    "cultural_stories",
    "cultural_submissions",
    # Speech Analysis & Pronunciation
    "speech_alignments",
    "speech_acoustic_metrics",
    "pronunciation_exercises",
    "pronunciation_attempts",
    # Learning & Research
    "learning_collections",
    "learning_modules",
    "learner_progress",
    "research_api_keys",
    "research_access_logs",
    # Multilingual Dictionary
    "dictionary",
    # Learning Studio & Spaced Repetition
    "learning_srs_cards",
    "learning_srs_reviews",
    "learning_formant_benchmarks",
    "learning_sentence_drills",
    "learning_listening_quizzes",
]

# Excluded tables (SQLite internal or virtual FTS5)
EXCLUDED_TABLES = {
    "sqlite_sequence",
    "sqlite_stat1",
    "alembic_version",
}


def normalize_pg_url(url: str) -> str:
    """Normalize postgres:// or postgresql+asyncpg:// to postgresql://."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://", 1)
    return url


def run_alembic_upgrade(pg_url: str) -> None:
    """Run Alembic migrations to bring PostgreSQL schema up to head."""
    import subprocess

    logger.info("Running Alembic migrations against PostgreSQL target...")
    env = dict(os.environ, DATABASE_URL=pg_url)
    cmd = [sys.executable, "-m", "alembic", "-c", ALEMBIC_INI_PATH, "upgrade", "head"]
    res = subprocess.run(cmd, env=env, capture_output=True, text=True)
    if res.returncode != 0:
        logger.error(f"Alembic migration failed:\n{res.stderr}")
        raise RuntimeError("Failed to apply Alembic migrations to target PostgreSQL database.")
    logger.info("Alembic migrations completed successfully.")


def get_sqlite_tables(sqlite_conn: sqlite3.Connection) -> list[str]:
    """Get non-internal, non-FTS SQLite table names."""
    cur = sqlite_conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    all_tables = [row[0] for row in cur.fetchall()]
    filtered = [
        t
        for t in all_tables
        if t not in EXCLUDED_TABLES and not t.endswith(("_fts", "_data", "_idx", "_content", "_docsize", "_config"))
    ]

    # Order according to TABLE_MIGRATION_ORDER, then append any remaining
    ordered = [t for t in TABLE_MIGRATION_ORDER if t in filtered]
    for t in filtered:
        if t not in ordered:
            ordered.append(t)
    return ordered


def migrate_data(
    sqlite_path: str,
    pg_url: str | None,
    dry_run: bool = False,
    batch_size: int = 500,
    run_migrations: bool = True,
) -> dict[str, Any]:
    """Execute SQLite to PostgreSQL data migration."""
    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"SQLite database not found at {sqlite_path}")

    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    tables = get_sqlite_tables(sqlite_conn)

    logger.info(f"Discovered {len(tables)} tables to migrate from SQLite.")

    results: dict[str, dict[str, Any]] = {}

    if dry_run or not pg_url:
        logger.info("=== DRY RUN MODE: Counting rows in SQLite ===")
        total_rows = 0
        for table in tables:
            cur = sqlite_conn.cursor()
            cur.execute(f'SELECT COUNT(*) FROM "{table}"')
            count = cur.fetchone()[0]
            total_rows += count
            results[table] = {"sqlite_count": count, "pg_count": 0, "status": "DRY_RUN"}
            logger.info(f"  {table}: {count} rows")
        logger.info(f"Total SQLite rows inspected: {total_rows}")
        return results

    # PostgreSQL target migration
    try:
        import psycopg2
        import psycopg2.extras
    except ImportError:
        raise ImportError(
            "psycopg2 is required for PostgreSQL migration. Install with 'pip install psycopg2-binary'."
        )

    norm_url = normalize_pg_url(pg_url)

    if run_migrations:
        run_alembic_upgrade(norm_url)

    pg_conn = psycopg2.connect(norm_url)
    pg_conn.autocommit = False

    try:
        total_migrated = 0
        for table in tables:
            sqlite_cur = sqlite_conn.cursor()
            sqlite_cur.execute(f'SELECT * FROM "{table}"')
            col_names = [desc[0] for desc in sqlite_cur.description]
            sqlite_rows = sqlite_cur.fetchall()
            row_count = len(sqlite_rows)

            logger.info(f"Migrating table '{table}' ({row_count} rows)...")

            if row_count > 0:
                pg_cur = pg_conn.cursor()
                cols_joined = ", ".join(f'"{col}"' for col in col_names)
                placeholders = ", ".join(["%s"] * len(col_names))
                insert_sql = f'INSERT INTO "{table}" ({cols_joined}) VALUES ({placeholders}) ON CONFLICT DO NOTHING'

                # Insert in batches
                for i in range(0, row_count, batch_size):
                    batch = [tuple(row) for row in sqlite_rows[i : i + batch_size]]
                    psycopg2.extras.execute_batch(pg_cur, insert_sql, batch)

                # Reset sequence if table has auto-increment 'id'
                if "id" in col_names:
                    try:
                        seq_sql = f"""
                            SELECT setval(
                                pg_get_serial_sequence('"{table}"', 'id'),
                                COALESCE((SELECT MAX(id) FROM "{table}"), 1)
                            );
                        """
                        pg_cur.execute(seq_sql)
                    except Exception as seq_err:
                        # Some tables might have non-serial id or text id
                        logger.debug(f"Sequence reset skipped for {table}: {seq_err}")

                total_migrated += row_count

            # Verify count in PostgreSQL
            pg_cur = pg_conn.cursor()
            pg_cur.execute(f'SELECT COUNT(*) FROM "{table}"')
            pg_count = pg_cur.fetchone()[0]

            results[table] = {
                "sqlite_count": row_count,
                "pg_count": pg_count,
                "status": "VERIFIED" if pg_count >= row_count else "MISMATCH",
            }

        # Commit PostgreSQL transaction
        pg_conn.commit()
        logger.info(f"=== MIGRATION COMPLETE: Migrated {total_migrated} rows across {len(tables)} tables ===")

    except Exception as exc:
        pg_conn.rollback()
        logger.error(f"Migration error occurred: {exc}")
        raise
    finally:
        pg_conn.close()
        sqlite_conn.close()

    return results


def print_summary_table(results: dict[str, dict[str, Any]]) -> None:
    """Print markdown-formatted summary table."""
    print("\n| Table Name | SQLite Rows | PostgreSQL Rows | Migration Status |")
    print("| :--- | :---: | :---: | :---: |")
    for table, data in sorted(results.items()):
        print(f"| `{table}` | {data['sqlite_count']} | {data['pg_count']} | **{data['status']}** |")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Voice Roots SQLite to PostgreSQL Migration")
    parser.add_argument(
        "--sqlite-path",
        default=DEFAULT_SQLITE_PATH,
        help="Path to SQLite master database (default: backend/voice_roots.db)",
    )
    parser.add_argument(
        "--pg-url",
        default=os.environ.get("DATABASE_URL"),
        help="Target PostgreSQL connection URL (or set DATABASE_URL env var)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect SQLite records without connecting or writing to PostgreSQL",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=500,
        help="Batch size for executing row inserts (default: 500)",
    )
    parser.add_argument(
        "--skip-migrations",
        action="store_true",
        help="Skip running Alembic migrations on target database before migration",
    )

    args = parser.parse_args()

    if not args.dry_run and not args.pg_url:
        logger.warning(
            "DATABASE_URL not provided. Running in --dry-run inspection mode.\n"
            "To execute migration against PostgreSQL, supply --pg-url or set DATABASE_URL."
        )
        args.dry_run = True

    results = migrate_data(
        sqlite_path=args.sqlite_path,
        pg_url=args.pg_url,
        dry_run=args.dry_run,
        batch_size=args.batch_size,
        run_migrations=not args.skip_migrations,
    )
    print_summary_table(results)


if __name__ == "__main__":
    main()
