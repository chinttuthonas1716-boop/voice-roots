"""Analytics API — platform-wide statistics."""
import structlog
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.recording import Recording, RecordingStatus
from app.models.language import Language
from app.models.transcript import Transcript

router = APIRouter(prefix="/analytics", tags=["Analytics"])
logger = structlog.get_logger(__name__)


@router.get("/overview")
async def overview(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Return high-level platform statistics for the analytics dashboard."""
    total_languages = (await db.execute(select(func.count()).select_from(Language))).scalar_one()
    total_recordings = (await db.execute(select(func.count()).select_from(Recording))).scalar_one()
    completed_recordings = (await db.execute(
        select(func.count()).select_from(Recording).where(Recording.status == RecordingStatus.completed)
    )).scalar_one()
    total_users = (await db.execute(
        select(func.count()).select_from(__import__("app.models.user", fromlist=["User"]).User)
    )).scalar_one()
    total_words = (await db.execute(
        select(func.sum(Recording.word_count))
    )).scalar_one() or 0
    total_duration_seconds = (await db.execute(
        select(func.sum(Recording.duration_seconds))
    )).scalar_one() or 0.0

    return {
        "languages": total_languages,
        "recordings": total_recordings,
        "completed_recordings": completed_recordings,
        "contributors": total_users,
        "words_digitized": int(total_words),
        "hours_archived": round(float(total_duration_seconds) / 3600, 1),
    }


@router.get("/languages")
async def language_breakdown(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Return top languages by recording count."""
    result = await db.execute(
        select(Language.name, Language.code, Language.recording_count, Language.hour_count)
        .order_by(Language.recording_count.desc())
        .limit(limit)
    )
    return [
        {
            "name": row.name,
            "code": row.code,
            "recordings": row.recording_count,
            "hours": round(float(row.hour_count or 0), 1),
        }
        for row in result.fetchall()
    ]


@router.get("/recordings-over-time")
async def recordings_over_time(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Monthly recording count for the past 12 months."""
    result = await db.execute(
        select(
            func.date_trunc("month", Recording.created_at).label("month"),
            func.count().label("count"),
        )
        .group_by("month")
        .order_by("month")
        .limit(12)
    )
    return [
        {"month": str(row.month)[:7], "count": row.count}
        for row in result.fetchall()
    ]
