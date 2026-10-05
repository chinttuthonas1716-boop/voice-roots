"""
Mock AI Provider — realistic development fallback.

Returns plausible Telugu/multilingual data so the full Voice Roots
workflow can be demonstrated without GPU or API keys.
"""
import asyncio
import random
import math
from app.ai.base import (
    AIProvider, TranscriptionResult, LanguageDetectionResult,
    TranslationResult, EmbeddingResult, SpeakerSegment, SummarizationResult,
)

# Sample Telugu content for realistic mock responses
_TELUGU_SAMPLES = [
    "మా ఊరిలో ప్రతి సంవత్సరం వేసవికాలంలో పెద్ద పండుగ జరుగుతుంది. "
    "పెద్దలు చెప్పే కథలు వింటూ పిల్లలు రాత్రంతా మేల్కొని ఉంటారు.",

    "మా నాన్నమ్మ చెప్పిన కథ ఇది. చాలా కాలం క్రితం మన పల్లెలో "
    "ఒక తెలివైన రైతు ఉండేవాడు. అతను భూమిని చాలా ప్రేమించేవాడు.",

    "వర్షాకాలంలో వ్యవసాయం చాలా కష్టంగా ఉంటుంది. అయినా రైతులు "
    "పొలాలలో పని చేస్తూ మనందరికి అన్నం పెడతారు.",
]

_EN_TRANSLATIONS = [
    "In our village, a grand festival takes place every summer. "
    "Children stay awake all night listening to the stories told by elders.",

    "This is a story my grandmother told. Long ago, in our village, "
    "there lived a wise farmer. He loved the land very much.",

    "Farming is very difficult during the monsoon season. Yet farmers "
    "work in the fields to feed all of us.",
]


class MockAIProvider(AIProvider):
    """
    Development mock provider. Simulates realistic AI processing with
    configurable delays so the full UI pipeline is demonstrable.
    """

    name = "mock"

    async def transcribe(
        self, audio_path: str, language_hint: str | None = None
    ) -> TranscriptionResult:
        await asyncio.sleep(random.uniform(0.5, 1.5))  # simulate processing
        sample_idx = hash(audio_path) % len(_TELUGU_SAMPLES)
        text = _TELUGU_SAMPLES[sample_idx]
        segments = self._make_segments(text)
        return TranscriptionResult(
            text=text,
            confidence=round(random.uniform(0.82, 0.97), 3),
            language_code="te",
            language_name="Telugu",
            segments=segments,
            model_used="mock-whisper-v3",
        )

    async def detect_language(self, text: str) -> LanguageDetectionResult:
        await asyncio.sleep(0.1)
        return LanguageDetectionResult(
            language_code="te",
            language_name="Telugu",
            confidence=round(random.uniform(0.88, 0.99), 3),
            alternatives=[
                {"code": "hi", "name": "Hindi", "confidence": 0.05},
                {"code": "kn", "name": "Kannada", "confidence": 0.03},
            ],
        )

    async def detect_audio_language(self, audio_path: str) -> LanguageDetectionResult:
        await asyncio.sleep(0.3)
        return LanguageDetectionResult(
            language_code="te",
            language_name="Telugu",
            confidence=round(random.uniform(0.85, 0.97), 3),
        )

    async def translate(
        self, text: str, source_language: str, target_language: str
    ) -> TranslationResult:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        sample_idx = hash(text) % len(_EN_TRANSLATIONS)
        translated = _EN_TRANSLATIONS[sample_idx]
        return TranslationResult(
            source_text=text,
            translated_text=translated,
            source_language=source_language,
            target_language=target_language,
            model_used="mock-indictrans2-200M",
        )

    async def embed(self, text: str) -> EmbeddingResult:
        await asyncio.sleep(0.05)
        # Deterministic pseudo-embedding based on text hash
        seed = hash(text) % (2**31)
        random.seed(seed)
        dim = 384
        vec = [random.gauss(0, 0.1) for _ in range(dim)]
        # Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        vec = [x / norm for x in vec]
        random.seed()  # Reset RNG
        return EmbeddingResult(vector=vec, model_used="mock-multilingual-minilm")

    async def segment_speakers(
        self, audio_path: str, num_speakers: int | None = None
    ) -> list[SpeakerSegment]:
        await asyncio.sleep(0.4)
        speakers = num_speakers or 2
        sample_idx = hash(audio_path) % len(_TELUGU_SAMPLES)
        text = _TELUGU_SAMPLES[sample_idx]
        words = text.split()
        chunk_size = max(1, len(words) // speakers)
        segments = []
        for i in range(speakers):
            start = i * chunk_size
            end = min(start + chunk_size, len(words))
            segment_text = " ".join(words[start:end])
            segments.append(
                SpeakerSegment(
                    speaker_label=f"Speaker {i + 1}",
                    start_time=round(i * 30.0, 2),
                    end_time=round((i + 1) * 30.0, 2),
                    text=segment_text,
                    confidence=round(random.uniform(0.75, 0.95), 3),
                )
            )
        return segments

    async def summarize(self, text: str, language: str = "en") -> SummarizationResult:
        await asyncio.sleep(0.2)
        return SummarizationResult(
            summary=(
                "This oral recording describes traditional agricultural practices "
                "and cultural stories from a Telugu-speaking community. The speaker "
                "recounts seasonal farming routines and village festival traditions "
                "passed down through generations."
            ),
            key_topics=["Traditional Agriculture", "Village Festivals", "Cultural Heritage"],
            keywords=["farming", "village", "festival", "rain", "harvest", "tradition"],
            entities=[
                {"text": "village", "type": "LOCATION"},
                {"text": "festival", "type": "EVENT"},
                {"text": "farmer", "type": "PERSON_ROLE"},
            ],
        )

    def _make_segments(self, text: str) -> list[dict]:
        """Split text into timed segments for the transcript view."""
        sentences = text.split(". ")
        segments = []
        t = 0.0
        for i, sentence in enumerate(sentences):
            duration = len(sentence.split()) * 0.4  # ~0.4 sec/word
            segments.append({
                "index": i,
                "speaker": f"Speaker {(i % 2) + 1}",
                "start": round(t, 2),
                "end": round(t + duration, 2),
                "text": sentence.strip(),
                "confidence": round(random.uniform(0.80, 0.98), 3),
            })
            t += duration + 0.3  # pause between sentences
        return segments
