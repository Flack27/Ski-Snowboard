"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { Container } from "@/components/layout/Container";
import { useCart, useCartSubtotal } from "@/lib/cart";
import { formatCents } from "@/lib/money";

const inputCls =
  "w-full rounded-ctl border border-line bg-ink-800 px-3.5 py-3 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-ice focus:ring-2 focus:ring-ice/20";

export function CheckoutForm({
  shippingEnabled,
  shippingPrice,
  onlineEnabled,
  pickupEnabled,
}: {
  shippingEnabled: boolean;
  shippingPrice: number;
  onlineEnabled: boolean;
  pickupEnabled: boolean;
}) {
  const items = useCart((s) => s.items);
  const subtotal = useCartSubtotal();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", postal: "", city: "" });
  const [fulfilment, setFulfilment] = useState<"pickup" | "shipping">("pickup");
  const [method, setMethod] = useState<"online" | "pickup">(onlineEnabled ? "online" : "pickup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bothMethods = onlineEnabled && pickupEnabled;
  const payOnline = onlineEnabled && (method === "online" || !pickupEnabled);
  const shipping = shippingEnabled && fulfilment === "shipping" ? shippingPrice : 0;
  const total = subtotal + shipping;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          customer: form,
          fulfilment,
          paymentMethod: payOnline ? "online" : "pickup",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setError(data.error ?? "Er ging iets mis bij het starten van de betaling.");
    } catch {
      setError("Kon geen verbinding maken. Probeer het opnieuw.");
    }
    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <Container className="py-20">
        <h1 className="mb-4 font-display text-2xl font-semibold">Afrekenen</h1>
        <p className="text-fg-dim">
          Je winkelwagen is leeg.{" "}
          <Link href="/shop" className="text-ice hover:text-ice-hover">
            Naar de shop →
          </Link>
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-16 md:py-20">
      <h1 className="mb-8 font-display text-3xl font-semibold md:text-4xl">Afrekenen</h1>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={submit} className="order-2 lg:order-1">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ice">Gegevens</div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-fg-muted">Naam *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Voor- en achternaam" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-fg-muted">E-mailadres *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jij@voorbeeld.nl" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-fg-muted">Telefoon (optioneel)</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="06 …" className={inputCls} />
            </div>
          </div>

          {shippingEnabled ? (
            <>
              <div className="mb-3 mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ice">Bezorging</div>
              <div className="flex flex-col gap-2">
                {(["pickup", "shipping"] as const).map((m) => (
                  <label
                    key={m}
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 rounded-ctl border px-4 py-3 text-sm",
                      fulfilment === m ? "border-ice bg-ice/5" : "border-line",
                    )}
                  >
                    <input type="radio" name="fulfilment" checked={fulfilment === m} onChange={() => setFulfilment(m)} className="accent-ice" />
                    <span className="flex-1 font-medium text-fg">
                      {m === "pickup" ? "Ophalen in Hilvarenbeek" : "Verzenden"}
                    </span>
                    <span className="font-mono text-fg-dim">
                      {m === "pickup" ? "gratis" : formatCents(shippingPrice)}
                    </span>
                  </label>
                ))}
              </div>
              {fulfilment === "shipping" && (
                <div className="mt-4 flex flex-col gap-4">
                  <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Straat + huisnummer *" className={inputCls} />
                  <div className="grid grid-cols-[1fr_2fr] gap-4">
                    <input required value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} placeholder="Postcode *" className={inputCls} />
                    <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Plaats *" className={inputCls} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-card border border-ice/20 bg-ice/5 px-4 py-3 text-sm text-fg-muted">
              <span className="font-semibold text-fg">Ophalen · gratis</span> — je haalt je
              bestelling op in Hilvarenbeek. We laten je weten wanneer het klaarstaat.
            </div>
          )}

          {bothMethods && (
            <>
              <div className="mb-3 mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ice">
                Betaalmethode
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className={clsx(
                    "flex cursor-pointer items-center gap-3 rounded-ctl border px-4 py-3 text-sm",
                    method === "online" ? "border-ice bg-ice/5" : "border-line",
                  )}
                >
                  <input type="radio" name="method" checked={method === "online"} onChange={() => setMethod("online")} className="accent-ice" />
                  <span className="flex-1 font-medium text-fg">Online betalen</span>
                  <span className="font-mono text-fg-dim">iDEAL e.a.</span>
                </label>
                <label
                  className={clsx(
                    "flex cursor-pointer items-center gap-3 rounded-ctl border px-4 py-3 text-sm",
                    method === "pickup" ? "border-ice bg-ice/5" : "border-line",
                  )}
                >
                  <input type="radio" name="method" checked={method === "pickup"} onChange={() => setMethod("pickup")} className="accent-ice" />
                  <span className="flex-1 font-medium text-fg">Betalen bij ophalen</span>
                  <span className="font-mono text-fg-dim">in de winkel</span>
                </label>
              </div>
            </>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-ctl bg-ice py-3.5 font-display text-sm font-semibold text-on-ice transition-colors hover:bg-ice-hover disabled:opacity-60"
          >
            {loading
              ? "Bezig…"
              : payOnline
                ? `Betaal ${formatCents(total)}`
                : `Reserveren — betaal ${formatCents(total)} bij ophalen`}
          </button>
          <p className="mt-3 text-center font-mono text-[10px] text-fg-faint">
            {payOnline
              ? "🔒 Veilig via Mollie · iDEAL, creditcard & Bancontact"
              : "Je bestelling wordt gereserveerd — betaal bij het ophalen in Hilvarenbeek."}
          </p>
        </form>

        <aside className="order-1 h-fit rounded-card border border-line bg-ink-700 p-6 lg:order-2">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">Overzicht</div>
          <ul className="flex flex-col gap-4">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-lg bg-ink-800">
                  {i.image ? (
                    <Image src={i.image} alt={i.name} fill sizes="48px" className="img-treatment object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold leading-snug">{i.name}</div>
                  <div className="font-mono text-[11px] text-fg-dim">Aantal: {i.qty}</div>
                </div>
                <span className="font-mono text-xs">{formatCents(i.priceCents * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-line pt-4">
            <div className="flex justify-between text-sm text-fg-dim">
              <span>Subtotaal</span>
              <span className="font-mono">{formatCents(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-fg-dim">
              <span>{shippingEnabled && fulfilment === "shipping" ? "Verzending" : "Ophalen"}</span>
              <span className="font-mono">{shipping > 0 ? formatCents(shipping) : "gratis"}</span>
            </div>
            <div className="flex justify-between pt-1 font-display text-base font-semibold">
              <span>Totaal</span>
              <span className="font-mono text-ice">{formatCents(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
