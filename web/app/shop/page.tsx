import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductModal } from "@/components/shop/ProductModal";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { ProductListJsonLd } from "@/components/seo/ProductJsonLd";
import { getProducts, productImageUrls } from "@/lib/products";
import { SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop — tweedehands ski's & gear",
  description:
    "Een wisselende voorraad tweedehands ski's, snowboards en gear in Hilvarenbeek. Van (bijna) alles is er maar één.",
  path: "/shop",
});

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <Container className="py-16 md:py-20">
      <SectionIntro
        as="h1"
        enter="load"
        eyebrow="Shop"
        title="Tweedehands ski's & gear"
        lead="Een wisselende voorraad zorgvuldig nagekeken tweedehands ski's, snowboards en schoenen — van (bijna) alles is er maar één. Op = op."
      />
      <p className="mb-10 mt-3 animate-rise text-sm leading-relaxed text-fg-dim [animation-delay:240ms]">
        {SITE.appointmentNote}
      </p>

      {products.length === 0 ? (
        <p className="rounded-card border border-line bg-ink-700 px-6 py-10 text-center text-fg-dim">
          Momenteel geen artikelen op voorraad — kom binnenkort terug.
        </p>
      ) : (
        // Cards enter as they scroll into view; a row that arrives together staggers.
        <div
          data-stagger
          className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              images={productImageUrls(p, "1200x1200f")}
              priority={i < 4}
            />
          ))}
        </div>
      )}
      <ProductModal />
      <ProductListJsonLd products={products} />
    </Container>
  );
}
