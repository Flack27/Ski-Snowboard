"use client";

import clsx from "clsx";
import { useCart, useCartDrawer } from "@/lib/cart";
import { useProductModal } from "@/lib/productModal";
import { ProductImage } from "./ProductImage";
import { formatCents, effectiveCents, discountPct } from "@/lib/money";
import type { Product } from "@/lib/products";

export function ProductCard({ product, images }: { product: Product; images: string[] }) {
  const qtyInCart = useCart((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0);
  const add = useCart((s) => s.add);
  const openDrawer = useCartDrawer((s) => s.setOpen);
  const openModal = useProductModal((s) => s.open);

  const imageUrl = images[0] ?? null;
  const eff = effectiveCents(product.price, product.sale_price);
  const onSale =
    product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price;
  const pct = discountPct(product.price, product.sale_price);
  const soldOut = product.stock <= 0;
  const maxedOut = qtyInCart >= product.stock;

  function showDetails() {
    openModal({ product, images });
  }

  function addToCart() {
    add({
      id: product.id,
      name: product.name,
      priceCents: eff,
      regularCents: product.price,
      image: imageUrl,
      slug: product.slug,
      stock: product.stock,
    });
    openDrawer(true);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-line bg-ink-700">
      <button type="button" onClick={showDetails} aria-label={`Bekijk ${product.name}`} className="relative block">
        <ProductImage url={imageUrl} alt={product.name} />
        {onSale && !soldOut && (
          <span className="absolute right-3 top-3 rounded-md bg-ice px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-on-ice">
            {pct ? `−${pct}%` : "Sale"}
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-md bg-ink-900/80 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wide text-fg-dim">
            Verkocht
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-5">
        <button
          type="button"
          onClick={showDetails}
          className="text-left font-display text-sm font-semibold leading-snug transition-colors hover:text-ice"
        >
          {product.name}
        </button>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-base font-semibold text-ice">{formatCents(eff)}</span>
          {onSale && (
            <span className="font-mono text-xs text-fg-faint line-through">
              {formatCents(product.price)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={soldOut || maxedOut}
          className={clsx(
            "mt-4 w-full rounded-ctl border px-4 py-2.5 font-display text-xs font-semibold transition-colors",
            soldOut
              ? "cursor-not-allowed border-line bg-ink-600 text-fg-faint"
              : maxedOut
                ? "cursor-default border-ice/30 bg-ice/10 text-ice"
                : "border-ice/30 bg-ice/10 text-ice hover:bg-ice/20",
          )}
        >
          {soldOut ? "Verkocht" : maxedOut ? "In winkelwagen ✓" : "In winkelwagen"}
        </button>
      </div>
    </div>
  );
}
