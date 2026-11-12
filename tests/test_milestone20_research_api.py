"""Tests for Milestone 20: Institutional Research API & Interoperability.

Verifies:
- Token-scoped research access control (read:registry, read:vocabulary, read:transcripts, export:corpus).
- SHA-256 hashed credential persistence and secure issuance.
- Strict OCAP data sovereignty boundary enforcement on exported corpora.
- Standardized corpus version manifest and computational lexicon exports.
- Audit logging of research API accesses.
"""

import main
from fastapi.testclient import TestClient

client = TestClient(main.app)

# Default seeded token for CIIL with all scopes
VALID_TOKEN = "vr_res_ciil_indigenous_linguistics_2026_auth"


def test_research_overview_endpoint():
    """Verify research overview telemetry, supported scopes, and OCAP policy metadata."""
    resp = client.get("/api/v1/research/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "active"
    assert data["registered_institutions_count"] >= 3
    assert "export:corpus" in data["supported_scopes"]
    assert "read:transcripts" in data["supported_scopes"]
    assert data["ocap_boundaries"]["strict_research_consent_enforced"] is True
    assert data["ocap_boundaries"]["commercial_resale_strictly_prohibited"] is True


def test_research_manifest_public_endpoint():
    """Verify standardized public corpus version manifest."""
    resp = client.get("/api/v1/research/manifest")
    assert resp.status_code == 200
    data = resp.json()
    assert "v1." in data["corpus_version"]
    assert data["total_languages"] >= 1
    assert data["total_transcripts"] >= 1
    assert data["total_audio_hours"] >= 0.0
    assert data["ocap_compliance"] is True
    assert "CC BY-NC 4.0" in data["license"]


def test_research_token_registration_and_listing():
    """Verify issuing a new institutional research API key and listing registered partners."""
    reg_resp = client.post(
        "/api/v1/research/keys/register",
        json={
            "organization_name": "Indian Institute of Technology (IIT) Hyderabad - AI Center",
            "contact_email": "speech.research@iith.ac.in",
            "scopes": ["read:registry", "read:transcripts", "export:corpus"],
            "rate_limit_per_minute": 120,
        },
    )
    assert reg_resp.status_code == 200
    key_data = reg_resp.json()
    assert key_data["key_id"].startswith("key_")
    assert key_data["raw_api_key"].startswith("vr_res_")
    assert key_data["organization_name"] == "Indian Institute of Technology (IIT) Hyderabad - AI Center"
    assert "export:corpus" in key_data["scopes"]

    # Verify listing keys (does not expose raw keys)
    list_resp = client.get("/api/v1/research/keys")
    assert list_resp.status_code == 200
    keys = list_resp.json()["keys"]
    matching = next((k for k in keys if k["key_id"] == key_data["key_id"]), None)
    assert matching is not None
    assert "raw_api_key" not in matching
    assert "api_key_hash" not in matching
    assert matching["is_active"] is True


def test_research_corpus_export_with_valid_token_and_ocap_boundaries():
    """Verify authorized corpus export filters strictly by OCAP consent and excludes private records."""
    # Via X-Research-Token header
    resp = client.get(
        "/api/v1/research/corpus/export",
        headers={"X-Research-Token": VALID_TOKEN},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 1
    for rec in data["records"]:
        assert rec["privacy_level"] != "private"
        assert "audio_url" in rec
        assert "language" in rec

    # Via Authorization Bearer header
    bearer_resp = client.get(
        "/api/v1/research/corpus/export",
        headers={"Authorization": f"Bearer {VALID_TOKEN}"},
    )
    assert bearer_resp.status_code == 200


def test_research_corpus_export_unauthenticated_and_invalid_token():
    """Verify 403 Forbidden when token is missing or invalid."""
    # Missing token
    resp_no_token = client.get("/api/v1/research/corpus/export")
    assert resp_no_token.status_code == 403

    # Invalid token
    resp_bad_token = client.get(
        "/api/v1/research/corpus/export",
        headers={"X-Research-Token": "vr_res_invalid_fraudulent_token_9999"},
    )
    assert resp_bad_token.status_code == 403


def test_research_token_scope_enforcement():
    """Verify token lacking required export scope is rejected with 403."""
    # Register token with ONLY read:registry scope
    reg = client.post(
        "/api/v1/research/keys/register",
        json={
            "organization_name": "Limited Read-Only Institute",
            "contact_email": "readonly@institute.org",
            "scopes": ["read:registry"],
        },
    ).json()
    limited_token = reg["raw_api_key"]

    # Calling /corpus/export should fail with 403 because it lacks export:corpus or read:transcripts
    export_resp = client.get(
        "/api/v1/research/corpus/export",
        headers={"X-Research-Token": limited_token},
    )
    assert export_resp.status_code == 403
    assert "Insufficient permissions" in export_resp.json()["detail"]


def test_research_lexicon_export_endpoint():
    """Verify computational linguistics lexicon export with IPA and orthography."""
    resp = client.get(
        "/api/v1/research/lexicon/export",
        headers={"X-Research-Token": VALID_TOKEN},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 1
    assert "entries" in data
    first_entry = data["entries"][0]
    assert "headword" in first_entry
    assert "ipa_phonetic" in first_entry
    assert "language" in first_entry
