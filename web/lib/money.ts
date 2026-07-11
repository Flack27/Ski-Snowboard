// Money is stored as integer cents everywhere. Format for display in nl-NL.

const eur = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

/** 30000 -> "€ 300,00" */
export function formatCents(cents: number): string {
  return eur.format(cents / 100);
}

/** Mollie wants a decimal string like "435.00" (dot, two decimals). */
export function centsToMollieValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** The effective price: sale_price when set, otherwise price. */
export function effectiveCents(price: number, salePrice?: number | null): number {
  return salePrice != null && salePrice > 0 ? salePrice : price;
}

/** Discount percentage for a sale, rounded. e.g. (10000, 8500) -> 15 */
export function discountPct(price: number, salePrice?: number | null): number | null {
  if (salePrice == null || salePrice <= 0 || salePrice >= price) return null;
  return Math.round((1 - salePrice / price) * 100);
}
