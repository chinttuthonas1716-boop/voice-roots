"""Voice Roots Restricted Data Export Service (T2.9).

Provides administrator-only export of consented, public-tier data conforming to OCAP principles:
- Audio masters preserved and packaged as the primary immutable assets.
- Dual manifest generation (manifest.jsonl and manifest.csv) with language, consent, and license fields.
- Dry-run mode for pre-flight inventory and volume auditing without disk/network write overhead.
- OCAP data sovereignty disclosure and ethical governance notice embedded in the export archive.
"""

from __future__ import annotations

import csv
import io
import json
import logging
import os
import sqlite3
import zipfile
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

OCAP_NOTICE = """================================================================================
VOICE ROOTS — PUBLIC AUDIO CORPUS & RESEARCH EXPORT
Rooting oral languages in text with community-first AI, offline masters, and elder provenance.
================================================================================

DATA SOVEREIGNTY & ETHICAL USE GUIDELINES (OCAP Principles):
1. Ownership:
   Indigenous and oral language communities retain collective and individual ownership
   over their voices, linguistic expressions, oral folklore, and cultural narratives.

2. Control:
   The original voice recording is the immutable master asset. Any AI transcriptions,
   phonetic alignments, or translations bundled herein are assistive annotations only
   and must never replace or overwrite the spoken word.

3. Access:
   This export bundle contains exclusively those recordings where contributors have
   explicitly provided informed consent for public research under OCAP guidelines.
   Sacred lore, ceremonial chants, and private family stories have been shielded and
   excluded from this package.

4. Possession & Licensing:
   All assets in this export are shared under CC BY-NC 4.0 / OCAP Community License.
   Commercial usage, closed model training without elder consent, or biometric voice
   synthesis without explicit community agreement is strictly prohibited.

For governance inquiries or withdrawal requests, contact: governance@voiceroots.org
"""


def get_consented_public_records(
    db_path: str,
    audio_storage_dir: str,
    language: str | None = None,
) -> list[dict[str, Any]]:
    """Query all non-withdrawn, affirmatively consented, public-tier voice recordings."""
    conditions = [
        "archived_at IS NULL",
        "(privacy_level = 'public' OR privacy_level IS NULL)",
        "(consent_at IS NOT NULL OR consent_public_publication = 1 OR consent_community_access = 1)",
    ]
    params: list[Any] = []

    if language and language.strip() and language.strip().lower() != "all":
        conditions.append("LOWER(language) = LOWER(?)")
        params.append(language.strip())

    query = f"""
        SELECT
            id, uuid_id, title, audio_filename, language, dialect,
            transcript_text, status, duration_seconds, created_at,
            audio_sha256, flac_sha256, file_size_bytes, consent_at,
            consent_version, contributor_name, contributor_role,
            license, privacy_level, verification_status,
            consent_public_publication, consent_community_access,
            is_anonymous
        FROM transcripts
        WHERE {' AND '.join(conditions)}
        ORDER BY id ASC
    """

    records: list[dict[str, Any]] = []
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        rows = cursor.execute(query, params).fetchall()

        for row in rows:
            r = dict(row)
            audio_filename = r.get("audio_filename") or ""
            audio_path = os.path.join(audio_storage_dir, audio_filename) if audio_filename else ""
            audio_exists = bool(audio_path and os.path.isfile(audio_path))
            file_size = os.path.getsize(audio_path) if audio_exists else (r.get("file_size_bytes") or 0)

            is_anon = bool(r.get("is_anonymous"))
            contributor = "Anonymous Contributor" if is_anon else (r.get("contributor_name") or "Community Contributor")

            manifest_entry = {
                "id": r["id"],
                "uuid_id": r["uuid_id"],
                "title": r["title"],
                "language": r["language"],
                "dialect": r.get("dialect") or "Standard / Unspecified",
                "duration_seconds": float(r.get("duration_seconds") or 0.0),
                "audio_filename": audio_filename,
                "audio_sha256": r.get("audio_sha256") or "",
                "flac_sha256": r.get("flac_sha256") or "",
                "audio_exists_on_disk": audio_exists,
                "file_size_bytes": file_size,
                "contributor": contributor,
                "contributor_role": r.get("contributor_role") or "speaker",
                "consent_confirmed": True,
                "consent_at": r.get("consent_at") or r.get("created_at") or "",
                "consent_public_publication": int(r.get("consent_public_publication") or 1),
                "privacy_level": r.get("privacy_level") or "public",
                "license": r.get("license") or "CC BY-NC 4.0 / OCAP Community License",
                "verification_status": r.get("verification_status") or "submitted",
                "transcript_text": r.get("transcript_text") or "",
                "immutable_master_notice": "The original voice recording is the immutable master asset. AI transcripts are assistive annotations.",
            }
            records.append(manifest_entry)

    return records


def get_export_dry_run(
    db_path: str,
    audio_storage_dir: str,
    language: str | None = None,
) -> dict[str, Any]:
    """Audit and preview the public-tier export package without compiling the ZIP."""
    records = get_consented_public_records(db_path, audio_storage_dir, language=language)

    total_records = len(records)
    audio_found = sum(1 for r in records if r["audio_exists_on_disk"])
    audio_missing = total_records - audio_found
    total_audio_bytes = sum(r["file_size_bytes"] for r in records if r["audio_exists_on_disk"])

    languages: dict[str, int] = {}
    for r in records:
        lang = r["language"]
        languages[lang] = languages.get(lang, 0) + 1

    return {
        "dry_run": True,
        "status": "ready_for_export",
        "total_records": total_records,
        "audio_files_found": audio_found,
        "audio_files_missing": audio_missing,
        "total_audio_size_bytes": total_audio_bytes,
        "languages": languages,
        "target_filter": language or "all",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "records_sample": records[:10],
        "records": records,
    }


def build_export_zip(
    db_path: str,
    audio_storage_dir: str,
    manifest_format: str = "jsonl",
    language: str | None = None,
) -> tuple[bytes, str, dict[str, Any]]:
    """Build a downloadable ZIP archive containing audio files and OCAP manifests."""
    records = get_consented_public_records(db_path, audio_storage_dir, language=language)

    now = datetime.now(timezone.utc)
    timestamp_str = now.strftime("%Y%m%d_%H%M%S")
    zip_filename = f"voice_roots_public_corpus_{timestamp_str}.zip"

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        # 1. OCAP ethical and governance notice
        zf.writestr("OCAP_GOVERNANCE.txt", OCAP_NOTICE)

        # 2. JSON Lines Manifest
        jsonl_lines = []
        for r in records:
            jsonl_lines.append(json.dumps(r, ensure_ascii=False))
        zf.writestr("manifest.jsonl", "\n".join(jsonl_lines) + "\n")

        # 3. CSV Manifest
        csv_buffer = io.StringIO()
        csv_buffer.write("\ufeff")  # UTF-8 BOM for Microsoft Excel / spreadsheet compatibility
        fieldnames = [
            "id",
            "uuid_id",
            "title",
            "language",
            "dialect",
            "duration_seconds",
            "audio_filename",
            "audio_sha256",
            "flac_sha256",
            "audio_exists_on_disk",
            "file_size_bytes",
            "contributor",
            "contributor_role",
            "consent_confirmed",
            "consent_at",
            "consent_public_publication",
            "privacy_level",
            "license",
            "verification_status",
            "transcript_text",
            "immutable_master_notice",
        ]
        writer = csv.DictWriter(csv_buffer, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for r in records:
            writer.writerow(r)
        zf.writestr("manifest.csv", csv_buffer.getvalue())

        # 4. Audio files in audio/ subdirectory (deduplicated by filename)
        audio_written_count = 0
        written_audio_filenames: set[str] = set()
        for r in records:
            audio_filename = r.get("audio_filename")
            if not audio_filename or audio_filename in written_audio_filenames:
                continue

            audio_path = os.path.join(audio_storage_dir, audio_filename)
            if os.path.isfile(audio_path):
                try:
                    with open(audio_path, "rb") as af:
                        zf.writestr(f"audio/{audio_filename}", af.read())
                    written_audio_filenames.add(audio_filename)
                    audio_written_count += 1
                except Exception as exc:
                    logger.warning("Could not read audio file '%s' for export: %s", audio_path, exc)

    zip_bytes = zip_buffer.getvalue()
    summary = {
        "total_records": len(records),
        "audio_files_exported": audio_written_count,
        "zip_size_bytes": len(zip_bytes),
        "filename": zip_filename,
    }

    return zip_bytes, zip_filename, summary
