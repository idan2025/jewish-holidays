import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const geonameid = searchParams.get("geonameid") || "281184";
  const date = searchParams.get("date") || "now";

  try {
    const url = `https://www.hebcal.com/zmanim?cfg=json&geonameid=${geonameid}&date=${date}`;
    const res = await fetch(url);
    
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch zmanim" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
