#!/usr/bin/env python3
"""Voice Roots Automated Database Backup CLI (T3.3).

Executes point-in-time database snapshot with rolling retention pruning.
Supports SQLite (local / volume) and PostgreSQL (via pg_dump).
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

import backup_retention_service  # noqa: E402


def backup_sqlite(db_path: Path, backup_dir: Path) -> dict[str, str | int]:
    print(f"Creating point-in-time SQLite snapshot from '{db_path}'...")
    res = backup_retention_service.create_atomic_backup(
        db_path=db_path,
        backup_dir=backup_dir,
    )
    print(f"✓ Snapshot created: {res['backup_filename']} ({res['size_bytes']} bytes)")
    if res.get("retention_status"):
        print(f"✓ Retention policy: {res['retention_status']}")
    return res


def backup_postgres(database_url: str, backup_dir: Path) -> str:
    from datetime import datetime, timezone

    backup_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    out_file = backup_dir / f"voice_roots_pg_backup_{timestamp}.dump"

    print(f"Executing pg_dump to '{out_file}'...")
    cmd = ["pg_dump", "-Fc", "--no-owner", "--no-acl", "-d", database_url, "-f", str(out_file)]
    subprocess.run(cmd, check=True)
    size = out_file.stat().st_size
    print(f"✓ PostgreSQL dump complete: {out_file.name} ({size} bytes)")
    return str(out_file)


def main() -> None:
    parser = argparse.ArgumentParser(description="Voice Roots Automated Database Backup CLI")
    parser.add_argument("--db-path", default=os.getenv("VOICE_ROOTS_DB", "backend/voice_roots.db"), help="SQLite database path")
    parser.add_argument("--backup-dir", default=os.getenv("VOICE_ROOTS_BACKUP_DIR", "backend/backups"), help="Backup destination directory")
    parser.add_argument("--postgres-url", default=os.getenv("DATABASE_URL"), help="PostgreSQL connection URL")
    args = parser.parse_args()

    b_dir = Path(args.backup_dir)
    if args.postgres_url and args.postgres_url.startswith("postgres"):
        backup_postgres(args.postgres_url, b_dir)
    else:
        db_path = Path(args.db_path)
        if not db_path.exists():
            print(f"Error: database file '{db_path}' does not exist.", file=sys.stderr)
            sys.exit(1)
        backup_sqlite(db_path, b_dir)


if __name__ == "__main__":
    main()
