import { SITE } from "@/lib/site";
import { OG_IMAGE } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

// schema.org LocalBusiness (SportingGoodsStore) for local SEO.
export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    "@id": `${SITE.url}/#business`,
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.phone,
    email: SITE.email,
    logo: `${SITE.url}/logo.png`,
    image: `${SITE.url}${OG_IMAGE.url}`,
    hasMap: SITE.google.mapsUrl,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      postalCode: SITE.address.postalCode,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.lat,
      longitude: SITE.geo.lng,
    },
    areaServed: { "@type": "City", name: "Hilvarenbeek" },
  };

  return <JsonLd data={data} />;
}
