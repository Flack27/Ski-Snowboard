// Read-side product data from PocketBase. Server-only (uses the internal PB URL).
// Reads are cached with the "products" tag so the PocketBase hook can revalidate on edit.

const PB_INTERNAL = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
const PB_PUBLIC = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

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
};

// eslint-disable-next-line
function mapProduct(r: any): Product {
  return {
    id: r.id,
    collectionId: r.collectionId,
    name: r.name ?? "",
    slug: r.slug ?? "",
    description: r.description ?? "",
    price: r.price ?? 0,
    sale_price: r.sale_price ? r.sale_price : null,
    stock: r.stock ?? 0,
    category: r.category ?? "",
    brand: r.brand ?? "",
    size: r.size ?? "",
    active: !!r.active,
    sort: r.sort ?? 0,
    images: Array.isArray(r.images) ? r.images : [],
  };
}

async function pbGet(path: string) {
  const res = await fetch(`${PB_INTERNAL}${path}`, {
    next: { revalidate: 3600, tags: ["products"] },
  });
  if (!res.ok) throw new Error(`PocketBase ${res.status} for ${path}`);
  return res.json();
}

export async function getProducts(opts?: { category?: string }): Promise<Product[]> {
  const params = new URLSearchParams({ perPage: "200", sort: "sort,-created" });
  const data = await pbGet(`/api/collections/products/records?${params.toString()}`);
  let items: Product[] = (data.items ?? []).map(mapProduct);
  if (opts?.category) items = items.filter((p) => p.category === opts.category);
  return items;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const params = new URLSearchParams({
    perPage: "1",
    filter: `slug = ${JSON.stringify(slug)}`,
  });
  const data = await pbGet(`/api/collections/products/records?${params.toString()}`);
  const item = (data.items ?? [])[0];
  return item ? mapProduct(item) : null;
}

/** Public file URL (via the browser-reachable PB URL) for the first image, optionally a thumb. */
export function productImageUrl(p: Product, thumb?: string): string | null {
  if (!p.images.length) return null;
  const q = thumb ? `?thumb=${thumb}` : "";
  return `${PB_PUBLIC}/api/files/${p.collectionId}/${p.id}/${p.images[0]}${q}`;
}

/** All image URLs for a product (for the detail gallery). */
export function productImageUrls(p: Product, thumb?: string): string[] {
  const q = thumb ? `?thumb=${thumb}` : "";
  return p.images.map((f) => `${PB_PUBLIC}/api/files/${p.collectionId}/${p.id}/${f}${q}`);
}
