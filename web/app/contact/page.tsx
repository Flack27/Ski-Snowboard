import { Container } from "@/components/layout/Container";
import { getBookingConfig } from "@/lib/booking";
import { getServices } from "@/lib/services";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { ContactForm } from "@/components/contact/ContactForm";
import { SITE } from "@/lib/site";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow, SectionIntro } from "@/components/ui/SectionIntro";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact & afspraak maken",
  description:
    "Boek online een drop-off voor het waxen, slijpen of onderhoud van je ski's of snowboard in Hilvarenbeek, of stuur ons een bericht.",
  path: "/contact",
});

// Live embedded map (keyless), centred on the shop.
const mapEmbedUrl = `https://maps.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}&z=16&output=embed`;

export default async function ContactPage() {
  const [config, services] = await Promise.all([getBookingConfig(), getServices()]);
  const serviceOptions = services.map((s) => ({ slug: s.slug, label: s.short, popular: s.popular }));
  const serviceLabels = Object.fromEntries(services.map((s) => [s.slug, s.short]));

  return (
    <>
      {/* ── BOOKING ── */}
      <section id="boeken" className="scroll-mt-24 border-b border-line">
        <Container className="py-16 md:py-20">
          <SectionIntro
            as="h1"
            enter="load"
            eyebrow="Afspraak maken"
            title="Boek een drop-off"
            lead="Kies een dienst, dag en tijd. Je brengt je materiaal langs in Hilvarenbeek; we laten je weten zodra het klaar is om op te halen."
          />
          <div className="mt-8">
            <BookingWidget config={config} serviceOptions={serviceOptions} />
          </div>
        </Container>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="scroll-mt-24">
        <Container className="grid gap-12 py-16 md:grid-cols-2 md:py-20">
          <div>
            <SectionIntro
              enter="scroll"
              eyebrow="Contact"
              title="Neem contact op"
              lead={
                <>
                  Vragen of een afspraak? Stuur een bericht of bel{" "}
                  <a
                    href={`tel:${SITE.phone}`}
                    className="font-mono text-fg transition-colors hover:text-ice"
                  >
                    {SITE.phoneDisplay}
                  </a>
                  .
                </>
              }
            />
            <div data-reveal className="mt-6">
              <ContactForm serviceLabels={serviceLabels} />
            </div>
          </div>

          <div data-reveal data-reveal-delay="120">
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
              href={SITE.google.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ice transition-colors hover:text-ice-hover"
            >
              <Icon name="pin" className="h-4 w-4" />
              Bekijk op Google Maps <span className="link-arrow">→</span>
            </a>

            <Eyebrow className="mt-6">Locatie &amp; openingstijden</Eyebrow>
            <div data-stagger="fade" className="mt-4 flex flex-col gap-3 text-[15px] text-fg-muted">
              <div className="flex gap-2.5">
                <Icon name="pin" className="mt-px text-ice" />
                <span>
                  {SITE.address.street}
                  <br />
                  {SITE.address.postalCode} {SITE.address.city}
                </span>
              </div>
              <div className="flex gap-2.5">
                <Icon name="clock" className="mt-px text-ice" />
                <span>Geopend op afspraak — boek online of bel voordat je langskomt.</span>
              </div>
              <div className="flex gap-2.5">
                <Icon name="mail" className="mt-px text-ice" />
                <a href={`mailto:${SITE.email}`} className="break-all transition-colors hover:text-ice">
                  {SITE.email}
                </a>
              </div>
              <div className="flex gap-2.5">
                <Icon name="phone" className="mt-px text-ice" />
                <a href={`tel:${SITE.phone}`} className="font-mono transition-colors hover:text-ice">
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
