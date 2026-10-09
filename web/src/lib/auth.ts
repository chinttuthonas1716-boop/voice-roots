/**
 * Voice Roots — Unified Authentication & Identity Profile Management
 * Supports Google Sign-In, Email/Password, Guest Access, and Role-Based Permissions
 * Roles: listener | contributor | reviewer | admin | guest
 */

export type UserRole = "listener" | "contributor" | "reviewer" | "admin" | "guest";

export interface UserProfile {
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
  token: string;
  isGuest?: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, { title: string; description: string; permissions: string[] }> = {
  listener: {
    title: "Heritage Listener",
    description: "Explore oral stories, listen in original dialects, translate to 13+ languages, and query Voice Roots AI.",
    permissions: ["explore_stories", "listen_audio", "translate", "ask_ai", "save_stories"],
  },
  contributor: {
    title: "Oral Heritage Contributor",
    description: "Record voice memories, upload high-fidelity audio, generate Heritage Passports, and manage spoken narratives.",
    permissions: ["record_audio", "upload_audio", "create_stories", "manage_own_recordings", "view_translations"],
  },
  reviewer: {
    title: "Elder & Linguist Reviewer",
    description: "Review phoneme transcripts, verify indigenous cultural context, and approve oral heritage archives.",
    permissions: ["review_transcripts", "verify_stories", "approve_heritage_records", "view_restricted_community"],
  },
  admin: {
    title: "System Administrator",
    description: "Manage users, monitor platform integrity, enforce OCAP data sovereignty, and audit system logs.",
    permissions: ["manage_users", "manage_content", "audit_provenance", "platform_monitoring", "system_configuration"],
  },
  guest: {
    title: "Public Guest Explorer",
    description: "Browse publicly released oral stories with basic listening and translation features.",
    permissions: ["explore_public_stories", "listen_public_audio"],
  },
};

export const DEMO_USERS: UserProfile[] = [
  {
    id: "usr_reviewer_01",
    name: "Elder Soyam Laxman",
    email: "soyam.laxman@voiceroots.org",
    role: "reviewer",
    roleTitle: "Community Elder & Sacred Storyteller",
    clanOrCommunity: "Gondi Koitur Clan Canopy",
    location: "Adilabad Forest, Telangana",
    languages: ["Gondi (గోండీ)", "Telugu (తెలుగు)", "Koya (కోయ)"],
    verifiedElder: true,
    contributionsCount: 14,
    memberSince: "October 2024",
    bio: "Custodian of sacred Mahua creation chants, generational harvest prayers, and oral medicinal lore.",
    avatarInitials: "SL",
    token: "vr_tok_elder_soyam_laxman_verified",
  },
  {
    id: "usr_contributor_02",
    name: "Dr. Ananya Sen",
    email: "ananya.sen@indiclinguistics.edu",
    role: "contributor",
    roleTitle: "Principal Ethnolinguist Researcher",
    clanOrCommunity: "Deccan Oral Traditions Institute",
    location: "Hyderabad & Bastar Highland",
    languages: ["Telugu (తెలుగు)", "Hindi (हिन्दी)", "English", "Tamil (தமிழ்)"],
    verifiedElder: false,
    contributionsCount: 29,
    memberSince: "January 2025",
    bio: "Field linguist documenting endangered Dravidian & Austroasiatic dialects with acoustic audio preservation.",
    avatarInitials: "AS",
    token: "vr_tok_researcher_ananya_sen",
  },
  {
    id: "usr_contributor_03",
    name: "Kovvasi Ramesh",
    email: "kovvasi.ramesh@community.org",
    role: "contributor",
    roleTitle: "Heritage Field Custodian",
    clanOrCommunity: "Godavari Basin Koya Council",
    location: "Bhadrachalam, Andhra Pradesh",
    languages: ["Koya (కోయ)", "Telugu (తెలుగు)", "Lambadi (లంబాడీ)"],
    verifiedElder: true,
    contributionsCount: 8,
    memberSince: "March 2025",
    bio: "Community archivist recording elder wisdom, monsoon river chants, and oral farming cycles.",
    avatarInitials: "KR",
    token: "vr_tok_custodian_kovvasi_ramesh",
  },
  {
    id: "usr_listener_04",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    role: "listener",
    roleTitle: "Heritage Explorer & Student",
    clanOrCommunity: "Public Heritage Circle",
    location: "Bengaluru, Karnataka",
    languages: ["Telugu (తెలుగు)", "Hindi (हिन्दी)", "English", "Kannada (ಕನ್ನಡ)"],
    verifiedElder: false,
    contributionsCount: 0,
    memberSince: "September 2026",
    bio: "Student exploring generational spoken folktales and indigenous oral traditions across India.",
    avatarInitials: "PS",
    token: "vr_tok_listener_priya_sharma",
  },
  {
    id: "usr_admin_05",
    name: "Platform Administrator",
    email: "admin@voiceroots.org",
    role: "admin",
    roleTitle: "System Integrity Administrator",
    clanOrCommunity: "Voice Roots Foundation",
    location: "Global",
    languages: ["English", "Telugu (తెలుగు)", "Hindi (हिन्दी)"],
    verifiedElder: false,
    contributionsCount: 120,
    memberSince: "August 2024",
    bio: "Overseeing data sovereignty, cryptographic provenance hashing, and privacy compliance.",
    avatarInitials: "AD",
    token: "vr_tok_admin_root_master",
  },
];

const AUTH_STORAGE_KEY = "voice_roots_active_user";
const REGISTERED_USERS_KEY = "voice_roots_registered_users";

/**
 * Get active user from browser storage
 */
export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Fetch all registered users (demo + local custom)
 */
export function getAllUsers(): UserProfile[] {
  if (typeof window === "undefined") return DEMO_USERS;
  try {
    const customRaw = localStorage.getItem(REGISTERED_USERS_KEY);
    const custom: UserProfile[] = customRaw ? JSON.parse(customRaw) : [];
    return [...DEMO_USERS, ...custom];
  } catch {
    return DEMO_USERS;
  }
}

/**
 * Sign in using Google OAuth simulation
 */
export function loginWithGoogle(): UserProfile {
  const googleUser: UserProfile = {
    id: "usr_google_" + Date.now().toString(36),
    name: "Cultural Contributor (Google)",
    email: "contributor@gmail.com",
    role: "contributor",
    roleTitle: ROLE_DEFINITIONS.contributor.title,
    clanOrCommunity: "Community Oral Circle",
    location: "Deccan Plateau",
    languages: ["Telugu (తెలుగు)", "English", "Hindi (हिन्दी)"],
    verifiedElder: false,
    contributionsCount: 3,
    memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    bio: "Authenticated via Google Single Sign-On for Voice Roots preservation.",
    avatarInitials: "GG",
    token: `vr_tok_google_${Math.random().toString(36).substring(2, 10)}`,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
  }
  return googleUser;
}

/**
 * Sign in as Guest
 */
export function loginAsGuest(): UserProfile {
  const guestUser: UserProfile = {
    id: "usr_guest_" + Date.now().toString(36),
    name: "Guest Explorer",
    email: "guest@voiceroots.local",
    role: "guest",
    roleTitle: ROLE_DEFINITIONS.guest.title,
    clanOrCommunity: "Public Explorer",
    location: "Global",
    languages: ["English", "Telugu (తెలుగు)"],
    verifiedElder: false,
    contributionsCount: 0,
    memberSince: "Today",
    bio: "Guest session with public heritage browsing access.",
    avatarInitials: "GE",
    token: `vr_tok_guest_${Math.random().toString(36).substring(2, 8)}`,
    isGuest: true,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
  }
  return guestUser;
}

/**
 * Log in with credentials (email and password)
 */
export function loginUser(email: string, _password?: string): UserProfile {
  const all = getAllUsers();
  const match = all.find((u) => u.email.toLowerCase() === email.toLowerCase());

  const user: UserProfile = match || {
    id: `usr_${Date.now()}`,
    name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    email,
    role: "contributor",
    roleTitle: "Oral Heritage Contributor",
    clanOrCommunity: "Community Oral Circle",
    location: "Deccan Plateau",
    languages: ["Telugu (తెలుగు)", "English"],
    verifiedElder: false,
    contributionsCount: 1,
    memberSince: "October 2026",
    bio: "Preserving local spoken voices and family oral memories.",
    avatarInitials: email.slice(0, 2).toUpperCase(),
    token: `vr_tok_${Math.random().toString(36).substring(2, 12)}`,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }
  return user;
}

/**
 * Register a new Voice Roots account
 */
export function registerUser(data: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  clanOrCommunity?: string;
  languages?: string[];
}): UserProfile {
  const newUser: UserProfile = {
    id: `usr_${Date.now().toString(36)}`,
    name: data.name,
    email: data.email,
    role: data.role,
    roleTitle: ROLE_DEFINITIONS[data.role].title,
    clanOrCommunity: data.clanOrCommunity || "Community Oral Circle",
    location: "India",
    languages: data.languages || ["Telugu (తెలుగు)", "English"],
    verifiedElder: data.role === "reviewer",
    contributionsCount: 0,
    memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    bio: `${ROLE_DEFINITIONS[data.role].title} contributing to the Voice Roots indigenous archive.`,
    avatarInitials: data.name.slice(0, 2).toUpperCase(),
    token: `vr_tok_${Math.random().toString(36).substring(2, 12)}`,
  };

  if (typeof window !== "undefined") {
    try {
      const customRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      const custom: UserProfile[] = customRaw ? JSON.parse(customRaw) : [];
      custom.push(newUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(custom));
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    }
  }

  return newUser;
}

/**
 * Update user details
 */
export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getCurrentUser() || DEMO_USERS[0];
  const updated: UserProfile = { ...current, ...updates };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

/**
 * Log out
 */
export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Request password reset
 */
export function requestPasswordReset(email: string): { success: boolean; message: string; resetToken?: string } {
  if (!email || !email.includes("@")) {
    return { success: false, message: "Please enter a valid email address." };
  }
  const resetToken = `vr_rst_${Math.random().toString(36).substring(2, 10)}`;
  return {
    success: true,
    message: `Password reset verification link issued for ${email}. Check your inbox.`,
    resetToken,
  };
}

/**
 * CRITICAL ACCESS CONTROL:
 * Enforces Indigenous Data Sovereignty and Private-Story Protection.
 * "A user must never be able to access another contributor's private recording
 * simply by changing an ID in the URL/API request."
 */
export function canAccessRecording(
  user: UserProfile | null,
  recording: {
    id: string;
    accessLevel?: "public" | "community" | "private" | "restricted" | string;
    creatorId?: string;
    creatorEmail?: string;
    isUserUploaded?: boolean;
  }
): { allowed: boolean; reason: string } {
  const level = recording.accessLevel || "public";

  // Public recordings are visible to everyone (including guests)
  if (level === "public") {
    return { allowed: true, reason: "Public heritage archive record." };
  }

  // If user is not logged in, private or community records are blocked
  if (!user) {
    return {
      allowed: false,
      reason: "Authentication required. This oral recording is protected under community privacy protocols.",
    };
  }

  // Admins and Elders/Reviewers can review community records
  if (user.role === "admin") {
    return { allowed: true, reason: "Administrator platform audit access." };
  }

  if (user.role === "reviewer" && level !== "private") {
    return { allowed: true, reason: "Elder & Linguist reviewer verification privilege." };
  }

  // For private recordings: strictly verify ownership
  if (level === "private") {
    const isOwner =
      (recording.creatorId && recording.creatorId === user.id) ||
      (recording.creatorEmail && recording.creatorEmail.toLowerCase() === user.email.toLowerCase());

    if (isOwner) {
      return { allowed: true, reason: "Recording creator authorized." };
    }

    return {
      allowed: false,
      reason: "Private Recording Protection: You do not have permission to view another contributor's private recording.",
    };
  }

  // Community-restricted records: require logged-in contributor, reviewer, or elder
  if (level === "community" || level === "restricted") {
    if (user.role === "guest") {
      return {
        allowed: false,
        reason: "Community record: Guest accounts cannot view restricted clan narratives.",
      };
    }
    return { allowed: true, reason: "Community member access granted." };
  }

  return { allowed: true, reason: "Access granted." };
}
