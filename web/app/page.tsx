import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { TreatedImage } from "@/components/ui/TreatedImage";
import { GoogleReviewsStat } from "@/components/GoogleReviewsStat";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { Eyebrow, SectionIntro } from "@/components/ui/SectionIntro";
import { getServices, serviceImageUrl } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata = pageMetadata({ description: SITE.description, path: "/" });

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
        {/* Photo: full width up to 1920px (about its own resolution); on wider screens it
            stays that size and its sides fade into the page instead of stretching blurry.
            It settles in on load and drifts slower than the page as you scroll. */}
        <div className="hero-drift absolute inset-0 mx-auto max-w-[1920px] min-[1920px]:[mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
          <Image
            src="/images/hero.png"
            alt="Ski in de onderhoudsklem in de werkplaats van Spapens"
            fill
            priority
            sizes="(min-width: 1920px) 1920px, 100vw"
            className="animate-settle object-cover object-center"
          />
        </div>
        {/* Left→right legibility gradient. Its stops follow the 1440px text column, so on
            wide screens the dark side stays behind the text (same as at 1440 and below). */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg,
              rgba(8,9,12,.92) max(0px, calc(50% - 720px)),
              rgba(8,9,12,.70) calc(max(0px, 50% - 720px) + min(30%, 432px)),
              rgba(8,9,12,.28) calc(max(0px, 50% - 720px) + min(60%, 864px)),
              rgba(8,9,12,.10) 100%)`,
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
            {/* The H1 carries what people search for; the slogan stays the visual headline. */}
            {/* Tighter tracking on phones keeps the pill on one line (≥360px). */}
            <h1 className="inline-flex animate-rise items-center gap-2 rounded-full border border-ice/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ice [animation-delay:100ms] sm:tracking-[0.14em]">
              Ski &amp; snowboard onderhoud · Hilvarenbeek
            </h1>
            {/* Phone size scales with the screen so "Waxed for speed," stays one line
                (the line is ~8.1× the font size wide); fixed steps from sm up.
                Each line rises from behind its own baseline (the one signature move). */}
            <p className="mt-6 font-display text-[length:min(3rem,calc((100vw_-_2.5rem)/8.3))] font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
                <span className="block animate-line-up [animation-delay:200ms]">Waxed for speed,</span>
              </span>
              <span className="-my-[0.1em] block overflow-hidden py-[0.1em]">
                <span className="block animate-line-up [animation-delay:310ms]">tuned for thrill.</span>
              </span>
            </p>
            <p className="mt-6 max-w-lg animate-rise text-base leading-relaxed text-fg-muted [animation-delay:520ms] md:text-lg">
              Vakkundig waxen, slijpen en onderhoud van je ski&apos;s en snowboard — met de
              hand, klaar voor de eerste afdaling.
            </p>
            <div className="mt-9 flex animate-rise flex-wrap gap-3.5 [animation-delay:620ms]">
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

      {/* ── TRUST STRIP — border-to-border up to 1440px, then a boxed row in the column ── */}
      <section className="border-y border-line bg-ink-800">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-line bg-clip-padding md:grid-cols-4 min-[1440px]:border-x min-[1440px]:border-line">
          {/* The cells hold the divider lines, so only their contents enter. */}
          {TRUST.map((t) => (
            <div key={t.k} className="bg-ink-800 px-6 py-7">
              <div data-reveal>
                <div className="font-display text-xl font-semibold text-ice">{t.k}</div>
                <div className="mt-1 text-sm leading-snug text-fg-dim">{t.v}</div>
              </div>
            </div>
          ))}
          <GoogleReviewsStat className="bg-ink-800 px-6 py-7" />
        </div>
      </section>

      {/* ── GOOGLE REVIEWS — the newest few, each linking to the review on Google ── */}
      <GoogleReviews />

      {/* ── DIENSTEN TEASER ── */}
      <section>
        <Container className="py-20 md:py-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <SectionIntro enter="scroll" eyebrow="Diensten" title="Waar wij goed in zijn" />
            <Link
              href="/diensten"
              data-reveal="fade"
              className="group shrink-0 text-sm font-medium text-ice transition-colors hover:text-ice-hover"
            >
              Alle diensten <span className="link-arrow">→</span>
            </Link>
          </div>

          <div data-stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                      hoverZoom
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="aspect-square w-full"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-ink-800" />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="font-display text-lg font-semibold">{s.short}</div>
                    <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-fg-dim">
                      {s.blurb}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-mono text-base font-semibold text-ice">
                        {s.priceLabel}
                      </span>
                      <span className="text-sm text-fg-dim transition-colors group-hover:text-fg">
                        Meer <span className="link-arrow">→</span>
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
          <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[280px_1fr] md:gap-16">
            <div
              data-reveal="photo"
              className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-card border border-line bg-ink-900 md:mx-0 md:max-w-none"
            >
              <Image
                src="/images/hidde.webp"
                alt="Hidde Spapens, oprichter van Spapens Outdoor &amp; Snow"
                fill
                quality={90}
                // Box is only 280px, but request ~2x so it stays retina-crisp on
                // standard-density screens too (next/image picks the 640w render).
                sizes="560px"
                className="object-cover object-center"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{ background: "linear-gradient(180deg,transparent,rgba(8,9,12,0.85))" }}
              />
              <div className="absolute bottom-4 left-5">
                <div className="font-display text-lg font-semibold">Hidde Spapens</div>
                <Eyebrow>Oprichter</Eyebrow>
              </div>
            </div>

            <div>
              <SectionIntro enter="scroll" eyebrow="Even voorstellen" title="Over de eigenaar" />
              <div
                data-stagger
                className="mt-5 space-y-4 text-base leading-relaxed text-fg-muted md:text-[17px]"
              >
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
          <SectionIntro
            enter="scroll"
            eyebrow="Veelgestelde vragen"
            title="Goed om te weten"
            className="mb-8"
          />
          <FaqAccordion />
        </Container>
      </section>

      {/* ── CLOSING CTA ── */}
      <section>
        <Container className="pb-24">
          <div
            data-reveal="pop"
            className="relative overflow-hidden rounded-card border border-ice/20 bg-linear-to-b from-ice/[0.06] to-transparent px-8 py-16 text-center"
          >
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Klaar voor het nieuwe seizoen?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-fg-muted">
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
