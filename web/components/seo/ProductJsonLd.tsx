import { SITE } from "@/lib/site";
import { productImageUrls, type Product } from "@/lib/products";
import { effectiveCents } from "@/lib/money";
import { htmlToText } from "@/lib/html";
import { JsonLd } from "./JsonLd";

const productUrl = (p: Product) => `${SITE.url}/shop/${p.slug}`;

// schema.org Product for a product page (rich results: price, stock, used condition).
export function ProductJsonLd({ product: p }: { product: Product }) {
  const url = productUrl(p);
  const description = htmlToText(p.description).replace(/\n+/g, " ").slice(0, 500);
  const images = productImageUrls(p);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${url}#product`,
        name: p.name,
        url,
        ...(description ? { description } : {}),
        ...(images.length ? { image: images } : {}),
        ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "EUR",
          price: (effectiveCents(p.price, p.sale_price) / 100).toFixed(2),
          availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          itemCondition: "https://schema.org/UsedCondition",
          seller: { "@id": `${SITE.url}/#business` },
        },
      }}
    />
  );
}

// schema.org ItemList for /shop: points Google at each product's own page.
export function ProductListJsonLd({ products }: { products: Product[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: productUrl(p),
          name: p.name,
        })),
      }}
    />
  );
}
