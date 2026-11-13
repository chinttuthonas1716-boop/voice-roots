"""Voice Roots: Milestone 33 — Institutional Pilot Launch Gate Test Suite.
=============================================================================
Formally verifies all 5 Operational Pilot Gates (G-01 to G-05) required for
institutional pilot deployment:
  - G-01: Ethics IRB Review Package & Human Subjects Protocol
  - G-02: Bilateral Tribal Council Governance Treaties (Gondi, Koya, Santhali, Lambadi)
  - G-03: Multilingual Oral Consent Audio Prompts & Cryptographic Integrity
  - G-04: Zero Cloud Cost & Air-Gapped Offline PWA Readiness ($0.00 Spend)
  - G-05: Cross-Module System Integrity & Automated Verification Runner

All checks enforce OCAP data sovereignty principles and complete regression safety.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
SCRIPTS_DIR = ROOT_DIR / "scripts"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from main import app  # noqa: E402
from verify_pilot_gates import (  # noqa: E402
    check_gate_01_irb_protocol,
    check_gate_02_tribal_accords,
    check_gate_03_oral_consent_prompts,
    check_gate_04_zero_cost_and_offline,
    check_gate_05_system_integrity,
    verify_all_pilot_gates,
)


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_gate_01_irb_protocol_and_ethics_safeguards():
    """Verify G-01: IRB Ethics Package, UNDRIP 31, OCAP principles, and cascading revocation."""
    g1 = check_gate_01_irb_protocol()
    assert g1["passed"] is True, f"Gate G-01 failed: {g1}"
    assert g1["size_bytes"] > 5000
    assert g1["checks"]["undrip_art31"] is True
    assert g1["checks"]["ocap_principles"] is True
    assert g1["checks"]["six_facet_consent"] is True
    assert g1["checks"]["sacred_lore_shielding"] is True
    assert g1["checks"]["cascading_revocation"] is True
    assert g1["checks"]["irb_approval_signoff"] is True


def test_gate_02_bilateral_tribal_council_treaties():
    """Verify G-02: Bilateral Tribal Council Accords for all 4 partner communities."""
    g2 = check_gate_02_tribal_accords()
    assert g2["passed"] is True, f"Gate G-02 failed: {g2}"
    assert g2["size_bytes"] > 4000
    assert g2["councils"]["gondi_advisory_council"] is True
    assert g2["councils"]["koya_elder_council"] is True
    assert g2["councils"]["santhal_manjhi_council"] is True
    assert g2["councils"]["lambadi_tanda_board"] is True
    assert g2["councils"]["ratified_status"] is True


def test_gate_03_oral_consent_audio_prompts_and_integrity():
    """Verify G-03: Multilingual oral consent audio prompts, WAV headers, and SHA-256 hashes."""
    g3 = check_gate_03_oral_consent_prompts()
    assert g3["passed"] is True, f"Gate G-03 failed: {g3}"
    assert g3["prompts_verified_count"] == 4

    details = g3["details"]
    for code in ["gon", "kff", "sat", "lmn"]:
        assert code in details
        prompt = details[code]
        assert prompt["sample_rate"] == 16000
        assert prompt["channels"] == 1
        assert prompt["duration_seconds"] >= 3.0
        assert prompt["sha256_verified"] is True
        assert prompt["has_vernacular_text"] is True
        assert prompt["has_english_text"] is True


def test_gate_04_zero_cloud_cost_and_offline_pwa():
    """Verify G-04: Strict $0.00 cloud API spend and offline PWA assets."""
    g4 = check_gate_04_zero_cost_and_offline()
    assert g4["passed"] is True, f"Gate G-04 failed: {g4}"
    assert "$0.00" in g4["cloud_spend_target"]
    assert g4["pwa_service_worker"] is True
    assert g4["pwa_details"]["name_in_manifest"] is True
    assert g4["pwa_details"]["standalone_display"] is True
    assert g4["pwa_details"]["service_worker_bytes"] > 500


def test_gate_05_system_integrity_and_pilot_verification_runner():
    """Verify G-05: Programmatic verification runner certifies 5/5 gates and writes report."""
    g5 = check_gate_05_system_integrity()
    assert g5["passed"] is True, f"Gate G-05 failed: {g5}"
    assert all(g5["endpoint_health"].values())

    report = verify_all_pilot_gates()
    assert report["institutional_status"] == "CERTIFIED_PILOT_READY"
    assert report["summary"]["gates_passed"] == 5
    assert report["summary"]["overall_certified"] is True

    report_path = ROOT_DIR / "docs" / "PILOT_VERIFICATION_REPORT.json"
    assert report_path.exists()
    with open(report_path, encoding="utf-8") as f:
        loaded = json.load(f)
        assert loaded["institutional_status"] == "CERTIFIED_PILOT_READY"
        assert loaded["summary"]["gates_passed"] == 5


def test_end_to_end_pilot_readiness_certification(client):
    """Verify all 7 v2.0 modules respond cleanly under integrated pilot validation."""
    # 1. Module 1: Speech Alignment
    transcripts_resp = client.get("/api/transcripts")
    assert transcripts_resp.status_code == 200
    t_list = transcripts_resp.json().get("transcripts", [])
    assert len(t_list) > 0
    tid = t_list[0]["id"]
    r_align = client.get(f"/api/v1/speech/alignments/{tid}")
    assert r_align.status_code == 200

    # 2. Module 2: Multilingual Dictionary Overview
    r_dict = client.get("/api/v1/dictionary/overview")
    assert r_dict.status_code == 200
    assert r_dict.json()["total_words"] >= 20

    # 3. Module 3: Grounded AI Assistant
    r_ast = client.get("/api/v1/assistant/suggestions")
    assert r_ast.status_code == 200
    assert len(r_ast.json()["suggestions"]) >= 4

    # 4. Module 4: Cultural Archives Public Stories
    r_cult = client.get("/api/v1/cultural-archives/stories?include_teasers=true")
    assert r_cult.status_code == 200
    assert len(r_cult.json()) >= 1

    # 5. Module 5: Language Explorer
    r_exp = client.get("/api/v1/explorer/phylogenetic-tree")
    assert r_exp.status_code == 200
    assert r_exp.json()["total_languages"] == 44

    # 6. Module 6: Learning Studio Spaced Repetition
    r_learn = client.get("/api/v1/learning/srs/queue?learner_id=pilot_verifier&include_future=true")
    assert r_learn.status_code == 200
    assert len(r_learn.json()["cards"]) >= 6

    # 7. Module 7: Command Center
    r_cmd = client.get("/api/v1/command-center/overview")
    assert r_cmd.status_code == 200
    assert r_cmd.json()["status"] == "healthy"
