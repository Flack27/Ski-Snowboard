// Adds an editable `services` collection (text/prices/images all in the admin),
// seeds the 4 services (uploading their images), and switches bookings.service
// to a free text field so services stay flexible. Idempotent.
import { readFileSync } from "node:fs";
import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const EMAIL = process.env.PB_ADMIN_EMAIL || "admin@spapens.local";
const PASS = process.env.PB_ADMIN_PASSWORD || "devadmin12345_ChangeMe";
const PUBLIC_DIR = new URL("../public/images/", import.meta.url);

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const T = (name, required = false) => ({ name, type: "text", required, options: { min: null, max: null, pattern: "" } });
const NUM = (name) => ({ name, type: "number", required: false, options: { min: null, max: null, noDecimal: true } });
const BOOL = (name) => ({ name, type: "bool", required: false, options: {} });
const EDITOR = (name) => ({ name, type: "editor", required: false, options: { convertUrls: false } });
const JSONF = (name) => ({ name, type: "json", required: false, options: { maxSize: 200000 } });
const FILE1 = (name) => ({
  name, type: "file", required: false,
  options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"], thumbs: ["600x600", "1200x675"], protected: false },
});

const servicesCollection = {
  name: "services",
  type: "base",
  schema: [
    T("name", true), T("slug", true), T("short"), T("blurb"), EDITOR("details"),
    T("price_label"), FILE1("image"), JSONF("features"), BOOL("popular"), NUM("sort"), BOOL("active"),
  ],
  listRule: "active = true", viewRule: "active = true", createRule: null, updateRule: null, deleteRule: null,
  indexes: ["CREATE UNIQUE INDEX `idx_services_slug` ON `services` (`slug`)"],
};

const services = [
  {
    slug: "waxen", name: "Waxen van ski's & snowboard", short: "Waxen",
    blurb: "Schoon, heet gewaxt en uitgeborsteld voor maximale glij op de piste.",
    details: "We reinigen de belaag grondig, brengen warme wax aan die intrekt in de basis en borstelen uit voor maximale glij. Regelmatig waxen beschermt je belaag en houdt je ski's of board sneller.",
    price_label: "€ 17,50", features: ["Reinigen van de belaag", "Warm inwaxen", "Uitborstelen & polijsten"],
    popular: false, sort: 1, active: true, imageFile: "waxen.png",
  },
  {
    slug: "slijpen", name: "Slijpen van ski's & snowboard", short: "Slijpen",
    blurb: "Scherpe, gelijkmatige kanten voor grip en controle in de afdaling.",
    details: "Botte of beschadigde kanten kosten je grip en controle. We slijpen de kanten op de juiste hoek, verwijderen bramen en controleren de belaag op beschadigingen.",
    price_label: "€ 17,50", features: ["Kanten op hoek slijpen", "Bramen verwijderen", "Controle op beschadigingen"],
    popular: false, sort: 2, active: true, imageFile: "slijpen.png",
  },
  {
    slug: "waxen-slijpen", name: "Waxen & slijpen combi", short: "Waxen + slijpen",
    blurb: "De volledige beurt: kanten scherp én belaag snel. Onze meest gekozen beurt.",
    details: "De complete beurt in één keer: eerst de kanten scherp slijpen, dan warm inwaxen en uitborstelen. Ideaal aan het begin van het seizoen of voor je op wintersport gaat. Onze meest gekozen beurt.",
    price_label: "€ 27,50", features: ["Slijpen van de kanten", "Warm inwaxen", "Uitborstelen & polijsten"],
    popular: true, sort: 3, active: true, imageFile: "combi.png",
  },
  {
    slug: "onderhoud", name: "Onderhoudsbeurt compleet", short: "Onderhoud",
    blurb: "Reinigen, waxen, slijpen én kleine reparaties aan de onderkant.",
    details: "Een complete opknapbeurt: reinigen, slijpen, waxen én kleine reparaties aan de belaag. We bekijken je materiaal en adviseren wat nodig is. Prijs vanaf € 35, afhankelijk van het werk.",
    price_label: "Vanaf € 35", features: ["Volledige reiniging", "Waxen & slijpen", "Kleine belaagreparaties"],
    popular: false, sort: 4, active: true, imageFile: "onderhoud.png",
  },
];

async function main() {
  await pb.admins.authWithPassword(EMAIL, PASS);
  console.log("authed");

  const existing = await pb.collections.getFullList();
  if (!existing.some((c) => c.name === "services")) {
    await pb.collections.create(servicesCollection);
    console.log("created collection: services");
  } else console.log("services collection already exists");

  // Note: bookings.service stays a select on the 4 service slugs (PocketBase can't
  // change a field type in place). Service slugs are the stable keys; name/price/
  // text/image are all editable in the services collection.

  const seeded = await pb.collection("services").getFullList();
  if (seeded.length === 0) {
    for (const s of services) {
      const buf = readFileSync(new URL(s.imageFile, PUBLIC_DIR));
      const file = new File([buf], s.imageFile, { type: "image/png" });
      const fd = new FormData();
      fd.append("name", s.name);
      fd.append("slug", s.slug);
      fd.append("short", s.short);
      fd.append("blurb", s.blurb);
      fd.append("details", s.details);
      fd.append("price_label", s.price_label);
      fd.append("features", JSON.stringify(s.features));
      fd.append("popular", String(s.popular));
      fd.append("sort", String(s.sort));
      fd.append("active", String(s.active));
      fd.append("image", file);
      await pb.collection("services").create(fd);
      console.log("seeded service:", s.slug);
    }
  } else console.log("services already seeded:", seeded.length);

  console.log("DONE");
}

main().catch((e) => {
  console.error("SERVICES SETUP FAILED:", JSON.stringify(e?.response ?? e?.data ?? String(e), null, 2));
  process.exit(1);
});
