import type { Metadata } from "next";
import { SITE } from "./site";

export const DEFAULT_TITLE = `${SITE.name} — waxen & slijpen in Hilvarenbeek`;

/** Default share card (1200×630). Product pages use the product photo instead. */
export const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: SITE.name };

type OgImage = { url: string; width?: number; height?: number; alt?: string };

/**
 * Metadata for one page: its own title, description, canonical URL and share card.
 * Next replaces (not merges) a parent's `openGraph`, so every page sets the full set
 * here — otherwise a shared /shop link would show the homepage's title and URL.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = OG_IMAGE,
}: {
  title?: string; // omit for the homepage (uses DEFAULT_TITLE)
  description: string;
  path: string;
  image?: OgImage;
}): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "nl_NL",
      siteName: SITE.name,
      url: path,
      title: title ?? DEFAULT_TITLE,
      description,
      images: [image],
    },
  };
}
