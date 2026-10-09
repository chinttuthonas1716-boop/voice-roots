import { NextRequest, NextResponse } from "next/server";
import { getAudioTrack, saveAudioTrack, StoredAudioTrack } from "@/lib/ttsProvider";
import { HERITAGE_STORIES } from "@/lib/heritageData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const targetLang = searchParams.get("targetLang") || "en";

    // In a full database environment, query audio_tracks table
    const existing = getAudioTrack(id, targetLang);
    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
      });
    }

    const story = HERITAGE_STORIES.find((s) => s.id === id);
    const textToSpeak = story?.translations
      ? (story.translations as any)[targetLang] || story.originalTranscript
      : "Oral narrative preserved in native acoustic tongue.";

    const fallbackTrack: StoredAudioTrack = {
      id: `track-${id}-${targetLang}`,
      storyId: id,
      type: "TRANSLATED",
      language: targetLang,
      languageCode: targetLang,
      sourceLanguage: story?.language || "Telugu",
      sourceLanguageCode: "te",
      audioUrl: `/api/stories/tts-stream?text=${encodeURIComponent(textToSpeak.slice(0, 150))}&lang=${targetLang}`,
      duration: "03:15",
      durationSeconds: 195,
      provider: "VoiceRoots-Neural-TTS",
      voice: `${targetLang.toUpperCase()} Custodian Voice`,
      status: "READY",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: fallbackTrack,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch audio track" },
      { status: 500 }
    );
  }
}
