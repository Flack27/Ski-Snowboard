import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { TreatedImage } from "@/components/ui/TreatedImage";
import { GoogleReviewsStat } from "@/components/GoogleReviewsStat";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { getServices, serviceImageUrl } from "@/lib/services";

const TRUST = [
  { k: "Met de hand", v: "Nauwkeuriger dan machinaal" },
  { k: "5 min", v: "Van Hilvarenbeek centrum" },
  { k: "Op afspraak", v: "Eenvoudig online boeken" },
];

export default async function HomePage() {
  const services = await getServices();
  return (
    <>
      {/* ── HERO — fills the first viewport under the header ── */}
      <section className="relative isolate flex min-h-[calc(100dvh-var(--header-h))] items-center overflow-hidden">
        {/* background image (fills the section; section is the positioned ancestor) */}
        <Image
          src="/images/hero.png"
          alt="Ski in de onderhoudsklem in de werkplaats van Spapens"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* left→right legibility gradient — image is already dark, keep it visible */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg,rgba(8,9,12,.92) 0%,rgba(8,9,12,.70) 30%,rgba(8,9,12,.28) 60%,rgba(8,9,12,.10) 100%)",
          }}
        />
        {/* bottom fade into the page */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,rgba(8,9,12,0) 55%,rgba(8,9,12,.92) 100%)" }}
        />
        <Container className="relative py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-ice/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ice">
              Hilvarenbeek · met de hand getuned
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
              Waxed for speed,
              <br />
              tuned for thrill.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-fg-muted md:text-lg">
              Vakkundig waxen, slijpen en onderhoud van je ski&apos;s en snowboard — met de
              hand, klaar voor de eerste afdaling.
            </p>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Button href="/contact#boeken" size="lg">
                Boek een service
              </Button>
              <Button href="/shop" size="lg" variant="secondary">
                Bekijk de shop
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── TRUST STRIP — spans border-to-border, no side padding ── */}
      <section className="border-y border-line bg-ink-800">
        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.k} className="bg-ink-800 px-6 py-7">
              <div className="font-display text-xl font-semibold text-ice">{t.k}</div>
              <div className="mt-1 text-xs leading-snug text-fg-dim">{t.v}</div>
            </div>
          ))}
          <GoogleReviewsStat className="bg-ink-800 px-6 py-7" />
        </div>
      </section>

      {/* ── DIENSTEN TEASER ── */}
      <section>
        <Container className="py-20 md:py-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ice">
                Diensten
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                Waar wij goed in zijn
              </h2>
            </div>
            <Link
              href="/diensten"
              className="shrink-0 text-sm font-medium text-ice hover:text-ice-hover"
            >
              Alle diensten →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => {
              const img = serviceImageUrl(s, "600x600");
              return (
                <Link
                  key={s.slug}
                  href={`/diensten#${s.slug}`}
                  className="group flex flex-col overflow-hidden rounded-card border border-line bg-ink-700 transition-colors hover:border-white/15"
                >
                  {img ? (
                    <TreatedImage
                      src={img}
                      alt={s.name}
                      filter={false}
                      overlay="none"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="aspect-square w-full"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-ink-800" />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="font-display text-lg font-semibold">{s.short}</div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-dim">
                      {s.blurb}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-mono text-base font-semibold text-ice">
                        {s.priceLabel}
                      </span>
                      <span className="text-sm text-fg-dim transition-colors group-hover:text-fg">
                        Meer →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── OVER DE EIGENAAR ── */}
      <section className="border-y border-line bg-ink-800">
        <Container className="py-20 md:py-24">
          <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[280px_1fr] md:gap-12">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-card border border-line bg-ink-900 md:mx-0 md:max-w-none">
              <Image
                src="/images/hidde.webp"
                alt="Hidde Spapens, oprichter van Spapens Outdoor &amp; Snow"
                fill
                sizes="(max-width: 768px) 280px, 280px"
                className="object-cover object-center"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{ background: "linear-gradient(180deg,transparent,rgba(8,9,12,0.85))" }}
              />
              <div className="absolute bottom-4 left-5">
                <div className="font-display text-lg font-semibold">Hidde Spapens</div>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ice">
                  Oprichter
                </div>
              </div>
            </div>

            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ice">
                Even voorstellen
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                Over de eigenaar
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-fg-muted md:text-base">
                <p>
                  Mijn naam is Hidde Spapens, oprichter van Spapens Outdoor &amp; Snow. Met een
                  outdooropleiding, mijn Landes 1-skilerarendiploma en meer dan vier jaar ervaring in
                  de wintersportbranche heb ik van mijn passie mijn werk gemaakt.
                </p>
                <p>
                  Kwaliteit, vakmanschap en persoonlijke service staan bij ons centraal. Al het
                  onderhoud wordt met de hand uitgevoerd, zodat iedere ski en snowboard de aandacht
                  krijgt die het verdient. Met onze kennis en ervaring zorgen we ervoor dat iedere
                  wintersporter met perfect onderhouden materiaal en een goed gevoel de piste op
                  gaat.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section>
        <Container className="py-16 md:py-20">
          <div className="mb-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ice">
              Veelgestelde vragen
            </div>
            <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
              Goed om te weten
            </h2>
          </div>
          <FaqAccordion />
        </Container>
      </section>

      {/* ── CLOSING CTA ── */}
      <section>
        <Container className="pb-24">
          <div className="relative overflow-hidden rounded-card border border-ice/20 bg-linear-to-b from-ice/[0.06] to-transparent px-8 py-16 text-center">
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Klaar voor het nieuwe seizoen?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-fg-muted">
              Breng je ski&apos;s of board langs in Hilvarenbeek — of scoor een tweedehands set
              uit de shop.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3.5">
              <Button href="/contact#boeken" size="lg">
                Boek een drop-off
              </Button>
              <Button href="/shop" size="lg" variant="soft">
                Naar de shop
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <FaqJsonLd />
    </>
  );
}
