import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getProducts } from "@/lib/products";
import { getServices } from "@/lib/services";

// Re-generated with the shop data (hourly, or right away via the PocketBase hook),
// so new items appear and sold ones drop out without a redeploy.
export const revalidate = 3600;

/** Most recent PocketBase `updated` timestamp, or undefined (then lastmod is omitted). */
function latest(records: { updated: string }[]): Date | undefined {
  const times = records.map((r) => Date.parse(r.updated)).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const [products, services] = await Promise.all([getProducts(), getServices()]);
  const forSale = products.filter((p) => p.stock > 0); // sold items are noindex

  return [
    { url: `${base}/` },
    { url: `${base}/diensten`, lastModified: latest(services) },
    { url: `${base}/shop`, lastModified: latest(products) },
    { url: `${base}/contact` },
    ...forSale.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: latest([p]),
    })),
  ];
}
