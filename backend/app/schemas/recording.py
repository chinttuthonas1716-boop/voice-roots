"""Pydantic schemas for Recording endpoints."""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.recording import RecordingType, RecordingStatus, PrivacyLevel


class RecordingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    recording_type: RecordingType = RecordingType.story
    language_id: uuid.UUID | None = None
    dialect_id: uuid.UUID | None = None
    community_id: uuid.UUID | None = None
    privacy: PrivacyLevel = PrivacyLevel.public
    speaker_count: int = Field(1, ge=1, le=20)
    location: str | None = None
    cultural_context: str | None = None
    recorded_at: datetime | None = None


class RecordingUpdate(BaseModel):
    title: str | None = Field(None, max_length=500)
    description: str | None = None
    recording_type: RecordingType | None = None
    privacy: PrivacyLevel | None = None
    cultural_context: str | None = None


class RecordingResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    title: str
    description: str | None
    recording_type: RecordingType
    status: RecordingStatus
    privacy: PrivacyLevel
    duration_seconds: float | None
    file_size_bytes: int | None
    speaker_count: int
    word_count: int
    detected_language_code: str | None
    detected_language_confidence: float | None
    location: str | None
    cultural_context: str | None
    waveform_data: str | None
    thumbnail_url: str | None
    recorded_at: datetime | None
    created_at: datetime
    updated_at: datetime
    user_id: uuid.UUID
    language_id: uuid.UUID | None


class RecordingListResponse(BaseModel):
    items: list[RecordingResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
