// Adds an admin-only `payment_settings` record so the owner controls payment methods
// (and stores the Mollie key) from the PocketBase dashboard. Also adds a "reserved"
// order status for pay-at-pickup orders. Idempotent.
import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_ADMIN_EMAIL || "admin@spapens.local";
const PASS = process.env.PB_ADMIN_PASSWORD || "devadmin12345_ChangeMe";

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const BOOL = (name) => ({ name, type: "bool", required: false, options: {} });
const T = (name) => ({ name, type: "text", required: false, options: { min: null, max: null, pattern: "" } });

const paymentCollection = {
  name: "payment_settings",
  type: "base",
  schema: [BOOL("online_enabled"), BOOL("pickup_enabled"), T("mollie_api_key")],
  // Admin-only: never publicly readable (the Mollie key must not leak).
  listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
  indexes: [],
};

async function main() {
  await pb.admins.authWithPassword(EMAIL, PASS);

  const existing = await pb.collections.getFullList();
  if (!existing.some((c) => c.name === "payment_settings")) {
    await pb.collections.create(paymentCollection);
    console.log("created collection: payment_settings (admin-only)");
  } else console.log("payment_settings already exists");

  // seed the single record: pickup on, online off, empty key
  const recs = await pb.collection("payment_settings").getFullList();
  if (recs.length === 0) {
    await pb.collection("payment_settings").create({
      online_enabled: false,
      pickup_enabled: true,
      mollie_api_key: "",
    });
    console.log("seeded payment_settings (pickup on, online off)");
  } else console.log("payment_settings record already present");

  // orders.status += "reserved"
  const orders = await pb.collections.getOne("orders");
  const statusField = orders.schema.find((f) => f.name === "status");
  const values = statusField?.options?.values ?? [];
  if (!values.includes("reserved")) {
    const schema = orders.schema.map((f) =>
      f.name === "status" ? { ...f, options: { ...f.options, values: [...values, "reserved"] } } : f,
    );
    await pb.collections.update(orders.id, { schema });
    console.log("orders.status += reserved");
  } else console.log("orders.status already has reserved");

  console.log("DONE");
}

main().catch((e) => {
  console.error("FAILED:", JSON.stringify(e?.response ?? String(e), null, 2));
  process.exit(1);
});
