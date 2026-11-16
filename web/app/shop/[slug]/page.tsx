import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductGallery, ProductInfo } from "@/components/shop/ProductDetail";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { getProductBySlug, getProducts, productImageUrls, type Product } from "@/lib/products";
import { htmlToText } from "@/lib/html";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

// One page per shop item, so each one-of-a-kind item can be found in Google and
// shared as a link. /shop opens the same detail as a quick-view pop-up.

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

function summary(p: Product): string {
  const text = htmlToText(p.description).replace(/\n+/g, " ");
  if (!text) return `Tweedehands ${p.name} te koop bij ${SITE.name} in Hilvarenbeek.`;
  return text.length > 155 ? `${text.slice(0, 152).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  const [photo] = productImageUrls(product, "1200x1200f");
  return {
    ...pageMetadata({
      title: `${product.name} — tweedehands`,
      description: summary(product),
      path: `/shop/${product.slug}`,
      ...(photo ? { image: { url: photo, alt: product.name } } : {}),
    }),
    // A sold item stays reachable but drops out of Google.
    ...(product.stock <= 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const images = productImageUrls(product, "1200x1200f");

  return (
    <Container className="py-12 md:py-16">
      <nav
        aria-label="Kruimelpad"
        className="mb-8 flex animate-rise flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim"
      >
        <Link href="/shop" className="transition-colors hover:text-ice">
          ← Shop
        </Link>
        <span aria-hidden className="text-fg-faint">
          /
        </span>
        <span className="text-fg-muted">{product.name}</span>
      </nav>

      {/* The photo arrives on load; the details follow (ProductInfo staggers its parts). */}
      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12 lg:gap-16">
        <div className="animate-rise [animation-delay:80ms]">
          <ProductGallery
            product={product}
            images={images}
            sizes="(max-width: 768px) 90vw, 520px"
            // On phones, leave room for the name and price on the first screen.
            imageClassName="aspect-[1/2] max-h-[52dvh] md:max-h-[78dvh]"
          />
        </div>
        <div className="flex flex-col md:max-w-xl">
          <ProductInfo product={product} image={images[0] ?? null} as="h1" />
          <p data-reveal="fade" className="mt-4 text-sm leading-relaxed text-fg-dim">
            {SITE.appointmentNote}
          </p>
        </div>
      </div>

      <ProductJsonLd product={product} />
    </Container>
  );
}
