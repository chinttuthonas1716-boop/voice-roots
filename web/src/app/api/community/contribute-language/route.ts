import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      languageName,
      nativeName,
      community,
      stateId,
      districtId,
      localityName,
      evidenceSource,
      contributorNotes,
    } = body;

    if (!languageName || !stateId) {
      return NextResponse.json(
        { success: false, error: "languageName and stateId are required fields" },
        { status: 400 }
      );
    }

    const contribution = {
      id: `comm-contrib-${Date.now().toString(36)}`,
      languageName,
      nativeName: nativeName || languageName,
      community: community || "Local Community Custodians",
      stateId,
      districtId: districtId || null,
      localityName: localityName || null,
      evidenceSource: evidenceSource || "Oral Community Report",
      contributorNotes: contributorNotes || "",
      verificationStatus: "PENDING_REVIEW",
      provenance: "COMMUNITY_REPORTED",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Community language relationship submitted for human review. Status: PENDING_REVIEW.",
      data: contribution,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit contribution" },
      { status: 500 }
    );
  }
}
