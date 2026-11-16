import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/pocketbase";
import { getAvailableSlots, isDuplicateSlotError, parseBookingRequest } from "@/lib/booking";
import { getServices } from "@/lib/services";
import { sendBookingNotification, sendBookingConfirmation } from "@/lib/mail";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

const SLOT_TAKEN = "Dit tijdslot is net bezet. Kies een ander.";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot → fake success

  // Services are editable in the admin, so validate against the live list.
  const parsed = parseBookingRequest(b, await getServices());
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { name, email, phone, note, date, time_slot, service } = parsed.value;

  if (!(await verifyTurnstile(b.turnstileToken))) {
    return NextResponse.json({ error: "Verificatie mislukt. Probeer opnieuw." }, { status: 400 });
  }

  // Re-check the slot is still free (defends against races).
  const available = await getAvailableSlots(date);
  if (!available.includes(time_slot)) {
    return NextResponse.json({ error: SLOT_TAKEN }, { status: 409 });
  }

  const ref = `AFS-${Date.now().toString(36).toUpperCase()}`;
  // The service is stored and mailed by its name — that's what the owner reads.
  const mail = { ref, name, email, phone, service: service.name, date, time_slot, note };

  try {
    const pb = await createAdminClient();
    await pb.collection("bookings").create({
      ...mail,
      date: `${date} 00:00:00.000Z`,
      status: "nieuw",
    });
  } catch (e) {
    if (isDuplicateSlotError(e)) {
      return NextResponse.json({ error: SLOT_TAKEN }, { status: 409 });
    }
    console.error("booking create failed", e);
    return NextResponse.json(
      { error: "Er ging iets mis bij het opslaan. Probeer het opnieuw of bel ons even." },
      { status: 500 },
    );
  }

  await Promise.allSettled([sendBookingNotification(mail), sendBookingConfirmation(mail)]);
  return NextResponse.json({ ok: true, ref });
}
