import PocketBase from "pocketbase";

// Server-side PocketBase client. Uses the internal docker URL by default.
// Never import this into a client component.
export function createServerClient(): PocketBase {
  const pb = new PocketBase(process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090");
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

// The public base URL used to build <img> file links for next/image.
export function pbFileBase(): string {
  return process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";
}
