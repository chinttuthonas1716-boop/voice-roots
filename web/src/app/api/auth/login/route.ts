import { NextResponse } from "next/server";
import { DEMO_USERS, ROLE_DEFINITIONS, type UserProfile, type UserRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, provider = "credentials" } = body;

    // Google Sign-In Provider
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
        bio: "Authenticated via Google Single Sign-On.",
        avatarInitials: "GG",
        token: `vr_tok_google_${Math.random().toString(36).substring(2, 10)}`,
      };

      return NextResponse.json({
        success: true,
        user: googleUser,
        token: googleUser.token,
        message: "Google Sign-In successful.",
      });
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
        languages: ["English", "Telugu (తెలుగు)"],
        verifiedElder: false,
        contributionsCount: 0,
        memberSince: "Today",
        bio: "Guest session with public heritage browsing access.",
        avatarInitials: "GE",
        token: `vr_tok_guest_${Math.random().toString(36).substring(2, 8)}`,
        isGuest: true,
      };

      return NextResponse.json({
        success: true,
        user: guestUser,
        token: guestUser.token,
        message: "Guest session established.",
      });
    }

    // Standard Credentials
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    // Match existing demo user or create contributor session
    const match = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const user: UserProfile = match || {
      id: `usr_${Date.now()}`,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      email,
      role: "contributor",
      roleTitle: ROLE_DEFINITIONS.contributor.title,
      clanOrCommunity: "Community Oral Circle",
      location: "South Asia",
      languages: ["Telugu (తెలుగు)", "English"],
      verifiedElder: false,
      contributionsCount: 1,
      memberSince: "October 2026",
      bio: "Preserving local spoken voices and family oral memories.",
      avatarInitials: email.slice(0, 2).toUpperCase(),
      token: `vr_tok_${Math.random().toString(36).substring(2, 12)}`,
    };

    return NextResponse.json({
      success: true,
      user,
      token: user.token,
      message: `Signed in as ${user.name} (${user.roleTitle}).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication failed", details: err?.message },
      { status: 500 }
    );
  }
}
