import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchAirQualityBySido, fetchAllSidoSummary } from "@/lib/airquality";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sido = searchParams.get("sido");

  if (sido) {
    const data = await fetchAirQualityBySido(sido);
    return NextResponse.json(data);
  } else {
    const data = await fetchAllSidoSummary();
    return NextResponse.json(data);
  }
}
