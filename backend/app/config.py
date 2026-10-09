"""Voice Roots application configuration."""
from functools import lru_cache
from typing import Literal
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "Voice Roots"
    app_env: Literal["development", "staging", "production"] = "development"
    debug: bool = True

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v):
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "debug", "development")
        return bool(v)
    secret_key: str = "change-me-in-production"
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/voice_roots"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/voice_roots"
    db_pool_size: int = 10
    db_max_overflow: int = 20

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "change-me-jwt-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    # Storage
    storage_backend: Literal["local", "s3"] = "local"
    local_storage_path: str = "./storage"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "ap-south-1"
    s3_bucket: str = "voice-roots-audio"

    # AI
    ai_provider: Literal["mock", "whisper", "huggingface"] = "mock"
    whisper_model_size: str = "base"
    asr_model: str = "openai/whisper-base"
    lid_model: str = "papluca/xlm-roberta-base-language-detection"
    translation_model: str = "ai4bharat/indictrans2-indic-en-dist-200M"
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    embedding_dim: int = 384

    # OpenAI (optional fallback for RAG)
    openai_api_key: str = ""

    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Upload limits
    max_audio_size_mb: int = 500
    max_video_size_mb: int = 2000
    allowed_audio_types: list[str] = [
        "audio/mpeg", "audio/wav", "audio/ogg",
        "audio/mp4", "audio/webm", "audio/flac",
    ]
    allowed_video_types: list[str] = [
        "video/mp4", "video/webm", "video/ogg",
    ]


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


settings = get_settings()
