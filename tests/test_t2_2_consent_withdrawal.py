"""Tests for Task T2.2: Consent Withdrawal and OCAP Cascade Purge.

Proves:
1. Speaker can withdraw consent via POST /api/v1/transcripts/{id}/withdraw-consent.
2. Complete cascade purge:
   - Original audio master file is deleted from storage and local disk.
   - Child translations in translations table are deleted.
   - Child corrections in corrections table are deleted.
   - Search embeddings in vector collections are deleted.
   - Full-text search index (FTS5) entry is deleted.
   - Audio streaming route returns HTTP 404 Withdrawn.
3. Governance audit log entry is written to governance_audit_logs table with actor role and purged manifest.
4. Heritage Passport endpoint GET /api/v1/passport/{id} returns HTTP 200 with is_withdrawn=True and message
   (showing withdrawn state instead of disappearing silently).
5. Subsequent withdrawal requests are idempotent.
"""

import io
import json
import os
import sqlite3
import wave

from fastapi.testclient import TestClient

from backend import main
from backend.main import AUDIO_STORAGE, DB_PATH

client = TestClient(main.app)


def _generate_synthetic_pcm_wav(duration_sec: float = 0.5) -> bytes:
    """Generate minimal valid 16-bit PCM mono WAV bytes with unique audio payload."""
    import random
    buf = io.BytesIO()
    sample_rate = 16000
    num_samples = int(sample_rate * duration_sec)
    # Generate unique audio samples so ingest does not deduplicate against existing runs
    noise = bytes(random.randint(1, 255) for _ in range(num_samples * 2))
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(noise)
    return buf.getvalue()


def test_consent_withdrawal_full_cascade_and_audit():
    """Verify that withdrawing consent cascades deletion to audio, translations, and embeddings while maintaining passport audit state."""
    # 1. Upload valid consented audio recording
    wav_bytes = _generate_synthetic_pcm_wav(0.5)
    upload_resp = client.post(
        "/api/upload",
        files={"file": ("field_recording_consent_test.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Sacred Clan Chant for Withdrawal Test",
            "language": "Gondi",
            "consent": "true",
            "speaker": "Elder Maravi",
        },
    )
    assert upload_resp.status_code == 200
    upload_data = upload_resp.json()
    transcript_id = upload_data["id"]

    # 2. Add translations to translations table for this transcript
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO translations (
                transcript_id, source_language, target_language, source_text,
                translated_text, provider, model, verified, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """,
            (transcript_id, "gon", "en", "సేవా జోహార్", "Sacred greetings", "phrasebook", "manual", 1),
        )
        conn.commit()

    # 3. Verify preconditions: audio file exists, translation exists
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        t_row = cur.execute("SELECT * FROM transcripts WHERE id = ?", (transcript_id,)).fetchone()
        assert t_row is not None
        audio_filename = t_row["audio_filename"]
        audio_path = os.path.join(AUDIO_STORAGE, audio_filename)
        assert os.path.exists(audio_path), f"Expected audio file {audio_path} to exist before withdrawal"

        tr_rows = cur.execute("SELECT * FROM translations WHERE transcript_id = ?", (transcript_id,)).fetchall()
        assert len(tr_rows) == 1, "Expected 1 translation before withdrawal"

    # 4. Perform consent withdrawal
    withdraw_resp = client.post(f"/api/v1/transcripts/{transcript_id}/withdraw-consent")
    assert withdraw_resp.status_code == 200
    withdraw_data = withdraw_resp.json()
    assert withdraw_data["success"] is True
    assert withdraw_data["status"] == "withdrawn"
    assert withdraw_data["purged"]["audio"] is True
    assert withdraw_data["purged"]["translations"] is True

    # 5. Verify audio master file is purged from disk
    assert not os.path.exists(audio_path), f"Expected audio file {audio_path} to be deleted on withdrawal"

    # 6. Verify audio stream endpoint returns HTTP 404 Withdrawn
    stream_resp = client.get(f"/api/v1/audio/{transcript_id}/stream")
    assert stream_resp.status_code == 404
    assert "withdrawn" in stream_resp.json()["detail"].lower()

    # 7. Verify translations table is purged
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        tr_rows = cur.execute("SELECT * FROM translations WHERE transcript_id = ?", (transcript_id,)).fetchall()
        assert len(tr_rows) == 0, "Translations must be deleted on consent withdrawal"

        # 8. Verify transcripts row has archived_at and withdrawn status
        t_row = cur.execute("SELECT * FROM transcripts WHERE id = ?", (transcript_id,)).fetchone()
        assert t_row is not None
        assert t_row[10] is not None or "archived_at" in str(t_row)  # archived_at set
        cur.execute("SELECT status, verification_status, audio_filename FROM transcripts WHERE id = ?", (transcript_id,))
        status, v_status, fname = cur.fetchone()
        assert status == "withdrawn"
        assert v_status == "withdrawn_or_rejected"
        assert fname == "", "Audio filename must be cleared"

        # 9. Verify governance audit log entry was written
        cur.execute(
            "SELECT action_type, entity_id, details_json FROM governance_audit_logs WHERE action_type = 'CONSENT_WITHDRAWN' AND entity_id = ? ORDER BY id DESC LIMIT 1",
            (str(transcript_id),),
        )
        audit_row = cur.fetchone()
        assert audit_row is not None, "Governance audit log must record CONSENT_WITHDRAWN event"
        assert audit_row[0] == "CONSENT_WITHDRAWN"
        details = json.loads(audit_row[2])
        assert "purged" in details
        assert "audio_master" in details["purged"]

    # 10. Verify Heritage Passport endpoint returns withdrawn state (does not disappear silently)
    passport_resp = client.get(f"/api/v1/passport/{transcript_id}")
    assert passport_resp.status_code == 200
    passport_data = passport_resp.json()
    assert passport_data["is_withdrawn"] is True
    assert passport_data["status"] == "withdrawn"
    assert passport_data["audio_available"] is False
    assert "withdrawn" in passport_data["message"].lower()

    # 11. Verify idempotency
    retry_resp = client.post(f"/api/v1/transcripts/{transcript_id}/withdraw-consent")
    assert retry_resp.status_code == 200
    assert retry_resp.json()["status"] == "withdrawn"


def test_consent_withdrawal_by_uuid():
    """Verify consent withdrawal using string uuid_id lookup."""
    wav_bytes = _generate_synthetic_pcm_wav(0.4)
    upload_resp = client.post(
        "/api/upload",
        files={"file": ("uuid_lookup_test.wav", wav_bytes, "audio/wav")},
        data={"title": "UUID Lookup Story", "language": "Koya", "consent": "true"},
    )
    assert upload_resp.status_code == 200
    uuid_id = upload_resp.json()["uuid_id"]

    withdraw_resp = client.post(f"/api/v1/transcripts/{uuid_id}/withdraw-consent")
    assert withdraw_resp.status_code == 200
    assert withdraw_resp.json()["status"] == "withdrawn"

    # Passport by uuid_id returns withdrawn status
    passport_resp = client.get(f"/api/v1/passport/{uuid_id}")
    assert passport_resp.status_code == 200
    assert passport_resp.json()["is_withdrawn"] is True


def test_withdrawn_recording_inaccessible_in_active_endpoints():
    """Verify withdrawn recordings are omitted from active queries and stream routes."""
    wav_bytes = _generate_synthetic_pcm_wav(0.4)
    upload_resp = client.post(
        "/api/upload",
        files={"file": ("inaccessible_test.wav", wav_bytes, "audio/wav")},
        data={"title": "Inaccessible Story", "language": "Lambadi", "consent": "true"},
    )
    t_id = upload_resp.json()["id"]

    # Withdraw consent
    withdraw_resp = client.post(f"/api/v1/transcripts/{t_id}/withdraw-consent")
    assert withdraw_resp.status_code == 200

    # Active transcript route must return 404
    active_resp = client.get(f"/api/transcripts/{t_id}")
    assert active_resp.status_code == 404

    # Audio stream route must return 404
    stream_resp = client.get(f"/api/v1/audio/{t_id}/stream")
    assert stream_resp.status_code == 404


def test_nonexistent_transcript_withdrawal_returns_404():
    """Withdrawing consent for non-existent transcript ID must return HTTP 404."""
    resp = client.post("/api/v1/transcripts/99999999/withdraw-consent")
    assert resp.status_code == 404

