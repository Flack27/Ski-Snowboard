import type { Metadata } from "next";
import { getShopSettings } from "@/lib/shopSettings";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Afrekenen",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const { shippingEnabled, shippingPrice } = await getShopSettings();
  return <CheckoutForm shippingEnabled={shippingEnabled} shippingPrice={shippingPrice} />;
}
