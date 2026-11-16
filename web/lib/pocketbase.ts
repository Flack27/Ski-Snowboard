import PocketBase from "pocketbase";

// Where the server reads PocketBase. At runtime (Docker) POCKETBASE_URL is the internal
// address. During `next build` only the NEXT_PUBLIC_ build args exist, so the build reads
// via the public URL: falling back to localhost there made every deploy prerender an empty
// shop and no services, cached until revalidation (up to an hour).
// `||`, not `??`: docker compose passes an unset variable through as "".
export const PB_URL =
  process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

// Browser-reachable base for file links (product and service photos).
export const PB_PUBLIC_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090";

// Server-side PocketBase client. Never import this into a client component.
export function createServerClient(): PocketBase {
  const pb = new PocketBase(PB_URL);
  // Disable auto-cancellation so parallel server requests don't cancel each other.
  pb.autoCancellation(false);
  return pb;
}

// Authenticated client for privileged writes (creating orders/bookings).
// NOTE: superuser/admin auth API differs across PocketBase versions — this is
// finalised and tested against the running container in the data-layer step.
export async function createAdminClient(): Promise<PocketBase> {
  const pb = createServerClient();
  const email = process.env.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("POCKETBASE_ADMIN_EMAIL / POCKETBASE_ADMIN_PASSWORD not set");
  }
  await pb.admins.authWithPassword(email, password);
  return pb;
}

