"""Recordings API endpoints."""
import uuid
import asyncio
import structlog
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.recording import Recording, RecordingStatus, PrivacyLevel
from app.schemas.recording import (
    RecordingCreate, RecordingUpdate, RecordingResponse, RecordingListResponse
)

router = APIRouter(prefix="/recordings", tags=["Recordings"])
logger = structlog.get_logger(__name__)


def _visibility_filter(user: User):
    """Build a SQLAlchemy filter for recordings the user can see."""
    return or_(
        Recording.privacy == PrivacyLevel.public,
        Recording.user_id == user.id,
        # moderators/admins see everything
        user.role.value in ("moderator", "admin"),
    )


@router.get("", response_model=RecordingListResponse)
async def list_recordings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    language_id: uuid.UUID | None = None,
    recording_type: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recordings visible to the current user."""
    q = select(Recording).where(_visibility_filter(current_user))
    if language_id:
        q = q.where(Recording.language_id == language_id)
    if recording_type:
        q = q.where(Recording.recording_type == recording_type)
    if status_filter:
        q = q.where(Recording.status == status_filter)

    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar_one()

    q = q.order_by(Recording.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(q)).scalars().all()

    return RecordingListResponse(
        items=[RecordingResponse.model_validate(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
        has_next=(page * page_size) < total,
    )


@router.post("", response_model=RecordingResponse, status_code=status.HTTP_201_CREATED)
async def create_recording(
    payload: RecordingCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new recording metadata entry."""
    recording = Recording(
        user_id=current_user.id,
        **payload.model_dump(exclude_none=True),
    )
    db.add(recording)
    await db.commit()
    await db.refresh(recording)
    logger.info("recording.created", id=str(recording.id))
    return RecordingResponse.model_validate(recording)


@router.get("/mine", response_model=RecordingListResponse)
async def my_recordings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's own recordings."""
    q = select(Recording).where(Recording.user_id == current_user.id)
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar_one()
    q = q.order_by(Recording.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(q)).scalars().all()
    return RecordingListResponse(
        items=[RecordingResponse.model_validate(r) for r in items],
        total=total,
        page=page,
        page_size=page_size,
        has_next=(page * page_size) < total,
    )


@router.get("/{recording_id}", response_model=RecordingResponse)
async def get_recording(
    recording_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single recording by ID."""
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if (recording.privacy != PrivacyLevel.public and
            recording.user_id != current_user.id and
            current_user.role.value not in ("moderator", "admin")):
        raise HTTPException(status_code=403, detail="Access denied")
    return RecordingResponse.model_validate(recording)


@router.patch("/{recording_id}", response_model=RecordingResponse)
async def update_recording(
    recording_id: uuid.UUID,
    payload: RecordingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update recording metadata."""
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.user_id != current_user.id and current_user.role.value not in ("moderator", "admin"):
        raise HTTPException(status_code=403, detail="Not your recording")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(recording, field, value)
    db.add(recording)
    await db.commit()
    await db.refresh(recording)
    return RecordingResponse.model_validate(recording)


@router.delete("/{recording_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recording(
    recording_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a recording and all its data."""
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not your recording")
    await db.delete(recording)
    await db.commit()
    logger.info("recording.deleted", id=str(recording_id))


@router.post("/{recording_id}/process", status_code=status.HTTP_202_ACCEPTED)
async def trigger_ai_processing(
    recording_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger the full AI processing pipeline for a recording."""
    result = await db.execute(select(Recording).where(Recording.id == recording_id))
    recording = result.scalar_one_or_none()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    if recording.user_id != current_user.id and current_user.role.value not in ("moderator", "admin"):
        raise HTTPException(status_code=403, detail="Access denied")
    if not recording.file_path:
        raise HTTPException(status_code=400, detail="No audio file attached to this recording")

    from app.ai.pipeline import run_full_pipeline
    background_tasks.add_task(run_full_pipeline, recording, db)
    return {"message": "AI processing started", "recording_id": str(recording_id)}
