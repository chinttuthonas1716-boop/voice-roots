"""AI provider behavior must fail clearly instead of returning sample transcripts."""

import asyncio
import sys
from types import SimpleNamespace

import pytest

from app.ai.base import ProviderUnavailableError
from app.ai import registry
from app.ai.whisper_provider import WhisperProvider


def test_disabled_provider_does_not_fall_back_to_mock(monkeypatch):
    monkeypatch.setattr(registry.settings, "ai_provider", "disabled")
    monkeypatch.setattr(registry, "_instance", None)

    with pytest.raises(ProviderUnavailableError, match="processing is disabled"):
        registry.get_provider()


def test_unregistered_provider_does_not_fall_back_to_mock(monkeypatch):
    monkeypatch.setattr(registry.settings, "ai_provider", "unknown-provider")
    monkeypatch.setattr(registry, "_instance", None)

    with pytest.raises(ProviderUnavailableError, match="not registered"):
        registry.get_provider()


def test_whisper_load_failure_returns_clear_error_without_mock_text(monkeypatch):
    def fail_to_load(_model_size):
        raise RuntimeError("model weights unavailable")

    monkeypatch.setitem(sys.modules, "whisper", SimpleNamespace(load_model=fail_to_load))
    monkeypatch.setattr(WhisperProvider, "_model", None)
    provider = WhisperProvider()

    with pytest.raises(ProviderUnavailableError, match="no transcript was generated"):
        asyncio.run(provider.transcribe("unused-audio.wav"))


def test_whisper_does_not_invent_confidence_or_speaker_labels(monkeypatch):
    class TestModel:
        def transcribe(self, _audio_path, **_options):
            return {
                "text": "sample result",
                "language": "hi",
                "segments": [
                    {
                        "start": 0.0,
                        "end": 1.2,
                        "text": "sample result",
                        "avg_logprob": -0.18,
                    }
                ],
            }

    monkeypatch.setattr(WhisperProvider, "_model", TestModel())
    result = asyncio.run(WhisperProvider().transcribe("unused-audio.wav"))

    assert result.text == "sample result"
    assert result.confidence is None
    assert result.segments == [
        {"index": 0, "start": 0.0, "end": 1.2, "text": "sample result"}
    ]
