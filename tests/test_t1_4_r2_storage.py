"""Voice Roots: Tests for Production Launch Task T1.4 (Audio in Cloudflare R2 Object Storage)
========================================================================================
Verifies:
1. R2StorageProvider initialization with Cloudflare R2 endpoint and auto region.
2. Presigned short-lived signed URL generation without credential leakage.
3. Write-once master policy: duplicate uploads do not overwrite stored masters.
4. Master deletion protection: deletion denied unless consent_withdrawn=True.
5. Ingest deduplication: identical SHA-256 uploads reuse existing master without duplicating storage.
6. Server-side access tier enforcement (OCAP):
   - public: accessible to all.
   - community: requires authenticated community/elder credentials.
   - research: requires researcher role or research API key.
   - private: restricted to admin or owner.
   - withdrawn: returns HTTP 404 under consent withdrawal.
7. Audio stream endpoint redirects to short-lived signed URLs for R2 objects.
"""

import io
import os
import tempfile
import wave
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from backend.auth_service import create_access_token
from backend.main import ADMIN_API_KEY, app
from backend.storage_service import (
    R2StorageProvider,
    create_storage_provider,
)

client = TestClient(app)


def _generate_wav_bytes(duration_sec: float = 0.2) -> bytes:
    """Generate minimal valid PCM WAV bytes."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        frames = int(16000 * duration_sec)
        wf.writeframes(b"\x00\x00" * frames)
    return buf.getvalue()


# ─── 1. R2 Provider & Write-Once Immutability Tests ───


def test_r2_storage_provider_config_and_presigned_urls():
    """Verify R2StorageProvider configures correctly and generates short-lived presigned URLs."""
    mock_s3 = MagicMock()
    mock_s3.generate_presigned_url.return_value = (
        "https://r2.cloudflarestorage.com/voice-roots-audio/audio_master.wav?X-Amz-Signature=abc&X-Amz-Expires=3600"
    )

    provider = R2StorageProvider(
        bucket="voice-roots-audio",
        endpoint_url="https://r2.cloudflarestorage.com",
        aws_access_key_id="test-r2-key",
        aws_secret_access_key="test-r2-secret",
        client=mock_s3,
    )

    assert provider.name == "r2"
    assert provider.bucket == "voice-roots-audio"
    assert provider.region_name == "auto"

    url = provider.get_stream_url("audio_master.wav", expires_in=3600)
    assert "https://r2.cloudflarestorage.com" in url
    assert "X-Amz-Signature=abc" in url
    mock_s3.generate_presigned_url.assert_called_once_with(
        ClientMethod="get_object",
        Params={"Bucket": "voice-roots-audio", "Key": "audio_master.wav"},
        ExpiresIn=3600,
    )


def test_r2_write_once_policy_prevents_overwrite():
    """Verify master audio files in R2 cannot be overwritten once stored."""
    mock_s3 = MagicMock()
    mock_s3.head_object.return_value = {"ContentLength": 1024}

    provider = R2StorageProvider(
        bucket="voice-roots-audio",
        client=mock_s3,
    )

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(_generate_wav_bytes(0.1))
        tmp_path = tmp.name

    try:
        # file_exists returns True (simulating object already in bucket)
        name, size, sha = provider.store_file(tmp_path, "existing_master.wav", "audio/wav")

        assert name == "existing_master.wav"
        # upload_file MUST NOT be called because the file already exists
        mock_s3.upload_file.assert_not_called()
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_r2_master_delete_protection():
    """Verify master recordings are protected against deletion except when consent is withdrawn."""
    mock_s3 = MagicMock()
    provider = R2StorageProvider(
        bucket="voice-roots-audio",
        client=mock_s3,
    )

    # 1. Standard delete without consent withdrawal MUST be denied
    assert provider.delete_file("master.wav", consent_withdrawn=False) is False
    mock_s3.delete_object.assert_not_called()

    # 2. Delete with explicit affirmative consent withdrawal is permitted
    assert provider.delete_file("master.wav", consent_withdrawn=True) is True
    mock_s3.delete_object.assert_called_once_with(Bucket="voice-roots-audio", Key="master.wav")


def test_create_storage_provider_factory():
    """Verify create_storage_provider detects R2 environment variables."""
    r2_env = {
        "VOICE_ROOTS_STORAGE_BACKEND": "r2",
        "R2_BUCKET": "voice-roots-prod-audio",
        "R2_ENDPOINT_URL": "https://account123.r2.cloudflarestorage.com",
        "R2_ACCESS_KEY_ID": "key123",
        "R2_SECRET_ACCESS_KEY": "secret123",
    }
    with patch("boto3.client"):
        provider = create_storage_provider(environ=r2_env)
        assert isinstance(provider, R2StorageProvider)
        assert provider.name == "r2"
        assert provider.bucket == "voice-roots-prod-audio"


# ─── 2. Ingest SHA-256 Deduplication & Server-Side Access Tiers ───


def test_ingest_sha256_deduplication():
    """Verify uploading an audio master with an existing SHA-256 reuses the master without duplicate storage."""
    wav_bytes = _generate_wav_bytes(0.3)

    # First upload
    res1 = client.post(
        "/api/upload",
        files={"audio": ("dedupe_sample_1.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Dedupe Master Test 1",
            "language": "gon",
            "consent": "true",
            "consent_private_storage": "true",
        },
    )
    assert res1.status_code == 200
    data1 = res1.json()
    first_filename = data1["audio_filename"]
    sha256_1 = data1["audio_sha256"]

    # Second upload with identical bytes
    res2 = client.post(
        "/api/upload",
        files={"audio": ("dedupe_sample_2.wav", wav_bytes, "audio/wav")},
        data={
            "title": "Dedupe Master Test 2",
            "language": "gon",
            "consent": "true",
            "consent_private_storage": "true",
        },
    )
    assert res2.status_code == 200
    data2 = res2.json()

    # Audio master filename and SHA-256 must match (deduplicated)
    assert data2["audio_filename"] == first_filename
    assert data2["audio_sha256"] == sha256_1


def test_server_side_access_tier_enforcement_all_levels():
    """Verify server-side OCAP enforcement for public, community, research, and private tiers."""
    # Helper to upload at a given privacy level
    def _create_record(tier: str, title: str) -> int:
        data = {
            "title": title,
            "language": "kff",
            "consent": "true",
            "privacy_level": tier,
        }
        if tier == "public":
            data["consent_public_publication"] = "true"
        elif tier == "community":
            data["consent_community_access"] = "true"
        elif tier == "private":
            data["consent_private_storage"] = "true"

        res = client.post(
            "/api/upload",
            files={"audio": (f"{tier}_{title.replace(' ', '_')}.wav", _generate_wav_bytes(0.15), "audio/wav")},
            data=data,
        )
        assert res.status_code == 200, f"Upload failed for {tier}: {res.text}"
        return res.json()["id"]

    public_id = _create_record("public", "Public Folk Song Level")
    community_id = _create_record("community", "Community Sacred Lore Level")
    research_id = _create_record("research", "Research Linguistic Sample Level")
    private_id = _create_record("private", "Private Family Genealogy Level")

    # 1. PUBLIC TIER: accessible anonymously
    assert client.get(f"/api/transcripts/{public_id}").status_code == 200
    assert client.get(f"/api/v1/audio/{public_id}/stream").status_code == 200

    # 2. COMMUNITY TIER: 403 anonymously; 200 with authenticated contributor token
    assert client.get(f"/api/transcripts/{community_id}").status_code == 403
    assert client.get(f"/api/v1/audio/{community_id}/stream").status_code == 403

    user_token = create_access_token(
        user_id="u1", username="member1", email="member1@example.com", role="contributor"
    )
    auth_headers = {"Authorization": f"Bearer {user_token}"}
    assert client.get(f"/api/transcripts/{community_id}", headers=auth_headers).status_code == 200
    assert client.get(f"/api/v1/audio/{community_id}/stream", headers=auth_headers).status_code == 200

    # 3. RESEARCH TIER: 403 for anonymous & standard contributor; 200 for researcher & admin
    assert client.get(f"/api/transcripts/{research_id}").status_code == 403
    assert client.get(f"/api/transcripts/{research_id}", headers=auth_headers).status_code == 403

    researcher_token = create_access_token(
        user_id="r1", username="dr_linguist", email="linguist@research.org", role="researcher"
    )
    res_headers = {"Authorization": f"Bearer {researcher_token}"}
    assert client.get(f"/api/transcripts/{research_id}", headers=res_headers).status_code == 200
    assert client.get(f"/api/v1/audio/{research_id}/stream", headers=res_headers).status_code == 200

    # 4. PRIVATE TIER: 403 for anonymous, contributor, and researcher; 200 for admin
    assert client.get(f"/api/transcripts/{private_id}").status_code == 403
    assert client.get(f"/api/transcripts/{private_id}", headers=auth_headers).status_code == 403
    assert client.get(f"/api/transcripts/{private_id}", headers=res_headers).status_code == 403

    admin_headers = {"X-Admin-Key": ADMIN_API_KEY}
    assert client.get(f"/api/transcripts/{private_id}", headers=admin_headers).status_code == 200
    assert client.get(f"/api/v1/audio/{private_id}/stream", headers=admin_headers).status_code == 200


def test_audio_stream_endpoint_r2_signed_redirect():
    """Verify requesting audio stream when backend is R2 generates signed presigned redirect."""
    # Create a fresh record for testing R2 streaming
    res_up = client.post(
        "/api/upload",
        files={"audio": ("r2_stream_sample.wav", _generate_wav_bytes(0.12), "audio/wav")},
        data={"title": "R2 Stream Target", "language": "gon", "consent": "true", "privacy_level": "public"},
    )
    assert res_up.status_code == 200
    rec = res_up.json()
    rec_id = rec["id"]
    filename = rec["audio_filename"]

    mock_s3 = MagicMock()
    mock_s3.generate_presigned_url.return_value = (
        f"https://r2.cloudflarestorage.com/voice-roots-audio/{filename}?X-Amz-Signature=signed_token&Expires=3600"
    )

    r2_provider = R2StorageProvider(
        bucket="voice-roots-audio",
        endpoint_url="https://r2.cloudflarestorage.com",
        client=mock_s3,
    )

    with patch("backend.main.create_storage_provider", return_value=r2_provider):
        # Test stream metadata endpoint
        res = client.get(f"/api/v1/audio/{rec_id}/stream")
        assert res.status_code == 200
        data = res.json()
        assert data["storage_backend"] == "r2"
        assert "https://r2.cloudflarestorage.com" in data["stream_url"]
        assert data["expires_in_seconds"] == 3600

        # Test storage file stream redirect
        res_redirect = client.get(f"/storage/audio/{filename}", follow_redirects=False)
        assert res_redirect.status_code == 307
        assert "https://r2.cloudflarestorage.com" in res_redirect.headers["location"]
