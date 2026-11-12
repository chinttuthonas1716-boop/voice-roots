#!/usr/bin/env python3
"""Voice Roots Database Restore & Verification CLI (T3.3).

Restores a point-in-time database snapshot with pre-flight and post-restore integrity validation.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

import backup_retention_service  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Voice Roots Database Restore & Verification CLI")
    parser.add_argument("backup_file", help="Path to backup snapshot .db file to restore from")
    parser.add_argument("--target-db", default=os.getenv("VOICE_ROOTS_DB", "backend/voice_roots.db"), help="Target database path")
    parser.add_argument("--dry-run", action="store_true", help="Validate snapshot integrity without writing to target")
    args = parser.parse_args()

    backup_path = Path(args.backup_file)
    target_path = Path(args.target_db)

    print(f"Validating backup snapshot: {backup_path}")
    if args.dry_run:
        res = backup_retention_service.restore_database_snapshot(
            backup_path=backup_path,
            target_db_path=target_path,
            dry_run=True,
        )
        print(f"✓ Dry-run validation passed: snapshot has {res['backup_tables']} tables, {res['backup_records']} records.")
        return

    print(f"Restoring to target database: {target_path}...")
    res = backup_retention_service.restore_database_snapshot(
        backup_path=backup_path,
        target_db_path=target_path,
        dry_run=False,
    )
    print("✓ Restore successful!")
    print(f"  Restored from: {res['restored_from']}")
    print(f"  Target DB:     {res['target_db']}")
    print(f"  Safety Copy:   {res['safety_copy']}")
    print(f"  Tables:        {res['table_count']}")
    print(f"  Records:       {res['record_count']}")


if __name__ == "__main__":
    main()
