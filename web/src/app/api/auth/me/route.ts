import { NextRequest, NextResponse } from "next/server";
import { findServerUserById, sanitizeUserToProfile, verifySessionToken } from "@/lib/serverAuth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    let token = "";

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else {
      const cookie = request.cookies.get("vr_token");
      if (cookie) token = cookie.value;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated. Missing session token." },
        { status: 401 }
      );
    }

    const verification = verifySessionToken(token);
    if (!verification.valid || !verification.userId) {
      return NextResponse.json(
        { success: false, error: "Session token is invalid or has expired. Please log in again." },
        { status: 401 }
      );
    }

    const user = findServerUserById(verification.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUserToProfile(user, token),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Authentication check failed", details: err?.message },
      { status: 500 }
    );
  }
}

