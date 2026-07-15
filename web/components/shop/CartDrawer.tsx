"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useCart, useCartDrawer, useCartSubtotal } from "@/lib/cart";
import { formatCents } from "@/lib/money";

export function CartDrawer() {
  const open = useCartDrawer((s) => s.open);
  const setOpen = useCartDrawer((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCartSubtotal();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={clsx(
          "fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label="Winkelwagen"
        className={clsx(
          "fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-sm flex-col border-l border-line bg-ink-800 shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-display text-[15px] font-semibold">Winkelwagen</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Sluiten"
            className="text-lg text-fg-dim hover:text-fg"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <p className="text-sm text-fg-dim">Je winkelwagen is leeg.</p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ice hover:text-ice-hover"
            >
              Naar de shop →
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg bg-ink-700">
                    {i.image ? (
                      <Image src={i.image} alt={i.name} fill sizes="64px" className="img-treatment object-contain" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-mono text-[8px] text-fg-faint">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-xs font-semibold leading-snug">{i.name}</span>
                    <span className="mt-0.5 font-mono text-xs text-ice">{formatCents(i.priceCents)}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQty(i.id, i.qty - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-line text-fg-dim hover:text-fg"
                          aria-label="Minder"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-mono text-xs">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(i.id, i.qty + 1)}
                          disabled={i.qty >= i.stock}
                          className="flex h-6 w-6 items-center justify-center rounded border border-line text-fg-dim hover:text-fg disabled:opacity-30"
                          aria-label="Meer"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(i.id)}
                        className="text-[11px] text-fg-faint hover:text-fg"
                      >
                        Verwijder
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-fg-dim">Subtotaal</span>
                <span className="font-mono font-semibold text-ice">{formatCents(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="block w-full rounded-ctl bg-ice py-3 text-center font-display text-sm font-semibold text-on-ice transition-colors hover:bg-ice-hover"
              >
                Afrekenen
              </Link>
              <p className="mt-2 text-center font-mono text-[10px] text-fg-faint">
                🔒 Veilig betalen · iDEAL via Mollie
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
