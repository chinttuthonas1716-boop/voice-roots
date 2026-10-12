"""Unit tests for the backend-only OpenAI transcription adapter."""

from types import SimpleNamespace

import pytest

from transcription_service import (
    MAX_TRANSCRIPTION_FILE_BYTES,
    LocalWhisperTranscriptionProvider,
    OpenAITranscriptionProvider,
    TranscriptionNotConfiguredError,
    TranscriptionProviderError,
    create_transcription_provider,
)


class FakeTranscriptions:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error
        self.calls = []

    def create(self, **kwargs):
        audio = kwargs["file"]
        self.calls.append({**kwargs, "audio_bytes": audio.read()})
        if self.error:
            raise self.error
        return self.response


def fake_client(transcriptions):
    return SimpleNamespace(
        audio=SimpleNamespace(transcriptions=transcriptions)
    )


def test_provider_uses_mocked_sdk_response_and_original_audio(tmp_path):
    audio_path = tmp_path / "voice.wav"
    original = b"RIFF\x00\x00\x00\x00WAVEfmt test fixture"
    audio_path.write_bytes(original)
    transcriptions = FakeTranscriptions(
        response=SimpleNamespace(text="  నమస్కారం  ")
    )
    provider = OpenAITranscriptionProvider(
        api_key="unit-test-key",
        client=fake_client(transcriptions),
    )

    result = provider.transcribe(str(audio_path))

    assert result.text == "నమస్కారం"
    assert result.provider == "openai"
    assert result.model == "whisper-1"
    assert transcriptions.calls[0]["model"] == "whisper-1"
    assert transcriptions.calls[0]["response_format"] == "json"
    assert transcriptions.calls[0]["audio_bytes"] == original


def test_provider_rejects_empty_provider_transcript(tmp_path):
    audio_path = tmp_path / "voice.wav"
    audio_path.write_bytes(b"audio")
    provider = OpenAITranscriptionProvider(
        api_key="unit-test-key",
        client=fake_client(FakeTranscriptions(response={"text": "  "})),
    )

    with pytest.raises(TranscriptionProviderError, match="empty transcript"):
        provider.transcribe(str(audio_path))


def test_provider_rejects_files_over_api_limit_before_calling_provider(tmp_path, monkeypatch):
    audio_path = tmp_path / "large.wav"
    audio_path.write_bytes(b"large fixture")
    transcriptions = FakeTranscriptions(response=SimpleNamespace(text="should not run"))
    provider = OpenAITranscriptionProvider(
        api_key="unit-test-key",
        client=fake_client(transcriptions),
    )
    monkeypatch.setattr("transcription_service.MAX_TRANSCRIPTION_FILE_BYTES", 4)

    with pytest.raises(TranscriptionProviderError, match="up to 25 MB"):
        provider.transcribe(str(audio_path))

    assert transcriptions.calls == []
    assert MAX_TRANSCRIPTION_FILE_BYTES == 25_000_000


def test_provider_does_not_return_raw_sdk_errors_or_secrets(tmp_path):
    audio_path = tmp_path / "voice.wav"
    audio_path.write_bytes(b"audio")
    provider = OpenAITranscriptionProvider(
        api_key="unit-test-secret",
        client=fake_client(FakeTranscriptions(error=RuntimeError("unit-test-secret"))),
    )

    with pytest.raises(TranscriptionProviderError) as raised:
        provider.transcribe(str(audio_path))

    assert "unit-test-secret" not in str(raised.value)
    assert "provider request failed" in str(raised.value)


def test_provider_requires_explicit_paid_usage_authorization():
    env = {
        "VOICE_ROOTS_TRANSCRIPTION_PROVIDER": "openai",
        "OPENAI_API_KEY": "unit-test-key",
    }

    with pytest.raises(TranscriptionNotConfiguredError, match="Paid transcription is disabled"):
        create_transcription_provider(env)


def test_provider_requires_backend_api_key_after_paid_usage_authorization():
    env = {
        "VOICE_ROOTS_TRANSCRIPTION_PROVIDER": "openai",
        "VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION": "true",
    }

    with pytest.raises(TranscriptionNotConfiguredError, match="OPENAI_API_KEY"):
        create_transcription_provider(env)


def test_provider_builds_from_backend_environment_without_network(monkeypatch):
    captured = {}

    class FakeOpenAI:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    monkeypatch.setitem(
        __import__("sys").modules,
        "openai",
        SimpleNamespace(OpenAI=FakeOpenAI),
    )
    provider = create_transcription_provider(
        {
            "VOICE_ROOTS_TRANSCRIPTION_PROVIDER": "openai",
            "VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION": "true",
            "VOICE_ROOTS_TRANSCRIPTION_MODEL": "whisper-1",
            "OPENAI_API_KEY": "unit-test-key",
        }
    )

    assert provider.name == "openai"
    assert provider.model == "whisper-1"
    assert captured == {
        "api_key": "unit-test-key",
        "timeout": 90.0,
        "max_retries": 0,
    }


def test_local_whisper_provider_uses_mocked_model_without_credentials(monkeypatch, tmp_path):
    monkeypatch.setattr("transcription_service.shutil.which", lambda _name: "/mock/ffmpeg")
    audio_path = tmp_path / "voice.wav"
    original = b"test audio bytes"
    audio_path.write_bytes(original)
    calls = []

    class FakeModel:
        def transcribe(self, path, **kwargs):
            calls.append((path, kwargs))
            return {"text": "  Locally transcribed words.  "}

    class FakeWhisper:
        @staticmethod
        def load_model(model_size):
            assert model_size == "unit-test-base"
            return FakeModel()

    monkeypatch.setitem(__import__("sys").modules, "whisper", FakeWhisper)
    provider = LocalWhisperTranscriptionProvider(model_size="unit-test-base")
    result = provider.transcribe(str(audio_path))

    assert result.text == "Locally transcribed words."
    assert result.provider == "whisper-local"
    assert result.model == "whisper-unit-test-base"
    assert calls == [(str(audio_path), {"fp16": False})]


def test_local_whisper_fails_before_loading_weights_when_ffmpeg_is_missing(monkeypatch):
    loaded_models = []

    class FakeWhisper:
        @staticmethod
        def load_model(model_size):
            loaded_models.append(model_size)
            return object()

    monkeypatch.setattr("transcription_service.shutil.which", lambda _name: None)
    monkeypatch.setitem(__import__("sys").modules, "whisper", FakeWhisper)
    provider = LocalWhisperTranscriptionProvider(model_size="unit-test-base")

    with pytest.raises(TranscriptionNotConfiguredError, match="brew install ffmpeg"):
        provider.transcribe("unused.wav")

    assert loaded_models == []


def test_local_whisper_provider_is_selectable_without_paid_gate_or_api_key():
    provider = create_transcription_provider(
        {
            "VOICE_ROOTS_TRANSCRIPTION_PROVIDER": "whisper-local",
            "VOICE_ROOTS_WHISPER_MODEL_SIZE": "tiny",
        }
    )
    assert isinstance(provider, LocalWhisperTranscriptionProvider)
    assert provider.model_size == "tiny"


def test_local_whisper_provider_reports_model_load_failure_without_fake_text(monkeypatch):
    monkeypatch.setattr("transcription_service.shutil.which", lambda _name: "/mock/ffmpeg")

    class BrokenWhisper:
        @staticmethod
        def load_model(_model_size):
            raise OSError("missing model weights")

    monkeypatch.setitem(__import__("sys").modules, "whisper", BrokenWhisper)
    provider = LocalWhisperTranscriptionProvider(model_size="unit-test-unavailable")

    with pytest.raises(TranscriptionNotConfiguredError, match="could not be loaded"):
        provider.transcribe("unused.wav")


def test_local_whisper_provider_rejects_empty_model_response(monkeypatch, tmp_path):
    monkeypatch.setattr("transcription_service.shutil.which", lambda _name: "/mock/ffmpeg")
    audio_path = tmp_path / "voice.wav"
    audio_path.write_bytes(b"test audio")

    class EmptyModel:
        def transcribe(self, _path, **_kwargs):
            return {"text": "  "}

    class FakeWhisper:
        @staticmethod
        def load_model(_model_size):
            return EmptyModel()

    monkeypatch.setitem(__import__("sys").modules, "whisper", FakeWhisper)
    provider = LocalWhisperTranscriptionProvider(model_size="unit-test-empty")

    with pytest.raises(TranscriptionProviderError, match="empty transcript"):
        provider.transcribe(str(audio_path))


def test_local_whisper_reports_audio_decode_failure_without_fabricating_text(monkeypatch, tmp_path):
    monkeypatch.setattr("transcription_service.shutil.which", lambda _name: "/mock/ffmpeg")
    audio_path = tmp_path / "invalid.wav"
    audio_path.write_bytes(b"not decodable audio")

    class BrokenModel:
        def transcribe(self, _path, **_kwargs):
            raise RuntimeError("decoder failure details")

    class FakeWhisper:
        @staticmethod
        def load_model(_model_size):
            return BrokenModel()

    monkeypatch.setitem(__import__("sys").modules, "whisper", FakeWhisper)
    provider = LocalWhisperTranscriptionProvider(model_size="unit-test-decode-error")

    with pytest.raises(TranscriptionProviderError, match="Check ffmpeg and the audio file"):
        provider.transcribe(str(audio_path))
