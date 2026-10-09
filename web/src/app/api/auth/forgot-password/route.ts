import { NextRequest, NextResponse } from "next/server";
import { checkAuthRateLimit, createPasswordResetToken } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkAuthRateLimit(clientIp, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many reset attempts. Please wait a minute before requesting again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const result = createPasswordResetToken(email.trim());

    // We return success and the reset token so testing / immediate flow is verifiable
    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, a password reset token has been issued.",
      resetToken: result.token, // Returned for test & instant reset workflow
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Password reset request failed", details: err?.message },
      { status: 500 }
    );
  }
}

