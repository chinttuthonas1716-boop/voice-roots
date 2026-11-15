import { NextRequest, NextResponse } from "next/server";
import { checkAuthRateLimit, createEmailVerificationToken, verifyEmailToken } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkAuthRateLimit(clientIp, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, email } = body;

    // Mode 1: Verify token
    if (token) {
      const result = verifyEmailToken(token);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Invalid or expired verification token." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: `Email ${result.email} has been successfully verified! You may now sign in.`,
        email: result.email,
      });
    }

    // Mode 2: Request new verification token
    if (email) {
      const result = createEmailVerificationToken(email);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Could not issue verification token." },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Verification link generated successfully.",
        token: result.token,
      });
    }

    return NextResponse.json(
      { success: false, error: "Either token or email is required." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Email verification failed", details: err?.message },
      { status: 500 }
    );
  }
}
