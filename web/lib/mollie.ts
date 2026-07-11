import { createMollieClient, type MollieClient } from "@mollie/api-client";

// Server-only Mollie client. Uses the secret key from env (test_… first, then live_…).
export function mollie(): MollieClient {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey || apiKey === "test_replace_me") {
    throw new Error("MOLLIE_API_KEY is not configured");
  }
  return createMollieClient({ apiKey });
}

export function isMollieConfigured(): boolean {
  const k = process.env.MOLLIE_API_KEY;
  return !!k && k !== "test_replace_me";
}
