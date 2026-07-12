import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/pocketbase";
import { mollieFromKey, isMollieKey } from "@/lib/mollie";
import { effectiveCents, centsToMollieValue } from "@/lib/money";
import { getShopSettings } from "@/lib/shopSettings";
import { getPaymentSettings } from "@/lib/paymentSettings";
import { sendReservationNotification, sendReservationConfirmation } from "@/lib/mail";

export const runtime = "nodejs";

const PB = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

type IncomingItem = { id?: unknown; qty?: unknown };
type LineItem = {
  product_id: string;
  name: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const items: IncomingItem[] = body?.items;
  const cust = (body?.customer ?? {}) as Record<string, unknown>;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Winkelwagen is leeg." }, { status: 400 });
  }

  // Re-fetch every product and compute the total SERVER-SIDE (client prices ignored).
  const lineItems: LineItem[] = [];
  let total = 0;
  for (const it of items) {
    const id = String(it?.id ?? "");
    const qty = Math.max(1, Math.floor(Number(it?.qty) || 1));
    if (!id) return NextResponse.json({ error: "Ongeldig artikel." }, { status: 400 });
    const res = await fetch(`${PB}/api/collections/products/records/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "Een artikel is niet meer beschikbaar." }, { status: 409 });
    const p = await res.json();
    if (!p.active || (p.stock ?? 0) < qty) {
      return NextResponse.json({ error: `"${p.name}" is niet meer op voorraad.` }, { status: 409 });
    }
    const unit = effectiveCents(p.price, p.sale_price);
    total += unit * qty;
    lineItems.push({ product_id: id, name: p.name, qty, unit_price_cents: unit, line_total_cents: unit * qty });
  }
  if (total <= 0) return NextResponse.json({ error: "Ongeldig totaalbedrag." }, { status: 400 });

  // Fulfilment + shipping.
  const shop = await getShopSettings();
  let fulfilment: "pickup" | "shipping" = "pickup";
  if (body?.fulfilment === "shipping" && shop.shippingEnabled) {
    fulfilment = "shipping";
    if (!String(cust.address ?? "").trim() || !String(cust.postal ?? "").trim() || !String(cust.city ?? "").trim()) {
      return NextResponse.json({ error: "Vul je verzendadres in." }, { status: 400 });
    }
    if (shop.shippingPrice > 0) {
      total += shop.shippingPrice;
      lineItems.push({ product_id: "", name: "Verzending", qty: 1, unit_price_cents: shop.shippingPrice, line_total_cents: shop.shippingPrice });
    }
  }

  // Payment method (owner-controlled in PocketBase).
  const pay = await getPaymentSettings();
  const onlineOk = pay.onlineEnabled && isMollieKey(pay.mollieKey);
  let method: "online" | "pickup";
  if (body?.paymentMethod === "online" && onlineOk) method = "online";
  else if (pay.pickupEnabled) method = "pickup";
  else if (onlineOk) method = "online";
  else return NextResponse.json({ error: "Er is momenteel geen betaalmethode beschikbaar." }, { status: 503 });

  const baseCustomer = {
    customer_email: String(cust.email ?? ""),
    customer_name: String(cust.name ?? ""),
    customer_phone: String(cust.phone ?? ""),
    customer_address: String(cust.address ?? ""),
    customer_postal: String(cust.postal ?? ""),
    customer_city: String(cust.city ?? ""),
  };
  const ref = `SOS-${Date.now().toString(36).toUpperCase()}`;

  // ── ONLINE: Mollie payment; stock decremented on "paid" webhook ──
  if (method === "online") {
    let checkoutUrl: string | undefined;
    let paymentId: string | undefined;
    try {
      const payment = await mollieFromKey(pay.mollieKey).payments.create({
        amount: { currency: "EUR", value: centsToMollieValue(total) },
        description: `Bestelling ${ref} — Spapens Outdoor & Snow`,
        redirectUrl: `${SITE}/checkout/bedankt?ref=${ref}`,
        webhookUrl: `${SITE}/api/mollie-webhook`,
        metadata: { ref },
      });
      paymentId = payment.id;
      checkoutUrl = payment.getCheckoutUrl() ?? undefined;
    } catch (e) {
      console.error("Mollie create failed", e);
      return NextResponse.json({ error: "Betaling kon niet gestart worden." }, { status: 502 });
    }
    try {
      const pb = await createAdminClient();
      await pb.collection("orders").create({
        ref, line_items: lineItems, amount: total, ...baseCustomer,
        mollie_payment_id: paymentId, status: "open", fulfilment,
      });
    } catch (e) {
      console.error("order create failed", e);
    }
    return NextResponse.json({ checkoutUrl });
  }

  // ── PICKUP: reserve the item(s), pay in person on collection ──
  try {
    const pb = await createAdminClient();
    for (const li of lineItems) {
      if (!li.product_id) continue;
      try {
        const prod = await pb.collection("products").getOne(li.product_id);
        const newStock = Math.max(0, (prod.stock ?? 0) - li.qty);
        await pb.collection("products").update(li.product_id, {
          stock: newStock,
          active: newStock > 0 ? prod.active : false,
        });
      } catch {
        /* product gone — skip */
      }
    }
    await pb.collection("orders").create({
      ref, line_items: lineItems, amount: total, ...baseCustomer,
      mollie_payment_id: "", status: "reserved", fulfilment,
    });
    const orderMail = { ref, amount: total, ...baseCustomer, fulfilment, line_items: lineItems };
    await Promise.allSettled([sendReservationNotification(orderMail), sendReservationConfirmation(orderMail)]);
    try {
      revalidateTag("products");
    } catch {
      /* ignore */
    }
  } catch (e) {
    console.error("reservation failed", e);
    return NextResponse.json({ error: "Reservering kon niet geplaatst worden." }, { status: 500 });
  }
  return NextResponse.json({ checkoutUrl: `${SITE}/checkout/bedankt?ref=${ref}&type=reserved` });
}
