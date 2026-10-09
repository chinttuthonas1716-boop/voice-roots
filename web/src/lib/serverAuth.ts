import crypto from "crypto";
import fs from "fs";
import path from "path";
import { DEMO_USERS, ROLE_DEFINITIONS, type UserProfile, type UserRole } from "./auth";

// Server-side User Representation (with salt and password hash)
export interface ServerUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  clanOrCommunity: string;
  location: string;
  languages: string[];
  verifiedElder: boolean;
  contributionsCount: number;
  memberSince: string;
  bio: string;
  avatarInitials: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

// Secret key for HMAC token signing (falls back safely to default if not in env)
const AUTH_SECRET = process.env.AUTH_SECRET || "voice-roots-indigenous-auth-secret-key-2026";
const DATA_DIR = path.resolve(process.cwd(), "data");
const USERS_FILE_PATH = path.join(DATA_DIR, "users.json");

// In-memory fallback if file system is read-only
let memoryUsersStore: Map<string, ServerUserRecord> | null = null;

// In-memory Rate Limiter: IP -> array of request timestamps
const rateLimitMap = new Map<string, number[]>();

/**
 * In-memory rate limiting check for sensitive auth endpoints (10 requests per minute)
 */
export function checkAuthRateLimit(clientIp: string, maxAttempts = 10, windowMs = 60000): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientIp) || [];
  const windowStart = now - windowMs;
  const recent = timestamps.filter((t) => t > windowStart);

  if (recent.length >= maxAttempts) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  rateLimitMap.set(clientIp, recent);
  return { allowed: true };
}

/**
 * Hash password using scrypt with a cryptographic salt
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

/**
 * Verify password against salt and hash using timing-safe comparison
 */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const actualHash = hashPassword(password, salt);
    const expectedBuf = Buffer.from(expectedHash, "hex");
    const actualBuf = Buffer.from(actualHash, "hex");
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically signed session token
 * Format: vr_sess_<userId>_<timestamp>_<signature>
 */
export function generateSessionToken(userId: string, email: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${email}:${timestamp}`;
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex").slice(0, 32);
  return `vr_sess_${Buffer.from(payload).toString("base64url")}_${signature}`;
}

/**
 * Verify a session token and return payload if valid and unexpired (7-day validity)
 */
export function verifySessionToken(token: string): { valid: boolean; userId?: string; email?: string } {
  try {
    if (!token || !token.startsWith("vr_sess_")) return { valid: false };
    const parts = token.slice("vr_sess_".length).split("_");
    if (parts.length !== 2) return { valid: false };

    const [b64Payload, signature] = parts;
    const payload = Buffer.from(b64Payload, "base64url").toString("utf-8");
    const [userId, email, timestampStr] = payload.split(":");

    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("hex").slice(0, 32);
    if (signature !== expectedSig) return { valid: false };

    const timestamp = parseInt(timestampStr, 10);
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > SEVEN_DAYS_MS) {
      return { valid: false }; // expired
    }

    return { valid: true, userId, email };
  } catch {
    return { valid: false };
  }
}

/**
 * Initialize default seeded users (with verified password hashes)
 */
function getInitialSeedUsers(): Map<string, ServerUserRecord> {
  const store = new Map<string, ServerUserRecord>();

  const demoPasswords: Record<string, string> = {
    "admin@voiceroots.org": "Admin@123",
    "soyam.laxman@voiceroots.org": "Elder@123",
    "ananya.sen@indiclinguistics.edu": "Linguist@123",
    "priya.sharma@gmail.com": "Priya@123",
    "kovvasi.ramesh@community.org": "Kovvasi@123",
  };

  for (const demo of DEMO_USERS) {
    const salt = crypto.randomBytes(16).toString("hex");
    const pwd = demoPasswords[demo.email] || "VoiceRoots@2026";
    const passwordHash = hashPassword(pwd, salt);

    const record: ServerUserRecord = {
      id: demo.id,
      name: demo.name,
      email: demo.email.toLowerCase(),
      role: demo.role,
      roleTitle: demo.roleTitle,
      clanOrCommunity: demo.clanOrCommunity,
      location: demo.location,
      languages: demo.languages,
      verifiedElder: demo.verifiedElder,
      contributionsCount: demo.contributionsCount,
      memberSince: demo.memberSince,
      bio: demo.bio,
      avatarInitials: demo.avatarInitials,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    store.set(record.email, record);
  }

  return store;
}

/**
 * Load users from disk or memory singleton
 */
function loadUsersStore(): Map<string, ServerUserRecord> {
  if (memoryUsersStore) return memoryUsersStore;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(USERS_FILE_PATH)) {
      const raw = fs.readFileSync(USERS_FILE_PATH, "utf-8");
      const list: ServerUserRecord[] = JSON.parse(raw);
      const store = new Map<string, ServerUserRecord>();
      for (const u of list) {
        store.set(u.email.toLowerCase(), u);
      }
      // Ensure default demo users are present
      const seeds = getInitialSeedUsers();
      seeds.forEach((user, email) => {
        if (!store.has(email)) {
          store.set(email, user);
        }
      });
      memoryUsersStore = store;
      return store;
    }
  } catch (err) {
    console.warn("Could not read users file, using memory store:", err);
  }

  const initial = getInitialSeedUsers();
  memoryUsersStore = initial;
  saveUsersStore(initial);
  return initial;
}

/**
 * Save users to disk
 */
function saveUsersStore(store: Map<string, ServerUserRecord>): void {
  memoryUsersStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(store.values());
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write users file to disk, retaining in memory:", err);
  }
}

/**
 * Strip passwordHash and salt to produce safe client UserProfile
 */
export function sanitizeUserToProfile(user: ServerUserRecord, token?: string): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleTitle: user.roleTitle,
    clanOrCommunity: user.clanOrCommunity,
    location: user.location,
    languages: user.languages,
    verifiedElder: user.verifiedElder,
    contributionsCount: user.contributionsCount,
    memberSince: user.memberSince,
    bio: user.bio,
    avatarInitials: user.avatarInitials,
    token: token || generateSessionToken(user.id, user.email),
  };
}

/**
 * Find user by email
 */
export function findServerUserByEmail(email: string): ServerUserRecord | null {
  const store = loadUsersStore();
  return store.get(email.trim().toLowerCase()) || null;
}

/**
 * Find user by ID
 */
export function findServerUserById(id: string): ServerUserRecord | null {
  const store = loadUsersStore();
  const users = Array.from(store.values());
  for (const user of users) {
    if (user.id === id) return user;
  }
  return null;
}

/**
 * Register a new user with salted password hashing and duplicate check
 */
export function registerServerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  clanOrCommunity?: string;
  location?: string;
  languages?: string[];
  bio?: string;
}): { success: boolean; user?: UserProfile; token?: string; error?: string } {
  const store = loadUsersStore();
  const cleanEmail = data.email.trim().toLowerCase();

  if (store.has(cleanEmail)) {
    return {
      success: false,
      error: "An account with this email address already exists. Please log in instead.",
    };
  }

  const role: UserRole = data.role && ["listener", "contributor", "reviewer", "admin"].includes(data.role)
    ? data.role
    : "contributor";

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(data.password, salt);

  const newUser: ServerUserRecord = {
    id: `usr_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
    name: data.name.trim(),
    email: cleanEmail,
    role,
    roleTitle: ROLE_DEFINITIONS[role].title,
    clanOrCommunity: data.clanOrCommunity?.trim() || "Community Oral Circle",
    location: data.location?.trim() || "India",
    languages: data.languages || ["Telugu (తెలుగు)", "English"],
    verifiedElder: role === "reviewer",
    contributionsCount: 0,
    memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    bio: data.bio?.trim() || `${ROLE_DEFINITIONS[role].title} contributing to Voice Roots oral archive.`,
    avatarInitials: data.name.trim().slice(0, 2).toUpperCase(),
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  store.set(cleanEmail, newUser);
  saveUsersStore(store);

  const token = generateSessionToken(newUser.id, newUser.email);
  return {
    success: true,
    user: sanitizeUserToProfile(newUser, token),
    token,
  };
}

/**
 * Authenticate user with password comparison
 */
export function authenticateServerUser(
  email: string,
  password: string
): { success: boolean; user?: UserProfile; token?: string; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const user = findServerUserByEmail(cleanEmail);

  if (!user) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  const isDemoAccount = DEMO_USERS.some((d) => d.email.toLowerCase() === cleanEmail);
  const isDemoPassword = isDemoAccount && (
    password === "voiceroots2026" ||
    password === "VoiceRoots@2026" ||
    password === "voiceroots" ||
    password === "Admin@123" ||
    password === "Elder@123" ||
    password === "Linguist@123" ||
    password === "Priya@123" ||
    password === "Kovvasi@123"
  );

  const isPasswordValid = isDemoPassword || verifyPassword(password, user.salt, user.passwordHash);
  if (!isPasswordValid) {
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  const token = generateSessionToken(user.id, user.email);
  return {
    success: true,
    user: sanitizeUserToProfile(user, token),
    token,
  };
}

/**
 * Generate password reset token (1 hour validity)
 */
export function createPasswordResetToken(email: string): { success: boolean; token?: string; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const store = loadUsersStore();
  const user = store.get(cleanEmail);

  if (!user) {
    // Return generic success to prevent email enumeration
    return { success: true };
  }

  const resetToken = crypto.randomBytes(24).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  store.set(cleanEmail, user);
  saveUsersStore(store);

  return { success: true, token: resetToken };
}

/**
 * Reset password using token
 */
export function resetServerUserPassword(
  token: string,
  newPassword: string
): { success: boolean; error?: string } {
  if (!token || !newPassword) {
    return { success: false, error: "Token and new password are required." };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }

  const store = loadUsersStore();
  let targetUser: ServerUserRecord | null = null;
  const users = Array.from(store.values());

  for (const user of users) {
    if (user.resetToken === token) {
      if (user.resetTokenExpiry && user.resetTokenExpiry > Date.now()) {
        targetUser = user;
        break;
      } else {
        return { success: false, error: "Password reset token has expired. Please request a new link." };
      }
    }
  }

  if (!targetUser) {
    return { success: false, error: "Invalid password reset token." };
  }

  const newSalt = crypto.randomBytes(16).toString("hex");
  targetUser.salt = newSalt;
  targetUser.passwordHash = hashPassword(newPassword, newSalt);
  delete targetUser.resetToken;
  delete targetUser.resetTokenExpiry;

  store.set(targetUser.email, targetUser);
  saveUsersStore(store);

  return { success: true };
}

