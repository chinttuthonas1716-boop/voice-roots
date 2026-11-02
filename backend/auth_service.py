"""Voice Roots — User Authentication, Session Management, and Role-Based Access Control.

Provides secure SQLite-backed user registration, password hashing (bcrypt),
JWT session token management, and multi-tier role authorization (Admin,
Researcher, Reviewer/Elder, and Contributor/Speaker).
"""

from __future__ import annotations

import datetime
import hashlib
import logging
import os
import sqlite3
import uuid
from typing import Any

logger = logging.getLogger(__name__)

# Configurable JWT settings
JWT_SECRET_KEY = os.environ.get(
    "VOICE_ROOTS_JWT_SECRET",
    "voice-roots-secure-enterprise-jwt-signing-secret-key-2026-production",
)
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("VOICE_ROOTS_JWT_EXPIRATION_HOURS", "24"))

# Valid user roles in the Voice Roots ecosystem
VALID_ROLES = {"admin", "researcher", "reviewer", "contributor"}

# Normalized role mappings
ROLE_ALIASES = {
    "elder": "reviewer",
    "moderator": "reviewer",
    "village_elder": "reviewer",
    "speaker": "contributor",
    "field_worker": "contributor",
}


def normalize_role(role: str) -> str:
    """Normalize input role string to one of the canonical role identifiers."""
    cleaned = (role or "").strip().lower()
    cleaned = ROLE_ALIASES.get(cleaned, cleaned)
    if cleaned not in VALID_ROLES:
        return "contributor"
    return cleaned


def hash_password(plain_password: str) -> str:
    """Hash a password using bcrypt with fallback to PBKDF2-SHA256."""
    try:
        import bcrypt
        hashed = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt(12))
        return hashed.decode("utf-8")
    except Exception as e:
        logger.warning(f"bcrypt hashing failed or unavailable ({e}), falling back to PBKDF2: {e}")
        salt = os.urandom(16)
        key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100_000)
        return f"pbkdf2_sha256${salt.hex()}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a stored hash."""
    if not hashed_password or not plain_password:
        return False
    try:
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            import bcrypt
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        elif hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            if len(parts) == 3:
                salt = bytes.fromhex(parts[1])
                expected_key = parts[2]
                computed_key = hashlib.pbkdf2_hmac(
                    "sha256", plain_password.encode("utf-8"), salt, 100_000
                ).hex()
                return computed_key == expected_key
        # Fallback check
        import bcrypt
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception as exc:
        logger.warning(f"Password verification error: {exc}")
        return False


def create_access_token(
    user_id: str,
    username: str,
    email: str,
    role: str,
    full_name: str = "",
    expires_delta: datetime.timedelta | None = None,
) -> str:
    """Create a signed JWT session access token."""
    import jwt

    delta = expires_delta or datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    now = datetime.datetime.now(datetime.timezone.utc)
    expire = now + delta

    payload = {
        "sub": str(user_id),
        "username": username,
        "email": email,
        "role": normalize_role(role),
        "full_name": full_name,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "iss": "voiceroots.ai",
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT access token, returning claims dict or None."""
    if not token:
        return None
    try:
        import jwt
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM], issuer="voiceroots.ai")
        return payload
    except Exception as exc:
        logger.debug(f"JWT decode error: {exc}")
        return None


def init_auth_tables(conn: sqlite3.Connection) -> None:
    """Initialize SQLite tables for user accounts and active sessions."""
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'contributor',
            is_active INTEGER NOT NULL DEFAULT 1,
            is_verified INTEGER NOT NULL DEFAULT 0,
            avatar_url TEXT,
            bio TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token_hash TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)")


def seed_default_accounts(conn: sqlite3.Connection) -> None:
    """Seed foundational demo/evaluation accounts if the users table is empty."""
    cursor = conn.cursor()
    count = cursor.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    if count > 0:
        return

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    default_accounts = [
        {
            "id": "usr_admin_001",
            "username": "admin",
            "email": "admin@voiceroots.ai",
            "password": "VoiceRootsAdmin2026!",
            "full_name": "System Administrator",
            "role": "admin",
            "is_verified": 1,
            "bio": "Voice Roots System Administrator & Platform Overseer",
        },
        {
            "id": "usr_researcher_001",
            "username": "researcher",
            "email": "researcher@ciil.res.in",
            "password": "ResearchScholar2026!",
            "full_name": "Dr. CIIL Research Scholar",
            "role": "researcher",
            "is_verified": 1,
            "bio": "Central Institute of Indian Languages Research Collaborator",
        },
        {
            "id": "usr_reviewer_001",
            "username": "elder_reviewer",
            "email": "elder.reviewer@gondi.org",
            "password": "ElderReviewer2026!",
            "full_name": "Elder Somu Meshram",
            "role": "reviewer",
            "is_verified": 1,
            "bio": "Accredited Gondi Tribal Council Elder & Community Reviewer",
        },
        {
            "id": "usr_worker_001",
            "username": "field_worker",
            "email": "field.worker@voiceroots.org",
            "password": "preservation2026",
            "full_name": "Field Preservation Specialist",
            "role": "contributor",
            "is_verified": 1,
            "bio": "Community Audio Documentation & Ingestion Field Worker",
        },
    ]

    for acc in default_accounts:
        hashed = hash_password(acc["password"])
        cursor.execute(
            """
            INSERT OR IGNORE INTO users 
            (id, username, email, hashed_password, full_name, role, is_active, is_verified, bio, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
            """,
            (
                acc["id"],
                acc["username"],
                acc["email"],
                hashed,
                acc["full_name"],
                acc["role"],
                acc["is_verified"],
                acc["bio"],
                now,
                now,
            ),
        )
    conn.commit()
    logger.info("auth.default_accounts_seeded", count=len(default_accounts))


def register_user(
    db_path: str,
    username: str,
    email: str,
    password: str,
    full_name: str,
    role: str = "contributor",
    bio: str | None = None,
) -> dict[str, Any]:
    """Register a new user account with duplicate checks and password hashing."""
    username = username.strip().lower()
    email = email.strip().lower()
    full_name = full_name.strip()
    role = normalize_role(role)

    if not username or len(username) < 3:
        raise ValueError("Username must be at least 3 characters long.")
    if not email or "@" not in email:
        raise ValueError("Valid email address is required.")
    if not password or len(password) < 6:
        raise ValueError("Password must be at least 6 characters long.")
    if not full_name:
        raise ValueError("Full name is required.")

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    hashed = hash_password(password)

    with sqlite3.connect(db_path, timeout=10.0) as conn:
        cursor = conn.cursor()
        # Check uniqueness
        existing = cursor.execute(
            "SELECT id, username, email FROM users WHERE username = ? OR email = ?",
            (username, email),
        ).fetchone()
        if existing:
            if existing[1] == username:
                raise ValueError("Username already taken.")
            raise ValueError("Email address already registered.")

        cursor.execute(
            """
            INSERT INTO users (id, username, email, hashed_password, full_name, role, is_active, is_verified, bio, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?)
            """,
            (user_id, username, email, hashed, full_name, role, bio, now, now),
        )
        conn.commit()

    token = create_access_token(user_id, username, email, role, full_name)
    return {
        "id": user_id,
        "username": username,
        "email": email,
        "full_name": full_name,
        "role": role,
        "is_active": True,
        "is_verified": False,
        "access_token": token,
        "token_type": "bearer",
        "created_at": now,
    }


def authenticate_user(
    db_path: str,
    identifier: str,
    password: str,
) -> dict[str, Any] | None:
    """Authenticate user by username or email. Returns user dict with access token or None."""
    identifier = identifier.strip().lower()
    with sqlite3.connect(db_path, timeout=10.0) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        row = cursor.execute(
            """
            SELECT id, username, email, hashed_password, full_name, role, is_active, is_verified, avatar_url, bio, created_at
            FROM users WHERE username = ? OR email = ?
            """,
            (identifier, identifier),
        ).fetchone()

        if not row:
            return None

        user = dict(row)
        if not user.get("is_active"):
            raise ValueError("User account is deactivated.")

        if not verify_password(password, user["hashed_password"]):
            return None

        # Generate fresh JWT session token
        token = create_access_token(
            user["id"],
            user["username"],
            user["email"],
            user["role"],
            user["full_name"],
        )

        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "is_active": bool(user["is_active"]),
            "is_verified": bool(user["is_verified"]),
            "avatar_url": user.get("avatar_url"),
            "bio": user.get("bio"),
            "access_token": token,
            "token_type": "bearer",
            "created_at": user["created_at"],
        }


def get_user_by_id(db_path: str, user_id: str) -> dict[str, Any] | None:
    """Fetch user profile metadata by user ID."""
    with sqlite3.connect(db_path, timeout=10.0) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        row = cursor.execute(
            """
            SELECT id, username, email, full_name, role, is_active, is_verified, avatar_url, bio, created_at, updated_at
            FROM users WHERE id = ?
            """,
            (user_id,),
        ).fetchone()
        return dict(row) if row else None


def list_users(db_path: str) -> list[dict[str, Any]]:
    """List all registered users without exposing password hashes."""
    with sqlite3.connect(db_path, timeout=10.0) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        rows = cursor.execute(
            """
            SELECT id, username, email, full_name, role, is_active, is_verified, created_at
            FROM users ORDER BY created_at DESC
            """
        ).fetchall()
        return [dict(r) for r in rows]
