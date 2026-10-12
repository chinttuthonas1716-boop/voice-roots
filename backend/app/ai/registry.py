"""AI model registry — maps config values to provider implementations."""
import structlog
from app.ai.base import AIProvider, ProviderUnavailableError
from app.config import settings

logger = structlog.get_logger(__name__)

_registry: dict[str, type[AIProvider]] = {}
_instance: AIProvider | None = None


def register_provider(name: str, cls: type[AIProvider]) -> None:
    """Register a provider class under a name."""
    _registry[name] = cls


def get_provider() -> AIProvider:
    """Return the singleton provider instance configured via AI_PROVIDER env var."""
    global _instance
    if _instance is not None:
        return _instance

    provider_name = settings.ai_provider
    if provider_name == "disabled":
        raise ProviderUnavailableError(
            "Speech processing is disabled. Configure a real AI provider before requesting a transcript."
        )

    cls = _registry.get(provider_name)
    if cls is None:
        raise ProviderUnavailableError(
            f"AI provider '{provider_name}' is not registered; no transcript was generated."
        )

    _instance = cls()
    logger.info("ai.provider_initialized", provider=_instance.name)
    return _instance


# Register built-in providers
from app.ai.mock_provider import MockAIProvider  # noqa: E402
from app.ai.whisper_provider import WhisperProvider  # noqa: E402

register_provider("mock", MockAIProvider)
register_provider("whisper", WhisperProvider)
