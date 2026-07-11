// Shop-wide settings the owner controls in PocketBase (shipping toggle + price).
const PB = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

export type ShopSettings = {
  shippingEnabled: boolean;
  shippingPrice: number; // cents
};

export async function getShopSettings(): Promise<ShopSettings> {
  try {
    const res = await fetch(`${PB}/api/collections/settings/records?perPage=1`, {
      next: { revalidate: 300, tags: ["shop-settings"] },
    });
    if (!res.ok) return { shippingEnabled: false, shippingPrice: 0 };
    const s = (await res.json()).items?.[0];
    return {
      shippingEnabled: !!s?.shipping_enabled,
      shippingPrice: s?.shipping_price ?? 0,
    };
  } catch {
    return { shippingEnabled: false, shippingPrice: 0 };
  }
}
