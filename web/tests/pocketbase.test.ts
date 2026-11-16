import { test } from "node:test";
import assert from "node:assert/strict";

// Regression: during the Docker build only the NEXT_PUBLIC_ build args exist. The server
// reads fell back to localhost there, so every deploy prerendered an empty shop and no
// services, which stayed cached until revalidation (up to an hour).
test("without POCKETBASE_URL (the build), PocketBase is read via the public URL", async () => {
  process.env.POCKETBASE_URL = ""; // how docker compose passes an unset variable
  process.env.NEXT_PUBLIC_POCKETBASE_URL = "https://beheer.example.nl";
  const { PB_URL, PB_PUBLIC_URL } = await import("@/lib/pocketbase");
  assert.equal(PB_URL, "https://beheer.example.nl");
  assert.equal(PB_PUBLIC_URL, "https://beheer.example.nl");
});
