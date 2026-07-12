import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getBookingConfig } from "@/lib/booking";
import { getServices } from "@/lib/services";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & afspraak maken",
  description:
    "Boek online een drop-off voor het waxen, slijpen of onderhoud van je ski's of snowboard in Hilvarenbeek, of stuur ons een bericht.",
  alternates: { canonical: "/contact" },
};

// The actual Google Maps business listing (not just the address pin).
const mapsUrl =
  "https://www.google.com/maps/place/Spapens+ski+%26+snowboard+service/@51.4884215,5.1347909,17z/data=!4m15!1m8!3m7!1s0x47c6c0ab698f55f5:0xc7918884f7a35631!2sPetershemstraat+16,+5081+ZB+Hilvarenbeek!3b1!8m2!3d51.4884215!4d5.1347909!16s%2Fg%2F11c1flvtdn!3m5!1s0x47c6c1d9e14847ff:0x3695237a9a87102e!8m2!3d51.4884215!4d5.1347909!16s%2Fg%2F11wgmjc_f0";
// Live embedded map (keyless), centred on the shop.
const mapEmbedUrl = `https://maps.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}&z=16&output=embed`;

export default async function ContactPage() {
  const [config, services] = await Promise.all([getBookingConfig(), getServices()]);
  const serviceOptions = services.map((s) => ({ slug: s.slug, label: s.short }));
  const serviceLabels = Object.fromEntries(services.map((s) => [s.slug, s.short]));

  return (
    <>
      {/* ── BOOKING ── */}
      <section id="boeken" className="scroll-mt-24 border-b border-line">
        <Container className="py-16 md:py-20">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ice">
            Afspraak maken
          </div>
          <h1 className="font-display text-3xl font-semibold md:text-4xl">Boek een drop-off</h1>
          <p className="mt-3 text-sm leading-relaxed text-fg-dim">
            Kies een dienst, dag en tijd. Je brengt je materiaal langs in Hilvarenbeek; we laten je
            weten zodra het klaar is om op te halen.
          </p>
          <div className="mt-8">
            <BookingWidget config={config} serviceOptions={serviceOptions} />
          </div>
        </Container>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="scroll-mt-24">
        <Container className="grid gap-12 py-16 md:grid-cols-2 md:py-20">
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ice">
              Contact
            </div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">Neem contact op</h2>
            <p className="mt-3 text-sm text-fg-dim">
              Vragen of een afspraak? Stuur een bericht of bel{" "}
              <a href={`tel:${SITE.phone}`} className="font-mono text-fg hover:text-ice">
                {SITE.phoneDisplay}
              </a>
              .
            </p>
            <div className="mt-6">
              <ContactForm serviceLabels={serviceLabels} />
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-card border border-line">
              <iframe
                src={mapEmbedUrl}
                title="Locatie Spapens Outdoor & Snow"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-52 w-full border-0"
              />
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ice hover:text-ice-hover"
            >
              📍 Bekijk op Google Maps →
            </a>

            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ice">
              Locatie &amp; openingstijden
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-fg-muted">
              <div className="flex gap-2.5">
                <span className="text-ice">📍</span>
                <span>
                  {SITE.address.street}
                  <br />
                  {SITE.address.postalCode} {SITE.address.city}
                </span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-ice">🕑</span>
                <span>Geopend op afspraak — boek online of bel voordat je langskomt.</span>
              </div>
              <div className="flex gap-2.5">
                <span className="text-ice">✉</span>
                <a href={`mailto:${SITE.email}`} className="break-all hover:text-ice">
                  {SITE.email}
                </a>
              </div>
              <div className="flex gap-2.5">
                <span className="text-ice">📞</span>
                <a href={`tel:${SITE.phone}`} className="font-mono hover:text-ice">
                  {SITE.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
