// Central business facts (NAP), navigation, shop categories and FAQs.
// Services, products, orders and bookings live in PocketBase (editable in the admin).

export const SITE = {
  name: "Spapens Outdoor & Snow",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sosoutdoor.nl",
  description:
    "Met de hand waxen, slijpen en onderhoud van ski's en snowboards in Hilvarenbeek. Plus een wisselende voorraad tweedehands ski's, boards en gear.",
  appointmentNote:
    "De winkel en werkplaats zijn uitsluitend op afspraak geopend — plan online of bel even voordat je langskomt.",
  // Usual time until the gear is ready again (booking panel + FAQ).
  turnaround: "3 tot 4 werkdagen",
  email: "info@sosoutdoor.nl",
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
    // The listing's public Place ID: fetches the live rating and reviews (lib/googlePlace.ts)
    // and builds the reviews link. A fixed fact like the address, not an env var: as a
    // NEXT_PUBLIC_ build variable it never reached the Docker build, so in production the
    // reviews link and the live rating were silently off.
    placeId: "ChIJ_0dI4dnBxkcRLhCHmnojlTY",
    // Fallback reviews link, for when the API (which returns its own) can't be reached.
    reviewsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJ_0dI4dnBxkcRLhCHmnojlTY",
    // The Google Maps business listing itself (not just the address pin).
    mapsUrl:
      "https://www.google.com/maps/place/Spapens+ski+%26+snowboard+service/@51.4884215,5.1347909,17z/data=!4m15!1m8!3m7!1s0x47c6c0ab698f55f5:0xc7918884f7a35631!2sPetershemstraat+16,+5081+ZB+Hilvarenbeek!3b1!8m2!3d51.4884215!4d5.1347909!16s%2Fg%2F11c1flvtdn!3m5!1s0x47c6c1d9e14847ff:0x3695237a9a87102e!8m2!3d51.4884215!4d5.1347909!16s%2Fg%2F11wgmjc_f0",
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
    a: `Dit hangt erg af van de drukte. Het duurt meestal ${SITE.turnaround}. Wel kun je een spoedbeurt aanvragen waarbij je de volgende dag je materiaal al kunt ophalen.`,
  },
] as const;
