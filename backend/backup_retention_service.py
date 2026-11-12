"""Voice Roots — Automated Backup Retention and Rotation Service.

Manages rolling retention of SQLite database backups:
- Retains all atomic snapshots from the last 7 days.
- Retains 1 daily snapshot for days 8 through 30.
- Retains 1 weekly snapshot for days 31 through 90.
- Prunes older snapshots exceeding retention windows or maximum count.
- Never prunes designated pre-milestone preservation baselines (e.g. pre_m*).
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Regular expressions matching timestamped backup files
BACKUP_TIMESTAMP_PATTERN = re.compile(r"(\d{8}_\d{6})")


def parse_backup_timestamp(filename: str) -> datetime | None:
    """Extract UTC datetime from backup filename containing YYYYMMDD_HHMMSS."""
    match = BACKUP_TIMESTAMP_PATTERN.search(filename)
    if not match:
        return None
    try:
        return datetime.strptime(match.group(1), "%Y%m%d_%H%M%S").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def get_backup_summary(backup_dir: Path | str) -> dict[str, Any]:
    """Inspect backup directory and summarize counts, sizes, and file list."""
    dir_path = Path(backup_dir)
    if not dir_path.exists():
        return {
            "backup_dir": str(dir_path),
            "exists": False,
            "total_count": 0,
            "total_bytes": 0,
            "backups": [],
        }

    backups = []
    total_bytes = 0
    for entry in dir_path.glob("*.db"):
        if entry.is_file():
            size = entry.stat().st_size
            total_bytes += size
            backups.append({
                "filename": entry.name,
                "size_bytes": size,
                "created_at": parse_backup_timestamp(entry.name),
                "path": str(entry),
            })

    # Sort newest first
    backups.sort(
        key=lambda b: b["created_at"].timestamp() if b["created_at"] else 0.0,
        reverse=True,
    )

    return {
        "backup_dir": str(dir_path),
        "exists": True,
        "total_count": len(backups),
        "total_bytes": total_bytes,
        "backups": backups,
    }


def prune_old_backups(
    backup_dir: Path | str,
    retain_days: int = 14,
    max_backups: int = 50,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Prune historical database snapshots according to tiered retention policy.

    Rules:
    1. Preservation baselines (files starting with 'pre_' or containing 'milestone') are preserved.
    2. All snapshots created within 7 days are preserved.
    3. Exactly 1 snapshot per calendar day is retained for days 8 through 30.
    4. Exactly 1 snapshot per calendar week is retained for days 31 through 90.
    5. Snapshots older than 90 days are pruned.
    6. If count exceeds max_backups, oldest non-baseline snapshots are pruned first.
    """
    dir_path = Path(backup_dir)
    if not dir_path.exists():
        return {
            "status": "skipped",
            "message": f"Backup directory '{dir_path}' does not exist.",
            "pruned_count": 0,
            "pruned_bytes": 0,
            "retained_count": 0,
        }

    now = datetime.now(timezone.utc)
    candidates: list[dict[str, Any]] = []

    for entry in dir_path.glob("*.db"):
        if not entry.is_file():
            continue

        filename = entry.name
        is_protected = (
            filename.startswith("pre_")
            or "milestone" in filename.lower()
            or "baseline" in filename.lower()
            or "stage9_pre_audit" in filename.lower()
        )

        ts = parse_backup_timestamp(filename)
        # If timestamp cannot be parsed from name, fall back to file mtime
        if ts is None:
            ts = datetime.fromtimestamp(entry.stat().st_mtime, tz=timezone.utc)

        age_days = (now - ts).total_seconds() / 86400.0

        candidates.append({
            "path": entry,
            "filename": filename,
            "size_bytes": entry.stat().st_size,
            "timestamp": ts,
            "age_days": age_days,
            "is_protected": is_protected,
            "date_key": ts.strftime("%Y-%m-%d"),
            "week_key": f"{ts.year}-W{ts.isocalendar()[1]:02d}",
        })

    # Sort by age (newest first)
    candidates.sort(key=lambda c: c["age_days"])

    retained: list[dict[str, Any]] = []
    to_prune: list[dict[str, Any]] = []

    seen_days_8_30: set[str] = set()
    seen_weeks_31_90: set[str] = set()

    for item in candidates:
        if item["is_protected"]:
            retained.append(item)
            continue

        age = item["age_days"]
        if age <= 7.0:
            # Keep all in last 7 days
            retained.append(item)
        elif 7.0 < age <= 30.0:
            # 1 per day
            if item["date_key"] not in seen_days_8_30:
                seen_days_8_30.add(item["date_key"])
                retained.append(item)
            else:
                to_prune.append(item)
        elif 30.0 < age <= 90.0:
            # 1 per week
            if item["week_key"] not in seen_weeks_31_90:
                seen_weeks_31_90.add(item["week_key"])
                retained.append(item)
            else:
                to_prune.append(item)
        else:
            # Older than 90 days pruned
            to_prune.append(item)

    # Check max_backups limit on remaining non-protected items
    if len(retained) > max_backups:
        # Prune oldest non-protected retained items
        non_protected = [i for i in retained if not i["is_protected"]]
        # Reverse to prune oldest first
        non_protected.reverse()
        excess = len(retained) - max_backups
        prunable_excess = non_protected[:excess]
        for p in prunable_excess:
            retained.remove(p)
            to_prune.append(p)

    pruned_bytes = 0
    pruned_files: list[str] = []

    for item in to_prune:
        pruned_bytes += item["size_bytes"]
        pruned_files.append(item["filename"])
        if not dry_run:
            try:
                item["path"].unlink(missing_ok=True)
            except OSError as e:
                logger.warning("Failed to delete old backup %s: %s", item["path"], e)

    retained_bytes = sum(i["size_bytes"] for i in retained)

    return {
        "status": "success",
        "dry_run": dry_run,
        "pruned_count": len(pruned_files),
        "pruned_bytes": pruned_bytes,
        "pruned_files": pruned_files[:20],  # sample first 20
        "retained_count": len(retained),
        "retained_bytes": retained_bytes,
        "message": f"Pruned {len(pruned_files)} backup snapshots ({round(pruned_bytes / (1024 * 1024), 2)} MB). Retained {len(retained)} snapshots.",
    }


def create_atomic_backup(
    db_path: Path | str,
    backup_dir: Path | str,
    prefix: str = "voice_roots_backup",
) -> dict[str, Any]:
    """Create a point-in-time atomic SQLite backup using sqlite3.connect().backup()."""
    import sqlite3

    db_file = Path(db_path)
    if not db_file.exists():
        raise FileNotFoundError(f"Source database '{db_path}' not found.")

    b_dir = Path(backup_dir)
    b_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    backup_file = b_dir / f"{prefix}_{timestamp}.db"

    with sqlite3.connect(db_file) as src, sqlite3.connect(backup_file) as dst:
        src.backup(dst)

    size = backup_file.stat().st_size
    prune_res = prune_old_backups(backup_dir=b_dir, retain_days=14, max_backups=50)

    return {
        "success": True,
        "backup_path": str(backup_file),
        "backup_filename": backup_file.name,
        "size_bytes": size,
        "timestamp": timestamp,
        "retention_status": prune_res.get("message"),
    }


def verify_database_integrity(db_path: Path | str) -> dict[str, Any]:
    """Verify SQLite database integrity via PRAGMA integrity_check and table count."""
    import sqlite3

    path = Path(db_path)
    if not path.exists():
        return {"valid": False, "error": f"File '{db_path}' does not exist."}

    try:
        with sqlite3.connect(path) as conn:
            cursor = conn.cursor()
            cursor.execute("PRAGMA integrity_check")
            check_result = cursor.fetchone()[0]
            if check_result != "ok":
                return {"valid": False, "error": f"Integrity check failed: {check_result}"}

            cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table'")
            table_count = cursor.fetchone()[0]

            # Get row count in transcripts if table exists
            cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='transcripts'")
            has_transcripts = bool(cursor.fetchone()[0])
            record_count = 0
            if has_transcripts:
                cursor.execute("SELECT count(*) FROM transcripts")
                record_count = cursor.fetchone()[0]

            return {
                "valid": True,
                "integrity_check": "ok",
                "table_count": table_count,
                "record_count": record_count,
                "size_bytes": path.stat().st_size,
            }
    except Exception as exc:  # noqa: BLE001
        return {"valid": False, "error": str(exc)}


def restore_database_snapshot(
    backup_path: Path | str,
    target_db_path: Path | str,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Safely restore a point-in-time database backup snapshot with integrity validation."""
    import shutil
    import sqlite3

    src_backup = Path(backup_path)
    if not src_backup.exists() or not src_backup.is_file():
        raise FileNotFoundError(f"Backup snapshot '{backup_path}' does not exist or is not a file.")

    # 1. Validate backup integrity before restoring
    backup_check = verify_database_integrity(src_backup)
    if not backup_check.get("valid"):
        raise ValueError(f"Cannot restore corrupt backup snapshot: {backup_check.get('error')}")

    target = Path(target_db_path)
    pre_restore_integrity = verify_database_integrity(target) if target.exists() else None

    if dry_run:
        return {
            "dry_run": True,
            "status": "validated_ready_to_restore",
            "backup_file": str(src_backup),
            "target_db": str(target),
            "backup_tables": backup_check.get("table_count"),
            "backup_records": backup_check.get("record_count"),
            "current_target_records": pre_restore_integrity.get("record_count") if pre_restore_integrity else 0,
        }

    # 2. Safety copy of current target before replacing
    safety_copy = None
    if target.exists():
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        safety_copy = target.parent / f"pre_restore_safety_{timestamp}.db"
        shutil.copy2(target, safety_copy)

    try:
        # 3. Perform atomic restore using sqlite3 backup API
        with sqlite3.connect(src_backup) as src, sqlite3.connect(target) as dst:
            src.backup(dst)

        # 4. Verify post-restore target integrity
        post_restore = verify_database_integrity(target)
        if not post_restore.get("valid"):
            # Rollback to safety copy
            if safety_copy and safety_copy.exists():
                shutil.copy2(safety_copy, target)
            raise RuntimeError(f"Post-restore integrity check failed: {post_restore.get('error')}")

        return {
            "success": True,
            "restored_from": str(src_backup),
            "target_db": str(target),
            "safety_copy": str(safety_copy) if safety_copy else None,
            "table_count": post_restore.get("table_count"),
            "record_count": post_restore.get("record_count"),
            "restored_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception:
        if safety_copy and safety_copy.exists():
            shutil.copy2(safety_copy, target)
        raise
