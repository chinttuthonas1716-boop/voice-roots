"""Speaker model."""
import uuid
import enum
from sqlalchemy import String, Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class AgeGroup(str, enum.Enum):
    child = "child"
    youth = "youth"
    adult = "adult"
    elder = "elder"
    unknown = "unknown"


class Speaker(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "speakers"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "Speaker 1"
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    age_group: Mapped[AgeGroup] = mapped_column(
        SAEnum(AgeGroup, name="agegroup"), default=AgeGroup.unknown
    )
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)

    recording: Mapped["Recording"] = relationship(  # noqa: F821
        "Recording", back_populates="speakers"
    )
