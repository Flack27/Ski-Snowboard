import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { DEFAULT_TITLE, OG_IMAGE } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { initReveal } from "@/lib/reveal";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const ibmSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});
const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

// Site-wide defaults. Each indexable page sets its own canonical + share card via
// pageMetadata() (lib/seo.ts); nothing here may claim a page's URL, or pages without
// their own (404, checkout) would inherit the homepage's canonical.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: SITE.name,
    title: DEFAULT_TITLE,
    description: SITE.description,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      className={`${spaceGrotesk.variable} ${ibmSans.variable} ${ibmMono.variable}`}
    >
      <head>
        {/* Scroll entrances (lib/reveal.ts). Inline so it is running before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: `(${initReveal.toString()})()` }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        {/* Sections run edge to edge (their backgrounds and photos fill wide screens);
            each one keeps its content in the 1440px column via <Container>. */}
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartDrawer />
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
