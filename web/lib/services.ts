// Read-side service data from PocketBase (editable by the shop owner in the admin).
import { htmlToText } from "./html";
import { slugify } from "./slug";

const PB_INTERNAL = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";
const PB_PUBLIC = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

export type Service = {
  id: string;
  collectionId: string;
  slug: string;
  name: string;
  short: string;
  blurb: string;
  details: string;
  priceLabel: string;
  features: string[];
  popular: boolean;
  sort: number;
  image: string;
  updated: string; // PocketBase timestamp, used for sitemap lastmod
};

// eslint-disable-next-line
function mapService(r: any): Service {
  return {
    id: r.id,
    collectionId: r.collectionId,
    slug: slugify(r.slug || r.name || "") || r.id,
    name: r.name ?? "",
    short: r.short || r.name || "",
    blurb: r.blurb ?? "",
    // `details` is a rich-text field in the admin; render-side it's shown as plain
    // text, so strip any pasted markup/entities to clean readable text.
    details: htmlToText(r.details ?? ""),
    priceLabel: r.price_label ?? "",
    features: Array.isArray(r.features) ? r.features : [],
    popular: !!r.popular,
    sort: r.sort ?? 0,
    image: r.image ?? "",
    updated: r.updated ?? "",
  };
}

export async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(
      `${PB_INTERNAL}/api/collections/services/records?perPage=50&sort=sort`,
      { next: { revalidate: 300, tags: ["services"] } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map(mapService);
  } catch {
    // PB unreachable (e.g. at build time before the container is up) — fall back to
    // empty; ISR revalidation repopulates once PB is available.
    return [];
  }
}

export function serviceImageUrl(s: Service, thumb?: string): string | null {
  if (!s.image) return null;
  const q = thumb ? `?thumb=${thumb}` : "";
  return `${PB_PUBLIC}/api/files/${s.collectionId}/${s.id}/${s.image}${q}`;
}
