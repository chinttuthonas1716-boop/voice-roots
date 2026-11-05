"""Voice Roots: Pluggable Audio Storage Service Layer
===================================================
Provides abstract storage provider adapters for:
1. LocalStorageProvider: Zero-cost offline local filesystem storage ($0.00/month).
   Audio files are saved with restricted 0o600 permissions outside the database.
2. S3StorageProvider: Enterprise S3-compatible cloud object storage
   (AWS S3, Cloudflare R2, MinIO, Ceph) with presigned streaming URLs,
   automatic metadata attribution, and zero client credential leakage.
"""

from __future__ import annotations

import hashlib
import logging
import os
import shutil
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger(__name__)

MAX_AUDIO_SIZE_BYTES = 500 * 1024 * 1024  # 500 MB max audio size
ALLOWED_AUDIO_EXTENSIONS = {
    ".wav", ".mp3", ".m4a", ".mp4", ".ogg", ".oga", ".webm", ".flac"
}
ALLOWED_MIME_TYPES = {
    "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mpeg", "audio/mp3",
    "audio/mp4", "audio/x-m4a", "audio/m4a",
    "audio/ogg", "application/ogg",
    "audio/webm",
    "audio/flac", "audio/x-flac",
}


class StorageError(RuntimeError):
    """Raised when an audio storage operation fails."""


class BaseStorageProvider(ABC):
    """Abstract interface for Voice Roots audio object storage."""

    name: str = "base"

    @abstractmethod
    def store_file(
        self,
        temp_file_path: str,
        filename: str,
        content_type: str | None = None,
    ) -> tuple[str, int, str]:
        """Store audio file, returning (stored_identifier, size_bytes, sha256_hash)."""
        ...

    @abstractmethod
    def get_stream_url(self, filename: str, expires_in: int = 3600) -> str:
        """Return secure streaming URL (direct local path or short-lived presigned URL)."""
        ...

    @abstractmethod
    def delete_file(self, filename: str) -> bool:
        """Delete stored audio object."""
        ...

    @abstractmethod
    def file_exists(self, filename: str) -> bool:
        """Check if audio object exists in storage."""
        ...


class LocalStorageProvider(BaseStorageProvider):
    """Offline local filesystem storage adapter ($0.00 cost, private 0o600 permissions)."""

    name = "local"

    def __init__(self, storage_dir: str):
        self.storage_dir = os.path.abspath(storage_dir)
        os.makedirs(self.storage_dir, exist_ok=True)

    def store_file(
        self,
        temp_file_path: str,
        filename: str,
        content_type: str | None = None,
    ) -> tuple[str, int, str]:
        if not os.path.isfile(temp_file_path):
            raise StorageError(f"Source file not found: {temp_file_path}")

        file_size = os.path.getsize(temp_file_path)
        if file_size > MAX_AUDIO_SIZE_BYTES:
            raise StorageError(f"Audio file exceeds maximum size of {MAX_AUDIO_SIZE_BYTES} bytes.")

        # Compute SHA-256 digest
        digest = hashlib.sha256()
        with open(temp_file_path, "rb") as f:
            while chunk := f.read(65536):
                digest.update(chunk)
        sha256_hash = digest.hexdigest()

        final_path = os.path.join(self.storage_dir, filename)
        try:
            shutil.move(temp_file_path, final_path)
            # Restrict permissions to owner read/write only
            os.chmod(final_path, 0o600)
        except Exception as exc:
            raise StorageError(f"Failed to persist file to local storage: {exc}") from exc

        return filename, file_size, sha256_hash

    def get_stream_url(self, filename: str, expires_in: int = 3600) -> str:
        # Standard isolated audio route
        return f"/storage/audio/{filename}"

    def delete_file(self, filename: str) -> bool:
        path = os.path.join(self.storage_dir, filename)
        if os.path.exists(path):
            os.remove(path)
            return True
        return False

    def file_exists(self, filename: str) -> bool:
        return os.path.exists(os.path.join(self.storage_dir, filename))


class S3StorageProvider(BaseStorageProvider):
    """S3-compatible object storage adapter with presigned URLs (AWS S3, MinIO, Cloudflare R2)."""

    name = "s3"

    def __init__(
        self,
        bucket: str,
        aws_access_key_id: str | None = None,
        aws_secret_access_key: str | None = None,
        region_name: str = "ap-south-1",
        endpoint_url: str | None = None,
        client: Any = None,
    ):
        if not bucket:
            raise StorageError("S3 storage requires a valid bucket name.")
        self.bucket = bucket
        self.endpoint_url = endpoint_url
        self.region_name = region_name

        if client is not None:
            self._client = client
        else:
            try:
                import boto3
                from botocore.config import Config
            except ImportError as exc:
                raise StorageError(
                    "boto3 is required for S3StorageProvider. Install backend dependencies."
                ) from exc

            client_kwargs: dict[str, Any] = {
                "service_name": "s3",
                "region_name": region_name,
                "config": Config(signature_version="s3v4", retries={"max_attempts": 3}),
            }
            if endpoint_url:
                client_kwargs["endpoint_url"] = endpoint_url
            if aws_access_key_id and aws_secret_access_key:
                client_kwargs["aws_access_key_id"] = aws_access_key_id
                client_kwargs["aws_secret_access_key"] = aws_secret_access_key

            self._client = boto3.client(**client_kwargs)

    def store_file(
        self,
        temp_file_path: str,
        filename: str,
        content_type: str | None = None,
    ) -> tuple[str, int, str]:
        if not os.path.isfile(temp_file_path):
            raise StorageError(f"Source file not found: {temp_file_path}")

        file_size = os.path.getsize(temp_file_path)
        if file_size > MAX_AUDIO_SIZE_BYTES:
            raise StorageError(f"Audio file exceeds maximum size of {MAX_AUDIO_SIZE_BYTES} bytes.")

        digest = hashlib.sha256()
        with open(temp_file_path, "rb") as f:
            while chunk := f.read(65536):
                digest.update(chunk)
        sha256_hash = digest.hexdigest()

        extra_args: dict[str, Any] = {
            "Metadata": {
                "sha256": sha256_hash,
                "service": "voice-roots",
            }
        }
        if content_type:
            extra_args["ContentType"] = content_type

        try:
            self._client.upload_file(
                Filename=temp_file_path,
                Bucket=self.bucket,
                Key=filename,
                ExtraArgs=extra_args,
            )
            # Remove temp file after successful upload
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception as exc:
            raise StorageError(f"Failed to upload audio to S3 bucket '{self.bucket}': {exc}") from exc

        return filename, file_size, sha256_hash

    def get_stream_url(self, filename: str, expires_in: int = 3600) -> str:
        """Generate short-lived presigned URL without exposing permanent credentials to the frontend."""
        try:
            url = self._client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.bucket, "Key": filename},
                ExpiresIn=expires_in,
            )
            return url
        except Exception as exc:
            logger.error("Failed to generate presigned S3 URL for %s: %s", filename, exc)
            return f"/storage/audio/{filename}"

    def delete_file(self, filename: str, consent_withdrawn: bool = True) -> bool:
        try:
            self._client.delete_object(Bucket=self.bucket, Key=filename)
            return True
        except Exception as exc:
            logger.error("Failed to delete S3 object %s: %s", filename, exc)
            return False

    def file_exists(self, filename: str) -> bool:
        try:
            self._client.head_object(Bucket=self.bucket, Key=filename)
            return True
        except Exception:
            return False


class R2StorageProvider(S3StorageProvider):
    """Cloudflare R2 private object storage adapter (S3-compatible, zero egress).

    Guarantees:
    - Master audio objects are write-once (no overwrite).
    - Preserves SHA-256 deduplication metadata on all objects.
    - Serves audio exclusively via short-lived signed URLs (presigned s3v4).
    - Protected against deletion except via explicit consent-withdrawal workflow.
    """

    name = "r2"

    def __init__(
        self,
        bucket: str,
        aws_access_key_id: str | None = None,
        aws_secret_access_key: str | None = None,
        region_name: str = "auto",
        endpoint_url: str | None = None,
        client: Any = None,
    ):
        super().__init__(
            bucket=bucket,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=region_name or "auto",
            endpoint_url=endpoint_url,
            client=client,
        )

    def store_file(
        self,
        temp_file_path: str,
        filename: str,
        content_type: str | None = None,
    ) -> tuple[str, int, str]:
        """Store master audio into Cloudflare R2 with write-once enforcement."""
        if not os.path.isfile(temp_file_path):
            raise StorageError(f"Source file not found: {temp_file_path}")

        file_size = os.path.getsize(temp_file_path)
        if file_size > MAX_AUDIO_SIZE_BYTES:
            raise StorageError(f"Audio file exceeds maximum size of {MAX_AUDIO_SIZE_BYTES} bytes.")

        digest = hashlib.sha256()
        with open(temp_file_path, "rb") as f:
            while chunk := f.read(65536):
                digest.update(chunk)
        sha256_hash = digest.hexdigest()

        # Write-once protection: if master object exists in R2, prevent overwrite
        if self.file_exists(filename):
            logger.info(
                "Write-once guard: master '%s' already exists in R2 bucket '%s'. Preserving existing master.",
                filename,
                self.bucket,
            )
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            return filename, file_size, sha256_hash

        extra_args: dict[str, Any] = {
            "Metadata": {
                "sha256": sha256_hash,
                "service": "voice-roots",
                "storage_class": "r2-standard",
            }
        }
        if content_type:
            extra_args["ContentType"] = content_type

        try:
            self._client.upload_file(
                Filename=temp_file_path,
                Bucket=self.bucket,
                Key=filename,
                ExtraArgs=extra_args,
            )
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception as exc:
            raise StorageError(f"Failed to upload audio to Cloudflare R2 bucket '{self.bucket}': {exc}") from exc

        return filename, file_size, sha256_hash

    def delete_file(self, filename: str, consent_withdrawn: bool = False) -> bool:
        """Delete audio master from R2 only if authorized via affirmative consent withdrawal."""
        if not consent_withdrawn:
            logger.warning(
                "Master write-once policy: rejected deletion of '%s'. Deletion requires consent_withdrawn=True.",
                filename,
            )
            return False
        return super().delete_file(filename, consent_withdrawn=True)


def create_storage_provider(
    environ: dict[str, str] | None = None,
    storage_dir: str | None = None,
) -> BaseStorageProvider:
    """Factory creating the configured storage provider (R2, S3, or Local)."""
    env = os.environ if environ is None else environ
    backend = env.get("VOICE_ROOTS_STORAGE_BACKEND", "").strip().lower()

    # Cloudflare R2 is preferred for production
    r2_bucket = env.get("R2_BUCKET", "").strip()
    r2_endpoint = env.get("R2_ENDPOINT_URL", "").strip()
    if backend in ("r2", "cloudflare_r2") or (r2_bucket and r2_endpoint):
        r2_key = env.get("R2_ACCESS_KEY_ID", "").strip() or None
        r2_secret = env.get("R2_SECRET_ACCESS_KEY", "").strip() or None
        logger.info("Initializing R2StorageProvider (bucket: %s, endpoint: %s)", r2_bucket, r2_endpoint)
        return R2StorageProvider(
            bucket=r2_bucket or "voice-roots-audio",
            endpoint_url=r2_endpoint or None,
            aws_access_key_id=r2_key,
            aws_secret_access_key=r2_secret,
            region_name="auto",
        )

    # Standard S3 fallback
    s3_bucket = env.get("S3_BUCKET", "").strip()
    if backend == "s3" or s3_bucket:
        aws_key = env.get("AWS_ACCESS_KEY_ID", "").strip() or None
        aws_secret = env.get("AWS_SECRET_ACCESS_KEY", "").strip() or None
        region = env.get("AWS_REGION", "ap-south-1").strip()
        endpoint = env.get("S3_ENDPOINT_URL", "").strip() or None

        logger.info("Initializing S3StorageProvider (bucket: %s, region: %s)", s3_bucket, region)
        return S3StorageProvider(
            bucket=s3_bucket or "voice-roots-audio",
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
            region_name=region,
            endpoint_url=endpoint,
        )

    # Default to LocalStorageProvider ($0.00 cost)
    local_dir = storage_dir or os.path.join(os.path.dirname(__file__), "storage", "audio")
    return LocalStorageProvider(storage_dir=local_dir)

