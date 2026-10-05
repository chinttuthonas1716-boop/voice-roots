"""Transcript and TranscriptSegment models."""
import uuid
import enum
from sqlalchemy import String, Text, Integer, Float, Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class TranscriptType(str, enum.Enum):
    original_ai = "original_ai"
    human_corrected = "human_corrected"
    normalized = "normalized"


class Transcript(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transcripts"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    language_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id"), nullable=True
    )
    version: Mapped[int] = mapped_column(Integer, default=1)
    content_type: Mapped[TranscriptType] = mapped_column(
        SAEnum(TranscriptType, name="transcripttype"),
        default=TranscriptType.original_ai,
        nullable=False,
    )
    full_text: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_used: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    recording: Mapped["Recording"] = relationship(  # noqa: F821
        "Recording", back_populates="transcripts"
    )
    segments: Mapped[list["TranscriptSegment"]] = relationship(
        "TranscriptSegment", back_populates="transcript", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Transcript [{self.content_type}] v{self.version}>"


class TranscriptSegment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transcript_segments"

    transcript_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transcripts.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    speaker_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("speakers.id"), nullable=True
    )
    speaker_label: Mapped[str | None] = mapped_column(String(50), nullable=True)
    start_time: Mapped[float] = mapped_column(Float, default=0.0)
    end_time: Mapped[float] = mapped_column(Float, default=0.0)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    segment_index: Mapped[int] = mapped_column(Integer, default=0)

    transcript: Mapped[Transcript] = relationship("Transcript", back_populates="segments")
