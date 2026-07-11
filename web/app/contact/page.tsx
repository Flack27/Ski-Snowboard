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

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE.address.street} ${SITE.address.postalCode} ${SITE.address.city}`,
)}`;

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
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-dim">
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
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bekijk op Google Maps"
              className="relative block h-44 overflow-hidden rounded-card border border-line"
              style={{ background: "linear-gradient(135deg,#0e1519,#16232a)" }}
            >
              <span
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(52,227,242,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(52,227,242,.06) 1px,transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-3xl text-ice drop-shadow-[0_0_8px_rgba(52,227,242,.6)]">
                📍
              </span>
              <span className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-wide text-fg-faint">
                Kaart — Hilvarenbeek
              </span>
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
