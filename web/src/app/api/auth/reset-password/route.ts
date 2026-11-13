import { NextRequest, NextResponse } from "next/server";
import { checkAuthRateLimit, resetServerUserPassword } from "@/lib/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkAuthRateLimit(clientIp, 6, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many attempts. Please wait before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const result = resetServerUserPassword(token, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Password reset failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now log in with your new password.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Password update failed", details: err?.message },
      { status: 500 }
    );
  }
}

