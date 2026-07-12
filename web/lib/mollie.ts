import { createMollieClient, type MollieClient } from "@mollie/api-client";

// The Mollie key now comes from the admin-only payment_settings record
// (owner-managed), not env. Build a client from a given key.
export function mollieFromKey(apiKey: string): MollieClient {
  return createMollieClient({ apiKey });
}

export function isMollieKey(key: string | undefined | null): key is string {
  return !!key && (key.startsWith("test_") || key.startsWith("live_"));
}
