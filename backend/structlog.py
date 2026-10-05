"""Shim for structlog using standard logging fallback."""
from app.logger import get_logger

__all__ = ["get_logger"]
