"""RBAC permissions map."""
from app.models.user import UserRole

# Maps each role to the set of permission strings it has
ROLE_PERMISSIONS: dict[UserRole, set[str]] = {
    UserRole.contributor: {
        "recordings:create",
        "recordings:read_own",
        "recordings:update_own",
        "recordings:delete_own",
        "transcripts:read",
        "transcripts:correct",
        "translations:read",
        "vocabulary:read",
        "search:query",
        "community:read",
        "consent:manage_own",
        "profile:read",
        "profile:update_own",
        "collections:create",
        "collections:read",
        "ai_jobs:create",
        "ai_jobs:read_own",
    },
    UserRole.researcher: {
        "recordings:read_all",
        "transcripts:read",
        "translations:read",
        "vocabulary:read",
        "search:query",
        "search:advanced",
        "analytics:read",
        "corpus:access",
        "model_lab:read",
        "community:read",
        "profile:read",
        "collections:read",
        "ai_jobs:read_all",
    },
    UserRole.moderator: {
        "recordings:read_all",
        "recordings:update_any",
        "transcripts:read",
        "transcripts:verify",
        "translations:verify",
        "vocabulary:verify",
        "reviews:create",
        "reviews:update",
        "community:manage",
        "content:moderate",
        "users:read",
    },
    UserRole.admin: {
        "*",  # all permissions
    },
}


def has_permission(role: UserRole, permission: str) -> bool:
    """Check if a role has a specific permission."""
    perms = ROLE_PERMISSIONS.get(role, set())
    return "*" in perms or permission in perms
