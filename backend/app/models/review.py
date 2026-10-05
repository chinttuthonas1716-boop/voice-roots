"""Review model."""
import uuid
import enum
from sqlalchemy import String, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class ReviewType(str, enum.Enum):
    transcript_correction = "transcript_correction"
    vocabulary_verification = "vocabulary_verification"
    translation_check = "translation_check"
    cultural_context = "cultural_context"
    content_moderation = "content_moderation"


class ReviewStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    needs_revision = "needs_revision"


class Review(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "reviews"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    review_type: Mapped[ReviewType] = mapped_column(
        SAEnum(ReviewType, name="reviewtype"), nullable=False
    )
    status: Mapped[ReviewStatus] = mapped_column(
        SAEnum(ReviewStatus, name="reviewstatus"),
        default=ReviewStatus.pending,
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    correction_data: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON

    recording: Mapped["Recording"] = relationship("Recording", back_populates="reviews")  # noqa: F821
    reviewer: Mapped["User"] = relationship("User", back_populates="reviews")  # noqa: F821


class VocabularyEntry(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "vocabulary_entries"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    language_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id"), nullable=True
    )
    word: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    normalized_form: Mapped[str | None] = mapped_column(String(200), nullable=True)
    meaning: Mapped[str | None] = mapped_column(Text, nullable=True)
    translation_en: Mapped[str | None] = mapped_column(String(500), nullable=True)
    context_sentence: Mapped[str | None] = mapped_column(Text, nullable=True)
    audio_timestamp: Mapped[float | None] = mapped_column(default=None)
    is_verified: Mapped[bool] = mapped_column(__import__("sqlalchemy").Boolean, default=False)
