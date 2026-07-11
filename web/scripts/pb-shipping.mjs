// Adds owner-toggleable shipping: a shipping_enabled + shipping_price on `settings`,
// and a "shipping" fulfilment option + address fields on `orders`. Idempotent.
import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_ADMIN_EMAIL || "admin@spapens.local";
const PASS = process.env.PB_ADMIN_PASSWORD || "devadmin12345_ChangeMe";

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const BOOL = (name) => ({ name, type: "bool", required: false, options: {} });
const NUM = (name) => ({ name, type: "number", required: false, options: { min: null, max: null, noDecimal: true } });
const T = (name) => ({ name, type: "text", required: false, options: { min: null, max: null, pattern: "" } });

async function main() {
  await pb.admins.authWithPassword(EMAIL, PASS);

  // settings: + shipping_enabled, shipping_price
  const settings = await pb.collections.getOne("settings");
  const sNames = new Set(settings.schema.map((f) => f.name));
  const sSchema = [...settings.schema];
  if (!sNames.has("shipping_enabled")) sSchema.push(BOOL("shipping_enabled"));
  if (!sNames.has("shipping_price")) sSchema.push(NUM("shipping_price"));
  if (sSchema.length !== settings.schema.length) {
    await pb.collections.update(settings.id, { schema: sSchema });
    console.log("settings: added shipping fields");
  } else console.log("settings: shipping fields already present");

  // orders: fulfilment += "shipping"; + address fields
  const orders = await pb.collections.getOne("orders");
  const oNames = new Set(orders.schema.map((f) => f.name));
  const oSchema = orders.schema.map((f) =>
    f.name === "fulfilment" ? { ...f, options: { ...f.options, values: ["pickup", "shipping"] } } : f,
  );
  for (const nm of ["customer_address", "customer_postal", "customer_city"]) {
    if (!oNames.has(nm)) oSchema.push(T(nm));
  }
  await pb.collections.update(orders.id, { schema: oSchema });
  console.log("orders: shipping option + address fields");

  // defaults on the settings record
  const rec = (await pb.collection("settings").getFullList())[0];
  if (rec) {
    await pb.collection("settings").update(rec.id, {
      shipping_enabled: rec.shipping_enabled ?? false,
      shipping_price: rec.shipping_price ?? 0,
    });
    console.log("settings record: shipping defaults set");
  }
  console.log("DONE");
}

main().catch((e) => {
  console.error("FAILED:", JSON.stringify(e?.response ?? String(e), null, 2));
  process.exit(1);
});
