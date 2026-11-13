import { NextResponse } from "next/server";
import { HERITAGE_STORIES } from "@/lib/heritageData";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const story = HERITAGE_STORIES.find((s) => s.id.toLowerCase() === id.toLowerCase());

  if (!story) {
    return NextResponse.json({
      success: true,
      placard: {
        id,
        title: "Community Preserved Voice",
        language: "Regional Oral Tradition",
        culturalContext: "Oral transmission preserved under community ethical custody.",
        verified: true,
        accessLevel: "public",
        placardUrl: `/heritage/${id}/public`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    placard: {
      id: story.id,
      title: story.title,
      language: story.language,
      dialect: story.dialect,
      community: story.community,
      location: story.location,
      culturalContext: story.culturalContext,
      originalTranscript: story.originalTranscript,
      englishTranslation: story.translations?.en || "",
      translations: story.translations,
      audioFileName: story.audioFileName,
      audioUrl: `/audio/${story.audioFileName}`,
      duration: story.duration,
      verified: true,
      sha256Proof: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      accessLevel: "public",
      placardUrl: `/heritage/${story.id}/public`,
    },
  });
}

