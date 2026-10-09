import { NextRequest, NextResponse } from "next/server";
import {
  registerServerUser,
  checkAuthRateLimit,
} from "@/lib/serverAuth";
import { type UserRole } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting Check
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkAuthRateLimit(clientIp, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many registration attempts. Please wait a moment before trying again.",
          retryAfterSec: rateCheck.retryAfterSec,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role = "contributor",
      clanOrCommunity,
      location,
      languages,
      bio,
    } = body;

    // 2. Strict Input Validations
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Full name is required (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const assignedRole: UserRole = ["listener", "contributor", "reviewer", "admin"].includes(role)
      ? (role as UserRole)
      : "contributor";

    // 3. Register user with salted hashing & duplicate email enforcement
    const result = registerServerUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role: assignedRole,
      clanOrCommunity: clanOrCommunity?.trim(),
      location: location?.trim(),
      languages: Array.isArray(languages) && languages.length > 0 ? languages : undefined,
      bio: bio?.trim(),
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Registration failed.",
        },
        { status: result.error?.includes("already exists") ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: `Account created successfully for ${result.user.name} (${result.user.roleTitle}).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Registration processing failed", details: err?.message },
      { status: 500 }
    );
  }
}
