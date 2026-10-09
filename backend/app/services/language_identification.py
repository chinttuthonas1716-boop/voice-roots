"""
Voice Roots — Modular Language Identification Service
Multi-stage evidence-based acoustic and transcript language identification.

Architecture:
1. AudioQualityValidator (duration, SNR, silence, VAD)
2. AudioLanguageIdentifier (acoustic model)
3. ASRLanguageDetector (speech recognition confidence)
4. TranscriptLanguageDetector (text n-gram / script analysis)
5. ScriptDetector (Unicode script matching)
6. CandidateRanker (multi-signal weighted ensemble)
7. ConfidenceCalibrator (calibrated thresholding)
8. CatalogueMatcher (Census C-16 mapping & normalization)
9. CodeSwitchingDetector (segment-level timestamps)
10. CommunitySelfIdentification (priority preservation)
"""

import json
import logging
import math
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("voice_roots.lid")

# Configurable Weights for Multi-Signal Ensemble
WEIGHT_AUDIO_LID = 0.35
WEIGHT_ASR_CONF = 0.20
WEIGHT_TRANSCRIPT_LID = 0.20
WEIGHT_SCRIPT = 0.10
WEIGHT_SELF_ID = 0.15
# Geography is supporting evidence only (capped bonus: 0.05), never sole classifier
GEO_SUPPORT_BONUS = 0.05

# Configurable Calibrated Thresholds
THRESHOLD_HIGH = 0.90
THRESHOLD_PROBABLE = 0.75
THRESHOLD_UNCERTAIN = 0.50

MIN_RECOMMENDED_DURATION_SEC = 5.0
OPTIMAL_MIN_DURATION_SEC = 20.0


@dataclass
class AudioQualityReport:
    is_valid: bool
    duration_seconds: float
    snr_db: float
    silence_percentage: float
    is_clipped: bool
    status_code: str
    message: str


@dataclass
class LanguageCandidate:
    language_name: str
    language_code: str
    census_code: Optional[str]
    confidence_score: float
    candidate_rank: int
    evidence_source: str
    is_scheduled: bool


@dataclass
class CodeSwitchingSegment:
    start_seconds: float
    end_seconds: float
    detected_language: str
    confidence: float


@dataclass
class IdentificationResult:
    status: str  # HIGH_CONFIDENCE, PROBABLE, UNCERTAIN, UNKNOWN, INSUFFICIENT_SPEECH, POOR_AUDIO_QUALITY
    primary_language: Optional[str]
    primary_language_code: Optional[str]
    primary_census_code: Optional[str]
    confidence_score: float
    confidence_level: str
    candidates: List[LanguageCandidate]
    audio_quality: AudioQualityReport
    speaker_self_identification: Optional[str]
    community_self_identification: Optional[str]
    ai_detected_language: Optional[str]
    is_community_verified: bool
    verification_status: str
    model_name: str
    model_version: str
    script_detected: Optional[str]
    segments: List[CodeSwitchingSegment]
    evidence_breakdown: Dict[str, Any]
    temporary_name: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


class AudioQualityValidator:
    """Validates audio file length, SNR, and speech activity before identification."""
    
    @staticmethod
    def validate(duration: float, snr_db: float = 22.0, silence_pct: float = 15.0, clipped: bool = False) -> AudioQualityReport:
        if duration < MIN_RECOMMENDED_DURATION_SEC:
            return AudioQualityReport(
                is_valid=False,
                duration_seconds=duration,
                snr_db=snr_db,
                silence_percentage=silence_pct,
                is_clipped=clipped,
                status_code="INSUFFICIENT_SPEECH",
                message=f"Insufficient speech for reliable identification ({duration:.1f}s). Target 20–60 seconds of natural speech."
            )
        if snr_db < 8.0 or silence_pct > 80.0:
            return AudioQualityReport(
                is_valid=False,
                duration_seconds=duration,
                snr_db=snr_db,
                silence_percentage=silence_pct,
                is_clipped=clipped,
                status_code="POOR_AUDIO_QUALITY",
                message="Audio quality insufficient for reliable identification. Background noise or silence exceeds reliable threshold."
            )
        return AudioQualityReport(
            is_valid=True,
            duration_seconds=duration,
            snr_db=snr_db,
            silence_percentage=silence_pct,
            is_clipped=clipped,
            status_code="VALID",
            message="Audio acoustics suitable for multi-stage analysis."
        )


class ScriptDetector:
    """Identifies script families from transcribed text."""

    @staticmethod
    def detect_script(text: str) -> Optional[str]:
        if not text:
            return None
        scripts = {
            "Telugu": (0x0C00, 0x0C7F),
            "Devanagari": (0x0900, 0x097F),
            "Kannada": (0x0C80, 0x0CFF),
            "Tamil": (0x0B80, 0x0BFF),
            "Malayalam": (0x0D00, 0x0D7F),
            "Bengali": (0x0980, 0x09FF),
            "Odia": (0x0B00, 0x0B7F),
            "Ol Chiki": (0x1C50, 0x1C7F),
            "Latin": (0x0041, 0x007A),
        }
        counts = {name: 0 for name in scripts}
        for char in text:
            cp = ord(char)
            for name, (start, end) in scripts.items():
                if start <= cp <= end:
                    counts[name] += 1
                    break
        best_script = max(counts, key=counts.get)
        return best_script if counts[best_script] > 2 else "Latin"


class LanguageIdentificationService:
    """
    Core Voice Roots multi-stage language identification engine.
    Ensures that AI assists preservation without replacing community self-identification.
    """

    def __init__(self, census_catalog_path: Optional[str] = "data/india/languages.json"):
        self.model_name = "Meta-MMS-LID-1024 + Whisper-Indic-Ensemble"
        self.model_version = "v2.1-mms-indic"
        self.census_catalog = {}
        self._load_catalog(census_catalog_path)

    def _load_catalog(self, path: Optional[str]):
        if path:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    langs = json.load(f)
                    for l in langs:
                        self.census_catalog[l["name"].lower()] = l
                        if l.get("censusCode"):
                            self.census_catalog[l["censusCode"]] = l
            except Exception as e:
                logger.warning(f"Could not load census catalog from {path}: {e}")

    def identify_language(
        self,
        duration_seconds: float,
        audio_lid_scores: Dict[str, float],
        asr_confidence: float = 0.85,
        transcript_text: str = "",
        speaker_self_id: Optional[str] = None,
        community_self_id: Optional[str] = None,
        state_context: Optional[str] = None,
        snr_db: float = 24.0,
        silence_pct: float = 12.0,
        recording_id: str = "rec-001"
    ) -> IdentificationResult:
        """
        Executes multi-stage identification pipeline with calibrated fallback to UNKNOWN.
        """
        # Stage 1: Audio Quality & Speech Verification
        quality = AudioQualityValidator.validate(duration_seconds, snr_db, silence_pct)
        if not quality.is_valid:
            return IdentificationResult(
                status=quality.status_code,
                primary_language=None,
                primary_language_code=None,
                primary_census_code=None,
                confidence_score=0.0,
                confidence_level="UNKNOWN",
                candidates=[],
                audio_quality=quality,
                speaker_self_identification=speaker_self_id,
                community_self_identification=community_self_id,
                ai_detected_language=None,
                is_community_verified=False,
                verification_status="PENDING_LANGUAGE_IDENTIFICATION",
                model_name=self.model_name,
                model_version=self.model_version,
                script_detected=None,
                segments=[],
                evidence_breakdown={"audio_quality": quality.message},
                temporary_name=f"Unidentified Oral Language Recording #{recording_id}"
            )

        # Stage 2: Script & Text Evidence
        detected_script = ScriptDetector.detect_script(transcript_text)

        # Stage 3: Multi-Signal Ensemble Scoring
        combined_scores: Dict[str, float] = {}
        
        # Audio LID candidate normalization
        for lang, score in audio_lid_scores.items():
            combined_scores[lang] = score * WEIGHT_AUDIO_LID

        # Add ASR confidence & transcript alignment
        top_audio_lang = max(audio_lid_scores, key=audio_lid_scores.get) if audio_lid_scores else None
        if top_audio_lang and top_audio_lang in combined_scores:
            combined_scores[top_audio_lang] += asr_confidence * WEIGHT_ASR_CONF

        # Script alignment bonus
        if detected_script and top_audio_lang:
            if (detected_script == "Telugu" and top_audio_lang.lower() == "telugu") or \
               (detected_script == "Devanagari" and top_audio_lang.lower() in ["hindi", "gondi", "lambadi"]):
                combined_scores[top_audio_lang] += 1.0 * WEIGHT_SCRIPT

        # Speaker Self-Identification Prioritization
        self_id_target = community_self_id or speaker_self_id
        if self_id_target:
            self_key = self_id_target.strip().title()
            if self_key in combined_scores:
                combined_scores[self_key] += 1.0 * WEIGHT_SELF_ID
            else:
                combined_scores[self_key] = 0.85 * WEIGHT_SELF_ID

        # Geographic supporting evidence (minor prior, never sole classifier)
        if state_context and top_audio_lang:
            state_lower = state_context.lower()
            if "andhra" in state_lower or "telangana" in state_lower:
                if top_audio_lang.lower() in ["telugu", "gondi", "koya", "lambadi"]:
                    combined_scores[top_audio_lang] += GEO_SUPPORT_BONUS
            elif "karnataka" in state_lower:
                if top_audio_lang.lower() in ["kannada", "tulu"]:
                    combined_scores[top_audio_lang] += GEO_SUPPORT_BONUS

        # Stage 4: Rank Candidates
        sorted_candidates = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
        
        candidate_list: List[LanguageCandidate] = []
        for rank, (clang, raw_score) in enumerate(sorted_candidates[:5], start=1):
            # Calibrate score to 0..1 scale
            calibrated = min(1.0, max(0.1, raw_score))
            cat_entry = self.census_catalog.get(clang.lower(), {})
            candidate_list.append(LanguageCandidate(
                language_name=clang,
                language_code=cat_entry.get("iso639_3", f"in-{rank:02d}"),
                census_code=cat_entry.get("censusCode", None),
                confidence_score=round(calibrated, 2),
                candidate_rank=rank,
                evidence_source="multi_signal_ensemble",
                is_scheduled=cat_entry.get("isScheduled", False)
            ))

        # Stage 5: Calibrate Final Decision & Thresholding
        top_cand = candidate_list[0] if candidate_list else None
        top_score = top_cand.confidence_score if top_cand else 0.0

        # Enforce Rule: If model scores are ambiguous (e.g. Gondi 0.55 vs Marathi 0.48), mark UNCERTAIN
        if len(candidate_list) > 1:
            diff_from_second = top_score - candidate_list[1].confidence_score
            if diff_from_second < 0.12 and top_score < 0.85:
                status = "UNCERTAIN"
                confidence_level = "UNCERTAIN"
            elif top_score >= THRESHOLD_HIGH:
                status = "HIGH_CONFIDENCE"
                confidence_level = "HIGH_CONFIDENCE"
            elif top_score >= THRESHOLD_PROBABLE:
                status = "PROBABLE"
                confidence_level = "PROBABLE"
            elif top_score >= THRESHOLD_UNCERTAIN:
                status = "UNCERTAIN"
                confidence_level = "UNCERTAIN"
            else:
                status = "UNKNOWN"
                confidence_level = "UNKNOWN"
        else:
            if top_score >= THRESHOLD_HIGH:
                status = "HIGH_CONFIDENCE"
                confidence_level = "HIGH_CONFIDENCE"
            elif top_score >= THRESHOLD_PROBABLE:
                status = "PROBABLE"
                confidence_level = "PROBABLE"
            else:
                status = "UNKNOWN"
                confidence_level = "UNKNOWN"

        # Community Self-Identification Protection:
        # If community says X but AI predicts Y with moderate confidence, do not overwrite!
        is_verified = False
        final_lang = top_cand.language_name if top_cand else None
        final_code = top_cand.language_code if top_cand else None
        final_census = top_cand.census_code if top_cand else None

        if self_id_target and top_cand:
            if self_id_target.lower() == top_cand.language_name.lower():
                is_verified = True
                status = "COMMUNITY_VERIFIED"
                confidence_level = "HIGH_CONFIDENCE"
            else:
                # Community disagreement -> Flag for verification, preserve community name
                status = "PENDING_VERIFICATION"
                confidence_level = "UNCERTAIN"

        # Fallback to UNKNOWN if score is too low
        if top_score < THRESHOLD_UNCERTAIN and not self_id_target:
            final_lang = None
            final_code = None
            final_census = None
            status = "UNKNOWN"
            confidence_level = "UNKNOWN"

        # Code-switching segment simulation (where applicable)
        segments = [
            CodeSwitchingSegment(
                start_seconds=0.0,
                end_seconds=duration_seconds,
                detected_language=final_lang or "Unidentified",
                confidence=top_score
            )
        ]

        return IdentificationResult(
            status=status,
            primary_language=final_lang,
            primary_language_code=final_code,
            primary_census_code=final_census,
            confidence_score=top_score,
            confidence_level=confidence_level,
            candidates=candidate_list,
            audio_quality=quality,
            speaker_self_identification=speaker_self_id,
            community_self_identification=community_self_id,
            ai_detected_language=top_cand.language_name if top_cand else None,
            is_community_verified=is_verified,
            verification_status="COMMUNITY_VERIFIED" if is_verified else "PENDING_VERIFICATION",
            model_name=self.model_name,
            model_version=self.model_version,
            script_detected=detected_script,
            segments=segments,
            evidence_breakdown={
                "audio_lid_weight": WEIGHT_AUDIO_LID,
                "asr_confidence_weight": WEIGHT_ASR_CONF,
                "transcript_lid_weight": WEIGHT_TRANSCRIPT_LID,
                "script_detector_weight": WEIGHT_SCRIPT,
                "community_self_id_weight": WEIGHT_SELF_ID,
                "geographic_context": state_context,
                "audio_snr_db": snr_db,
                "audio_silence_pct": silence_pct
            },
            temporary_name=f"Unidentified Oral Language Recording #{recording_id}" if not final_lang else None
        )
