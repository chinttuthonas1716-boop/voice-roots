"""AI Processing Job model."""
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class JobType(str, enum.Enum):
    transcription = "transcription"
    translation = "translation"
    embedding = "embedding"
    language_detection = "language_detection"
    speaker_segmentation = "speaker_segmentation"
    summarization = "summarization"
    keyword_extraction = "keyword_extraction"
    full_pipeline = "full_pipeline"


class JobStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class AIProcessingJob(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_processing_jobs"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    job_type: Mapped[JobType] = mapped_column(
        SAEnum(JobType, name="jobtype"), nullable=False
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus, name="jobstatus"),
        default=JobStatus.queued,
        nullable=False,
        index=True,
    )
    model_used: Mapped[str | None] = mapped_column(String(200), nullable=True)
    result_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    progress_percent: Mapped[int] = mapped_column(default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    recording: Mapped["Recording"] = relationship(  # noqa: F821
        "Recording", back_populates="ai_jobs"
    )
