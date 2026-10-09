import { NextRequest, NextResponse } from "next/server";
import { getSubdistrictsByDistrict } from "@/lib/indiaGeoData";
import subdistrictsData from "../../../../../../data/india/subdistricts.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("districtId");

    const subdistricts = districtId
      ? getSubdistrictsByDistrict(districtId)
      : subdistrictsData;

    return NextResponse.json({
      success: true,
      count: subdistricts.length,
      data: subdistricts,
      source: "Local Government Directory (LGD), Ministry of Panchayati Raj",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch subdistricts" },
      { status: 500 }
    );
  }
}
