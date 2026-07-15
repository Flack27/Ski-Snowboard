import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductModal } from "@/components/shop/ProductModal";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { getProducts, productImageUrls } from "@/lib/products";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop — tweedehands ski's & gear",
  description:
    "Een wisselende voorraad tweedehands ski's, snowboards en gear in Hilvarenbeek. Van (bijna) alles is er maar één.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <Container className="py-16 md:py-20">
      <h1 className="font-display text-3xl font-semibold md:text-4xl">
        Tweedehands ski&apos;s &amp; gear
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-dim">
        Een wisselende voorraad zorgvuldig nagekeken tweedehands ski&apos;s, snowboards en schoenen
        — van (bijna) alles is er maar één. Op = op.
      </p>
      <p className="mb-10 mt-3 text-xs leading-relaxed text-fg-faint">{SITE.appointmentNote}</p>

      {products.length === 0 ? (
        <p className="rounded-card border border-line bg-ink-700 px-6 py-10 text-center text-fg-dim">
          Momenteel geen artikelen op voorraad — kom binnenkort terug.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} images={productImageUrls(p, "1200x1200f")} />
          ))}
        </div>
      )}
      <ProductModal />
      <ProductJsonLd products={products} />
    </Container>
  );
}
