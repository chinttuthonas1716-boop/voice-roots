"""Voice Roots — Universal Translation Layer.

Provides a pluggable adapter architecture for multilingual machine translation,
with explicit language-pair support discovery, provider chaining, and strict
enforcement of Indigenous Data Sovereignty (OCAP) protocols.

Never fabricates translations for unsupported language pairs or unwritten oral tongues.
"""

from __future__ import annotations

import logging
import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Set, Tuple

from language_registry import is_oral_or_endangered, language_registry

logger = logging.getLogger(__name__)


@dataclass
class TranslationResult:
    source_text: str
    translated_text: str
    source_language: str
    target_language: str
    provider: str
    model: str
    verified: bool
    pair_status: str = "supported"
    limitation_note: Optional[str] = None


class UnsupportedLanguagePairError(ValueError):
    """Raised when no configured translation provider supports the requested language pair."""
    def __init__(self, src: str, tgt: str, reason: str):
        super().__init__(f"Language pair '{src}' -> '{tgt}' is unsupported: {reason}")
        self.source = src
        self.target = tgt
        self.reason = reason


class OralLanguageElderReviewRequiredError(ValueError):
    """Raised when an unwritten oral language requires community elder verification."""
    def __init__(self, lang: str):
        super().__init__(
            f"Language '{lang}' is an unwritten oral heritage tongue. "
            f"Automated AI translation without community elder review is prohibited to prevent linguistic hallucination."
        )
        self.language = lang


class BaseTranslationAdapter(ABC):
    """Abstract base adapter for translation service providers."""

    name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool:
        """Return True if this provider is configured and available to execute translations."""
        ...

    @abstractmethod
    def get_supported_languages(self) -> Set[str]:
        """Return the set of language codes supported by this adapter."""
        ...

    @abstractmethod
    def is_pair_supported(self, src: str, tgt: str) -> bool:
        """Check if this adapter can translate between source and target language codes."""
        ...

    @abstractmethod
    def translate(self, text: str, src: str, tgt: str) -> TranslationResult:
        """Execute translation, returning a structured TranslationResult."""
        ...


class IdentityTranslationAdapter(BaseTranslationAdapter):
    """Handles identical source and target language requests."""

    name = "identity"

    def is_configured(self) -> bool:
        return True

    def get_supported_languages(self) -> Set[str]:
        return {l["code"] for l in language_registry.get_all_capabilities()}

    def is_pair_supported(self, src: str, tgt: str) -> bool:
        src_code = language_registry.resolve_language_code(src)
        tgt_code = language_registry.resolve_language_code(tgt)
        return src_code is not None and src_code == tgt_code

    def translate(self, text: str, src: str, tgt: str) -> TranslationResult:
        return TranslationResult(
            source_text=text,
            translated_text=text,
            source_language=src,
            target_language=tgt,
            provider=self.name,
            model="direct-passthrough",
            verified=True,
            pair_status="identical",
            limitation_note="Source and target languages are identical; no transformation performed.",
        )


class OpenAITranslationAdapter(BaseTranslationAdapter):
    """OpenAI API translation adapter for general multilingual language pairs."""

    name = "openai"

    def __init__(self) -> None:
        self.api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        self.allow_paid = os.environ.get("VOICE_ROOTS_ALLOW_PAID_TRANSCRIPTION", "false").strip().lower() in {"1", "true", "yes"}
        self.model = os.environ.get("VOICE_ROOTS_TRANSLATION_MODEL", "gpt-4o-mini")

    def is_configured(self) -> bool:
        return bool(self.api_key and self.allow_paid)

    def get_supported_languages(self) -> Set[str]:
        # OpenAI supports major written world languages
        return {
            "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar",
            "te", "hi", "ta", "kn", "ml", "mr", "bn", "gu", "pa", "ur", "or",
            "sw", "yo", "am", "zu", "qu", "gn", "mi", "cy", "ga", "eu", "tr", "id", "vi"
        }

    def is_pair_supported(self, src: str, tgt: str) -> bool:
        if not self.is_configured():
            return False
        src_code = language_registry.resolve_language_code(src) or src.lower()
        tgt_code = language_registry.resolve_language_code(tgt) or tgt.lower()
        # Prevent automated hallucination on oral tongues
        if is_oral_or_endangered(src_code):
            return False
        return src_code in self.get_supported_languages() and tgt_code in self.get_supported_languages()

    def translate(self, text: str, src: str, tgt: str) -> TranslationResult:
        if not self.is_configured():
            raise RuntimeError("OpenAI translation provider is not configured.")
        from openai import OpenAI

        src_name = (language_registry.get_language(src) or {}).get("name", src)
        tgt_name = (language_registry.get_language(tgt) or {}).get("name", tgt)

        client = OpenAI(api_key=self.api_key, timeout=30.0)
        system_prompt = (
            f"You are a linguistic translation engine for the Voice Roots preservation archive. "
            f"Translate the following text faithfully from {src_name} to {tgt_name}. "
            f"Preserve cultural nuance, honorifics, and terminology. "
            f"Return ONLY the translated text, without commentary."
        )

        completion = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            max_tokens=600,
            temperature=0.2,
        )
        translated = completion.choices[0].message.content.strip()

        return TranslationResult(
            source_text=text,
            translated_text=translated,
            source_language=src,
            target_language=tgt,
            provider=self.name,
            model=self.model,
            verified=False,
            pair_status="machine_translated",
            limitation_note="Machine generated translation via commercial LLM. Requires native speaker verification.",
        )


class NLLBTranslationAdapter(BaseTranslationAdapter):
    """Adapter for Meta's No Language Left Behind (NLLB-200) translation model."""

    name = "nllb"

    def __init__(self, endpoint_url: Optional[str] = None) -> None:
        self.endpoint_url = endpoint_url or os.environ.get("VOICE_ROOTS_NLLB_URL", "").strip()

    def is_configured(self) -> bool:
        return bool(self.endpoint_url)

    def get_supported_languages(self) -> Set[str]:
        # NLLB-200 covers 200 languages including Quechua, Guarani, Swahili, Yoruba, Maori, Basque, Welsh
        return {
            "en", "es", "fr", "de", "pt", "ru", "zh", "ja", "ko", "ar",
            "te", "hi", "ta", "kn", "ml", "mr", "bn", "gu", "pa", "ur", "or",
            "qu", "gn", "sw", "yo", "am", "zu", "mi", "cy", "ga", "eu", "tr", "id", "vi"
        }

    def is_pair_supported(self, src: str, tgt: str) -> bool:
        if not self.is_configured():
            return False
        src_code = language_registry.resolve_language_code(src) or src.lower()
        tgt_code = language_registry.resolve_language_code(tgt) or tgt.lower()
        return src_code in self.get_supported_languages() and tgt_code in self.get_supported_languages()

    def translate(self, text: str, src: str, tgt: str) -> TranslationResult:
        # In mock or offline test without live NLLB endpoint
        raise RuntimeError("NLLB endpoint not active in local environment.")


class UniversalTranslationManager:
    """Manages translation adapters and verifies language pair capabilities."""

    def __init__(self) -> None:
        self.adapters: List[BaseTranslationAdapter] = [
            IdentityTranslationAdapter(),
            OpenAITranslationAdapter(),
            NLLBTranslationAdapter(),
        ]

    def register_adapter(self, adapter: BaseTranslationAdapter) -> None:
        """Register a new custom translation provider adapter."""
        self.adapters.insert(1, adapter)
        logger.info("Registered translation adapter: %s", adapter.name)

    def get_available_providers(self) -> List[Dict[str, Any]]:
        """Return list of registered translation adapters with active configuration status."""
        return [
            {
                "name": a.name,
                "configured": a.is_configured(),
                "supported_languages_count": len(a.get_supported_languages()),
            }
            for a in self.adapters
        ]

    def check_pair_support(self, src: str, tgt: str) -> Dict[str, Any]:
        """Check if a language pair is supported, explaining any limitations."""
        src_clean = (src or "").strip().lower()
        tgt_clean = (tgt or "en").strip().lower()

        src_lang = language_registry.get_language(src_clean)
        tgt_lang = language_registry.get_language(tgt_clean)

        src_name = src_lang["name"] if src_lang else src
        tgt_name = tgt_lang["name"] if tgt_lang else tgt

        # 1. Oral Language Protection Check
        if is_oral_or_endangered(src_clean):
            return {
                "supported": False,
                "pair_status": "elder_review_required",
                "source_language": src_name,
                "target_language": tgt_name,
                "reason": (
                    f"{src_name} is an unwritten oral heritage tongue without a standardized commercial NMT benchmark. "
                    f"Automated translation is restricted under Indigenous Data Sovereignty protocols; "
                    f"verified community elder transcription and translation is required."
                ),
            }

        # 2. Check Adapters
        for adapter in self.adapters:
            if adapter.is_pair_supported(src_clean, tgt_clean):
                return {
                    "supported": True,
                    "pair_status": "supported",
                    "provider": adapter.name,
                    "source_language": src_name,
                    "target_language": tgt_name,
                    "reason": f"Supported via provider '{adapter.name}'.",
                }

        # 3. Unsupported Pair
        return {
            "supported": False,
            "pair_status": "unsupported",
            "source_language": src_name,
            "target_language": tgt_name,
            "reason": (
                f"No active translation provider currently supports pair '{src_name}' -> '{tgt_name}'. "
                f"Configure an external provider (such as OpenAI or NLLB-200) or provide verified community translations."
            ),
        }

    def translate(self, text: str, src: str, tgt: str) -> TranslationResult:
        """Execute translation across configured adapters, or raise explicit error."""
        text_clean = (text or "").strip()
        if not text_clean:
            raise ValueError("Text to translate must not be empty.")

        src_clean = (src or "").strip()
        tgt_clean = (tgt or "en").strip()

        # Check oral protection
        if is_oral_or_endangered(src_clean):
            src_name = (language_registry.get_language(src_clean) or {}).get("name", src_clean)
            raise OralLanguageElderReviewRequiredError(src_name)

        # Execute through adapters
        for adapter in self.adapters:
            if adapter.is_pair_supported(src_clean, tgt_clean):
                try:
                    return adapter.translate(text_clean, src_clean, tgt_clean)
                except Exception as exc:
                    logger.error("Adapter '%s' failed to translate: %s", adapter.name, exc)
                    raise

        # Pair is unsupported
        src_name = (language_registry.get_language(src_clean) or {}).get("name", src_clean)
        tgt_name = (language_registry.get_language(tgt_clean) or {}).get("name", tgt_clean)
        raise UnsupportedLanguagePairError(
            src_name,
            tgt_name,
            "No active translation provider supports this language pair. Voice Roots never returns fabricated translations."
        )


# Global translation manager instance
translation_manager = UniversalTranslationManager()


def get_translation_manager() -> UniversalTranslationManager:
    """Return the global UniversalTranslationManager instance."""
    return translation_manager

