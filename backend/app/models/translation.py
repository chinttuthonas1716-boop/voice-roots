"""Translation model."""
import uuid
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class Translation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "translations"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    transcript_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transcripts.id"), nullable=True
    )
    source_language_code: Mapped[str] = mapped_column(String(20), nullable=False)
    target_language: Mapped[str] = mapped_column(String(100), nullable=False)
    target_language_code: Mapped[str] = mapped_column(String(20), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    model_used: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_verified: Mapped[bool] = mapped_column(
        __import__("sqlalchemy").Boolean, default=False
    )

    recording: Mapped["Recording"] = relationship(  # noqa: F821
        "Recording", back_populates="translations"
    )
