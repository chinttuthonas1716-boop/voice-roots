"""
Whisper AI Provider — real transcription using OpenAI Whisper.

Falls back to MockAIProvider if the whisper package is not installed
or the model cannot be loaded (e.g. no GPU memory).
"""
import asyncio
import structlog
from typing import Any

from app.ai.base import (
    AIProvider, TranscriptionResult, LanguageDetectionResult,
    TranslationResult, EmbeddingResult, SpeakerSegment, SummarizationResult,
)
from app.config import settings

logger = structlog.get_logger(__name__)


class WhisperProvider(AIProvider):
    """
    OpenAI Whisper-based transcription provider.
    Loads the model lazily on first use.
    """

    name = "whisper"
    _model: Any = None
    _fallback: "AIProvider | None" = None

    async def _get_model(self):
        if self._model is not None:
            return self._model
        try:
            import whisper  # type: ignore
            loop = asyncio.get_event_loop()
            self._model = await loop.run_in_executor(
                None, lambda: whisper.load_model(settings.whisper_model_size)
            )
            logger.info("whisper.model_loaded", size=settings.whisper_model_size)
        except Exception as exc:
            logger.warning("whisper.load_failed_using_mock", error=str(exc))
            from app.ai.mock_provider import MockAIProvider
            self._fallback = MockAIProvider()
        return self._model

    async def transcribe(self, audio_path: str, language_hint: str | None = None) -> TranscriptionResult:
        model = await self._get_model()
        if self._fallback:
            return await self._fallback.transcribe(audio_path, language_hint)

        loop = asyncio.get_event_loop()
        opts: dict = {"fp16": False}
        if language_hint:
            opts["language"] = language_hint

        result = await loop.run_in_executor(None, lambda: model.transcribe(audio_path, **opts))

        segments = [
            {
                "index": i,
                "speaker": "Speaker 1",
                "start": round(seg["start"], 2),
                "end": round(seg["end"], 2),
                "text": seg["text"].strip(),
                "confidence": round(abs(seg.get("avg_logprob", -0.3)) * -1 + 1, 3),
            }
            for i, seg in enumerate(result.get("segments", []))
        ]

        return TranscriptionResult(
            text=result["text"].strip(),
            confidence=0.90,
            language_code=result.get("language", "unknown"),
            language_name=result.get("language", "Unknown").capitalize(),
            segments=segments,
            model_used=f"whisper-{settings.whisper_model_size}",
        )

    async def detect_language(self, text: str) -> LanguageDetectionResult:
        if self._fallback:
            return await self._fallback.detect_language(text)
        # Whisper works on audio; use fallback for text LID
        from app.ai.mock_provider import MockAIProvider
        return await MockAIProvider().detect_language(text)

    async def detect_audio_language(self, audio_path: str) -> LanguageDetectionResult:
        model = await self._get_model()
        if self._fallback:
            return await self._fallback.detect_audio_language(audio_path)
        import whisper  # type: ignore
        import numpy as np

        loop = asyncio.get_event_loop()

        def _detect():
            audio = whisper.load_audio(audio_path)
            audio = whisper.pad_or_trim(audio)
            mel = whisper.log_mel_spectrogram(audio).to(model.device)
            _, probs = model.detect_language(mel)
            top_lang = max(probs, key=probs.get)
            return top_lang, probs[top_lang]

        code, conf = await loop.run_in_executor(None, _detect)
        return LanguageDetectionResult(
            language_code=code,
            language_name=code.capitalize(),
            confidence=round(conf, 3),
        )

    async def translate(self, text: str, source_language: str, target_language: str) -> TranslationResult:
        # Whisper doesn't do text-to-text translation; use mock/IndicTrans2 for that
        from app.ai.mock_provider import MockAIProvider
        return await MockAIProvider().translate(text, source_language, target_language)

    async def embed(self, text: str) -> EmbeddingResult:
        from app.ai.mock_provider import MockAIProvider
        return await MockAIProvider().embed(text)

    async def segment_speakers(self, audio_path: str, num_speakers: int | None = None) -> list[SpeakerSegment]:
        from app.ai.mock_provider import MockAIProvider
        return await MockAIProvider().segment_speakers(audio_path, num_speakers)

    async def summarize(self, text: str, language: str = "en") -> SummarizationResult:
        from app.ai.mock_provider import MockAIProvider
        return await MockAIProvider().summarize(text, language)
