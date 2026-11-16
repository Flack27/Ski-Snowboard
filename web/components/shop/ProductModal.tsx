"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useProductModal } from "@/lib/productModal";
import { ProductGallery, ProductInfo } from "./ProductDetail";
import { Icon } from "@/components/ui/Icon";

// Quick-view overlay on /shop. The same item also has its own page (/shop/[slug]).
export function ProductModal() {
  const item = useProductModal((s) => s.item);
  const close = useProductModal((s) => s.close);

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
  const { product, images } = item;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade bg-black/70" onClick={close} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="relative z-10 flex max-h-[90dvh] w-full max-w-3xl animate-dialog flex-col overflow-hidden rounded-card border border-line bg-ink-800 shadow-2xl md:flex-row"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Sluiten"
          className="press absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/70 text-fg-dim hover:text-fg"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        <div className="p-4 md:w-2/5 md:p-5">
          <ProductGallery
            key={product.id}
            product={product}
            images={images}
            sizes="(max-width: 768px) 90vw, 320px"
            imageClassName="aspect-[1/2] max-h-[45dvh] md:max-h-[58dvh]"
          />
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-5 md:w-3/5 md:p-6">
          <ProductInfo product={product} image={images[0] ?? null} as="h2" onAdded={close} />
          <Link
            href={`/shop/${product.slug}`}
            onClick={close}
            className="group mt-3 text-center text-sm text-fg-dim transition-colors hover:text-ice"
          >
            Open als losse pagina (om te delen) <span className="link-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
