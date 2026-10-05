"""Community model."""
import uuid
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class Community(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "communities"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    region: Mapped[str | None] = mapped_column(String(200), nullable=True)
    language_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("languages.id"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    member_count: Mapped[int] = mapped_column(Integer, default=0)
    recording_count: Mapped[int] = mapped_column(Integer, default=0)
    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<Community {self.name}>"
