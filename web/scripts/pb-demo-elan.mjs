// Demo only: gives the Elan product a few photos + a description so the detail
// overlay can be shown. Replace with real photos/description in the admin.
import { readFileSync } from "node:fs";
import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_ADMIN_EMAIL || "admin@spapens.local";
const PASS = process.env.PB_ADMIN_PASSWORD || "devadmin12345_ChangeMe";
const DIR = new URL("../public/images/", import.meta.url);

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

async function main() {
  await pb.admins.authWithPassword(EMAIL, PASS);
  const elan = await pb.collection("products").getFirstListItem(`slug="elan-ace-slx-pro-169"`);
  if (Array.isArray(elan.images) && elan.images.length > 0) {
    console.log("Elan already has images — skipping.");
    return;
  }
  const files = ["hero.png", "waxen.png", "slijpen.png"].map(
    (f, i) => new File([readFileSync(new URL(f, DIR))], `elan-${i + 1}.png`, { type: "image/png" }),
  );
  const fd = new FormData();
  fd.append(
    "description",
    "<p>Nette tweedehands Elan Ace SLX Pro race-carver, lengte 169 cm. Recent geslepen en gewaxt — klaar voor gebruik. Kom gerust langs om te passen (op afspraak).</p>",
  );
  for (const f of files) fd.append("images", f);
  await pb.collection("products").update(elan.id, fd);
  console.log("Updated Elan with", files.length, "demo images + description.");
}

main().catch((e) => {
  console.error("FAILED:", JSON.stringify(e?.response ?? String(e), null, 2));
  process.exit(1);
});
