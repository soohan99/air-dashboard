import { NextResponse } from "next/server";
import { initDB, initGuestbook } from "@/lib/db";

export async function GET() {
  try {
    await initDB();
    await initGuestbook();
    return NextResponse.json({ success: true, message: "DB initialized" });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
