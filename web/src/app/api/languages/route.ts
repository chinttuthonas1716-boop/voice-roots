import { NextRequest, NextResponse } from "next/server";
import { 
  getAllLanguages, 
  searchLanguages, 
  getMotherTonguesByLanguage,
  getAllMotherTongues 
} from "@/lib/indiaGeoData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const status = searchParams.get("status"); // SCHEDULED_8 or NON_SCHEDULED
    const recordedOnly = searchParams.get("recorded") === "true";
    const scheduledOnly = searchParams.get("scheduled") === "true";
    const nonScheduledOnly = searchParams.get("nonScheduled") === "true";
    const includeMotherTongues = searchParams.get("includeMotherTongues") === "true";

    let results = query ? searchLanguages(query) : getAllLanguages();

    if (status) {
      results = results.filter((l) => l.officialStatus === status);
    }
    if (scheduledOnly) {
      results = results.filter((l) => l.isScheduled || l.officialStatus === "SCHEDULED_8");
    }
    if (nonScheduledOnly) {
      results = results.filter((l) => !l.isScheduled && l.officialStatus !== "SCHEDULED_8");
    }
    if (recordedOnly) {
      results = results.filter((l) => l.hasRecording);
    }

    let payload: any[] = results;
    if (includeMotherTongues) {
      payload = results.map((lang) => ({
        ...lang,
        motherTongues: getMotherTonguesByLanguage(lang.censusCode || lang.name),
      }));
    }

    return NextResponse.json({
      success: true,
      count: payload.length,
      data: payload,
      metadata: {
        source: "Office of the Registrar General & Census Commissioner, India",
        dataset: "C-16: Population by Mother Tongue, India, 2011",
        reference: "PC11_C16-00",
        censusYear: 2011,
        totalLanguagesInCensus: 121,
        scheduledLanguagesCount: 22,
        nonScheduledLanguagesCount: 99,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch languages" },
      { status: 500 }
    );
  }
}
