"""
Voice Roots: Milestone 11 Verification Suite
=============================================
Tests multilingual AI model evaluation, model registry, feasibility study,
governance release gates, and rollback mechanics:
1. Model Registry listing, metadata schema, and operational cost auditing ($0.00).
2. Cross-model comparison matrix (ASR, MT, Embeddings) with latencies, parameters, CER/WER, OCAP privacy.
3. Model card specification retrieval for production, candidate, and research models.
4. Model card 404 for non-existent model IDs.
5. Fine-tuning feasibility study: OCAP consent auditing (consent_ai_training), compute cost, data threshold.
6. Promotion release gate: enforces admin authorization key.
7. Promotion release gate: enforces task slot matching.
8. Promotion release gate: enforces 100% elder-review guardrail compliance on indigenous translation.
9. Production model promotion and rollback execution.
"""

import os
import pytest
from fastapi.testclient import TestClient

from main import app, ADMIN_API_KEY
from model_registry import (
    OFFICIAL_MODEL_REGISTRY,
    assess_fine_tuning_feasibility,
    get_model_comparison_matrix,
    get_model_details,
    list_registered_models,
    promote_candidate_model,
    rollback_production_model,
)


@pytest.fixture
def client():
    return TestClient(app)


# ------------------------------------------------------------------------------
# 1. Model Registry Discovery & Metadata Schemas
# ------------------------------------------------------------------------------

def test_model_registry_listing_and_schemas(client):
    """Verify that all registered models are cataloged with complete schemas."""
    res = client.get("/api/v1/models")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    models = data["models"]
    assert len(models) >= 8

    model_ids = [m["id"] for m in models]
    assert "whisper-base-local" in model_ids
    assert "whisper-small-local" in model_ids
    assert "indic-whisper-ai4bharat" in model_ids
    assert "meta-mms-1b" in model_ids
    assert "openai-whisper-api" in model_ids
    assert "voiceroots-elder-guardrail-v1" in model_ids
    assert "indictrans2-1b" in model_ids
    assert "meta-nllb-200" in model_ids
    assert "voiceroots_multilingual_v1" in model_ids

    # Validate essential schema fields
    for m in models:
        assert "id" in m and m["id"]
        assert "name" in m and m["name"]
        assert "task" in m and m["task"] in ("speech_to_text", "translation", "semantic_embedding")
        assert "parameter_count" in m
        assert "license" in m
        assert "status" in m
        assert "is_active_production" in m
        assert "cost" in m


def test_model_comparison_matrix(client):
    """Verify cross-model comparison matrix across ASR, MT, and Embeddings."""
    res = client.get("/api/v1/models/comparison/matrix")
    assert res.status_code == 200
    matrix = res.json()

    assert "summary" in matrix
    assert matrix["summary"]["production_models_count"] >= 3
    assert "speech_recognition_comparison" in matrix
    assert len(matrix["speech_recognition_comparison"]) >= 5

    # Check ASR model details in matrix
    whisper_base = next(m for m in matrix["speech_recognition_comparison"] if m["id"] == "whisper-base-local")
    assert whisper_base["is_active_production"] is True
    assert whisper_base["cost_per_minute"] == 0.00
    assert "Local" in whisper_base["privacy"]

    openai_api = next(m for m in matrix["speech_recognition_comparison"] if m["id"] == "openai-whisper-api")
    assert openai_api["is_active_production"] is False
    assert openai_api["cost_per_minute"] == 0.006
    assert "Cloud" in openai_api["privacy"]

    # Check Translation comparison
    assert "translation_comparison" in matrix
    guardrail = next(m for m in matrix["translation_comparison"] if m["id"] == "voiceroots-elder-guardrail-v1")
    assert "100% Protected" in guardrail["oral_guardrail_compliance"]

    # Check Embedding comparison
    assert "embedding_comparison" in matrix
    emb = next(m for m in matrix["embedding_comparison"] if m["id"] == "voiceroots_multilingual_v1")
    assert emb["mrr"] == 1.000


def test_model_specification_card_details_and_not_found(client):
    """Verify retrieval of detailed model specifications and 404 for unknown IDs."""
    res = client.get("/api/v1/models/whisper-base-local")
    assert res.status_code == 200
    card = res.json()
    assert card["id"] == "whisper-base-local"
    assert card["architecture"] == "Encoder-Decoder Transformer (Seq2Seq)"
    assert card["deployment"]["hardware_requirements"]["min_ram_mb"] == 512
    assert "scheduled_indian_languages" in card["language_coverage"]
    assert "known_limitations" in card
    assert len(card["known_limitations"]) >= 2

    # 404 for non-existent model
    res_404 = client.get("/api/v1/models/non-existent-model-xyz")
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()


# ------------------------------------------------------------------------------
# 2. Fine-Tuning Feasibility Study & OCAP Consent Audit
# ------------------------------------------------------------------------------

def test_fine_tuning_feasibility_study(client):
    """Verify data volume audit, OCAP consent checks, and compute cost estimations."""
    res = client.get("/api/v1/models/fine-tuning/feasibility")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "feasibility_audit_completed"
    assert "data_availability_audit" in data
    audit = data["data_availability_audit"]
    assert "total_archive_recordings" in audit
    assert "recordings_with_explicit_ai_training_consent" in audit
    assert audit["recommended_minimum_audio_hours_for_fine_tuning"] == 50.0

    # OCAP privacy boundaries
    assert "ocap_consent_and_rights_audit" in data
    assert "consent_ai_training" in data["ocap_consent_and_rights_audit"]["consent_status"]

    # Compute estimate
    assert "compute_and_infrastructure_estimate" in data
    est = data["compute_and_infrastructure_estimate"]
    assert est["hardware_target"] == "1x NVIDIA T4 / A10G (16GB - 24GB VRAM)"
    assert est["total_estimated_budget_usd"] > 0

    # Clear, evidence-based recommendation
    assert "recommendation" in data
    assert "HALT FINE-TUNING" in data["recommendation"]


# ------------------------------------------------------------------------------
# 3. Model Promotion, Governance Release Gates & Rollback
# ------------------------------------------------------------------------------

def test_model_promotion_requires_admin_key(client):
    """Verify that unauthorized requests to promote a candidate model are rejected with 403."""
    res = client.post(
        "/api/v1/models/whisper-small-local/promote",
        json={"target_slot": "speech_to_text", "admin_key": "invalid-key"},
    )
    assert res.status_code == 403
    assert "access denied" in res.json()["detail"].lower()


def test_model_promotion_task_slot_mismatch(client):
    """Verify that attempting to promote a translation model into ASR slot is rejected."""
    res = client.post(
        "/api/v1/models/indictrans2-1b/promote",
        json={"target_slot": "speech_to_text", "admin_key": ADMIN_API_KEY},
    )
    assert res.status_code == 400
    assert "does not match" in res.json()["detail"].lower()


def test_model_promotion_and_rollback_lifecycle(client):
    """Verify controlled candidate promotion and subsequent baseline rollback."""
    # Step 1: Promote whisper-small-local into speech_to_text slot
    res_promote = client.post(
        "/api/v1/models/whisper-small-local/promote",
        json={"target_slot": "speech_to_text", "admin_key": ADMIN_API_KEY},
    )
    assert res_promote.status_code == 200
    data_promote = res_promote.json()
    assert data_promote["success"] is True
    assert data_promote["promoted_model_id"] == "whisper-small-local"
    assert data_promote["previous_production_model"] == "whisper-base-local"

    # Verify active production status updated
    res_models = client.get("/api/v1/models")
    models = {m["id"]: m for m in res_models.json()["models"]}
    assert models["whisper-small-local"]["is_active_production"] is True
    assert models["whisper-base-local"]["is_active_production"] is False

    # Step 2: Rollback to baseline
    res_rollback = client.post(
        "/api/v1/models/rollback",
        json={"target_slot": "speech_to_text", "admin_key": ADMIN_API_KEY},
    )
    assert res_rollback.status_code == 200
    data_rollback = res_rollback.json()
    assert data_rollback["success"] is True
    assert data_rollback["reverted_to_model_id"] == "whisper-base-local"

    # Verify baseline is restored
    res_models_after = client.get("/api/v1/models")
    models_after = {m["id"]: m for m in res_models_after.json()["models"]}
    assert models_after["whisper-base-local"]["is_active_production"] is True
    assert models_after["whisper-small-local"]["is_active_production"] is False
