"""Search API — keyword + semantic search across the archive."""
import uuid
import structlog
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.database.session import get_db
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.models.recording import Recording, PrivacyLevel
from app.models.transcript import Transcript
from app.models.embedding import Embedding
from app.schemas.recording import RecordingResponse

router = APIRouter(prefix="/search", tags=["Search"])
logger = structlog.get_logger(__name__)


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    language_code: str | None = None
    recording_type: str | None = None
    limit: int = Field(10, ge=1, le=50)


class SearchResult(BaseModel):
    recording: RecordingResponse
    relevance_score: float
    matched_text: str | None = None


@router.get("")
async def keyword_search(
    q: str = Query(..., min_length=1),
    language_id: uuid.UUID | None = None,
    recording_type: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full-text keyword search across recording titles, descriptions and transcripts."""
    # Search recordings by title/description
    stmt = select(Recording).where(
        (Recording.privacy == PrivacyLevel.public) | (Recording.user_id == current_user.id)
    )
    if language_id:
        stmt = stmt.where(Recording.language_id == language_id)
    if recording_type:
        stmt = stmt.where(Recording.recording_type == recording_type)

    # Filter by title/description containing q
    stmt = stmt.where(
        Recording.title.ilike(f"%{q}%") |
        Recording.description.ilike(f"%{q}%") |
        Recording.cultural_context.ilike(f"%{q}%")
    )
    stmt = stmt.order_by(Recording.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    recordings = result.scalars().all()

    return {
        "query": q,
        "results": [RecordingResponse.model_validate(r) for r in recordings],
        "count": len(recordings),
    }


@router.post("/semantic", response_model=list[SearchResult])
async def semantic_search(
    payload: SemanticSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Semantic vector search using pgvector cosine similarity.
    Requires embeddings to have been generated for recordings.
    """
    from app.ai.registry import get_provider

    provider = get_provider()
    embed_result = await provider.embed(payload.query)
    query_vector = embed_result.vector

    # pgvector cosine similarity query
    # Only return recordings the user has permission to see
    raw_sql = text("""
        SELECT
            r.id AS recording_id,
            1 - (e.vector <=> CAST(:query_vec AS vector)) AS score,
            t.full_text AS matched_text
        FROM embeddings e
        JOIN recordings r ON r.id = e.recording_id
        LEFT JOIN transcripts t ON t.id = e.transcript_id
        WHERE
            (r.privacy = 'public' OR r.user_id = :user_id)
            AND r.status = 'completed'
        ORDER BY e.vector <=> CAST(:query_vec AS vector)
        LIMIT :limit
    """)

    vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"
    rows = (await db.execute(
        raw_sql,
        {"query_vec": vector_str, "user_id": str(current_user.id), "limit": payload.limit}
    )).fetchall()

    results = []
    for row in rows:
        rec_result = await db.execute(select(Recording).where(Recording.id == row.recording_id))
        recording = rec_result.scalar_one_or_none()
        if recording:
            results.append(SearchResult(
                recording=RecordingResponse.model_validate(recording),
                relevance_score=round(float(row.score), 4),
                matched_text=row.matched_text[:300] if row.matched_text else None,
            ))
    return results
