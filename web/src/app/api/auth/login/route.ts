import { NextRequest, NextResponse } from "next/server";
import { DEMO_USERS, ROLE_DEFINITIONS, type UserProfile, type UserRole } from "@/lib/auth";
import { authenticateServerUser, checkAuthRateLimit } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkAuthRateLimit(clientIp, 12, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many sign-in attempts. Please try again in ${rateCheck.retryAfterSec || 60} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe = false, provider = "credentials" } = body;

    // Google Sign-In Provider
    if (provider === "google") {
      const googleUser: UserProfile = {
        id: "usr_google_" + Date.now().toString(36),
        name: body.name || "Cultural Contributor (Google)",
        email: email || "contributor@gmail.com",
        role: "contributor",
        roleTitle: ROLE_DEFINITIONS.contributor.title,
        clanOrCommunity: "Community Oral Circle",
        location: "Global",
        languages: ["English"],
        verifiedElder: false,
        contributionsCount: 3,
        memberSince: "October 2026",
        bio: "Authenticated via Google Single Sign-On.",
        avatarInitials: "GG",
        token: `vr_tok_google_${Math.random().toString(36).substring(2, 10)}`,
      };

      const response = NextResponse.json({
        success: true,
        user: googleUser,
        token: googleUser.token,
        message: "Google Sign-In successful.",
      });
      response.cookies.set("vr_token", googleUser.token, {
        path: "/",
        maxAge: 7 * 24 * 3600,
        sameSite: "lax",
      });
      return response;
    }

    // Guest Access
    if (provider === "guest") {
      const guestUser: UserProfile = {
        id: "usr_guest_" + Date.now().toString(36),
        name: "Guest Explorer",
        email: "guest@voiceroots.local",
        role: "guest",
        roleTitle: ROLE_DEFINITIONS.guest.title,
        clanOrCommunity: "Public Explorer",
        location: "Global",
        languages: ["English"],
        verifiedElder: false,
        contributionsCount: 0,
        memberSince: "Today",
        bio: "Guest session with public heritage browsing access.",
        avatarInitials: "GE",
        token: `vr_tok_guest_${Math.random().toString(36).substring(2, 8)}`,
        isGuest: true,
      };

      const response = NextResponse.json({
        success: true,
        user: guestUser,
        token: guestUser.token,
        message: "Guest session established.",
      });
      response.cookies.set("vr_token", guestUser.token, {
        path: "/",
        maxAge: 24 * 3600,
        sameSite: "lax",
      });
      return response;
    }

    // Standard Credentials Validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt FastAPI backend authentication if online
    const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const backendRes = await fetch(`${FASTAPI_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanEmail, password }),
        signal: AbortSignal.timeout(1500),
      });

      if (backendRes.ok) {
        const backendJson = await backendRes.json();
        const bUser = backendJson.data;
        const roleKey = (bUser.role || "contributor") as UserRole;
        const userProfile: UserProfile = {
          id: bUser.id,
          name: bUser.full_name || bUser.username || cleanEmail.split("@")[0],
          email: bUser.email || cleanEmail,
          role: roleKey,
          roleTitle: ROLE_DEFINITIONS[roleKey]?.title || "Oral Heritage Contributor",
          clanOrCommunity: "Community Oral Circle",
          location: "Global",
          languages: ["English"],
          verifiedElder: roleKey === "reviewer",
          contributionsCount: 0,
          memberSince: new Date(bUser.created_at || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          bio: bUser.bio || "Preserving low-resource oral traditions.",
          avatarInitials: (bUser.full_name || cleanEmail).slice(0, 2).toUpperCase(),
          token: bUser.access_token || `vr_sess_${bUser.id}`,
        };

        const maxAge = rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600;
        const response = NextResponse.json({
          success: true,
          user: userProfile,
          token: userProfile.token,
          message: `Welcome back, ${userProfile.name}!`,
        });
        response.cookies.set("vr_token", userProfile.token, {
          path: "/",
          maxAge,
          sameSite: "lax",
        });
        return response;
      }
    } catch {
      // Backend not running, proceed seamlessly with serverAuth
    }

    // 2. Authenticate against serverAuth (salted scrypt password verification)
    const authResult = authenticateServerUser(cleanEmail, password);
    if (!authResult.success || !authResult.user || !authResult.token) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Invalid email or password. Please verify your credentials.",
        },
        { status: 401 }
      );
    }

    const maxAge = rememberMe ? 30 * 24 * 3600 : 7 * 24 * 3600;
    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      message: `Welcome back, ${authResult.user.name}!`,
    });
    response.cookies.set("vr_token", authResult.token, {
      path: "/",
      maxAge,
      sameSite: "lax",
    });
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication failed", details: err?.message },
      { status: 500 }
    );
  }
}
