import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const passportId = `PASS-${id.toUpperCase()}`;
    const issuedAt = new Date().toISOString();
    const qrCodeUrl = `/heritage/${id}/public`;

    return NextResponse.json({
      success: true,
      message: "Living Heritage Passport successfully issued.",
      passport: {
        passportId,
        storyId: id,
        issuedAt,
        qrCodeUrl,
        standard: "ISO 639-3 & UNESCO Living Heritage",
        status: "ACTIVE",
      },
      nextRoute: `/passport/${id}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to generate passport", details: err?.message },
      { status: 500 }
    );
  }
}

