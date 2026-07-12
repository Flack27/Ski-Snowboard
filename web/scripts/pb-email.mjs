// Makes the customer confirmation emails editable in the admin: adds
// reservation_email + order_email (rich text) to `settings` and seeds defaults.
// Placeholders the owner can use: {naam} {ref} {bedrag} {items}. Idempotent.
import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_ADMIN_EMAIL || "admin@spapens.local";
const PASS = process.env.PB_ADMIN_PASSWORD || "devadmin12345_ChangeMe";

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const EDITOR = (name) => ({ name, type: "editor", required: false, options: { convertUrls: false } });

export const RESERVATION_DEFAULT = `<p>Hoi {naam},</p><p>Bedankt voor je reservering ({ref})! We houden je bestelling voor je apart en nemen contact met je op om een moment af te spreken voor het ophalen en betalen.</p><p>{items}</p><p><strong>Totaal: {bedrag}</strong> — te betalen bij het ophalen in Hilvarenbeek.</p><p>Groeten,<br>Spapens Outdoor &amp; Snow</p>`;

export const ORDER_DEFAULT = `<p>Hoi {naam},</p><p>Bedankt voor je bestelling ({ref})! We hebben je betaling ontvangen.</p><p>{items}</p><p><strong>Totaal: {bedrag}</strong></p><p>We laten je weten wanneer je bestelling klaarstaat om op te halen in Hilvarenbeek.</p><p>Groeten,<br>Spapens Outdoor &amp; Snow</p>`;

async function main() {
  await pb.admins.authWithPassword(EMAIL, PASS);

  const settings = await pb.collections.getOne("settings");
  const names = new Set(settings.schema.map((f) => f.name));
  const schema = [...settings.schema];
  if (!names.has("reservation_email")) schema.push(EDITOR("reservation_email"));
  if (!names.has("order_email")) schema.push(EDITOR("order_email"));
  if (schema.length !== settings.schema.length) {
    await pb.collections.update(settings.id, { schema });
    console.log("settings: added email template fields");
  } else console.log("settings: email template fields already present");

  const rec = (await pb.collection("settings").getFullList())[0];
  if (rec) {
    const upd = {};
    if (!rec.reservation_email) upd.reservation_email = RESERVATION_DEFAULT;
    if (!rec.order_email) upd.order_email = ORDER_DEFAULT;
    if (Object.keys(upd).length) {
      await pb.collection("settings").update(rec.id, upd);
      console.log("seeded default email templates");
    } else console.log("email templates already set");
  }
  console.log("DONE");
}

main().catch((e) => {
  console.error("FAILED:", JSON.stringify(e?.response ?? String(e), null, 2));
  process.exit(1);
});
