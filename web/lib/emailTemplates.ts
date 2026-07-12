// Customer email bodies are editable in the admin (settings.reservation_email /
// order_email, rich text). Falls back to these defaults if left empty.
const PB = process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090";

const RESERVATION_DEFAULT = `<p>Hoi {naam},</p><p>Bedankt voor je reservering ({ref})! We houden je bestelling voor je apart en nemen contact met je op om een moment af te spreken voor het ophalen en betalen.</p><p>{items}</p><p><strong>Totaal: {bedrag}</strong> — te betalen bij het ophalen in Hilvarenbeek.</p><p>Groeten,<br>Spapens Outdoor &amp; Snow</p>`;

const ORDER_DEFAULT = `<p>Hoi {naam},</p><p>Bedankt voor je bestelling ({ref})! We hebben je betaling ontvangen.</p><p>{items}</p><p><strong>Totaal: {bedrag}</strong></p><p>We laten je weten wanneer je bestelling klaarstaat om op te halen in Hilvarenbeek.</p><p>Groeten,<br>Spapens Outdoor &amp; Snow</p>`;

export type EmailTemplates = { reservation: string; order: string };

export async function getEmailTemplates(): Promise<EmailTemplates> {
  try {
    const res = await fetch(`${PB}/api/collections/settings/records?perPage=1`, {
      next: { revalidate: 300, tags: ["email-templates"] },
    });
    if (!res.ok) return { reservation: RESERVATION_DEFAULT, order: ORDER_DEFAULT };
    const s = (await res.json()).items?.[0];
    const r = (s?.reservation_email ?? "").trim();
    const o = (s?.order_email ?? "").trim();
    return {
      reservation: r || RESERVATION_DEFAULT,
      order: o || ORDER_DEFAULT,
    };
  } catch {
    return { reservation: RESERVATION_DEFAULT, order: ORDER_DEFAULT };
  }
}
