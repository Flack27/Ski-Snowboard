import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import { CartDrawer } from "@/components/shop/CartDrawer";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — waxen & slijpen in Hilvarenbeek`,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "ski waxen",
    "snowboard slijpen",
    "ski onderhoud",
    "Hilvarenbeek",
    "ski service",
    "tweedehands ski's",
  ],
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [{ url: "/logo.png", alt: SITE.name }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      className={`${spaceGrotesk.variable} ${ibmSans.variable} ${ibmMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        {/* Header + footer run full-width with no side border (content still aligns to the column). */}
        <SiteHeader />
        {/* Only the main content is framed: thin grey border down both sides, ink-900 in the gutters. */}
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col border-x border-line">
          <main className="flex-1">{children}</main>
        </div>
        <SiteFooter />
        <CartDrawer />
        <LocalBusinessJsonLd />
      </body>
    </html>
  );
}
