"""FastAPI auth dependencies."""
import uuid
import structlog
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.auth.jwt import decode_token
from app.auth.rbac import has_permission
from app.database.session import get_db
from app.models.user import User, UserRole

logger = structlog.get_logger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Decode JWT and return the current user. Raises 401 on failure."""
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type", "access")
        if not user_id or token_type != "access":
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exc
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Return current user, ensuring account is active."""
    return current_user


def require_roles(*roles: UserRole):
    """Dependency factory: require the user to have one of the given roles."""
    async def _check(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles and user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of: {[r.value for r in roles]}",
            )
        return user
    return _check


def require_permission(permission: str):
    """Dependency factory: require a specific permission string."""
    async def _check(user: User = Depends(get_current_user)) -> User:
        if not has_permission(user.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission}",
            )
        return user
    return _check
