import type { Metadata } from "next";
import { getShopSettings } from "@/lib/shopSettings";
import { getPaymentSettings } from "@/lib/paymentSettings";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Afrekenen",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [shop, pay] = await Promise.all([getShopSettings(), getPaymentSettings()]);
  return (
    <CheckoutForm
      shippingEnabled={shop.shippingEnabled}
      shippingPrice={shop.shippingPrice}
      onlineEnabled={pay.onlineEnabled && pay.mollieKey.length > 0}
      pickupEnabled={pay.pickupEnabled}
    />
  );
}
