import { NextResponse } from "next/server";
import { ROLE_DEFINITIONS, type UserProfile, type UserRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role = "contributor", clanOrCommunity } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Name and email are required for registration." },
        { status: 400 }
      );
    }

    const assignedRole: UserRole = ["listener", "contributor", "reviewer", "admin"].includes(role)
      ? (role as UserRole)
      : "contributor";

    const newUser: UserProfile = {
      id: `usr_${Date.now().toString(36)}`,
      name,
      email,
      role: assignedRole,
      roleTitle: ROLE_DEFINITIONS[assignedRole].title,
      clanOrCommunity: clanOrCommunity || "Community Oral Circle",
      location: "India",
      languages: ["Telugu (తెలుగు)", "English"],
      verifiedElder: assignedRole === "reviewer",
      contributionsCount: 0,
      memberSince: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      bio: `${ROLE_DEFINITIONS[assignedRole].title} in Voice Roots community archive.`,
      avatarInitials: name.slice(0, 2).toUpperCase(),
      token: `vr_tok_${Math.random().toString(36).substring(2, 12)}`,
    };

    return NextResponse.json({
      success: true,
      user: newUser,
      token: newUser.token,
      message: `Account created successfully for ${name} (${newUser.roleTitle}).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Registration failed", details: err?.message },
      { status: 500 }
    );
  }
}
