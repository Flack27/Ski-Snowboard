// Read-side product data from PocketBase. Server-only.
// Reads are cached with the "products" tag so the PocketBase hook can revalidate on edit.
import { sanitizeHtml } from "./html";
import { slugify } from "./slug";
import { PB_PUBLIC_URL, PB_URL } from "./pocketbase";

export type Product = {
  id: string;
  collectionId: string;
  name: string;
  slug: string;
  description: string;
  price: number; // cents
  sale_price: number | null; // cents
  stock: number;
  category: string;
  brand: string;
  size: string;
  active: boolean;
  sort: number;
  images: string[];
  updated: string; // PocketBase timestamp, used for sitemap lastmod
};

// eslint-disable-next-line
function mapProduct(r: any): Product {
  return {
    id: r.id,
    collectionId: r.collectionId,
    name: r.name ?? "",
    slug: slugify(r.slug || r.name || "") || r.id,
    // Rendered as HTML in the product modal; sanitise to a safe formatting subset
    // so pasted editor/ChatGPT markup (stray <div>s, attributes) can't leak in.
    description: sanitizeHtml(r.description ?? ""),
    price: r.price ?? 0,
    sale_price: r.sale_price ? r.sale_price : null,
    stock: r.stock ?? 0,
    category: r.category ?? "",
    brand: r.brand ?? "",
    size: r.size ?? "",
    active: !!r.active,
    sort: r.sort ?? 0,
    images: Array.isArray(r.images) ? r.images : [],
    updated: r.updated ?? "",
  };
}

async function pbGet(path: string) {
  try {
    const res = await fetch(`${PB_URL}${path}`, {
      next: { revalidate: 3600, tags: ["products"] },
    });
    if (!res.ok) return { items: [] };
    return res.json();
  } catch {
    // PB unreachable (e.g. at build time before the container is up) — empty result;
    // ISR revalidation repopulates once PB is available.
    return { items: [] };
  }
}

export async function getProducts(): Promise<Product[]> {
  const params = new URLSearchParams({ perPage: "200", sort: "sort,-created" });
  const data = await pbGet(`/api/collections/products/records?${params.toString()}`);
  const items: Product[] = (data.items ?? []).map(mapProduct);
  // Slugs are normalised from free text, so two items could land on the same one
  // (e.g. two identical second-hand skis). Keep every product URL unique.
  const seen = new Set<string>();
  for (const p of items) {
    if (seen.has(p.slug)) p.slug = `${p.slug}-${p.id.slice(0, 5)}`;
    seen.add(p.slug);
  }
  return items;
}

/** Looks up by the normalised slug the site links to (not the raw admin value). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

// PocketBase thumb formats: "WxH" crops to that box, "WxHf" fits inside it and
// keeps the original ratio. Product shots must stay uncropped — use the "f" form.

/** Public image URLs for a product (via the browser-reachable PB URL), optionally thumbs. */
export function productImageUrls(p: Product, thumb?: string): string[] {
  const q = thumb ? `?thumb=${thumb}` : "";
  return p.images.map((f) => `${PB_PUBLIC_URL}/api/files/${p.collectionId}/${p.id}/${f}${q}`);
}
