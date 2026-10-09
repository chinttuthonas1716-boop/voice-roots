"""Language, Mother Tongue, and Identification models for Voice Roots."""
import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, Enum as SAEnum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class LanguageStatus(str, enum.Enum):
    active = "active"
    endangered = "endangered"
    critically_endangered = "critically_endangered"
    dormant = "dormant"
    extinct = "extinct"


class IdentificationStatus(str, enum.Enum):
    verified = "VERIFIED"
    high_confidence = "HIGH_CONFIDENCE"
    probable = "PROBABLE"
    uncertain = "UNCERTAIN"
    unknown = "UNKNOWN"
    pending_verification = "PENDING_LANGUAGE_IDENTIFICATION"
    insufficient_speech = "INSUFFICIENT_SPEECH"
    poor_audio_quality = "POOR_AUDIO_QUALITY"


class Language(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "languages"

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    native_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    family: Mapped[str | None] = mapped_column(String(100), nullable=True)
    region: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[LanguageStatus] = mapped_column(
        SAEnum(LanguageStatus, name="languagestatus"),
        default=LanguageStatus.active,
        nullable=False,
    )
    recording_count: Mapped[int] = mapped_column(Integer, default=0)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    contributor_count: Mapped[int] = mapped_column(Integer, default=0)
    hour_count: Mapped[float] = mapped_column(default=0.0)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Official Census 2011 C-16 Provenance Fields
    census_code: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    census_raw_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    census_category: Mapped[str | None] = mapped_column(String(50), nullable=True)  # SCHEDULED_8, NON_SCHEDULED
    is_scheduled: Mapped[bool] = mapped_column(Boolean, default=False)
    population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    male_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    female_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rural_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    urban_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source_name: Mapped[str | None] = mapped_column(String(200), default="Office of the Registrar General & Census Commissioner, India")
    source_dataset: Mapped[str | None] = mapped_column(String(200), default="C-16: Population by Mother Tongue, India, 2011")
    source_year: Mapped[int | None] = mapped_column(Integer, default=2011)
    source_reference: Mapped[str | None] = mapped_column(String(100), default="PC11_C16-00")
    source_url: Mapped[str | None] = mapped_column(String(500), default="https://censusindia.gov.in/nada/index.php/catalog/10191")
    verification_status: Mapped[str | None] = mapped_column(String(50), default="OFFICIAL_CENSUS_2011")

    dialects: Mapped[list["Dialect"]] = relationship(
        "Dialect", back_populates="language", cascade="all, delete-orphan"
    )
    mother_tongues: Mapped[list["MotherTongue"]] = relationship(
        "MotherTongue", back_populates="language", cascade="all, delete-orphan"
    )
    aliases: Mapped[list["LanguageAlias"]] = relationship(
        "LanguageAlias", back_populates="language", cascade="all, delete-orphan"
    )
    recordings: Mapped[list["Recording"]] = relationship(  # noqa: F821
        "Recording", back_populates="language"
    )

    def __repr__(self) -> str:
        return f"<Language {self.name} ({self.code})>"


class Dialect(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "dialects"

    language_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    recording_count: Mapped[int] = mapped_column(Integer, default=0)

    language: Mapped[Language] = relationship("Language", back_populates="dialects")


class MotherTongue(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mother_tongues"

    language_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    native_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    census_code: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    is_residual_category: Mapped[bool] = mapped_column(Boolean, default=False)
    population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    male_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    female_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rural_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    urban_population_2011: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source_name: Mapped[str | None] = mapped_column(String(200), default="Office of the Registrar General & Census Commissioner, India")
    source_year: Mapped[int | None] = mapped_column(Integer, default=2011)
    verification_status: Mapped[str | None] = mapped_column(String(50), default="OFFICIAL_CENSUS_2011")

    language: Mapped[Language] = relationship("Language", back_populates="mother_tongues")


class LanguageAlias(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "language_aliases"

    canonical_language_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id", ondelete="CASCADE"), nullable=False
    )
    alias: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source: Mapped[str | None] = mapped_column(String(100), default="linguistic_crosswalk")
    verification_status: Mapped[str | None] = mapped_column(String(50), default="VERIFIED")

    language: Mapped[Language] = relationship("Language", back_populates="aliases")


class LanguageIdentification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "language_identifications"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    primary_language_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id"), nullable=True
    )
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    confidence_level: Mapped[str] = mapped_column(String(50), default="UNKNOWN")  # HIGH_CONFIDENCE, PROBABLE, UNCERTAIN, UNKNOWN
    status: Mapped[IdentificationStatus] = mapped_column(
        SAEnum(IdentificationStatus, name="identificationstatus"),
        default=IdentificationStatus.pending_verification,
        nullable=False
    )
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    transcript_language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    script_detected: Mapped[str | None] = mapped_column(String(50), nullable=True)
    
    # Priority community fields
    speaker_self_identification: Mapped[str | None] = mapped_column(String(100), nullable=True)
    community_self_identification: Mapped[str | None] = mapped_column(String(100), nullable=True)
    geographic_context: Mapped[str | None] = mapped_column(String(200), nullable=True)
    segments_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON for code-switching timestamps

    candidates: Mapped[list["LanguageIdentificationCandidate"]] = relationship(
        "LanguageIdentificationCandidate", back_populates="identification", cascade="all, delete-orphan"
    )


class LanguageIdentificationCandidate(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "language_identification_candidates"

    identification_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("language_identifications.id", ondelete="CASCADE"), nullable=False
    )
    language_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id"), nullable=True
    )
    language_name: Mapped[str] = mapped_column(String(100), nullable=False)
    candidate_rank: Mapped[int] = mapped_column(Integer, default=1)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    evidence_source: Mapped[str | None] = mapped_column(String(100), nullable=True)  # audio_lid, asr, transcript, script
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model_version: Mapped[str | None] = mapped_column(String(50), nullable=True)

    identification: Mapped[LanguageIdentification] = relationship(
        "LanguageIdentification", back_populates="candidates"
    )


class LanguageVerification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "language_verifications"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    language_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id"), nullable=False
    )
    verification_status: Mapped[str] = mapped_column(String(50), default="COMMUNITY_VERIFIED")
    verification_method: Mapped[str] = mapped_column(String(50), default="COMMUNITY_ELDER_REVIEW")  # COMMUNITY_ELDER_REVIEW, LINGUIST_PEER_REVIEW
    verified_by: Mapped[str] = mapped_column(String(100), nullable=False)
    verification_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    previous_prediction: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
