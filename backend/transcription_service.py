"""Backend-only adapters for consented speech-to-text processing."""

from __future__ import annotations

import os
import shutil
import threading
from dataclasses import dataclass
from typing import Any, Mapping


class TranscriptionNotConfiguredError(RuntimeError):
    """Raised when no authorized provider is configured on the backend."""


class TranscriptionProviderError(RuntimeError):
    """Raised when a provider fails or returns no transcript."""


MAX_TRANSCRIPTION_FILE_BYTES = 25_000_000
_LOCAL_WHISPER_MODELS: dict[str, Any] = {}
_LOCAL_WHISPER_MODELS_LOCK = threading.Lock()

# Discover scratch development tools (such as ffmpeg shim) if present
_SCRATCH_BIN = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "scratch", "bin"))
if os.path.isdir(_SCRATCH_BIN) and _SCRATCH_BIN not in os.environ.get("PATH", ""):
    os.environ["PATH"] = f"{_SCRATCH_BIN}:{os.environ.get('PATH', '')}"


@dataclass(frozen=True)
class TranscriptionResult:
    text: str
    provider: str
    model: str


class OpenAITranscriptionProvider:
    """OpenAI Python SDK adapter for the hosted audio transcription API."""

    name = "openai"

    def __init__(
        self,
        *,
        api_key: str,
        model: str = "whisper-1",
        client: Any | None = None,
    ):
        if not api_key:
            raise TranscriptionNotConfiguredError(
                "OPENAI_API_KEY is not configured on the backend."
            )
        self.model = model
        if client is None:
            try:
                from openai import OpenAI
            except ImportError as exc:
                raise TranscriptionNotConfiguredError(
                    "The OpenAI Python SDK is not installed in the backend environment."
                ) from exc
            # Disable SDK retries so a transient failure cannot silently resubmit
            # an audio file and create another billable request.
            client = OpenAI(api_key=api_key, timeout=90.0, max_retries=0)
        self._client = client

    def transcribe(self, audio_path: str) -> TranscriptionResult:
        if os.path.getsize(audio_path) > MAX_TRANSCRIPTION_FILE_BYTES:
            raise TranscriptionProviderError(
                "The hosted transcription API accepts audio files up to 25 MB. Compress or split this recording before retrying."
            )
        try:
            with open(audio_path, "rb") as audio_file:
                response = self._client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    response_format="json",
                )
        except Exception as exc:
            raise TranscriptionProviderError(_safe_provider_error(exc)) from exc

        text = response.get("text") if isinstance(response, dict) else getattr(response, "text", None)
        if not isinstance(text, str) or not text.strip():
            raise TranscriptionProviderError(
                "The transcription provider returned an empty transcript."
            )

        return TranscriptionResult(
            text=text.strip(),
            provider=self.name,
            model=self.model,
        )


class LocalWhisperTranscriptionProvider:
    """OpenAI Whisper model adapter for offline, non-billable inference."""

    name = "whisper-local"

    def __init__(self, *, model_size: str = "base"):
        self.model_size = model_size

    def _load_model(self):
        try:
            import whisper
        except ImportError as exc:
            raise TranscriptionNotConfiguredError(
                "Local Whisper is not installed. Install backend requirements and ffmpeg; no transcript was generated."
            ) from exc

        with _LOCAL_WHISPER_MODELS_LOCK:
            if self.model_size in _LOCAL_WHISPER_MODELS:
                return _LOCAL_WHISPER_MODELS[self.model_size]
            try:
                model = whisper.load_model(self.model_size)
            except Exception as exc:
                raise TranscriptionNotConfiguredError(
                    f"Local Whisper model '{self.model_size}' could not be loaded. Check the model cache and backend setup; no transcript was generated."
                ) from exc
            _LOCAL_WHISPER_MODELS[self.model_size] = model
            return model

    def transcribe(self, audio_path: str) -> TranscriptionResult:
        if shutil.which("ffmpeg") is None:
            raise TranscriptionNotConfiguredError(
                "Local Whisper requires ffmpeg on the backend PATH. On macOS, install it with `brew install ffmpeg`; no transcript was generated."
            )
        model = self._load_model()
        try:
            response = model.transcribe(audio_path, fp16=False)
        except Exception as exc:
            raise TranscriptionProviderError(
                "Local Whisper could not decode or transcribe this audio. Check ffmpeg and the audio file; no transcript was generated."
            ) from exc

        text = response.get("text") if isinstance(response, dict) else None
        if not isinstance(text, str) or not text.strip():
            raise TranscriptionProviderError(
                "Local Whisper returned an empty transcript."
            )
        return TranscriptionResult(
            text=text.strip(),
            provider=self.name,
            model=f"whisper-{self.model_size}",
        )


def _safe_provider_error(exc: Exception) -> str:
    """Translate SDK failures into useful messages without returning raw details."""
    error_type = type(exc).__name__
    if error_type == "AuthenticationError":
        return "The transcription provider rejected its backend credentials. Check OPENAI_API_KEY."
    if error_type == "RateLimitError":
        return "The transcription provider reported a rate or usage limit. Check the provider account before retrying."
    if error_type in {"APITimeoutError", "APIConnectionError"}:
        return "The transcription provider could not be reached. Retry when the connection is available."
    if error_type in {"BadRequestError", "UnprocessableEntityError"}:
        return "The transcription provider rejected the audio or request format."
    return "The transcription provider request failed. Check backend logs before retrying."


def create_transcription_provider(
    environ: Mapping[str, str] | None = None,
) -> OpenAITranscriptionProvider | LocalWhisperTranscriptionProvider:
    """Build the configured provider without ever exposing credentials to clients."""
    env = os.environ if environ is None else environ
    provider_name = env.get("VOICE_ROOTS_TRANSCRIPTION_PROVIDER", "disabled").strip().lower()

    if provider_name in {"", "disabled", "none"}:
        raise TranscriptionNotConfiguredError(
            "Speech-to-text is disabled. Configure a backend provider to request transcription."
        )
    if provider_name in {"whisper-local", "local-whisper"}:
        model_size = env.get("VOICE_ROOTS_WHISPER_MODEL_SIZE", "base").strip() or "base"
        return LocalWhisperTranscriptionProvider(model_size=model_size)
    if provider_name != "openai":
        raise TranscriptionNotConfiguredError(
            f"Unsupported transcription provider '{provider_name}'. Supported providers: whisper-local, openai."
        )

    allow_paid = env.get("VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION", "false").strip().lower()
    if allow_paid not in {"1", "true", "yes"}:
        raise TranscriptionNotConfiguredError(
            "Paid transcription is disabled. Enable VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION only after approving provider charges."
        )

    api_key = env.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise TranscriptionNotConfiguredError(
            "OPENAI_API_KEY is not configured on the backend."
        )

    model = env.get("VOICE_ROOTS_TRANSCRIPTION_MODEL", "whisper-1").strip() or "whisper-1"
    return OpenAITranscriptionProvider(api_key=api_key, model=model)
