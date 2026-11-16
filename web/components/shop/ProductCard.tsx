"use client";

import Link from "next/link";
import clsx from "clsx";
import { toCartItem, useCart, useCartDrawer } from "@/lib/cart";
import { useProductModal } from "@/lib/productModal";
import { ProductImage } from "./ProductImage";
import { formatCents, effectiveCents, discountPct } from "@/lib/money";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  images,
  priority,
}: {
  product: Product;
  images: string[];
  /** First row of the shop: load the photo first. */
  priority?: boolean;
}) {
  const qtyInCart = useCart((s) => s.items.find((i) => i.id === product.id)?.qty ?? 0);
  const add = useCart((s) => s.add);
  const openDrawer = useCartDrawer((s) => s.setOpen);
  const openModal = useProductModal((s) => s.open);

  const href = `/shop/${product.slug}`;
  const imageUrl = images[0] ?? null;
  const pct = discountPct(product.price, product.sale_price);
  const soldOut = product.stock <= 0;
  const maxedOut = qtyInCart >= product.stock;

  // Real links to the product page (crawlable, new-tab friendly); a plain click
  // opens the quick-view pop-up instead.
  function quickView(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    openModal({ product, images });
  }

  function addToCart() {
    add(toCartItem(product, imageUrl));
    openDrawer(true);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-line bg-ink-700">
      <Link
        href={href}
        onClick={quickView}
        aria-label={`Bekijk ${product.name}`}
        data-reveal="settle"
        className="relative block"
      >
        <ProductImage
          url={imageUrl}
          alt={product.name}
          className="aspect-[1/2]"
          hoverZoom
          priority={priority}
        />
        {pct !== null && !soldOut && (
          <span className="absolute right-3 top-3 rounded-md bg-ice px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-on-ice">
            {pct ? `−${pct}%` : "Sale"}
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-md bg-ink-900/80 px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-fg-dim">
            Verkocht
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={href}
          onClick={quickView}
          className="font-display text-sm font-semibold leading-snug transition-colors hover:text-ice"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-base font-semibold text-ice">
            {formatCents(effectiveCents(product.price, product.sale_price))}
          </span>
          {pct !== null && (
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
            "press mt-4 w-full rounded-ctl border px-4 py-2.5 font-display text-xs font-semibold",
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
