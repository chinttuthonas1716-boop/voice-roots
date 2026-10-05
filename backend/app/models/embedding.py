"""Embedding model using pgvector."""
import uuid
from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class Embedding(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "embeddings"

    recording_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recordings.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    transcript_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transcripts.id"), nullable=True
    )
    model_used: Mapped[str] = mapped_column(String(200), nullable=False)
    embedding_dim: Mapped[int] = mapped_column(Integer, default=384)
    vector: Mapped[list[float]] = mapped_column(Vector(768), nullable=False)

    recording: Mapped["Recording"] = relationship(  # noqa: F821
        "Recording", back_populates="embeddings"
    )
