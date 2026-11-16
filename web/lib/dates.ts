// Date display shared by the booking widget (browser) and the booking emails
// (server). Kept free of server imports so client components can use it.

const NL_DAY = new Intl.DateTimeFormat("nl-NL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** '2026-11-17' → 'dinsdag 17 november'. Read as a calendar day, so no timezone can shift it. */
export function formatDateNl(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return NL_DAY.format(new Date(Date.UTC(y, m - 1, d)));
}
