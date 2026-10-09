import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { action, currentStatus = "DRAFT", payload = {} } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required for workflow transition." },
        { status: 400 }
      );
    }

    switch (action) {
      case "SUBMIT_AUDIO":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "PROCESSING",
          nextRoute: `/process/${id}`,
        });

      case "COMPLETE_PROCESSING":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "TRANSCRIBED",
          nextRoute: `/transcript/${id}`,
        });

      case "CONFIRM_TRANSCRIPT":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "TRANSCRIPT_REVIEW",
          nextRoute: `/translate/${id}`,
        });

      case "SAVE_TRANSLATION":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "TRANSLATED",
          nextRoute: `/cultural-context/${id}`,
        });

      case "ADD_CULTURAL_CONTEXT":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "CULTURAL_CONTEXT",
          nextRoute: `/consent/${id}`,
        });

      case "GRANT_CONSENT":
        if (!payload.consentGranted) {
          return NextResponse.json(
            { error: "Community and speaker consent must be granted to proceed." },
            { status: 400 }
          );
        }
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "CONSENT_PENDING",
          nextRoute: `/verification/${id}`,
        });

      case "APPROVE_VERIFICATION":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "VERIFIED",
          nextRoute: `/heritage/${id}`,
        });

      case "CREATE_HERITAGE_RECORD":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "HERITAGE_RECORD",
          nextRoute: `/passport/${id}`,
        });

      case "CREATE_PASSPORT":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "PASSPORT_CREATED",
          nextRoute: `/passport/${id}`,
        });

      case "PUBLISH":
        return NextResponse.json({
          success: true,
          storyId: id,
          newStatus: "PUBLISHED",
          nextRoute: `/heritage/${id}/public`,
        });

      default:
        return NextResponse.json(
          { error: `Unrecognized action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process workflow transition", details: err?.message },
      { status: 500 }
    );
  }
}

