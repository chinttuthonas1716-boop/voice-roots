"""User model."""
import uuid
import enum
from sqlalchemy import String, Boolean, Enum as SAEnum, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class UserRole(str, enum.Enum):
    contributor = "contributor"
    researcher = "researcher"
    moderator = "moderator"
    admin = "admin"


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="userrole"), default=UserRole.contributor, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Relationships
    recordings: Mapped[list["Recording"]] = relationship(  # noqa: F821
        "Recording", back_populates="user", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(  # noqa: F821
        "Review", back_populates="reviewer"
    )

    def __repr__(self) -> str:
        return f"<User {self.username} ({self.role})>"
