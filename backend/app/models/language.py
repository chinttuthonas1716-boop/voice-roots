"""Language and Dialect models."""
import enum
from sqlalchemy import String, Text, Integer, Enum as SAEnum, ForeignKey
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

    dialects: Mapped[list["Dialect"]] = relationship(
        "Dialect", back_populates="language", cascade="all, delete-orphan"
    )
    recordings: Mapped[list["Recording"]] = relationship(  # noqa: F821
        "Recording", back_populates="language"
    )

    def __repr__(self) -> str:
        return f"<Language {self.name} ({self.code})>"


class Dialect(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "dialects"

    language_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    recording_count: Mapped[int] = mapped_column(Integer, default=0)

    language: Mapped[Language] = relationship("Language", back_populates="dialects")
