// One-shot PocketBase schema + seed for local dev. Idempotent (skips what exists).
// Run: node web/scripts/pb-setup.mjs   (PocketBase must be running on PB_URL)
import PocketBase from "pocketbase";

const URL = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_ADMIN_EMAIL || "admin@spapens.local";
const PASS = process.env.PB_ADMIN_PASSWORD || "devadmin12345_ChangeMe";

const pb = new PocketBase(URL);
pb.autoCancellation(false);

// ── field helpers (PocketBase v0.22 schema shape) ──
const T = (name, required = false) => ({ name, type: "text", required, options: { min: null, max: null, pattern: "" } });
const NUM = (name, required = false) => ({ name, type: "number", required, options: { min: null, max: null, noDecimal: true } });
const BOOL = (name) => ({ name, type: "bool", required: false, options: {} });
const EDITOR = (name) => ({ name, type: "editor", required: false, options: { convertUrls: false } });
const MAIL = (name, required = false) => ({ name, type: "email", required, options: { exceptDomains: null, onlyDomains: null } });
const DATE = (name, required = false) => ({ name, type: "date", required, options: { min: "", max: "" } });
const JSONF = (name) => ({ name, type: "json", required: false, options: { maxSize: 2000000 } });
const SEL = (name, values, maxSelect = 1, required = false) => ({ name, type: "select", required, options: { maxSelect, values } });
const FILE = (name, maxSelect = 10) => ({
  name, type: "file", required: false,
  // "f" = fit inside the box, keeping the photo's ratio. Plain "WxH" would crop
  // to a square and cut the ends off a ski. Sizes missing here fall back to the full file.
  options: { maxSelect, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"], thumbs: ["400x400f", "1200x1200f"], protected: false },
});

const collections = [
  {
    name: "products", type: "base",
    schema: [T("name", true), T("slug", true), EDITOR("description"), NUM("price", true), NUM("sale_price"),
      FILE("images"), NUM("stock"), SEL("category", ["ski", "snowboard", "boots", "accessoires", "wax"]),
      T("brand"), T("size"), BOOL("active"), NUM("sort")],
    listRule: "active = true", viewRule: "active = true", createRule: null, updateRule: null, deleteRule: null,
    indexes: ["CREATE UNIQUE INDEX `idx_products_slug` ON `products` (`slug`)"],
  },
  {
    name: "orders", type: "base",
    schema: [T("ref", true), JSONF("line_items"), MAIL("customer_email"), T("customer_name"), T("customer_phone"),
      NUM("amount"), T("mollie_payment_id"),
      SEL("status", ["open", "paid", "failed", "expired", "canceled", "refunded"]), SEL("fulfilment", ["pickup"])],
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    indexes: [
      "CREATE UNIQUE INDEX `idx_orders_ref` ON `orders` (`ref`)",
      "CREATE UNIQUE INDEX `idx_orders_mollie` ON `orders` (`mollie_payment_id`) WHERE `mollie_payment_id` != ''",
    ],
  },
  {
    name: "bookings", type: "base",
    schema: [T("ref", true), T("name", true), MAIL("email", true), T("phone"),
      SEL("service", ["waxen", "slijpen", "waxen-slijpen", "onderhoud"]), DATE("date", true), T("time_slot"), T("note"),
      SEL("status", ["nieuw", "bevestigd", "klaar", "geannuleerd"])],
    listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    indexes: [
      "CREATE UNIQUE INDEX `idx_bookings_ref` ON `bookings` (`ref`)",
      "CREATE UNIQUE INDEX `idx_bookings_slot` ON `bookings` (`date`,`time_slot`) WHERE `status` != 'geannuleerd'",
    ],
  },
  {
    name: "time_slots", type: "base",
    schema: [T("time", true), NUM("sort"), BOOL("active")],
    listRule: "active = true", viewRule: "active = true", createRule: null, updateRule: null, deleteRule: null,
    indexes: ["CREATE UNIQUE INDEX `idx_time_slots_time` ON `time_slots` (`time`)"],
  },
  {
    name: "settings", type: "base",
    schema: [SEL("open_weekdays", ["ma", "di", "wo", "do", "vr", "za", "zo"], 7), NUM("booking_horizon_days"), NUM("lead_time_hours")],
    listRule: "", viewRule: "", createRule: null, updateRule: null, deleteRule: null, indexes: [],
  },
  {
    name: "blocked_dates", type: "base",
    schema: [DATE("date", true), T("reason")],
    listRule: "", viewRule: "", createRule: null, updateRule: null, deleteRule: null,
    indexes: ["CREATE UNIQUE INDEX `idx_blocked_date` ON `blocked_dates` (`date`)"],
  },
];

const products = [
  { name: "Elan Ace SLX Pro Ski's – 169 cm", slug: "elan-ace-slx-pro-169", category: "ski", brand: "Elan", size: "169 cm", price: 40000, sale_price: 30000, stock: 1, active: true, sort: 1 },
  { name: "Blizzard Race RCC – 153 cm", slug: "blizzard-race-rcc-153", category: "ski", brand: "Blizzard", size: "153 cm", price: 10000, sale_price: 8500, stock: 1, active: true, sort: 2 },
  { name: "Head C110 System – 163 cm", slug: "head-c110-system-163", category: "ski", brand: "Head", size: "163 cm", price: 14000, sale_price: 11000, stock: 1, active: true, sort: 3 },
  { name: "Snowboard Nitro Team Series", slug: "nitro-team-series", category: "snowboard", brand: "Nitro", size: "", price: 37500, sale_price: 35000, stock: 1, active: true, sort: 4 },
  { name: "Nitro Addict 56 – 156 cm", slug: "nitro-addict-56-156", category: "snowboard", brand: "Nitro", size: "156 cm", price: 25000, sale_price: 20000, stock: 1, active: true, sort: 5 },
  { name: "Head skischoenen – mt 42", slug: "head-skischoenen-42", category: "boots", brand: "Head", size: "mt 42", price: 9000, sale_price: 6000, stock: 1, active: true, sort: 6 },
];

const slots = [["09:00", 1], ["10:30", 2], ["13:00", 3], ["14:30", 4], ["16:00", 5], ["17:30", 6]].map(([time, sort]) => ({ time, sort, active: true }));

async function main() {
  await pb.admins.authWithPassword(EMAIL, PASS);
  console.log("authed as", EMAIL);

  const existing = await pb.collections.getFullList();
  const have = new Set(existing.map((c) => c.name));
  for (const col of collections) {
    if (have.has(col.name)) { console.log("skip collection (exists):", col.name); continue; }
    await pb.collections.create(col);
    console.log("created collection:", col.name);
  }

  const existingProducts = await pb.collection("products").getFullList();
  if (existingProducts.length === 0) {
    for (const p of products) await pb.collection("products").create(p);
    console.log("seeded products:", products.length);
  } else console.log("products already present:", existingProducts.length);

  const existingSlots = await pb.collection("time_slots").getFullList();
  if (existingSlots.length === 0) {
    for (const s of slots) await pb.collection("time_slots").create(s);
    console.log("seeded time_slots:", slots.length);
  } else console.log("time_slots already present:", existingSlots.length);

  const existingSettings = await pb.collection("settings").getFullList();
  if (existingSettings.length === 0) {
    await pb.collection("settings").create({ open_weekdays: ["ma", "di", "wo", "do", "vr", "za"], booking_horizon_days: 30, lead_time_hours: 24 });
    console.log("seeded settings record");
  } else console.log("settings already present:", existingSettings.length);

  console.log("DONE");
}

main().catch((e) => {
  console.error("SETUP FAILED:", JSON.stringify(e?.response ?? e?.data ?? String(e), null, 2));
  process.exit(1);
});
