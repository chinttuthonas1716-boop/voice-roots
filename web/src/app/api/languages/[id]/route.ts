import { NextRequest, NextResponse } from "next/server";
import { getLanguageById, getLanguageVarieties } from "@/lib/indiaGeoData";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const language = getLanguageById(id);

    if (!language) {
      return NextResponse.json(
        { success: false, error: `Language with ID '${id}' not found` },
        { status: 404 }
      );
    }

    const varieties = getLanguageVarieties(language.id);

    return NextResponse.json({
      success: true,
      data: {
        ...language,
        varieties,
      },
      source: "Census of India 2011 Table C-16: Population by Mother Tongue",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch language" },
      { status: 500 }
    );
  }
}
