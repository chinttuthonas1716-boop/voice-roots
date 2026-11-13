import { NextResponse } from "next/server";
import { HERITAGE_STORIES } from "@/lib/heritageData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const status = searchParams.get("status");

  let stories = [...HERITAGE_STORIES];

  if (language && language !== "all") {
    stories = stories.filter(
      (s) => s.language.toLowerCase() === language.toLowerCase()
    );
  }

  return NextResponse.json({
    success: true,
    count: stories.length,
    stories: stories.map((s) => ({
      ...s,
      workflowStatus: "PUBLISHED",
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, sourceType = "microphone_recording", language = "Telugu" } = body;

    const newStoryId = `VR-${Date.now().toString(36).toUpperCase()}`;

    const newWorkflow = {
      id: newStoryId,
      title: title || `${language} Oral Heritage Recording`,
      status: "DRAFT",
      sourceType,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Preservation workflow initiated.",
      workflow: newWorkflow,
      nextRoute: `/record`,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to initiate preservation workflow", details: err?.message },
      { status: 500 }
    );
  }
}

