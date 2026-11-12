"""Fast, database-free checks for the FastAPI surface and upload validation."""
import asyncio
import os
import stat
from io import BytesIO

import httpx
import pytest
from fastapi import HTTPException
from starlette.datastructures import Headers, UploadFile

from app.api.v1.uploads import _save_file, _validate_audio, _validate_video
from app.config import settings
from app.main import app


def _request(method: str, path: str) -> httpx.Response:
    async def send() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.request(method, path)

    return asyncio.run(send())


def test_health_endpoint_returns_configured_provider_and_storage():
    response = _request("GET", "/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "provider": settings.ai_provider,
        "storage": settings.storage_backend,
    }


def test_root_endpoint_is_available():
    response = _request("GET", "/")

    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert response.json()["docs"] == "/docs"


def test_openapi_contains_current_api_routes_and_schemas():
    schema = app.openapi()
    paths = schema["paths"]

    expected = {
        ("post", "/api/v1/auth/register"),
        ("post", "/api/v1/auth/login"),
        ("post", "/api/v1/auth/refresh"),
        ("post", "/api/v1/auth/logout"),
        ("get", "/api/v1/recordings"),
        ("post", "/api/v1/recordings"),
        ("get", "/api/v1/recordings/mine"),
        ("get", "/api/v1/recordings/{recording_id}"),
        ("patch", "/api/v1/recordings/{recording_id}"),
        ("delete", "/api/v1/recordings/{recording_id}"),
        ("post", "/api/v1/recordings/{recording_id}/process"),
        ("post", "/api/v1/uploads/audio/{recording_id}"),
        ("post", "/api/v1/uploads/video/{recording_id}"),
        ("get", "/api/v1/languages"),
        ("post", "/api/v1/languages"),
        ("get", "/api/v1/languages/{language_id}"),
        ("get", "/api/v1/languages/{language_id}/dialects"),
        ("post", "/api/v1/languages/{language_id}/dialects"),
        ("get", "/api/v1/languages/stats/overview"),
        ("get", "/api/v1/search"),
        ("post", "/api/v1/search/semantic"),
        ("get", "/api/v1/analytics/overview"),
        ("get", "/api/v1/analytics/languages"),
        ("get", "/api/v1/analytics/recordings-over-time"),
    }
    found = {(method, path) for path, ops in paths.items() for method in ops}

    assert expected <= found
    components = schema["components"]["schemas"]
    assert {"UserCreate", "UserLogin", "Token", "RecordingCreate", "RecordingResponse"} <= set(components)


def test_audio_mime_validation_accepts_wav_and_rejects_non_audio():
    wav = UploadFile(
        file=BytesIO(b"RIFF\x00\x00\x00\x00WAVEfmt "),
        filename="sample.wav",
        headers=Headers({"content-type": "audio/wav"}),
    )
    non_audio = UploadFile(
        file=BytesIO(b"not audio"),
        filename="notes.txt",
        headers=Headers({"content-type": "text/plain"}),
    )

    assert asyncio.run(_validate_audio(wav)) == ("audio/wav", "wav")
    with pytest.raises(HTTPException) as error:
        asyncio.run(_validate_audio(non_audio))
    assert error.value.status_code == 415


def test_audio_mime_validation_rejects_a_signature_mismatch():
    upload = UploadFile(
        file=BytesIO(b"ID3\x04\x00\x00"),
        filename="sample.wav",
        headers=Headers({"content-type": "audio/wav"}),
    )

    with pytest.raises(HTTPException) as error:
        asyncio.run(_validate_audio(upload))

    assert error.value.status_code == 415


@pytest.mark.parametrize(
    "media_type,prefix,extension",
    [
        ("audio/mpeg", b"ID3\x04\x00\x00", "mp3"),
        ("audio/ogg", b"OggS\x00\x00", "ogg"),
        ("audio/mp4", b"\x00\x00\x00\x18ftypM4A ", "m4a"),
        ("audio/webm", b"\x1a\x45\xdf\xa3\x00", "webm"),
        ("audio/flac", b"fLaC\x00", "flac"),
    ],
)
def test_audio_validator_checks_supported_container_signatures(media_type, prefix, extension):
    upload = UploadFile(
        file=BytesIO(prefix),
        filename="sample.audio",
        headers=Headers({"content-type": media_type}),
    )

    assert asyncio.run(_validate_audio(upload)) == (media_type, extension)


@pytest.mark.parametrize(
    "media_type,prefix,extension",
    [
        ("video/mp4", b"\x00\x00\x00\x18ftypisom", "mp4"),
        ("video/webm", b"\x1a\x45\xdf\xa3\x00", "webm"),
        ("video/ogg", b"OggS\x00\x00", "ogv"),
    ],
)
def test_video_validator_checks_supported_container_signatures(media_type, prefix, extension):
    upload = UploadFile(
        file=BytesIO(prefix),
        filename="sample.video",
        headers=Headers({"content-type": media_type}),
    )

    assert asyncio.run(_validate_video(upload)) == (media_type, extension)


def test_media_save_enforces_size_limit_and_removes_partial_upload(tmp_path, monkeypatch):
    from app.api.v1 import uploads

    monkeypatch.setattr(uploads, "STORAGE_DIR", str(tmp_path))
    upload = UploadFile(file=BytesIO(b"more than four bytes"), filename="sample.wav")

    async def save():
        await _save_file(
            upload,
            "audio/test-user",
            max_size_bytes=4,
            extension="wav",
        )

    with pytest.raises(HTTPException) as error:
        asyncio.run(save())

    assert error.value.status_code == 413
    assert list((tmp_path / "audio" / "test-user").iterdir()) == []


def test_media_save_uses_private_generated_filename_and_preserves_bytes(tmp_path, monkeypatch):
    from app.api.v1 import uploads

    monkeypatch.setattr(uploads, "STORAGE_DIR", str(tmp_path))
    original = b"RIFF\x00\x00\x00\x00WAVEfmt original bytes"
    upload = UploadFile(file=BytesIO(original), filename="../../private.wav")

    async def save():
        return await _save_file(
            upload,
            "audio/test-user",
            max_size_bytes=1024,
            extension="wav",
        )

    relative_path, size = asyncio.run(save())
    stored_path = tmp_path / relative_path

    assert size == len(original)
    assert stored_path.read_bytes() == original
    assert stored_path.name.endswith(".wav")
    assert "private" not in stored_path.name
    assert stat.S_IMODE(os.stat(stored_path).st_mode) == 0o600


def test_production_configuration_requires_debug_off_and_strong_jwt_secret():
    from pydantic import ValidationError
    from app.config import Settings

    with pytest.raises(ValidationError, match="JWT_SECRET_KEY"):
        Settings(_env_file=None, app_env="production", debug=False)
    with pytest.raises(ValidationError, match="DEBUG must be false"):
        Settings(
            _env_file=None,
            app_env="production",
            debug=True,
            jwt_secret_key="test-only-secret-value-with-more-than-32-characters",
        )

    configured = Settings(
        _env_file=None,
        app_env="production",
        debug=False,
        jwt_secret_key="random-test-secret-value-with-more-than-32-characters",
    )
    assert configured.app_env == "production"


def test_allowed_origins_accepts_comma_separated_environment_value(monkeypatch):
    from app.config import Settings

    monkeypatch.setenv("ALLOWED_ORIGINS", "https://example.test,http://localhost:3000")
    configured = Settings(_env_file=None)

    assert configured.allowed_origin_list == [
        "https://example.test",
        "http://localhost:3000",
    ]
