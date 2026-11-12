"""API v1 router — registers all sub-routers."""
from app.api.v1 import analytics, auth, languages, recordings, search, uploads
from fastapi import APIRouter

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(recordings.router)
api_router.include_router(uploads.router)
api_router.include_router(languages.router)
api_router.include_router(search.router)
api_router.include_router(analytics.router)
