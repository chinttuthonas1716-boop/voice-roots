"""
Audio processing pipeline — orchestrates the full AI workflow for a recording.

Pipeline steps:
  1. Audio preprocessing & validation
  2. Audio language identification
  3. Speech-to-text transcription
  4. Speaker diarization
  5. Translation (if requested)
  6. Summarization & keyword extraction
  7. Semantic embedding generation
"""
import asyncio
import structlog
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.registry import get_provider
from app.models.recording import Recording, RecordingStatus
from app.models.transcript import Transcript, TranscriptSegment, TranscriptType
from app.models.translation import Translation
from app.models.embedding import Embedding
from app.models.ai_job import AIProcessingJob, JobType, JobStatus
from app.models.speaker import Speaker

logger = structlog.get_logger(__name__)


async def _update_job(
    db: AsyncSession,
    job: AIProcessingJob,
    status: JobStatus,
    progress: int = 0,
    result: dict | None = None,
    error: str | None = None,
) -> None:
    job.status = status
    job.progress_percent = progress
    if result:
        job.result_data = result
    if error:
        job.error_message = error
    if status == JobStatus.processing and not job.started_at:
        job.started_at = datetime.now(timezone.utc)
    if status in (JobStatus.completed, JobStatus.failed):
        job.completed_at = datetime.now(timezone.utc)
    db.add(job)
    await db.commit()


async def run_full_pipeline(
    recording: Recording,
    db: AsyncSession,
    translate_to: list[str] | None = None,
) -> dict:
    """
    Run the full AI processing pipeline for a recording.

    Returns a summary dict of what was produced.
    """
    provider = get_provider()
    log = logger.bind(recording_id=str(recording.id))
    results: dict = {}

    # Create master job
    job = AIProcessingJob(
        recording_id=recording.id,
        job_type=JobType.full_pipeline,
        status=JobStatus.processing,
        started_at=datetime.now(timezone.utc),
    )
    db.add(job)
    recording.status = RecordingStatus.processing
    db.add(recording)
    await db.commit()
    await db.refresh(job)

    try:
        audio_path = recording.file_path
        if not audio_path:
            raise ValueError("Recording has no audio file path")

        # ── Step 1: Language detection ─────────────────────────────────────────
        log.info("pipeline.language_detection")
        await _update_job(db, job, JobStatus.processing, 10)
        lid_result = await provider.detect_audio_language(audio_path)
        recording.detected_language_code = lid_result.language_code
        recording.detected_language_confidence = lid_result.confidence
        results["language"] = {
            "code": lid_result.language_code,
            "name": lid_result.language_name,
            "confidence": lid_result.confidence,
        }

        # ── Step 2: Transcription ──────────────────────────────────────────────
        log.info("pipeline.transcription")
        await _update_job(db, job, JobStatus.processing, 30)
        asr_result = await provider.transcribe(audio_path, lid_result.language_code)

        transcript = Transcript(
            recording_id=recording.id,
            content_type=TranscriptType.original_ai,
            full_text=asr_result.text,
            word_count=asr_result.word_count,
            ai_confidence=asr_result.confidence,
            model_used=asr_result.model_used,
            version=1,
        )
        db.add(transcript)
        recording.word_count = asr_result.word_count
        await db.commit()
        await db.refresh(transcript)

        # ── Step 3: Speaker diarization ───────────────────────────────────────
        log.info("pipeline.speaker_diarization")
        await _update_job(db, job, JobStatus.processing, 50)
        speaker_segments = await provider.segment_speakers(
            audio_path, recording.speaker_count or None
        )

        for i, seg in enumerate(speaker_segments):
            # Ensure speaker row exists
            ts_seg = TranscriptSegment(
                transcript_id=transcript.id,
                speaker_label=seg.speaker_label,
                start_time=seg.start_time,
                end_time=seg.end_time,
                text=seg.text,
                confidence=seg.confidence,
                segment_index=i,
            )
            db.add(ts_seg)

        recording.speaker_count = len(set(s.speaker_label for s in speaker_segments))
        results["transcript"] = {
            "id": str(transcript.id),
            "word_count": transcript.word_count,
            "confidence": transcript.ai_confidence,
            "segment_count": len(speaker_segments),
        }

        # ── Step 4: Summarization ─────────────────────────────────────────────
        log.info("pipeline.summarization")
        await _update_job(db, job, JobStatus.processing, 65)
        summary = await provider.summarize(asr_result.text, lid_result.language_code)
        results["summary"] = {
            "text": summary.summary,
            "topics": summary.key_topics,
            "keywords": summary.keywords,
        }

        # ── Step 5: Translation ───────────────────────────────────────────────
        target_langs = translate_to or ["en"]
        for lang_code in target_langs:
            if lang_code == lid_result.language_code:
                continue
            log.info("pipeline.translation", target=lang_code)
            await _update_job(db, job, JobStatus.processing, 75)
            trans_result = await provider.translate(
                asr_result.text, lid_result.language_code, lang_code
            )
            translation = Translation(
                recording_id=recording.id,
                transcript_id=transcript.id,
                source_language_code=lid_result.language_code,
                target_language=lang_code,
                target_language_code=lang_code,
                text=trans_result.translated_text,
                model_used=trans_result.model_used,
            )
            db.add(translation)
        results["translations"] = target_langs

        # ── Step 6: Semantic embedding ────────────────────────────────────────
        log.info("pipeline.embedding")
        await _update_job(db, job, JobStatus.processing, 90)
        embed_result = await provider.embed(asr_result.text)
        embedding = Embedding(
            recording_id=recording.id,
            transcript_id=transcript.id,
            model_used=embed_result.model_used,
            embedding_dim=embed_result.dim,
            vector=embed_result.vector,
        )
        db.add(embedding)
        results["embedding"] = {"dim": embed_result.dim, "model": embed_result.model_used}

        # ── Finalize ──────────────────────────────────────────────────────────
        recording.status = RecordingStatus.completed
        db.add(recording)
        await _update_job(db, job, JobStatus.completed, 100, result=results)
        log.info("pipeline.completed")

    except Exception as exc:
        log.error("pipeline.failed", error=str(exc))
        recording.status = RecordingStatus.failed
        db.add(recording)
        await _update_job(db, job, JobStatus.failed, error=str(exc))
        raise

    return results
