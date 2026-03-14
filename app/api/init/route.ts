import { NextResponse } from "next/server";
import { initDB } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    return NextResponse.json({ success: true, message: "DB initialized" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
