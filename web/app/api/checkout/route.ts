import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/pocketbase";
import { mollie, isMollieConfigured } from "@/lib/mollie";
import { effectiveCents, centsToMollieValue } from "@/lib/money";
import { getShopSettings } from "@/lib/shopSettings";

export const runtime = "nodejs";

const PB = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

type IncomingItem = { id?: unknown; qty?: unknown };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const items: IncomingItem[] = body?.items;
  const customer = body?.customer ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Winkelwagen is leeg." }, { status: 400 });
  }

  // Re-fetch every product from PocketBase and compute the total SERVER-SIDE.
  // Client-supplied prices are never trusted.
  const lineItems: {
    product_id: string;
    name: string;
    qty: number;
    unit_price_cents: number;
    line_total_cents: number;
  }[] = [];
  let total = 0;

  for (const it of items) {
    const id = String(it?.id ?? "");
    const qty = Math.max(1, Math.floor(Number(it?.qty) || 1));
    if (!id) return NextResponse.json({ error: "Ongeldig artikel." }, { status: 400 });

    const res = await fetch(`${PB}/api/collections/products/records/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Een artikel is niet meer beschikbaar." }, { status: 409 });
    }
    const p = await res.json();
    if (!p.active || (p.stock ?? 0) < qty) {
      return NextResponse.json({ error: `"${p.name}" is niet meer op voorraad.` }, { status: 409 });
    }
    const unit = effectiveCents(p.price, p.sale_price);
    const lineTotal = unit * qty;
    total += lineTotal;
    lineItems.push({ product_id: id, name: p.name, qty, unit_price_cents: unit, line_total_cents: lineTotal });
  }

  if (total <= 0) return NextResponse.json({ error: "Ongeldig totaalbedrag." }, { status: 400 });

  // Fulfilment + shipping (owner-toggleable; cost applied server-side).
  const cust = customer as Record<string, unknown>;
  const shop = await getShopSettings();
  let fulfilment: "pickup" | "shipping" = "pickup";
  if (body?.fulfilment === "shipping" && shop.shippingEnabled) {
    fulfilment = "shipping";
    if (!String(cust.address ?? "").trim() || !String(cust.postal ?? "").trim() || !String(cust.city ?? "").trim()) {
      return NextResponse.json({ error: "Vul je verzendadres in." }, { status: 400 });
    }
    if (shop.shippingPrice > 0) {
      total += shop.shippingPrice;
      lineItems.push({
        product_id: "",
        name: "Verzending",
        qty: 1,
        unit_price_cents: shop.shippingPrice,
        line_total_cents: shop.shippingPrice,
      });
    }
  }

  if (!isMollieConfigured()) {
    return NextResponse.json(
      { error: "Betalingen zijn nog niet geconfigureerd (Mollie test key ontbreekt).", computedTotalCents: total },
      { status: 503 },
    );
  }

  const ref = `SOS-${Date.now().toString(36).toUpperCase()}`;
  let checkoutUrl: string | undefined;
  let paymentId: string | undefined;

  try {
    const payment = await mollie().payments.create({
      amount: { currency: "EUR", value: centsToMollieValue(total) },
      description: `Bestelling ${ref} — Spapens Outdoor & Snow`,
      redirectUrl: `${SITE}/checkout/bedankt?ref=${ref}`,
      webhookUrl: `${SITE}/api/mollie-webhook`,
      metadata: { ref },
    });
    paymentId = payment.id;
    checkoutUrl = payment.getCheckoutUrl() ?? undefined;
  } catch (e) {
    console.error("Mollie payment create failed:", e);
    return NextResponse.json({ error: "Betaling kon niet gestart worden." }, { status: 502 });
  }

  // Record a pending order (the webhook flips it to paid). Best-effort.
  try {
    const pb = await createAdminClient();
    await pb.collection("orders").create({
      ref,
      line_items: lineItems,
      amount: total,
      customer_email: String(cust.email ?? ""),
      customer_name: String(cust.name ?? ""),
      customer_phone: String(cust.phone ?? ""),
      customer_address: String(cust.address ?? ""),
      customer_postal: String(cust.postal ?? ""),
      customer_city: String(cust.city ?? ""),
      mollie_payment_id: paymentId,
      status: "open",
      fulfilment,
    });
  } catch (e) {
    console.error("Order create failed:", e);
  }

  return NextResponse.json({ checkoutUrl });
}
