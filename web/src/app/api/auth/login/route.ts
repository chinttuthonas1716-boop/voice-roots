import { NextRequest, NextResponse } from "next/server";
import {
  authenticateServerUser,
  checkAuthRateLimit,
  generateSessionToken,
} from "@/lib/serverAuth";
import { DEMO_USERS, ROLE_DEFINITIONS, type UserProfile } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting Security Check (prevent brute-force password guessing)
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkAuthRateLimit(clientIp, 12, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many login attempts. Please wait a minute before trying again.",
          retryAfterSec: rateCheck.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, provider = "credentials" } = body;

    // 2. Google Sign-In Provider Simulation
    if (provider === "google") {
      const googleUser: UserProfile = {
        id: "usr_google_" + Date.now().toString(36),
        name: body.name || "Cultural Contributor (Google)",
        email: email || "contributor@gmail.com",
        role: "contributor",
        roleTitle: ROLE_DEFINITIONS.contributor.title,
        clanOrCommunity: "Community Oral Circle",
        location: "Deccan Plateau",
        languages: ["Telugu (తెలుగు)", "English", "Hindi (हिन्दी)"],
        verifiedElder: false,
        contributionsCount: 3,
        memberSince: "October 2026",
        bio: "Authenticated via Google Single Sign-On for Voice Roots preservation.",
        avatarInitials: "GG",
        token: generateSessionToken("usr_google", email || "contributor@gmail.com"),
      };

      return NextResponse.json({
        success: true,
        user: googleUser,
        token: googleUser.token,
        message: "Google Sign-In successful.",
      });
    }

    // 3. Guest Access Provider
    if (provider === "guest") {
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
        token: generateSessionToken("usr_guest", "guest@voiceroots.local"),
        isGuest: true,
      };

      return NextResponse.json({
        success: true,
        user: guestUser,
        token: guestUser.token,
        message: "Guest session established.",
      });
    }

    // 4. Standard Email/Password Credentials Verification
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    // Authenticate against real server store with salted scrypt verification
    const authResult = authenticateServerUser(email, password);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      message: `Signed in as ${authResult.user.name} (${authResult.user.roleTitle}).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication failed", details: err?.message },
      { status: 500 }
    );
  }
}
