import { SITE } from "@/lib/site";
import { productImageUrl, type Product } from "@/lib/products";
import { effectiveCents } from "@/lib/money";

// schema.org Product markup for each shop item (rich results in Google).
export function ProductJsonLd({ products }: { products: Product[] }) {
  const data = products.map((p) => {
    const img = productImageUrl(p);
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      ...(p.description ? { description: p.description.replace(/<[^>]*>/g, "").slice(0, 300) } : {}),
      ...(img ? { image: img } : {}),
      ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: (effectiveCents(p.price, p.sale_price) / 100).toFixed(2),
        availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/UsedCondition",
        url: `${SITE.url}/shop`,
      },
    };
  });

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
