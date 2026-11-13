"""Voice Roots Security & Access Control Service.

Implements Task T3.5:
- Access-tier enforcement (OCAP boundaries: public, community, research, private, withdrawn).
- Cryptographic signed URLs with timestamp expiration and constant-time HMAC validation.
- Role-based access control (RBAC) verification.
- Security headers and origin enforcement.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import time
from typing import Any

SECURITY_SECRET_KEY = os.environ.get(
    "VOICE_ROOTS_SECRET_KEY",
    os.environ.get("SECRET_KEY", "voice-roots-production-signing-secret-2026"),
).encode("utf-8")


def generate_signed_audio_url(
    filename: str,
    expires_in: int = 3600,
    secret_key: bytes | None = None,
    base_path: str = "/storage/audio",
) -> str:
    """Generate an HMAC-SHA256 signed streaming URL with an expiration timestamp."""
    key = secret_key or SECURITY_SECRET_KEY
    expires_at = int(time.time() + expires_in)
    message = f"{filename}:{expires_at}".encode()
    signature = hmac.new(key, message, hashlib.sha256).hexdigest()
    return f"{base_path}/{filename}?expires={expires_at}&sig={signature}"


def verify_signed_audio_token(
    filename: str,
    expires: int | str,
    sig: str,
    secret_key: bytes | None = None,
    current_time: float | None = None,
) -> tuple[bool, str]:
    """Verify an HMAC-SHA256 signed URL token, ensuring valid signature and non-expired timestamp."""
    try:
        exp_int = int(expires)
    except (ValueError, TypeError):
        return False, "Invalid expiration parameter"

    now = current_time if current_time is not None else time.time()
    if now > exp_int:
        return False, "Signed URL has expired"

    key = secret_key or SECURITY_SECRET_KEY
    message = f"{filename}:{exp_int}".encode()
    expected_sig = hmac.new(key, message, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_sig, sig):
        return False, "Invalid signature or filename mismatch"

    return True, "Valid signature"


def check_access_tier_permission(
    record: dict[str, Any],
    user_identity: dict[str, Any],
) -> tuple[bool, str, int]:
    """Evaluate access permission against OCAP access tiers and speaker consent.

    Returns:
        (allowed: bool, reason: str, status_code: int)
    """
    # 1. Speaker Consent check (OCAP fundamental invariant)
    if record.get("status") == "withdrawn" or record.get("archived_at") is not None:
        return False, "Recording withdrawn under speaker consent.", 404

    tier = (record.get("privacy_level") or "public").strip().lower()

    # 2. Public tier
    if tier == "public":
        return True, "Public archive recording.", 200

    # 3. Administrator override
    if user_identity.get("role") == "admin":
        return True, "Administrator override authorization.", 200

    # 4. Community tier
    if tier == "community":
        if not user_identity.get("authenticated"):
            return False, "Community access requires an authenticated member or elder.", 403
        return True, "Authenticated community member access granted.", 200

    # 5. Research tier
    if tier == "research":
        if user_identity.get("role") not in ("researcher", "admin"):
            return False, "Research tier requires verified researcher credentials.", 403
        return True, "Researcher credentials verified.", 200

    # 6. Private tier
    if tier == "private":
        is_owner = False
        if user_identity.get("authenticated"):
            # Check ID match
            if record.get("contributor_id") and user_identity.get("user_id"):
                if record.get("contributor_id") == user_identity.get("user_id"):
                    is_owner = True
            # Check username match
            c_name = record.get("contributor_name")
            if c_name and c_name not in ("Community Contributor", "Anonymous Contributor"):
                if c_name == user_identity.get("username"):
                    is_owner = True

        if not is_owner:
            return False, "Private recording restricted to recording owner.", 403
        return True, "Owner access granted.", 200

    return False, f"Unknown access tier: {tier}", 403
