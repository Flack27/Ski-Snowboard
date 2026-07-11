import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Ongeldige datum." }, { status: 400 });
  }
  try {
    const slots = await getAvailableSlots(date);
    return NextResponse.json({ date, slots });
  } catch (e) {
    console.error("availability error", e);
    return NextResponse.json({ error: "Kon beschikbaarheid niet laden." }, { status: 500 });
  }
}
