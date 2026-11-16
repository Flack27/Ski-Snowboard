/**
 * URL-safe slug: "Grote beurt" → "grote-beurt", "HEAD C240i – 156 cm" → "head-c240i-156-cm".
 * Slugs are free text in the admin, but they end up in URLs, anchors and bookings,
 * so the site always works from this normalised form.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
