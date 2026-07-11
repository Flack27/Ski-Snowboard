import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/pocketbase";
import { getAvailableSlots } from "@/lib/booking";
import { sendBookingNotification, sendBookingConfirmation } from "@/lib/mail";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

const VALID_SERVICES = ["waxen", "slijpen", "waxen-slijpen", "onderhoud"];

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot → fake success

  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim();
  const service = String(b.service || "");
  const date = String(b.date || "");
  const time_slot = String(b.time_slot || "");

  if (!name || !email || !date || !time_slot || !VALID_SERVICES.includes(service)) {
    return NextResponse.json({ error: "Vul alle verplichte velden in." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Ongeldige datum." }, { status: 400 });
  }
  if (!(await verifyTurnstile(b.turnstileToken))) {
    return NextResponse.json({ error: "Verificatie mislukt. Probeer opnieuw." }, { status: 400 });
  }

  // Re-check the slot is still free (defends against races).
  const available = await getAvailableSlots(date);
  if (!available.includes(time_slot)) {
    return NextResponse.json({ error: "Dit tijdslot is net bezet. Kies een ander." }, { status: 409 });
  }

  const ref = `AFS-${Date.now().toString(36).toUpperCase()}`;
  const mail = {
    ref,
    name,
    email,
    phone: String(b.phone || ""),
    service,
    date,
    time_slot,
    note: String(b.note || ""),
  };

  try {
    const pb = await createAdminClient();
    await pb.collection("bookings").create({
      ...mail,
      date: `${date} 00:00:00.000Z`,
      status: "nieuw",
    });
  } catch (e) {
    console.error("booking create failed", e);
    // Unique (date, time_slot) index → someone booked it first.
    return NextResponse.json({ error: "Dit tijdslot is net bezet. Kies een ander." }, { status: 409 });
  }

  await Promise.allSettled([sendBookingNotification(mail), sendBookingConfirmation(mail)]);
  return NextResponse.json({ ok: true, ref });
}
