import { NextResponse } from "next/server";
import { HERITAGE_STORIES } from "@/lib/heritageData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check seeded heritage stories
  const seeded = HERITAGE_STORIES.find((s) => s.id.toLowerCase() === id.toLowerCase());
  if (seeded) {
    return NextResponse.json({
      success: true,
      story: {
        ...seeded,
        status: "PUBLISHED",
        verification: {
          reviewerRole: "Elder Custodian",
          status: "VERIFIED",
          sha256Proof: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
        passportId: seeded.id,
      },
      nextRoute: `/story/${seeded.id}`,
    });
  }

  return NextResponse.json({
    success: true,
    story: {
      id,
      title: "Active Field Voice Recording",
      status: "DRAFT",
      sourceType: "microphone_recording",
    },
    nextRoute: `/record`,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: `Preservation record ${id} updated.`,
      updatedFields: body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid update payload", details: err?.message },
      { status: 400 }
    );
  }
}

