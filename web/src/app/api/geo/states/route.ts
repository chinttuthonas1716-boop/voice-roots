import { NextResponse } from "next/server";
import { getAllStates } from "@/lib/indiaGeoData";

export async function GET() {
  try {
    const states = getAllStates();
    return NextResponse.json({
      success: true,
      count: states.length,
      data: states,
      source: "Local Government Directory (LGD), Ministry of Panchayati Raj",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch states" },
      { status: 500 }
    );
  }
}
