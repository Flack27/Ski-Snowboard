import { createAdminClient } from "./pocketbase";

// Payment config lives in an admin-only PocketBase record so the owner can toggle
// methods (and paste the Mollie key) from the dashboard — the key is never public.
// Server-only (reads via admin auth).
export type PaymentSettings = {
  onlineEnabled: boolean;
  pickupEnabled: boolean;
  mollieKey: string;
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const pb = await createAdminClient();
    const rec = (await pb.collection("payment_settings").getFullList())[0];
    return {
      onlineEnabled: !!rec?.online_enabled,
      pickupEnabled: rec?.pickup_enabled ?? true,
      mollieKey: rec?.mollie_api_key ?? "",
    };
  } catch {
    // Safe fallback: pay-at-pickup only.
    return { onlineEnabled: false, pickupEnabled: true, mollieKey: "" };
  }
}
