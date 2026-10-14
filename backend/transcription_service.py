"""Backend-only adapters for consented speech-to-text processing."""

from __future__ import annotations

import os
import shutil
import threading
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Mapping, Set


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


class BaseTranscriptionProvider(ABC):
    """Abstract base provider adapter for speech recognition and language detection."""

    name: str = "base"
    supports_language_detection: bool = False

    @abstractmethod
    def transcribe(self, audio_path: str, language: str | None = None) -> TranscriptionResult:
        """Transcribe an audio file, returning TranscriptionResult."""
        ...

    def detect_language(self, audio_path: str) -> dict[str, Any]:
        """Perform acoustic language detection from audio."""
        raise TranscriptionNotConfiguredError(
            f"Provider '{self.name}' does not support acoustic language detection."
        )

    def get_supported_languages(self) -> Set[str] | None:
        """Return set of ISO language codes supported by this model, or None if arbitrary/unknown."""
        return None


def _resolve_whisper_language(language: str | None) -> str | None:
    """Map human language names or codes to Whisper language code, or None for auto-detection."""
    if not language:
        return None
    lang_clean = language.strip().lower()
    try:
        import whisper.tokenizer
        if lang_clean in whisper.tokenizer.LANGUAGES:
            return lang_clean
        if lang_clean in whisper.tokenizer.TO_LANGUAGE_CODE:
            return whisper.tokenizer.TO_LANGUAGE_CODE[lang_clean]
    except Exception:
        pass
    return None


class OpenAITranscriptionProvider(BaseTranscriptionProvider):
    """OpenAI Python SDK adapter for the hosted audio transcription API."""

    name = "openai"
    supports_language_detection = False

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

    def transcribe(self, audio_path: str, language: str | None = None) -> TranscriptionResult:
        if os.path.getsize(audio_path) > MAX_TRANSCRIPTION_FILE_BYTES:
            raise TranscriptionProviderError(
                "The hosted transcription API accepts audio files up to 25 MB. Compress or split this recording before retrying."
            )
        try:
            with open(audio_path, "rb") as audio_file:
                create_kwargs: dict[str, Any] = {
                    "model": self.model,
                    "file": audio_file,
                    "response_format": "json",
                }
                whisper_lang = _resolve_whisper_language(language)
                if whisper_lang:
                    create_kwargs["language"] = whisper_lang
                response = self._client.audio.transcriptions.create(**create_kwargs)
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


class LocalWhisperTranscriptionProvider(BaseTranscriptionProvider):
    """OpenAI Whisper model adapter for offline, non-billable inference."""

    name = "whisper-local"
    supports_language_detection = True

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

    def transcribe(self, audio_path: str, language: str | None = None) -> TranscriptionResult:
        if shutil.which("ffmpeg") is None:
            raise TranscriptionNotConfiguredError(
                "Local Whisper requires ffmpeg on the backend PATH. On macOS, install it with `brew install ffmpeg`; no transcript was generated."
            )
        model = self._load_model()
        transcribe_kwargs: dict[str, Any] = {"fp16": False}
        whisper_lang = _resolve_whisper_language(language)
        if whisper_lang:
            transcribe_kwargs["language"] = whisper_lang
        try:
            response = model.transcribe(audio_path, **transcribe_kwargs)
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

    def detect_language(self, audio_path: str) -> dict[str, Any]:
        """Perform acoustic language detection using Whisper Mel-spectrogram analysis."""
        if shutil.which("ffmpeg") is None:
            raise TranscriptionNotConfiguredError(
                "Local Whisper requires ffmpeg on the backend PATH. On macOS, install it with `brew install ffmpeg`."
            )
        try:
            import whisper
        except ImportError as exc:
            raise TranscriptionNotConfiguredError(
                "Local Whisper is not installed. Install backend requirements and ffmpeg."
            ) from exc

        model = self._load_model()
        try:
            audio = whisper.load_audio(audio_path)
            audio = whisper.pad_or_trim(audio)
            mel = whisper.log_mel_spectrogram(audio).to(model.device)
            _, probs = model.detect_language(mel)
        except Exception as exc:
            raise TranscriptionProviderError(
                f"Local Whisper acoustic language detection failed: {exc}"
            ) from exc

        top_lang = max(probs, key=probs.get)
        top5 = {k: round(float(v), 4) for k, v in sorted(probs.items(), key=lambda x: -x[1])[:5]}
        return {
            "detected_language_code": top_lang,
            "confidence": round(float(probs[top_lang]), 3),
            "probabilities": top5,
            "provider": self.name,
            "model": f"whisper-{self.model_size}",
            "notice": "Detection performed on audio acoustic features using local Whisper model.",
        }

    def get_supported_languages(self) -> Set[str]:
        """Return the standard ISO 639-1 language codes recognized by Whisper."""
        try:
            import whisper.tokenizer
            return set(whisper.tokenizer.LANGUAGES.keys())
        except Exception:
            return set()


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
) -> BaseTranscriptionProvider:
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


def get_speech_provider_status(
    environ: Mapping[str, str] | None = None,
) -> dict[str, Any]:
    """Return status metadata about the active transcription provider without loading heavy weights."""
    env = os.environ if environ is None else environ
    provider_name = env.get("VOICE_ROOTS_TRANSCRIPTION_PROVIDER", "disabled").strip().lower()
    if provider_name in {"whisper-local", "local-whisper"}:
        model_size = env.get("VOICE_ROOTS_WHISPER_MODEL_SIZE", "base").strip() or "base"
        has_ffmpeg = shutil.which("ffmpeg") is not None
        return {
            "configured": True,
            "provider": "whisper-local",
            "model": f"whisper-{model_size}",
            "supports_language_detection": True,
            "supports_auto_detection": True,
            "ffmpeg_available": has_ffmpeg,
            "offline": True,
        }
    if provider_name == "openai":
        allow_paid = env.get("VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION", "false").strip().lower() in {"1", "true", "yes"}
        has_key = bool(env.get("OPENAI_API_KEY", "").strip())
        return {
            "configured": allow_paid and has_key,
            "provider": "openai",
            "model": env.get("VOICE_ROOTS_TRANSCRIPTION_MODEL", "whisper-1").strip() or "whisper-1",
            "supports_language_detection": False,
            "supports_auto_detection": False,
            "offline": False,
        }
    return {
        "configured": False,
        "provider": "disabled",
        "model": None,
        "supports_language_detection": False,
        "supports_auto_detection": False,
        "offline": True,
    }

