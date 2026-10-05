"""Languages API — CRUD for languages and dialects."""
import uuid
import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.auth.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.language import Language, Dialect, LanguageStatus

router = APIRouter(prefix="/languages", tags=["Languages"])
logger = structlog.get_logger(__name__)


class LanguageCreate(BaseModel):
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=20)
    native_name: str | None = None
    family: str | None = None
    region: str | None = None
    description: str | None = None
    status: LanguageStatus = LanguageStatus.active


class LanguageResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    name: str
    code: str
    native_name: str | None
    family: str | None
    region: str | None
    description: str | None
    status: LanguageStatus
    recording_count: int
    word_count: int
    contributor_count: int
    hour_count: float
    cover_image_url: str | None


class DialectCreate(BaseModel):
    name: str = Field(..., max_length=100)
    region: str | None = None
    description: str | None = None


class DialectResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: uuid.UUID
    language_id: uuid.UUID
    name: str
    region: str | None
    description: str | None
    recording_count: int


@router.get("", response_model=list[LanguageResponse])
async def list_languages(
    search: str | None = None,
    status: LanguageStatus | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """List all languages in the archive, sorted by recording count."""
    q = select(Language)
    if search:
        q = q.where(Language.name.ilike(f"%{search}%") | Language.native_name.ilike(f"%{search}%"))
    if status:
        q = q.where(Language.status == status)
    q = q.order_by(Language.recording_count.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    return [LanguageResponse.model_validate(lang) for lang in result.scalars().all()]


@router.get("/{language_id}", response_model=LanguageResponse)
async def get_language(language_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Language).where(Language.id == language_id))
    lang = result.scalar_one_or_none()
    if not lang:
        raise HTTPException(status_code=404, detail="Language not found")
    return LanguageResponse.model_validate(lang)


@router.post("", response_model=LanguageResponse, status_code=201)
async def create_language(
    payload: LanguageCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(UserRole.admin, UserRole.moderator)),
):
    existing = await db.execute(select(Language).where(Language.code == payload.code))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Language code '{payload.code}' already exists")
    lang = Language(**payload.model_dump())
    db.add(lang)
    await db.commit()
    await db.refresh(lang)
    return LanguageResponse.model_validate(lang)


@router.get("/{language_id}/dialects", response_model=list[DialectResponse])
async def list_dialects(language_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dialect).where(Dialect.language_id == language_id))
    return [DialectResponse.model_validate(d) for d in result.scalars().all()]


@router.post("/{language_id}/dialects", response_model=DialectResponse, status_code=201)
async def create_dialect(
    language_id: uuid.UUID,
    payload: DialectCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    dialect = Dialect(language_id=language_id, **payload.model_dump())
    db.add(dialect)
    await db.commit()
    await db.refresh(dialect)
    return DialectResponse.model_validate(dialect)


@router.get("/stats/overview")
async def language_stats(db: AsyncSession = Depends(get_db)):
    """Aggregate stats for the analytics dashboard."""
    total_languages = (await db.execute(select(func.count()).select_from(Language))).scalar()
    total_recordings = (await db.execute(
        select(func.sum(Language.recording_count))
    )).scalar() or 0
    total_words = (await db.execute(
        select(func.sum(Language.word_count))
    )).scalar() or 0
    total_hours = (await db.execute(
        select(func.sum(Language.hour_count))
    )).scalar() or 0.0
    return {
        "total_languages": total_languages,
        "total_recordings": total_recordings,
        "total_words": total_words,
        "total_hours": round(float(total_hours), 1),
    }
