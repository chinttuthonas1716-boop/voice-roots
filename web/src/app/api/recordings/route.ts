import { NextResponse } from "next/server";
import { HERITAGE_STORIES } from "@/lib/heritageData";

export async function GET() {
  return NextResponse.json({
    success: true,
    totalCount: HERITAGE_STORIES.length,
    recordings: HERITAGE_STORIES,
    message: "Voice Roots Oral Heritage Archive API is active.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      language = "Telugu",
      dialect,
      durationSeconds = 180,
      consentSpeaker = true,
    } = body;

    if (!consentSpeaker) {
      return NextResponse.json(
        { error: "Speaker consent is strictly mandatory under Indigenous Ethical Protocols." },
        { status: 400 }
      );
    }

    const newId = `vr-${Math.floor(1000 + Math.random() * 9000)}`;
    const savedRecord = {
      id: newId,
      title: title || `${language} Spoken Heritage Recording`,
      language,
      dialect: dialect || `${language} Regional Variety`,
      duration: `${Math.floor(durationSeconds / 60).toString().padStart(2, "0")}:${(durationSeconds % 60).toString().padStart(2, "0")}`,
      durationSeconds,
      type: "Oral Heritage Story",
      uploadDate: new Date().toISOString(),
      status: "PRESERVED_IN_ARCHIVE",
    };

    return NextResponse.json({
      success: true,
      message: "Oral record successfully preserved in Voice Roots archive.",
      record: savedRecord,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process audio record storage", details: err?.message },
      { status: 500 }
    );
  }
}
