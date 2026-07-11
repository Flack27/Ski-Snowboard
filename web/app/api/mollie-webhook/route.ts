import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { mollie } from "@/lib/mollie";
import { createAdminClient } from "@/lib/pocketbase";
import { sendOrderNotification, sendOrderConfirmation, type OrderMail } from "@/lib/mail";

export const runtime = "nodejs";

// Mollie calls this on every payment status change. We never trust the request
// body — we re-fetch the authoritative status from Mollie by id.
export async function POST(req: Request) {
  let paymentId = "";
  try {
    const form = await req.formData();
    paymentId = String(form.get("id") ?? "");
  } catch {
    try {
      const body = await req.json();
      paymentId = String(body?.id ?? "");
    } catch {
      /* ignore */
    }
  }
  if (!paymentId) return NextResponse.json({ ok: true });

  try {
    const payment = await mollie().payments.get(paymentId);
    const status = payment.status; // paid | failed | expired | canceled | open | pending
    const pb = await createAdminClient();

    let order;
    try {
      order = await pb.collection("orders").getFirstListItem(`mollie_payment_id="${paymentId}"`);
    } catch {
      return NextResponse.json({ ok: true }); // no matching order → acknowledge
    }

    // Idempotent: if already finalised as paid, do nothing.
    if (order.status === "paid") return NextResponse.json({ ok: true });

    if (status === "paid") {
      // Decrement stock / mark one-of-a-kind items sold.
      const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
      for (const li of lineItems) {
        if (!li?.product_id) continue;
        try {
          const prod = await pb.collection("products").getOne(li.product_id);
          const newStock = Math.max(0, (prod.stock ?? 0) - (li.qty ?? 1));
          await pb.collection("products").update(li.product_id, {
            stock: newStock,
            active: newStock > 0 ? prod.active : false,
          });
        } catch {
          /* product may have been deleted — skip */
        }
      }
      await pb.collection("orders").update(order.id, { status: "paid" });
      const orderMail = order as unknown as OrderMail;
      await Promise.allSettled([sendOrderNotification(orderMail), sendOrderConfirmation(orderMail)]);
      try {
        revalidateTag("products");
      } catch {
        /* ignore */
      }
    } else if (status === "failed" || status === "expired" || status === "canceled") {
      await pb.collection("orders").update(order.id, { status });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("mollie-webhook error", e);
    // 500 → Mollie retries (good for transient errors like PB being briefly down).
    return NextResponse.json({ error: "webhook error" }, { status: 500 });
  }
}
