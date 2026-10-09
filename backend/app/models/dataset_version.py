"""Dataset versioning and update audit models for Voice Roots."""
import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Enum as SAEnum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class DatasetUpdateStatus(str, enum.Enum):
    checked = "CHECKED"
    no_change = "NO_CHANGE"
    new_version_found = "NEW_VERSION_FOUND"
    validation_failed = "VALIDATION_FAILED"
    awaiting_approval = "AWAITING_APPROVAL"
    approved = "APPROVED"
    imported = "IMPORTED"
    import_failed = "IMPORT_FAILED"
    rejected = "REJECTED"


class DatasetVersion(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "dataset_versions"

    source_name: Mapped[str] = mapped_column(String(200), default="Office of the Registrar General & Census Commissioner, India")
    dataset_name: Mapped[str] = mapped_column(String(200), default="C-16 Population by Mother Tongue, India, 2011")
    dataset_year: Mapped[int] = mapped_column(Integer, default=2011)
    dataset_version: Mapped[str] = mapped_column(String(50), default="v2011.C16.1")
    source_url: Mapped[str] = mapped_column(String(500), default="https://censusindia.gov.in/nada/index.php/catalog/10191/download/13303/DDW-C16-STMT-MDDS-0000.XLSX")
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    
    downloaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    validated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    imported_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    record_count: Mapped[int] = mapped_column(Integer, default=0)
    
    status: Mapped[DatasetUpdateStatus] = mapped_column(
        SAEnum(DatasetUpdateStatus, name="datasetupdatestatus"),
        default=DatasetUpdateStatus.awaiting_approval,
        nullable=False,
        index=True
    )
    change_summary: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON summary of diffs

    audit_logs: Mapped[list["DataUpdateAuditLog"]] = relationship(
        "DataUpdateAuditLog", back_populates="dataset_version", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<DatasetVersion {self.dataset_name} ({self.dataset_version}) [{self.status}]>"


class DataUpdateAuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "data_update_audit_logs"

    dataset_version_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dataset_versions.id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    actor_id: Mapped[str | None] = mapped_column(String(100), default="system_scheduler")
    status: Mapped[str] = mapped_column(String(50), default="SUCCESS")
    details: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON or text description
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    dataset_version: Mapped[DatasetVersion | None] = relationship("DatasetVersion", back_populates="audit_logs")
