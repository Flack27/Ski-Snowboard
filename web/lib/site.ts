// Central business facts (NAP), navigation, and the static services list.
// Products/orders/bookings live in PocketBase; services are fixed content and live here.

export const SITE = {
  name: "Spapens Outdoor & Snow",
  shortName: "SOS",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://waxen-en-slijpen-hilvarenbeek.nl",
  tagline: "Waxed for speed, tuned for thrill.",
  description:
    "Met de hand waxen, slijpen en onderhoud van ski's en snowboards in Hilvarenbeek. Plus een wisselende voorraad tweedehands ski's, boards en gear.",
  appointmentNote:
    "De winkel en werkplaats zijn uitsluitend op afspraak geopend — plan online of bel even voordat je langskomt.",
  email: "info@waxen-en-slijpen-hilvarenbeek.nl",
  phone: "+31657284765",
  phoneDisplay: "06 57284765",
  address: {
    street: "Petershemstraat 16",
    postalCode: "5081 ZB",
    city: "Hilvarenbeek",
    region: "Noord-Brabant",
    country: "NL",
  },
  // Rooftop coordinates of Petershemstraat 16 (from the Google listing).
  geo: { lat: 51.4884215, lng: 5.1347909 },
  socials: {
    instagram: "",
    whatsapp: "https://wa.me/31657284765",
  },
  google: {
    // Public — used to build the "read reviews" link and to fetch the live rating.
    placeId: process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID ?? "",
    reviewsUrl: process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID
      ? `https://www.google.com/maps/place/?q=place_id:${process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID}`
      : "",
    // Real current Google values — also the fallback if the live API call ever fails.
    rating: 5.0,
    reviewCount: 5,
  },
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
] as const;

export type Service = {
  slug: string;
  name: string;
  short: string;
  blurb: string;
  details: string;
  priceLabel: string;
  image: string;
  popular?: boolean;
  features: string[];
};

// Placeholder Dutch copy — replace blurbs/features with final wording when ready.
export const SERVICES: Service[] = [
  {
    slug: "waxen",
    name: "Waxen van ski's & snowboard",
    short: "Waxen",
    blurb: "Schoon, heet gewaxt en uitgeborsteld voor maximale glij op de piste.",
    details:
      "We reinigen de belaag grondig, brengen warme wax aan die intrekt in de basis en borstelen uit voor maximale glij. Regelmatig waxen beschermt je belaag en houdt je ski's of board sneller.",
    priceLabel: "€ 17,50",
    image: "/images/waxen.png",
    features: ["Reinigen van de belaag", "Warm inwaxen", "Uitborstelen & polijsten"],
  },
  {
    slug: "slijpen",
    name: "Slijpen van ski's & snowboard",
    short: "Slijpen",
    blurb: "Scherpe, gelijkmatige kanten voor grip en controle in de afdaling.",
    details:
      "Botte of beschadigde kanten kosten je grip en controle. We slijpen de kanten op de juiste hoek, verwijderen bramen en controleren de belaag op beschadigingen. Prijs op aanvraag, afhankelijk van de staat.",
    priceLabel: "Op aanvraag",
    image: "/images/slijpen.png",
    features: ["Kanten op hoek slijpen", "Bramen verwijderen", "Controle op beschadigingen"],
  },
  {
    slug: "waxen-slijpen",
    name: "Waxen & slijpen combi",
    short: "Waxen + slijpen",
    blurb: "De volledige beurt: kanten scherp én belaag snel. Onze meest gekozen beurt.",
    details:
      "De complete beurt in één keer: eerst de kanten scherp slijpen, dan warm inwaxen en uitborstelen. Ideaal aan het begin van het seizoen of voor je op wintersport gaat. Onze meest gekozen beurt.",
    priceLabel: "€ 27,50",
    image: "/images/combi.png",
    popular: true,
    features: ["Slijpen van de kanten", "Warm inwaxen", "Uitborstelen & polijsten"],
  },
  {
    slug: "onderhoud",
    name: "Onderhoudsbeurt compleet",
    short: "Onderhoud",
    blurb: "Reinigen, waxen, slijpen én kleine reparaties aan de onderkant.",
    details:
      "Een complete opknapbeurt: reinigen, slijpen, waxen én kleine reparaties aan de belaag. We bekijken je materiaal en adviseren wat nodig is. Prijs vanaf € 35, afhankelijk van het werk.",
    priceLabel: "Vanaf € 35",
    image: "/images/onderhoud.png",
    features: ["Volledige reiniging", "Waxen & slijpen", "Kleine belaagreparaties"],
  },
];

export const CATEGORIES = [
  { value: "ski", label: "Ski's" },
  { value: "snowboard", label: "Snowboards" },
  { value: "boots", label: "Schoenen" },
  { value: "accessoires", label: "Accessoires" },
  { value: "wax", label: "Wax & onderhoud" },
] as const;

export const FAQS = [
  {
    q: "Hoe vaak moet ik mijn ski's en snowboard laten waxen?",
    a: "Afhankelijk van het gebruik wordt geadviseerd om je ski's en snowboard om de 5–10 dagen te laten waxen.",
  },
  {
    q: "Wanneer is het tijd om mijn ski's en snowboard te laten slijpen?",
    a: "Dit is ook afhankelijk van het gebruik. Het wordt aangeraden om dit na elke week skiën of snowboarden te laten doen. Ook kun je het beste je ski's en snowboard laten slijpen wanneer je merkt dat de grip afneemt en de kanten bot worden.",
  },
  {
    q: "Wat houdt een onderhoudsbeurt precies in?",
    a: "Een onderhoudsbeurt omvat het waxen, slijpen, polijsten, repareren en afstellen van jouw ski's en snowboard om ze in topconditie te houden.",
  },
  {
    q: "Wanneer kan ik mijn ski's of snowboard weer ophalen?",
    a: "Dit hangt erg af van de drukte. Het duurt meestal 2 tot 3 werkdagen. Wel kun je een spoedbeurt aanvragen waarbij je de volgende dag je materiaal al kunt ophalen.",
  },
] as const;
