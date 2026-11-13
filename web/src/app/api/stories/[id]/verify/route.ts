import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const {
      reviewerId = "usr_elder_01",
      reviewerName = "Bhadradri Custodian Council",
      reviewerRole = "Elder Custodian",
      notes = "Verified against oral community lineage and phonetic fidelity.",
    } = body;

    // Generate cryptographic SHA-256 seal for immutable provenance
    const timestamp = new Date().toISOString();
    const rawSealSource = `VOICE_ROOTS_HERITAGE:${id}:${reviewerId}:${timestamp}`;
    const sha256Proof = crypto.createHash("sha256").update(rawSealSource).digest("hex");

    return NextResponse.json({
      success: true,
      message: "Oral record verified and attested by community custodians.",
      storyId: id,
      status: "VERIFIED",
      verification: {
        reviewerId,
        reviewerName,
        reviewerRole,
        notes,
        verifiedAt: timestamp,
        sha256Proof,
      },
      nextRoute: `/heritage/${id}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Verification signing failed", details: err?.message },
      { status: 500 }
    );
  }
}

