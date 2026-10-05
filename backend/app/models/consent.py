"""Consent model."""
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class VisibilityLevel(str, enum.Enum):
    public = "public"
    community = "community"
    research = "research"
    private = "private"


class Consent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "consents"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, unique=True, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    speaker_label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_processing_allowed: Mapped[bool] = mapped_column(Boolean, default=True)
    research_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    publication_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    commercial_use_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    visibility: Mapped[VisibilityLevel] = mapped_column(
        SAEnum(VisibilityLevel, name="visibilitylevel"),
        default=VisibilityLevel.public,
    )

    consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    withdrawal_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    recording: Mapped["Recording"] = relationship(  # noqa: F821
        "Recording", back_populates="consent"
    )
