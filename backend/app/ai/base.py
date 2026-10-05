"""Abstract AI provider base class for Voice Roots."""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class TranscriptionResult:
    """Result of an ASR transcription."""
    text: str
    confidence: float
    language_code: str
    language_name: str
    segments: list[dict] = field(default_factory=list)
    word_count: int = 0
    model_used: str = ""

    def __post_init__(self):
        if not self.word_count:
            self.word_count = len(self.text.split())


@dataclass
class LanguageDetectionResult:
    """Result of language identification."""
    language_code: str
    language_name: str
    confidence: float
    alternatives: list[dict] = field(default_factory=list)


@dataclass
class TranslationResult:
    """Result of a translation."""
    source_text: str
    translated_text: str
    source_language: str
    target_language: str
    model_used: str = ""


@dataclass
class EmbeddingResult:
    """Result of embedding generation."""
    vector: list[float]
    model_used: str
    dim: int = 0

    def __post_init__(self):
        self.dim = len(self.vector)


@dataclass
class SpeakerSegment:
    """A single speaker-segmented piece of audio."""
    speaker_label: str
    start_time: float
    end_time: float
    text: str
    confidence: float = 0.0


@dataclass
class SummarizationResult:
    """Result of text summarization."""
    summary: str
    key_topics: list[str] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)
    entities: list[dict] = field(default_factory=list)


class AIProvider(ABC):
    """
    Abstract base class for all Voice Roots AI providers.

    Subclass this to implement real model inference. The system will
    fall back to MockAIProvider when no real provider is configured.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider name."""

    @abstractmethod
    async def transcribe(self, audio_path: str, language_hint: str | None = None) -> TranscriptionResult:
        """Transcribe audio file to text."""

    @abstractmethod
    async def detect_language(self, text: str) -> LanguageDetectionResult:
        """Identify the language of a text snippet."""

    @abstractmethod
    async def detect_audio_language(self, audio_path: str) -> LanguageDetectionResult:
        """Identify the language directly from audio."""

    @abstractmethod
    async def translate(
        self, text: str, source_language: str, target_language: str
    ) -> TranslationResult:
        """Translate text from source to target language."""

    @abstractmethod
    async def embed(self, text: str) -> EmbeddingResult:
        """Generate a semantic embedding vector for text."""

    @abstractmethod
    async def segment_speakers(
        self, audio_path: str, num_speakers: int | None = None
    ) -> list[SpeakerSegment]:
        """Diarize audio: return speaker-labelled time segments."""

    @abstractmethod
    async def summarize(self, text: str, language: str = "en") -> SummarizationResult:
        """Generate a summary and extract topics/keywords from text."""

    # Optional health check
    async def health_check(self) -> dict[str, Any]:
        return {"provider": self.name, "status": "ok"}
