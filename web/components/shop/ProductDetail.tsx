"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ProductImage } from "./ProductImage";
import { toCartItem, useCart, useCartDrawer } from "@/lib/cart";
import { formatCents, effectiveCents, discountPct } from "@/lib/money";
import { CATEGORIES } from "@/lib/site";
import type { Product } from "@/lib/products";

// The product detail, shared by the shop pop-up (ProductModal) and the product
// page (/shop/[slug]). Each composes the gallery and info blocks in its own layout.

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
);

export function ProductGallery({
  product,
  images,
  sizes,
  imageClassName,
}: {
  product: Product;
  images: string[];
  sizes: string;
  imageClassName: string;
}) {
  const [active, setActive] = useState(0);
  const [switched, setSwitched] = useState(false);
  const pct = discountPct(product.price, product.sale_price);
  const soldOut = product.stock <= 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {/* Keyed on the photo, so a photo picked from the thumbnails fades in. */}
        <ProductImage
          key={active}
          url={images[active] ?? null}
          alt={product.name}
          sizes={sizes}
          className={clsx("rounded-lg", switched && "animate-fade", imageClassName)}
        />
        {pct !== null && !soldOut && (
          <span className="absolute left-3 top-3 rounded-md bg-ice px-2 py-1 font-mono text-[11px] font-semibold uppercase text-on-ice">
            {pct ? `−${pct}%` : "Sale"}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              type="button"
              key={img}
              onClick={() => {
                setActive(i);
                setSwitched(true);
              }}
              aria-label={`Foto ${i + 1}`}
              aria-current={i === active}
              className={clsx(
                "press relative h-14 w-14 flex-none overflow-hidden rounded-md border bg-ink-900",
                i === active ? "border-ice" : "border-line",
              )}
            >
              <Image src={img} alt="" fill sizes="56px" className="img-treatment object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductInfo({
  product: p,
  image,
  as: Heading,
  onAdded,
}: {
  product: Product;
  image: string | null; // photo shown in the cart line
  as: "h1" | "h2";
  onAdded?: () => void;
}) {
  const add = useCart((s) => s.add);
  const openDrawer = useCartDrawer((s) => s.setOpen);
  const qtyInCart = useCart((s) => s.items.find((i) => i.id === p.id)?.qty ?? 0);

  const onSale = discountPct(p.price, p.sale_price) !== null;
  const soldOut = p.stock <= 0;
  const maxedOut = qtyInCart >= p.stock;

  const specs: [string, string][] = [];
  if (p.brand) specs.push(["Merk", p.brand]);
  if (p.size) specs.push(["Maat", p.size]);
  if (p.category) specs.push(["Categorie", CATEGORY_LABELS[p.category] ?? p.category]);

  function addToCart() {
    add(toCartItem(p, image));
    openDrawer(true);
    onAdded?.();
  }

  // Name, price, specs, button and description arrive one after another.
  return (
    <div data-stagger className="flex flex-1 flex-col">
      <Heading
        className={clsx(
          "font-display font-semibold",
          Heading === "h1" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl",
        )}
      >
        {p.name}
      </Heading>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-lg font-semibold text-ice">
          {formatCents(effectiveCents(p.price, p.sale_price))}
        </span>
        {onSale && (
          <span className="font-mono text-sm text-fg-faint line-through">{formatCents(p.price)}</span>
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

      <div className="mt-5">
        <button
          type="button"
          onClick={addToCart}
          disabled={soldOut || maxedOut}
          className={clsx(
            "press w-full rounded-ctl border px-4 py-3 font-display text-sm font-semibold",
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

      {p.description ? (
        <div
          className="mt-6 space-y-3 border-t border-line pt-5 text-base leading-relaxed text-fg-muted [&_a]:text-ice [&_li]:pl-1 [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:marker:text-ice/60"
          // Sanitised server-side (lib/html.ts sanitizeHtml) — safe formatting tags only.
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: p.description }}
        />
      ) : null}
    </div>
  );
}
