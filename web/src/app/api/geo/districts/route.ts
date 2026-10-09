import { NextRequest, NextResponse } from "next/server";
import { getDistrictsByState } from "@/lib/indiaGeoData";
import districtsData from "../../../../../../data/india/districts.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get("stateId");

    const districts = stateId
      ? getDistrictsByState(stateId)
      : districtsData;

    return NextResponse.json({
      success: true,
      count: districts.length,
      data: districts,
      source: "Local Government Directory (LGD), Ministry of Panchayati Raj",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch districts" },
      { status: 500 }
    );
  }
}
