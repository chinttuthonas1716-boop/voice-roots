"""Pydantic schemas for User endpoints."""
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    full_name: str = Field(..., min_length=1, max_length=200)
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=200)
    bio: str | None = Field(None, max_length=1000)
    location: str | None = Field(None, max_length=200)
    avatar_url: str | None = None


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    email: EmailStr
    username: str
    full_name: str
    role: UserRole
    is_active: bool
    is_verified: bool
    avatar_url: str | None
    bio: str | None
    location: str | None
    created_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefresh(BaseModel):
    refresh_token: str


class TokenData(BaseModel):
    user_id: str | None = None
