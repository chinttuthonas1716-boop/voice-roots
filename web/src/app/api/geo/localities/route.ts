import { NextRequest, NextResponse } from "next/server";
import { getLocalitiesBySubdistrict } from "@/lib/indiaGeoData";
import localitiesData from "../../../../../../data/india/localities.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdistrictId = searchParams.get("subdistrictId");
    const query = searchParams.get("q");

    let results = subdistrictId
      ? getLocalitiesBySubdistrict(subdistrictId)
      : (localitiesData as any[]);

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.officialCode.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
      source: "Local Government Directory (LGD), Ministry of Panchayati Raj",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch localities" },
      { status: 500 }
    );
  }
}
