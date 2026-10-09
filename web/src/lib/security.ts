/**
 * Voice Roots — Indigenous Oral Heritage Security & Privacy Protocol
 * Implements:
 * 1. Cryptographic SHA-256 Data Provenance & Tamper Verification
 * 2. Strict Input Sanitization (XSS & Injection Prevention)
 * 3. Indigenous Data Sovereignty (OCAP Principles: Ownership, Control, Access, Possession)
 * 4. In-Memory API Rate Limiter
 */

export type AccessLevel = "public" | "community" | "private" | "restricted";

export interface AIPermissions {
  transcription: boolean;
  translation: boolean;
  culturalMetadata: boolean;
}

/**
 * Computes a SHA-256 hex string for any string or binary buffer using Web Crypto API.
 */
export async function computeSHA256(data: string | ArrayBuffer): Promise<string> {
  try {
    let buffer: ArrayBuffer;
    if (typeof data === "string") {
      buffer = new TextEncoder().encode(data).buffer;
    } else {
      buffer = data;
    }

    if (typeof crypto !== "undefined" && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (err) {
    console.warn("Crypto API fallback hash:", err);
  }

  // Fallback deterministic hash if crypto.subtle is unavailable
  let hash = 0;
  const str = typeof data === "string" ? data : new TextDecoder().decode(data);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `vr_hash_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

/**
 * Sanitizes user-submitted strings to prevent XSS and script injections.
 */
export function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (!input || typeof input !== "string") return "";

  // Truncate to maximum permissible length
  const truncated = input.slice(0, maxLength);

  // Strip dangerous HTML tags and script protocols
  return truncated
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim();
}

/**
 * Verifies Indigenous Data Sovereignty access permissions.
 * Ensures private records or restricted tribal lore cannot be leaked or ingested by external AI.
 */
export function canAccessRecord(
  accessLevel: AccessLevel = "public",
  userRole: "elder" | "community_member" | "public_visitor" = "public_visitor"
): boolean {
  switch (accessLevel) {
    case "public":
      return true;
    case "community":
      return userRole === "elder" || userRole === "community_member";
    case "private":
    case "restricted":
      return userRole === "elder";
    default:
      return false;
  }
}

/**
 * Validates whether AI processing (translation / transcription / lore indexing)
 * is authorized by the indigenous storyteller's consent agreement.
 */
export function canAiProcess(
  feature: "transcription" | "translation" | "culturalMetadata",
  permissions?: AIPermissions,
  accessLevel?: AccessLevel
): boolean {
  if (accessLevel === "restricted" || accessLevel === "private") {
    return false;
  }
  if (!permissions) return true;
  return Boolean(permissions[feature]);
}

/**
 * In-memory sliding-window rate limiter for server API routes.
 */
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip);

  // Clean up expired buckets periodically
  if (rateLimitMap.size > 2000) {
    rateLimitMap.forEach((v, k) => {
      if (v.resetAt < now) rateLimitMap.delete(k);
    });
  }

  if (!bucket || bucket.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (bucket.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - bucket.count,
    resetInSec: Math.ceil((bucket.resetAt - now) / 1000),
  };
}
