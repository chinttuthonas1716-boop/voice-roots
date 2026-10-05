"""API v1 router — registers all sub-routers."""
from fastapi import APIRouter
from app.api.v1 import auth, recordings, uploads, languages, search, analytics

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(recordings.router)
api_router.include_router(uploads.router)
api_router.include_router(languages.router)
api_router.include_router(search.router)
api_router.include_router(analytics.router)
