"""Recording model."""
import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Enum as SAEnum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class RecordingType(str, enum.Enum):
    story = "story"
    conversation = "conversation"
    interview = "interview"
    song = "song"
    traditional_knowledge = "traditional_knowledge"
    proverb = "proverb"
    history = "history"
    other = "other"


class RecordingStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    review_needed = "review_needed"


class PrivacyLevel(str, enum.Enum):
    public = "public"
    community = "community"
    research = "research"
    private = "private"


class Recording(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "recordings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    language_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id"), nullable=True, index=True
    )
    dialect_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dialects.id"), nullable=True
    )
    community_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("communities.id"), nullable=True
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    recording_type: Mapped[RecordingType] = mapped_column(
        SAEnum(RecordingType, name="recordingtype"), default=RecordingType.story, nullable=False
    )

    # File info
    file_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_size_bytes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    mime_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Status
    status: Mapped[RecordingStatus] = mapped_column(
        SAEnum(RecordingStatus, name="recordingstatus"),
        default=RecordingStatus.pending,
        nullable=False,
        index=True,
    )
    privacy: Mapped[PrivacyLevel] = mapped_column(
        SAEnum(PrivacyLevel, name="privacylevel"),
        default=PrivacyLevel.public,
        nullable=False,
        index=True,
    )

    # Metadata
    speaker_count: Mapped[int] = mapped_column(Integer, default=1)
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    cultural_context: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # AI-detected metadata
    detected_language_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    detected_language_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    word_count: Mapped[int] = mapped_column(Integer, default=0)

    # Thumbnail
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    waveform_data: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="recordings")  # noqa: F821
    language: Mapped["Language | None"] = relationship("Language", back_populates="recordings")
    transcripts: Mapped[list["Transcript"]] = relationship(  # noqa: F821
        "Transcript", back_populates="recording", cascade="all, delete-orphan"
    )
    translations: Mapped[list["Translation"]] = relationship(  # noqa: F821
        "Translation", back_populates="recording", cascade="all, delete-orphan"
    )
    speakers: Mapped[list["Speaker"]] = relationship(  # noqa: F821
        "Speaker", back_populates="recording", cascade="all, delete-orphan"
    )
    consent: Mapped["Consent | None"] = relationship(  # noqa: F821
        "Consent", back_populates="recording", uselist=False, cascade="all, delete-orphan"
    )
    ai_jobs: Mapped[list["AIProcessingJob"]] = relationship(  # noqa: F821
        "AIProcessingJob", back_populates="recording", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(  # noqa: F821
        "Review", back_populates="recording"
    )
    embeddings: Mapped[list["Embedding"]] = relationship(  # noqa: F821
        "Embedding", back_populates="recording", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Recording {self.title} [{self.status}]>"
