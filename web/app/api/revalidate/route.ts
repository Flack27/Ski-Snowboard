import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

// Which cache tags to bust for each PocketBase collection.
const TAG_MAP: Record<string, string[]> = {
  products: ["products"],
  services: ["services"],
  settings: ["booking-config", "shop-settings"],
  time_slots: ["booking-config"],
  blocked_dates: ["booking-config"],
};

// Called by the PocketBase hook when a record changes, so edits appear immediately.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const collection = url.searchParams.get("collection") ?? "";
  const tags = TAG_MAP[collection] ?? ["products", "services", "booking-config", "shop-settings"];
  for (const t of tags) revalidateTag(t);
  return NextResponse.json({ revalidated: tags });
}
