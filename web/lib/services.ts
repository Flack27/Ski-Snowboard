// Read-side service data from PocketBase (editable by the shop owner in the admin).
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
};

// eslint-disable-next-line
function mapService(r: any): Service {
  return {
    id: r.id,
    collectionId: r.collectionId,
    slug: r.slug ?? "",
    name: r.name ?? "",
    short: r.short || r.name || "",
    blurb: r.blurb ?? "",
    details: r.details ?? "",
    priceLabel: r.price_label ?? "",
    features: Array.isArray(r.features) ? r.features : [],
    popular: !!r.popular,
    sort: r.sort ?? 0,
    image: r.image ?? "",
  };
}

export async function getServices(): Promise<Service[]> {
  const res = await fetch(
    `${PB_INTERNAL}/api/collections/services/records?perPage=50&sort=sort`,
    { next: { revalidate: 300, tags: ["services"] } },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map(mapService);
}

export function serviceImageUrl(s: Service, thumb?: string): string | null {
  if (!s.image) return null;
  const q = thumb ? `?thumb=${thumb}` : "";
  return `${PB_PUBLIC}/api/files/${s.collectionId}/${s.id}/${s.image}${q}`;
}
