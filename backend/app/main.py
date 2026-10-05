"""Main FastAPI application entry point for Voice Roots."""
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.api.v1 import api_router

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler: handles startup and shutdown logic."""
    logger.info("app.startup", app_name=settings.app_name, env=settings.app_env)
    
    # Ensure storage directories exist
    os.makedirs(settings.local_storage_path, exist_ok=True)
    os.makedirs(os.path.join(settings.local_storage_path, "audio"), exist_ok=True)
    os.makedirs(os.path.join(settings.local_storage_path, "video"), exist_ok=True)
    
    # Try creating tables in development mode if DB is ready
    try:
        from app.database.session import create_tables
        await create_tables()
        logger.info("database.initialized")
    except Exception as e:
        logger.warning("database.initialization_skipped_or_failed", error=str(e))
        
    yield
    
    logger.info("app.shutdown")


app = FastAPI(
    title=settings.app_name,
    description="Voice Roots: Rooting Oral Languages in Text with AI — Core Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins if settings.allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for local audio/video storage (if local backend enabled)
if os.path.exists(settings.local_storage_path):
    app.mount("/static/storage", StaticFiles(directory=settings.local_storage_path), name="storage")

# Include API v1 router
app.include_router(api_router)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint verifying API availability."""
    return {
        "name": settings.app_name,
        "tagline": "Rooting Oral Languages in Text with AI",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "provider": settings.ai_provider,
        "storage": settings.storage_backend,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
