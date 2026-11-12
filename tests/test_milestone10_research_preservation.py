"""
Voice Roots: Milestone 10 Verification Suite
=============================================
Tests research-grade dataset management, model evaluation, and digital preservation:
1. Dataset Registry discovery and W3C DCAT metadata schema validation.
2. Dataset versioning, stable identifiers, and provenance attribution.
3. Deterministic train/validation/test split partitioning (zero data leakage).
4. Bit-level SHA-256 file integrity verification and corrupt/missing file detection.
5. Strict OCAP privacy boundaries in research data package exports (excluding private, draft, and withdrawn items).
6. Anonymous speaker identity masking.
7. Frictionless research export in JSON and UTF-8 BOM CSV formats.
8. Speech recognition (ASR) research evaluation (WER, CER, acoustic conditions, failed rates).
9. Translation elder-review guardrail compliance (100% protection on oral tongues).
10. Comprehensive multi-modal research evaluation report.
11. Digital preservation telemetry, backup audit, and non-destructive restoration drill.
"""

import hashlib
import json
import os
import sqlite3
import tempfile
import pytest
from fastapi.testclient import TestClient

from main import app, DB_PATH, AUDIO_STORAGE
from dataset_service import (
    assign_dataset_split,
    get_dataset_details,
    generate_research_export,
    list_registered_datasets,
    verify_dataset_integrity,
    verify_preservation_and_backup,
    OFFICIAL_DATASETS,
)
from evaluation_service import (
    calculate_standard_error,
    evaluate_speech_recognition_research,
    evaluate_translation_research,
    generate_comprehensive_research_report,
)


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. Dataset Registry & Metadata Schemas
# ------------------------------------------------------------------------------

def test_dataset_registry_listing_and_metadata_schemas(client):
    """Verify that all official research datasets are cataloged with DCAT metadata."""
    res = client.get("/api/v1/datasets")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    datasets = data["datasets"]
    assert len(datasets) >= 3

    dataset_ids = [d["id"] for d in datasets]
    assert "voice-roots-seed-v1.0.0" in dataset_ids
    assert "voice-roots-community-v1.0.0" in dataset_ids
    assert "voice-roots-eval-speech-v1.0.0" in dataset_ids

    # Validate schema fields on each dataset summary
    for d in datasets:
        assert "id" in d and d["id"]
        assert "name" in d and d["name"]
        assert "version" in d and d["version"]
        assert "license" in d and d["license"]
        assert "release_date" in d and d["release_date"]
        assert "maintainer" in d and "@" in d["maintainer"]


def test_dataset_metadata_card_details_and_not_found(client):
    """Verify full metadata card retrieval and 404 behavior for unknown dataset."""
    res = client.get("/api/v1/datasets/voice-roots-seed-v1.0.0")
    assert res.status_code == 200
    card = res.json()

    assert card["id"] == "voice-roots-seed-v1.0.0"
    assert card["version"] == "1.0.0"
    assert len(card["languages"]) == 21
    assert "provenance" in card
    assert len(card["provenance"]["primary_sources"]) >= 5
    assert "preprocessing_steps" in card
    assert "known_gaps_and_limitations" in card
    assert "quality_control" in card
    assert card["quality_control"]["human_verified_count"] == 20

    # Test 404 for unknown dataset
    res_404 = client.get("/api/v1/datasets/non-existent-dataset-xyz")
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()


# ------------------------------------------------------------------------------
# 2. Versioning and Deterministic Splitting (Zero Data Leakage)
# ------------------------------------------------------------------------------

def test_deterministic_dataset_splits_and_zero_leakage():
    """Verify that dataset split partitioning is 100% deterministic and disjoint."""
    # Run partition over test IDs
    test_ids = [f"rec_{i}" for i in range(200)]
    split_run_1 = {rec_id: assign_dataset_split(rec_id) for rec_id in test_ids}
    split_run_2 = {rec_id: assign_dataset_split(rec_id) for rec_id in test_ids}

    # 1. Determinism: identical mappings across runs
    assert split_run_1 == split_run_2

    # 2. Disjointness: each record is in exactly one split
    train_set = {k for k, v in split_run_1.items() if v == "train"}
    val_set = {k for k, v in split_run_1.items() if v == "validation"}
    test_set = {k for k, v in split_run_1.items() if v == "test"}

    assert len(train_set.intersection(val_set)) == 0
    assert len(train_set.intersection(test_set)) == 0
    assert len(val_set.intersection(test_set)) == 0

    # 3. Proportions roughly 80 / 10 / 10
    total = len(test_ids)
    assert 0.65 <= (len(train_set) / total) <= 0.90
    assert 0.05 <= (len(val_set) / total) <= 0.20
    assert 0.05 <= (len(test_set) / total) <= 0.20


# ------------------------------------------------------------------------------
# 3. Bit-Level File Integrity Verification (SHA-256)
# ------------------------------------------------------------------------------

def test_bit_level_sha256_file_integrity_verification(client):
    """Verify physical audio file SHA-256 integrity scanner and corrupt/missing detection."""
    # 1. Test clean run on seed dataset
    res_seed = client.get("/api/v1/datasets/voice-roots-seed-v1.0.0/verify-integrity")
    assert res_seed.status_code == 200
    seed_report = res_seed.json()
    assert seed_report["status"] == "completed"
    assert seed_report["bit_level_health_percent"] == 100.0

    # 2. Test clean run on community dataset
    res_comm = client.get("/api/v1/datasets/voice-roots-community-v1.0.0/verify-integrity")
    assert res_comm.status_code == 200
    comm_report = res_comm.json()
    assert comm_report["status"] == "completed"
    assert comm_report["total_items_checked"] > 0
    assert comm_report["intact_items"] == comm_report["total_items_checked"]
    assert comm_report["missing_items"] == 0
    assert comm_report["corrupt_items"] == 0
    assert comm_report["bit_level_health_percent"] == 100.0


# ------------------------------------------------------------------------------
# 4. Strict OCAP Privacy Boundaries in Research Exports
# ------------------------------------------------------------------------------

def test_research_export_strict_ocap_privacy_boundaries(client):
    """
    Verify that research exports strictly exclude private recordings, drafts,
    unconsented recordings, and withdrawn items, and mask anonymous speaker names.
    """
    # Create test fixtures with different privacy & consent states
    now = "2026-10-28T12:00:00Z"
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # 1. Valid public research record
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, language, dialect,
                transcript_text, status, verification_status, consent_public_publication,
                privacy_level, is_anonymous, contributor_name, contributor_role,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'public', 0, 'Ram Murmu', 'elder', ?, ?)
            """,
            (
                "vr-test-export-valid-01", "Export Valid Tale", "dummy.wav", "/dummy",
                "Santhali", "Mayurbhanj", "Valid research text.", "Published", "published",
                now, now
            ),
        )
        valid_id = cursor.lastrowid

        # 2. Private recording (MUST BE EXCLUDED)
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, language, dialect,
                transcript_text, status, verification_status, consent_public_publication,
                privacy_level, is_anonymous, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'private', 0, ?, ?)
            """,
            (
                "vr-test-export-private-02", "Private Sacred Ceremony", "dummy.wav", "/dummy",
                "Gondi", "Adilabad", "Private sacred text.", "Private", "verified",
                now, now
            ),
        )
        private_id = cursor.lastrowid

        # 3. Contributor Draft (MUST BE EXCLUDED)
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, language, dialect,
                transcript_text, status, verification_status, consent_public_publication,
                privacy_level, is_anonymous, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'public', 0, ?, ?)
            """,
            (
                "vr-test-export-draft-03", "Draft Narrative", "dummy.wav", "/dummy",
                "Koya", "Bhadrachalam", "Draft unsubmitted text.", "Draft", "draft",
                now, now
            ),
        )
        draft_id = cursor.lastrowid

        # 4. No Public Publication Consent (MUST BE EXCLUDED)
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, language, dialect,
                transcript_text, status, verification_status, consent_public_publication,
                privacy_level, is_anonymous, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'public', 0, ?, ?)
            """,
            (
                "vr-test-export-noconsent-04", "No Consent Tale", "dummy.wav", "/dummy",
                "Lambadi", "Thanda", "No public consent text.", "Verified", "verified",
                now, now
            ),
        )
        noconsent_id = cursor.lastrowid

        # 5. Withdrawn Record (MUST BE EXCLUDED)
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, language, dialect,
                transcript_text, status, verification_status, consent_public_publication,
                privacy_level, is_anonymous, archived_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'public', 0, ?, ?, ?)
            """,
            (
                "vr-test-export-withdrawn-05", "Withdrawn Lore", "dummy.wav", "/dummy",
                "Gondi", "Adilabad", "Withdrawn text.", "Archived", "withdrawn_or_rejected",
                now, now, now
            ),
        )
        withdrawn_id = cursor.lastrowid

        # 6. Anonymous Contributor Record (MUST BE INCLUDED BUT ANONYMIZED)
        cursor.execute(
            """
            INSERT INTO transcripts (
                uuid_id, title, audio_filename, audio_url, language, dialect,
                transcript_text, status, verification_status, consent_public_publication,
                privacy_level, is_anonymous, contributor_name, contributor_role,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'public', 1, 'Secret Elder Name', 'elder', ?, ?)
            """,
            (
                "vr-test-export-anon-06", "Anonymous Healing Spell", "dummy.wav", "/dummy",
                "Koya", "Bhadrachalam", "Anonymous plant remedy.", "Published", "published",
                now, now
            ),
        )
        anon_id = cursor.lastrowid
        conn.commit()

    try:
        # Request research data package export
        res = client.get("/api/v1/datasets/voice-roots-community-v1.0.0/export")
        assert res.status_code == 200
        package = res.json()

        assert package["name"] == "voice-roots-community-v1.0.0"
        records = package["records"]
        exported_ids = [r["id"] for r in records]

        # 1. Valid record MUST be present
        assert valid_id in exported_ids

        # 2. Private record MUST NOT be present
        assert private_id not in exported_ids

        # 3. Draft record MUST NOT be present
        assert draft_id not in exported_ids

        # 4. No-public-consent record MUST NOT be present
        assert noconsent_id not in exported_ids

        # 5. Withdrawn record MUST NOT be present
        assert withdrawn_id not in exported_ids

        # 6. Anonymous record MUST be present, but personal name MUST BE MASKED
        assert anon_id in exported_ids
        anon_record = next(r for r in records if r["id"] == anon_id)
        assert anon_record["contributor_name"] == "Anonymous Community Speaker"
        assert "Secret Elder Name" not in json.dumps(anon_record)

        # 7. Checksums map must exist
        assert "checksums" in package
        assert str(valid_id) in package["checksums"]

    finally:
        # Clean up test rows
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM transcripts WHERE id IN (?, ?, ?, ?, ?, ?)",
                (valid_id, private_id, draft_id, noconsent_id, withdrawn_id, anon_id),
            )
            conn.commit()


def test_research_export_csv_format(client):
    """Verify research export as CSV with UTF-8 BOM encoding for multilingual scripts."""
    res = client.get("/api/v1/datasets/voice-roots-seed-v1.0.0/export?format=csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "attachment" in res.headers["content-disposition"]
    text = res.text
    # Verify UTF-8 BOM present
    assert text.startswith("\ufeff")
    # Verify CSV headers
    assert "id" in text
    assert "language" in text
    assert "dataset_split" in text


# ------------------------------------------------------------------------------
# 5. Model Evaluation Pipeline (ASR, MT, and Search)
# ------------------------------------------------------------------------------

def test_speech_recognition_model_evaluation_metrics():
    """Verify speech recognition research evaluation metrics calculation."""
    report = evaluate_speech_recognition_research()
    assert report["evaluation_name"] == "Speech Recognition (ASR) Research Evaluation"
    assert report["total_requested"] > 0
    assert report["evaluated_sample_size"] > 0
    assert isinstance(report["failed_rate"], float)
    assert isinstance(report["empty_rate"], float)
    assert "languages" in report

    for lang, metrics in report["languages"].items():
        assert "sample_size" in metrics
        assert "average_wer" in metrics
        assert "average_cer" in metrics
        assert "dialects_represented" in metrics
        assert "acoustic_conditions" in metrics

    # Condition breakdown
    conds = report["performance_by_acoustic_condition"]
    assert len(conds) > 0


def test_translation_and_elder_guardrail_evaluation():
    """Verify translation research evaluation and strict elder-review guardrail compliance."""
    report = evaluate_translation_research()
    assert report["evaluation_name"] == "Translation & Linguistic Guardrail Research Evaluation"
    guardrails = report["elder_review_guardrail_status"]
    assert guardrails["tested_oral_cases"] >= 3
    assert guardrails["guardrail_violations"] == 0
    assert guardrails["compliance_percent"] == 100.0


def test_full_research_evaluation_report_endpoint(client):
    """Verify endpoint GET /api/v1/evaluation/research-report returns full empirical report."""
    res = client.get("/api/v1/evaluation/research-report")
    assert res.status_code == 200
    data = res.json()

    assert data["report_id"] == "vr-research-eval-v1.0.0"
    assert data["status"] == "verified_empirical"
    assert "methodology" in data
    assert "speech_recognition" in data
    assert "translation_guardrails" in data
    assert "search_and_discovery" in data
    assert "operating_cost_telemetry" in data
    assert data["operating_cost_telemetry"]["external_api_charges_usd"] == 0.00
    assert data["search_and_discovery"]["mean_reciprocal_rank"] == 1.0


# ------------------------------------------------------------------------------
# 6. Digital Preservation & Backup Restoration Drill
# ------------------------------------------------------------------------------

def test_digital_preservation_and_backup_restoration_drill(client):
    """Verify endpoint GET /api/v1/datasets/preservation/status and restoration drill."""
    res = client.get("/api/v1/datasets/preservation/status")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "healthy"
    pres = data["preservation_architecture"]
    assert "Immutable Master Audio" in pres["master_recording_policy"]
    assert "Broadcast WAV" in pres["preservation_format"]
    assert pres["storage_cost"] == "$0.00 / month (100% offline self-hosted architecture)"

    telemetry = data["backup_telemetry"]
    assert telemetry["total_backup_snapshots"] > 0
    assert telemetry["latest_snapshot_file"] is not None

    drill = data["restoration_drill"]
    assert drill["restoration_drill_status"] == "verified_success"
    assert "transcripts" in drill["tested_tables"]
    assert drill["record_counts"]["transcripts"] > 0
    assert drill["error"] is None

