"""Shim for structlog using standard logging fallback."""
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

class StdLoggerWrapper:
    def __init__(self, logger):
        self._logger = logger

    def bind(self, **kwargs):
        return self

    def info(self, msg, **kwargs):
        extra = " ".join(f"{k}={v}" for k, v in kwargs.items())
        self._logger.info(f"{msg} {extra}".strip())

    def warning(self, msg, **kwargs):
        extra = " ".join(f"{k}={v}" for k, v in kwargs.items())
        self._logger.warning(f"{msg} {extra}".strip())

    def error(self, msg, **kwargs):
        extra = " ".join(f"{k}={v}" for k, v in kwargs.items())
        self._logger.error(f"{msg} {extra}".strip())

    def debug(self, msg, **kwargs):
        extra = " ".join(f"{k}={v}" for k, v in kwargs.items())
        self._logger.debug(f"{msg} {extra}".strip())

def get_logger(name=None):
    return StdLoggerWrapper(logging.getLogger(name or "voice_roots"))

__all__ = ["get_logger"]
