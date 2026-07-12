import { Resend } from "resend";
import { SITE } from "./site";
import { formatCents } from "./money";
import { getEmailTemplates } from "./emailTemplates";

// Transactional email via Resend. If RESEND_API_KEY is unset, sends are skipped
// (returns { skipped: true }) so forms still succeed during development.
const FROM = process.env.MAIL_FROM || `Spapens Outdoor & Snow <onboarding@resend.dev>`;
const OWNER = process.env.MAIL_OWNER || SITE.email;

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export function isMailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendContactMessage(d: { name: string; email: string; message: string }) {
  const r = client();
  if (!r) return { skipped: true as const };
  await r.emails.send({
    from: FROM,
    to: OWNER,
    replyTo: d.email,
    subject: `Nieuw bericht via de website — ${d.name}`,
    text: `Van: ${d.name} <${d.email}>\n\n${d.message}`,
  });
  return { sent: true as const };
}

type BookingMail = {
  ref: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  date: string;
  time_slot: string;
  note?: string;
};

export async function sendBookingNotification(b: BookingMail) {
  const r = client();
  if (!r) return { skipped: true as const };
  await r.emails.send({
    from: FROM,
    to: OWNER,
    replyTo: b.email,
    subject: `Nieuwe afspraak — ${b.date} ${b.time_slot} (${b.service})`,
    text: `Nieuwe drop-off afspraak (${b.ref})\n\nDienst: ${b.service}\nDatum: ${b.date} om ${b.time_slot}\nNaam: ${b.name}\nE-mail: ${b.email}\nTelefoon: ${b.phone || "-"}\nNotitie: ${b.note || "-"}`,
  });
  return { sent: true as const };
}

export async function sendBookingConfirmation(b: BookingMail) {
  const r = client();
  if (!r) return { skipped: true as const };
  await r.emails.send({
    from: FROM,
    to: b.email,
    subject: `Je afspraak bij Spapens Outdoor & Snow — ${b.date} ${b.time_slot}`,
    text: `Hoi ${b.name},\n\nBedankt voor je afspraak (${b.ref}). We verwachten je op ${b.date} om ${b.time_slot} voor: ${b.service}.\n\nAdres: ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}\nVragen? Bel ${SITE.phoneDisplay}.\n\nTot dan!\nSpapens Outdoor & Snow`,
  });
  return { sent: true as const };
}

export type OrderMail = {
  ref: string;
  amount: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  fulfilment?: string;
  customer_address?: string;
  customer_postal?: string;
  customer_city?: string;
  line_items?: { name: string; qty: number; line_total_cents: number }[];
};

function orderLines(o: OrderMail) {
  return (o.line_items ?? [])
    .map((li) => `${li.qty}× ${li.name} — ${formatCents(li.line_total_cents)}`)
    .join("\n");
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Fills an editable customer-email template ({naam} {ref} {bedrag} {items}).
function renderTemplate(tpl: string, o: OrderMail): string {
  const itemsHtml = (o.line_items ?? [])
    .map((li) => `${li.qty}× ${escapeHtml(li.name)} — ${formatCents(li.line_total_cents)}`)
    .join("<br>");
  return tpl
    .replace(/\{naam\}/g, escapeHtml(o.customer_name ?? ""))
    .replace(/\{ref\}/g, escapeHtml(o.ref))
    .replace(/\{bedrag\}/g, formatCents(o.amount))
    .replace(/\{items\}/g, itemsHtml);
}

export async function sendOrderNotification(o: OrderMail) {
  const r = client();
  if (!r) return { skipped: true as const };
  const addr =
    o.fulfilment === "shipping"
      ? `\nVerzenden naar:\n${o.customer_address}\n${o.customer_postal} ${o.customer_city}`
      : "\nOphalen in Hilvarenbeek";
  await r.emails.send({
    from: FROM,
    to: OWNER,
    replyTo: o.customer_email,
    subject: `Betaalde bestelling ${o.ref} — ${formatCents(o.amount)}`,
    text: `Nieuwe betaalde bestelling (${o.ref})\n\n${orderLines(o)}\n\nTotaal: ${formatCents(o.amount)}\n\nKlant: ${o.customer_name} <${o.customer_email}> ${o.customer_phone || ""}${addr}`,
  });
  return { sent: true as const };
}

export async function sendOrderConfirmation(o: OrderMail) {
  const r = client();
  if (!r || !o.customer_email) return { skipped: true as const };
  const tpl = (await getEmailTemplates()).order;
  await r.emails.send({
    from: FROM,
    to: o.customer_email,
    subject: `Bevestiging bestelling ${o.ref} — Spapens Outdoor & Snow`,
    html: renderTemplate(tpl, o),
  });
  return { sent: true as const };
}

// Pay-at-pickup: order is reserved, paid in person on collection.
export async function sendReservationNotification(o: OrderMail) {
  const r = client();
  if (!r) return { skipped: true as const };
  await r.emails.send({
    from: FROM,
    to: OWNER,
    replyTo: o.customer_email,
    subject: `Nieuwe reservering ${o.ref} — ${formatCents(o.amount)} (betaalt bij ophalen)`,
    text: `Nieuwe reservering (${o.ref}) — betaling bij ophalen.\n\n${orderLines(o)}\n\nTotaal: ${formatCents(o.amount)}\n\nKlant: ${o.customer_name} <${o.customer_email}> ${o.customer_phone || ""}`,
  });
  return { sent: true as const };
}

export async function sendReservationConfirmation(o: OrderMail) {
  const r = client();
  if (!r || !o.customer_email) return { skipped: true as const };
  const tpl = (await getEmailTemplates()).reservation;
  await r.emails.send({
    from: FROM,
    to: o.customer_email,
    subject: `Je reservering ${o.ref} — Spapens Outdoor & Snow`,
    html: renderTemplate(tpl, o),
  });
  return { sent: true as const };
}
