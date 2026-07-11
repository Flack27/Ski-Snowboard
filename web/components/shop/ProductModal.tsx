"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useProductModal } from "@/lib/productModal";
import { useCart, useCartDrawer } from "@/lib/cart";
import { formatCents, effectiveCents, discountPct } from "@/lib/money";
import { CATEGORIES } from "@/lib/site";

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
);

export function ProductModal() {
  const item = useProductModal((s) => s.item);
  const close = useProductModal((s) => s.close);
  const add = useCart((s) => s.add);
  const openDrawer = useCartDrawer((s) => s.setOpen);
  const qtyInCart = useCart((s) =>
    item ? (s.items.find((i) => i.id === item.product.id)?.qty ?? 0) : 0,
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [item?.product.id]);

  useEffect(() => {
    document.body.style.overflow = item ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [item, close]);

  if (!item) return null;
  const p = item.product;
  const eff = effectiveCents(p.price, p.sale_price);
  const onSale = p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
  const pct = discountPct(p.price, p.sale_price);
  const soldOut = p.stock <= 0;
  const maxedOut = qtyInCart >= p.stock;

  const specs: [string, string][] = [];
  if (p.brand) specs.push(["Merk", p.brand]);
  if (p.size) specs.push(["Maat", p.size]);
  if (p.category) specs.push(["Categorie", CATEGORY_LABELS[p.category] ?? p.category]);

  function addToCart() {
    add({
      id: p.id,
      name: p.name,
      priceCents: eff,
      regularCents: p.price,
      image: item!.images[0] ?? null,
      slug: p.slug,
      stock: p.stock,
    });
    openDrawer(true);
    close();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={close} aria-hidden />
      <div
        role="dialog"
        aria-label={p.name}
        className="relative z-10 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-line bg-ink-800 shadow-2xl md:flex-row"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Sluiten"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/70 text-fg-dim hover:text-fg"
        >
          ✕
        </button>

        {/* gallery */}
        <div className="flex flex-col gap-3 p-4 md:w-1/2 md:p-5">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-ink-900">
            {item.images.length ? (
              <Image
                src={item.images[active]}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="img-treatment object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-xs text-fg-faint">
                Foto volgt
              </div>
            )}
            {onSale && !soldOut && (
              <span className="absolute left-3 top-3 rounded-md bg-ice px-2 py-1 font-mono text-[9px] font-semibold uppercase text-on-ice">
                {pct ? `−${pct}%` : "Sale"}
              </span>
            )}
          </div>
          {item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {item.images.map((img, i) => (
                <button
                  type="button"
                  key={img}
                  onClick={() => setActive(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={clsx(
                    "relative h-14 w-14 flex-none overflow-hidden rounded-md border",
                    i === active ? "border-ice" : "border-line",
                  )}
                >
                  <Image src={img} alt="" fill sizes="56px" className="img-treatment object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* details */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5 md:w-1/2 md:p-6">
          <h2 className="font-display text-xl font-semibold">{p.name}</h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-lg font-semibold text-ice">{formatCents(eff)}</span>
            {onSale && (
              <span className="font-mono text-sm text-fg-faint line-through">
                {formatCents(p.price)}
              </span>
            )}
          </div>

          {specs.length > 0 && (
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-fg-dim">{k}</dt>
                  <dd className="text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {p.description ? (
            <div
              className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-fg-muted [&_a]:text-ice"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: p.description }}
            />
          ) : null}

          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={addToCart}
              disabled={soldOut || maxedOut}
              className={clsx(
                "w-full rounded-ctl border px-4 py-3 font-display text-sm font-semibold transition-colors",
                soldOut
                  ? "cursor-not-allowed border-line bg-ink-600 text-fg-faint"
                  : maxedOut
                    ? "cursor-default border-ice/30 bg-ice/10 text-ice"
                    : "border-transparent bg-ice text-on-ice hover:bg-ice-hover",
              )}
            >
              {soldOut ? "Verkocht" : maxedOut ? "In winkelwagen ✓" : "In winkelwagen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
