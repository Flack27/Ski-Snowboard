import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/mail";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot → fake success

  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim();
  const message = String(b.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }
  if (!(await verifyTurnstile(b.turnstileToken))) {
    return NextResponse.json({ error: "Verificatie mislukt. Probeer opnieuw." }, { status: 400 });
  }

  try {
    const r = await sendContactMessage({ name, email, message });
    return NextResponse.json({ ok: true, mailed: "sent" in r });
  } catch (e) {
    console.error("contact send failed", e);
    return NextResponse.json({ error: "Kon bericht niet versturen. Probeer het later opnieuw." }, { status: 500 });
  }
}
