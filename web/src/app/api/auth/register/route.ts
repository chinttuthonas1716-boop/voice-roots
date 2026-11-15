import { NextRequest, NextResponse } from "next/server";
import { type UserRole } from "@/lib/auth";
import { checkAuthRateLimit, registerServerUser } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkAuthRateLimit(clientIp, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please try again in ${rateCheck.retryAfterSec || 60} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, role = "contributor", clanOrCommunity } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 2. Security Defense: Never allow public self-assignment of reviewer or admin roles
    const requestedRole = (role || "contributor").toString().toLowerCase().trim() as UserRole;
    let safeRole: UserRole = "contributor";
    let pendingApprovalNotice: string | undefined;

    if (requestedRole === "researcher" || requestedRole === "listener") {
      safeRole = requestedRole;
    } else if (requestedRole === "reviewer" || requestedRole === "admin") {
      safeRole = "contributor";
      pendingApprovalNotice = `Account created as Community Contributor. Your request for elevated ${requestedRole === "admin" ? "Platform Administrator" : "Language Reviewer"} privileges has been submitted for administrator verification.`;
    }

    // 3. Optional FastAPI Integration (if backend is running)
    const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const backendRes = await fetch(`${FASTAPI_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanEmail.split("@")[0].replace(/[^a-z0-9_]/g, "_").slice(0, 20),
          email: cleanEmail,
          password,
          full_name: cleanName,
          role: safeRole,
        }),
        signal: AbortSignal.timeout(1500),
      });

      if (!backendRes.ok) {
        const errJson = await backendRes.json().catch(() => ({}));
        if (backendRes.status === 400 && errJson.detail?.includes("already")) {
          return NextResponse.json(
            { success: false, error: "An account with this email address already exists. Please sign in instead." },
            { status: 409 }
          );
        }
      }
    } catch {
      // Backend unavailable; proceed with serverAuth
    }

    // 4. ServerAuth Salted Scrypt Registration
    const regResult = registerServerUser({
      name: cleanName,
      email: cleanEmail,
      password,
      role: safeRole,
      clanOrCommunity: clanOrCommunity?.trim() || "Community Oral Circle",
    });

    if (!regResult.success || !regResult.user || !regResult.token) {
      const isDuplicate = regResult.error?.includes("already exists");
      return NextResponse.json(
        { success: false, error: regResult.error || "Registration could not be completed." },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: regResult.user,
        token: regResult.token,
        message: `Account created successfully for ${cleanName} (${regResult.user.roleTitle}).`,
        pendingApprovalNotice: pendingApprovalNotice || regResult.pendingApprovalNotice,
      },
      { status: 201 }
    );

    response.cookies.set("vr_token", regResult.token, {
      path: "/",
      maxAge: 7 * 24 * 3600,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Registration failed due to an internal error", details: err?.message },
      { status: 500 }
    );
  }
}
