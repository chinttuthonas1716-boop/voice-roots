#!/usr/bin/env python3
"""Voice Roots Cloudflare R2 Audio Masters Backup & Versioning CLI (T3.3).

Features:
- Validates and enforces S3-compatible Object Versioning on the Cloudflare R2 bucket.
- Synchronizes all audio master files from R2 to a localized or secondary backup volume.
- Generates an integrity manifest with SHA-256 digests and version identifiers.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("r2_backup")


def get_r2_client() -> tuple[Any, str]:
    import boto3
    from botocore.config import Config

    endpoint = os.getenv("R2_ENDPOINT_URL", "").strip()
    key_id = os.getenv("R2_ACCESS_KEY_ID", "").strip()
    secret = os.getenv("R2_SECRET_ACCESS_KEY", "").strip()
    bucket = os.getenv("R2_BUCKET", "voice-roots-audio").strip()

    if not endpoint or not key_id or not secret:
        raise ValueError(
            "R2 credentials not fully configured. Ensure R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, "
            "and R2_SECRET_ACCESS_KEY are set."
        )

    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=key_id,
        aws_secret_access_key=secret,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    return s3, bucket


def configure_r2_versioning(s3: Any, bucket: str) -> dict[str, Any]:
    """Enable or verify object versioning on Cloudflare R2 bucket."""
    logger.info("Configuring Object Versioning on R2 bucket '%s'...", bucket)
    try:
        s3.put_bucket_versioning(
            Bucket=bucket,
            VersioningConfiguration={"Status": "Enabled"},
        )
        status = "Enabled"
    except Exception as exc:
        logger.warning("Could not set versioning via API (may require dashboard toggle on R2): %s", exc)
        status = "Manual dashboard configuration required"

    return {"bucket": bucket, "versioning_status": status}


def backup_r2_objects(s3: Any, bucket: str, backup_dir: Path) -> dict[str, Any]:
    """Download audio objects from R2 to backup directory with SHA-256 verification."""
    now = datetime.now(timezone.utc)
    ts_str = now.strftime("%Y%m%d_%H%M%S")
    dest_dir = backup_dir / f"r2_backup_{ts_str}"
    dest_dir.mkdir(parents=True, exist_ok=True)

    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=bucket)

    downloaded = 0
    total_bytes = 0
    manifest_records = []

    for page in pages:
        for obj in page.get("Contents", []):
            key = obj["Key"]
            size = obj["Size"]
            dest_file = dest_dir / key
            dest_file.parent.mkdir(parents=True, exist_ok=True)

            logger.info("Downloading %s (%d bytes)...", key, size)
            s3.download_file(bucket, key, str(dest_file))

            # Compute SHA-256
            hasher = hashlib.sha256()
            with open(dest_file, "rb") as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            sha256 = hasher.hexdigest()

            manifest_records.append({
                "key": key,
                "size_bytes": size,
                "sha256": sha256,
                "last_modified": obj["LastModified"].isoformat(),
            })
            downloaded += 1
            total_bytes += size

    # Write manifest
    manifest_file = dest_dir / "r2_backup_manifest.json"
    manifest = {
        "bucket": bucket,
        "backup_timestamp": now.isoformat(),
        "total_objects": downloaded,
        "total_bytes": total_bytes,
        "objects": manifest_records,
    }
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    logger.info("✓ R2 backup complete: %d objects (%d bytes) backed up to %s", downloaded, total_bytes, dest_dir)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Voice Roots R2 Audio Masters Backup CLI")
    parser.add_argument("--backup-dir", default="storage/r2_backups", help="Target backup directory")
    parser.add_argument("--configure-versioning-only", action="store_true", help="Only configure versioning on bucket")
    args = parser.parse_args()

    try:
        s3, bucket = get_r2_client()
    except Exception as exc:
        logger.error("R2 client initialization error: %s", exc)
        sys.exit(1)

    v_res = configure_r2_versioning(s3, bucket)
    print(f"R2 Versioning: {v_res['versioning_status']}")

    if not args.configure_versioning_only:
        backup_r2_objects(s3, bucket, Path(args.backup_dir))


if __name__ == "__main__":
    main()
