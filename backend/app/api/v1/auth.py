"""Auth API endpoints — register, login, refresh, logout."""
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token, create_refresh_token, decode_token
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenRefresh
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = structlog.get_logger(__name__)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new Voice Roots user."""
    # Check uniqueness
    existing = await db.execute(
        select(User).where((User.email == payload.email) | (User.username == payload.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already registered",
        )

    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("auth.registered", user_id=str(user.id), email=user.email)
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate a user and return JWT tokens."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account deactivated")

    logger.info("auth.login", user_id=str(user.id))
    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(payload: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """Issue a new access token from a valid refresh token."""
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
    )
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise credentials_exc
        user_id = data.get("sub")
    except JWTError:
        raise credentials_exc

    import uuid
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise credentials_exc

    return Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    """
    Logout endpoint — client should discard tokens.
    (Token blacklisting via Redis can be added in production.)
    """
    return
