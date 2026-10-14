FROM python:3.11-slim

# Install system dependencies including FFmpeg and libsndfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend application code and seeded datasets
COPY backend/ backend/
COPY data/ data/

# Create persistent storage directories
RUN mkdir -p /data/storage/audio /data/chroma_db /data/backups

# Configure environment defaults
ENV VOICE_ROOTS_ENV=production \
    VOICE_ROOTS_DB_PATH=/data/voice_roots.db \
    VOICE_ROOTS_STORAGE_DIR=/data/storage \
    VOICE_ROOTS_BACKUP_DIR=/data/backups \
    VOICE_ROOTS_CHROMA_DIR=/data/chroma_db \
    VOICE_ROOTS_TRANSCRIPTION_PROVIDER=whisper-local \
    VOICE_ROOTS_WHISPER_MODEL_SIZE=base \
    PYTHONPATH=/app/backend

EXPOSE 8000

# Health check using the readiness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/ready || exit 1

CMD ["python", "-m", "uvicorn", "main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000"]

