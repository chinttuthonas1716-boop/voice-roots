"""
Voice Roots: Real-Time Multilingual Voice Assistant Service
============================================================
Provides low-latency conversational voice sessions, live turn-taking,
incremental transcription, conversational translation with Indigenous Elder
guardrails, phonetic transliteration, pronunciation guidance, and ephemeral
memory lifecycle.
"""

from __future__ import annotations

import logging
import os
import sqlite3
import tempfile
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from translation_service import (
    OralLanguageElderReviewRequiredError,
    translation_manager,
)
from transcription_service import (
    TranscriptionNotConfiguredError,
    create_transcription_provider,
)

logger = logging.getLogger(__name__)

# Session limits & timeouts
SESSION_TIMEOUT_SECONDS = 900  # 15 minutes of inactivity
MAX_TURNS_PER_SESSION = 30
MAX_AUDIO_TURN_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB max per voice turn

ORAL_HERITAGE_LANGUAGES = {
    "gondi", "gon", "koya", "kff", "santhali", "sat", "lambadi", "lmn"
}


class VoiceAssistantTurn:
    def __init__(
        self,
        turn_id: str,
        speaker: str,
        original_transcript: str,
        source_language: str,
        target_language: str,
        translated_text: Optional[str] = None,
        transliteration: Optional[str] = None,
        pronunciation_guidance: Optional[Dict[str, Any]] = None,
        latency_ms: float = 0.0,
        guardrail_triggered: bool = False,
    ):
        self.turn_id = turn_id
        self.speaker = speaker
        self.original_transcript = original_transcript
        self.source_language = source_language
        self.target_language = target_language
        self.translated_text = translated_text
        self.transliteration = transliteration
        self.pronunciation_guidance = pronunciation_guidance or {}
        self.latency_ms = latency_ms
        self.guardrail_triggered = guardrail_triggered
        self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "turn_id": self.turn_id,
            "speaker": self.speaker,
            "original_transcript": self.original_transcript,
            "source_language": self.source_language,
            "target_language": self.target_language,
            "translated_text": self.translated_text,
            "transliteration": self.transliteration,
            "pronunciation_guidance": self.pronunciation_guidance,
            "latency_ms": self.latency_ms,
            "guardrail_triggered": self.guardrail_triggered,
            "timestamp": self.timestamp,
        }


class VoiceAssistantSession:
    def __init__(
        self,
        session_id: str,
        source_language: str = "te",
        target_language: str = "en",
        user_name: str = "Community Speaker",
    ):
        self.session_id = session_id
        self.source_language = source_language
        self.target_language = target_language
        self.user_name = user_name
        self.created_at = datetime.now(timezone.utc)
        self.last_active = datetime.now(timezone.utc)
        self.turns: List[VoiceAssistantTurn] = []
        self.is_active = True

    def is_expired(self) -> bool:
        elapsed = (datetime.now(timezone.utc) - self.last_active).total_seconds()
        return elapsed > SESSION_TIMEOUT_SECONDS

    def touch(self):
        self.last_active = datetime.now(timezone.utc)

    def to_summary(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "source_language": self.source_language,
            "target_language": self.target_language,
            "user_name": self.user_name,
            "turn_count": len(self.turns),
            "max_turns": MAX_TURNS_PER_SESSION,
            "created_at": self.created_at.isoformat(),
            "last_active": self.last_active.isoformat(),
            "is_active": self.is_active,
            "ephemeral_mode": True,
            "privacy_notice": "Audio is processed locally and discarded immediately. No recordings are stored on disk unless explicitly saved.",
        }


class VoiceAssistantManager:
    """Manages ephemeral in-memory conversation sessions and real-time turn processing."""

    def __init__(self):
        self._sessions: Dict[str, VoiceAssistantSession] = {}

    def _cleanup_expired_sessions(self):
        """Remove any sessions that have exceeded the 15-minute inactivity timeout."""
        expired = [sid for sid, s in self._sessions.items() if s.is_expired()]
        for sid in expired:
            del self._sessions[sid]

    def create_session(
        self,
        source_language: str = "te",
        target_language: str = "en",
        user_name: str = "Community Speaker",
    ) -> Dict[str, Any]:
        self._cleanup_expired_sessions()
        session_id = f"vas_{uuid.uuid4().hex[:16]}"
        session = VoiceAssistantSession(
            session_id=session_id,
            source_language=source_language.lower().strip(),
            target_language=target_language.lower().strip(),
            user_name=user_name.strip() or "Community Speaker",
        )
        self._sessions[session_id] = session
        return session.to_summary()

    def get_session(self, session_id: str) -> Optional[VoiceAssistantSession]:
        self._cleanup_expired_sessions()
        session = self._sessions.get(session_id)
        if session and session.is_expired():
            del self._sessions[session_id]
            return None
        return session

    def close_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False

    def process_turn(
        self,
        session_id: str,
        audio_bytes: Optional[bytes] = None,
        text_input: Optional[str] = None,
        audio_format: str = "wav",
        override_source_lang: Optional[str] = None,
        override_target_lang: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process an interactive voice or text turn:
        1. Validates session active state and rate limits.
        2. Performs Speech-to-Text via local Whisper provider (if audio).
        3. Enforces Indigenous Elder Guardrails on unwritten oral heritage tongues.
        4. Provides conversational translation for supported language pairs.
        5. Computes phonetic transliteration and pronunciation guidance.
        6. Measures end-to-end processing latency.
        7. Returns structured turn result while discarding raw audio bytes.
        """
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Voice assistant session '{session_id}' not found or expired.")

        if len(session.turns) >= MAX_TURNS_PER_SESSION:
            raise ValueError(f"Turn limit reached ({MAX_TURNS_PER_SESSION} turns). Please start a new session.")

        session.touch()
        t_start = time.perf_counter()

        src_lang = (override_source_lang or session.source_language).lower().strip()
        tgt_lang = (override_target_lang or session.target_language).lower().strip()

        # Step 1: Speech-to-Text Transcription
        transcript_text = ""
        if audio_bytes:
            if len(audio_bytes) > MAX_AUDIO_TURN_SIZE_BYTES:
                raise ValueError(f"Audio chunk exceeds maximum size of 10 MB.")

            # Ephemeral file for local Whisper inference
            suffix = f".{audio_format.lstrip('.')}"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_audio:
                tmp_path = tmp_audio.name
                tmp_audio.write(audio_bytes)

            try:
                provider = create_transcription_provider()
                res = provider.transcribe(tmp_path, language=src_lang)
                transcript_text = res.get("text", "").strip()
            except TranscriptionNotConfiguredError:
                transcript_text = "[Speech provider not configured: audio received]"
            except Exception as e:
                transcript_text = f"[Speech recognition error: {str(e)}]"
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.unlink(tmp_path)
                    except OSError:
                        pass
        elif text_input:
            transcript_text = text_input.strip()
        else:
            raise ValueError("Either audio_bytes or text_input must be provided for a conversation turn.")

        if not transcript_text:
            transcript_text = "[No audible speech detected]"

        # Step 2: Conversational Translation with Indigenous Elder Guardrail Protection
        translated_text = ""
        guardrail_triggered = False

        if src_lang in ORAL_HERITAGE_LANGUAGES or any(oral in src_lang for oral in ("gondi", "koya", "santhali", "lambadi")):
            guardrail_triggered = True
            translated_text = (
                f"[Elder Review Required] Translation restricted: Language '{src_lang}' is an unwritten oral heritage tongue. "
                "Automated AI translation without community elder review is prohibited to prevent linguistic hallucination under OCAP principles."
            )
        else:
            try:
                # If source matches target or empty translation requested
                if src_lang == tgt_lang:
                    translated_text = transcript_text
                else:
                    tx_result = translation_manager.translate(
                        text=transcript_text,
                        source_language=src_lang,
                        target_language=tgt_lang,
                        transcript_id=None,
                    )
                    translated_text = tx_result.get("translated_text", transcript_text)
            except OralLanguageElderReviewRequiredError:
                guardrail_triggered = True
                translated_text = (
                    f"[Elder Review Required] Translation restricted: Language '{src_lang}' requires community elder review."
                )
            except Exception as e:
                # Graceful fallback without crashing
                translated_text = f"[Translation unavailable for {src_lang}->{tgt_lang}: {str(e)}]"

        # Step 3: Phonetic Transliteration and Pronunciation Guidance
        pronunciation_guidance = generate_pronunciation_guidance(
            text=transcript_text,
            language=src_lang,
        )
        transliteration = pronunciation_guidance.get("transliteration", "")

        t_end = time.perf_counter()
        latency_ms = round((t_end - t_start) * 1000, 1)

        # Step 4: Record Turn in Session Memory
        turn_id = f"turn_{len(session.turns) + 1}_{uuid.uuid4().hex[:6]}"
        turn = VoiceAssistantTurn(
            turn_id=turn_id,
            speaker="user",
            original_transcript=transcript_text,
            source_language=src_lang,
            target_language=tgt_lang,
            translated_text=translated_text,
            transliteration=transliteration,
            pronunciation_guidance=pronunciation_guidance,
            latency_ms=latency_ms,
            guardrail_triggered=guardrail_triggered,
        )
        session.turns.append(turn)

        return {
            "session_id": session_id,
            "turn": turn.to_dict(),
            "session_summary": {
                "turn_count": len(session.turns),
                "max_turns": MAX_TURNS_PER_SESSION,
                "remaining_turns": MAX_TURNS_PER_SESSION - len(session.turns),
            },
        }

    def get_session_history(self, session_id: str) -> Dict[str, Any]:
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"Voice assistant session '{session_id}' not found or expired.")
        return {
            "session_id": session_id,
            "summary": session.to_summary(),
            "turns": [t.to_dict() for t in session.turns],
        }


# Global assistant manager instance
assistant_manager = VoiceAssistantManager()


# ==============================================================================
# Pronunciation Guidance & Phonetic Transliteration Helper
# ==============================================================================

def generate_pronunciation_guidance(text: str, language: str) -> Dict[str, Any]:
    """
    Generate pronunciation guidance, phoneme syllable breakdown, and Romanized
    phonetic transliteration for oral language learners and accessibility.
    """
    cleaned = text.strip()
    words = cleaned.split()
    word_count = len(words)

    # Phonetic transliteration approximation for Indic/regional scripts
    # Uses simple deterministic phonetic mapping for standard tokens
    transliteration = _approximate_phonetic_transliteration(cleaned, language)

    # Syllables estimation
    syllables = []
    for w in words[:6]:  # breakdown up to first 6 words for concise UI display
        syllables.append({
            "word": w,
            "syllable_count": max(1, len(w) // 2),
            "phonetic_hint": _word_phonetic_hint(w, language),
        })

    tips = []
    lang_lower = language.lower()
    if any(k in lang_lower for k in ("te", "telugu", "gon", "gondi", "kff", "koya")):
        tips.append("Retroflex consonants (ట, డ, ణ) require curling the tongue back to touch the hard palate.")
        tips.append("Distinguish short vowels (అ, ఇ, ఉ) from elongated long vowels (ఆ, ఈ, ఊ).")
    elif any(k in lang_lower for k in ("hi", "hindi", "mr", "marathi")):
        tips.append("Aspirated stops (ख, घ, छ, झ, थ, ध, फ, भ) require a distinct puff of air.")
    elif "sat" in lang_lower or "santhali" in lang_lower:
        tips.append("Glottal stops and unreleased checked consonants are characteristic of Ol Chiki phonology.")
    else:
        tips.append("Speak naturally at an even, conversational pace.")

    return {
        "text": cleaned,
        "language": language,
        "transliteration": transliteration,
        "word_count": word_count,
        "syllables_breakdown": syllables,
        "pronunciation_tips": tips,
        "synthesis_supported": True,
        "disclaimer": "Synthetic pronunciation guidance provides phonetic approximations. Community elder recordings remain the authoritative reference.",
    }


def _approximate_phonetic_transliteration(text: str, language: str) -> str:
    """Provide Romanized phonetic transliteration for non-Latin scripts."""
    # Common Telugu/Indic phonetic substitutions
    phonetic_map = {
        "నమస్కారం": "Namaskaram",
        "బాగున్నారా": "Bagunnara",
        "వాయిస్ రూట్స్": "Voice Roots",
        "గోండీ": "Gondi",
        "కోయ": "Koya",
        "హలో": "Hello",
        "ధన్యవాదాలు": "Dhanyavadalu",
        "नमस्ते": "Namaste",
        "धन्यवाद": "Dhanyavaad",
    }
    for k, v in phonetic_map.items():
        if k in text:
            return v
    # If already Latin text or unmapped
    return text


def _word_phonetic_hint(word: str, language: str) -> str:
    """Generate friendly phonetic pronunciation hint for a word."""
    if len(word) <= 3:
        return word
    # Split into chunks of 2-3 characters for rhythm guidance
    chunks = [word[i:i+3] for i in range(0, len(word), 3)]
    return "-".join(chunks)


# ==============================================================================
# Persistent Saved History (OCAP Consent Required)
# ==============================================================================

def save_conversation_history(
    session_id: str,
    user_name: Optional[str] = None,
    consent_confirmed: bool = False,
    db_path: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Save ephemeral session conversation into SQLite history table.
    Strictly requires affirmative OCAP consent (consent_confirmed = True).
    """
    if not consent_confirmed:
        raise ValueError("Consent is strictly required before saving conversation history (OCAP compliance).")

    session = assistant_manager.get_session(session_id)
    if not session:
        raise ValueError(f"Session '{session_id}' not found.")

    if not session.turns:
        raise ValueError("Cannot save an empty conversation.")

    import json
    target_db = db_path or os.environ.get("VOICE_ROOTS_DB_PATH", os.path.join(os.path.dirname(__file__), "voice_roots.db"))
    now = datetime.now(timezone.utc).isoformat()
    speaker_name = user_name or session.user_name

    conversation_data = {
        "session_id": session.session_id,
        "source_language": session.source_language,
        "target_language": session.target_language,
        "turns": [t.to_dict() for t in session.turns],
        "turn_count": len(session.turns),
        "saved_at": now,
    }

    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO assistant_conversations (
                session_id, user_name, source_language, target_language,
                turn_count, conversation_json, consent_confirmed, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
            """,
            (
                session.session_id,
                speaker_name,
                session.source_language,
                session.target_language,
                len(session.turns),
                json.dumps(conversation_data, ensure_ascii=False),
                now,
                now,
            ),
        )
        conn.commit()
        conv_id = cursor.lastrowid

    return {
        "success": True,
        "conversation_id": conv_id,
        "session_id": session_id,
        "user_name": speaker_name,
        "turn_count": len(session.turns),
        "saved_at": now,
        "message": "Conversation history saved successfully under OCAP protocols.",
    }


def list_saved_conversations(db_path: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve saved assistant conversation histories."""
    import json
    target_db = db_path or os.environ.get("VOICE_ROOTS_DB_PATH", os.path.join(os.path.dirname(__file__), "voice_roots.db"))
    conversations = []
    try:
        with sqlite3.connect(target_db) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, session_id, user_name, source_language, target_language,
                       turn_count, conversation_json, created_at, updated_at
                FROM assistant_conversations
                ORDER BY id DESC LIMIT ?
                """,
                (limit,),
            )
            for row in cursor.fetchall():
                r = dict(row)
                try:
                    r["conversation_data"] = json.loads(r["conversation_json"])
                except Exception:
                    r["conversation_data"] = None
                del r["conversation_json"]
                conversations.append(r)
    except Exception:
        pass
    return conversations


def delete_saved_conversation(conv_id: int, db_path: Optional[str] = None) -> bool:
    """Purge a saved conversation history permanently under user right-to-be-forgotten."""
    target_db = db_path or os.environ.get("VOICE_ROOTS_DB_PATH", os.path.join(os.path.dirname(__file__), "voice_roots.db"))
    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM assistant_conversations WHERE id = ?", (conv_id,))
        conn.commit()
        return cursor.rowcount > 0
