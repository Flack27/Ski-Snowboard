import clsx from "clsx";
import { Container } from "@/components/layout/Container";
import { TreatedImage } from "@/components/ui/TreatedImage";
import { Button } from "@/components/ui/Button";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { getServices, serviceImageUrl } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Diensten & tarieven",
  description:
    "Waxen, slijpen en onderhoud van ski's en snowboards — met de hand getuned in Hilvarenbeek. Bekijk de beurten en tarieven en boek direct een drop-off.",
  path: "/diensten",
});

export default async function DienstenPage() {
  const services = await getServices();
  return (
    <Container className="py-16 md:py-20">
      <SectionIntro
        as="h1"
        enter="load"
        eyebrow="Diensten & tarieven"
        title="Kies je beurt"
        lead="Met de hand getuned in Hilvarenbeek — nauwkeuriger dan machinaal. Kies een beurt en boek direct een drop-off, of stel eerst je vraag."
      />

      <div data-stagger className="mt-10 grid gap-5 md:grid-cols-2">
        {services.map((s) => {
          const img = serviceImageUrl(s, "1200x675");
          return (
          <div
            id={s.slug}
            key={s.slug}
            className={clsx(
              "flex scroll-mt-24 flex-col overflow-hidden rounded-card border bg-ink-700",
              s.popular ? "border-ice/40" : "border-line",
            )}
          >
            <div data-reveal="settle" className="relative">
              {img ? (
                <TreatedImage
                  src={img}
                  alt={s.name}
                  filter={false}
                  overlay="none"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="aspect-[16/9] w-full"
                />
              ) : (
                <div className="aspect-[16/9] w-full bg-ink-800" />
              )}
              {s.popular && (
                <span className="absolute left-4 top-4 rounded-md bg-ice px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-on-ice">
                  Meest gekozen
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">{s.name}</h2>
                <span className="whitespace-nowrap font-mono text-base font-semibold text-ice">
                  {s.priceLabel}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-fg-muted">
                {s.details}
              </p>
              {/* The checklist ticks in line by line. */}
              <ul data-stagger="fade" className="mt-4 flex flex-col gap-2">
                {s.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[15px] text-fg-muted">
                    <span className="text-ice">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                <Button
                  href={`/contact?dienst=${s.slug}#boeken`}
                  size="sm"
                  variant={s.popular ? "primary" : "soft"}
                >
                  Boek een afspraak
                </Button>
                <Button href={`/contact?dienst=${s.slug}#contact`} size="sm" variant="secondary">
                  Stel een vraag
                </Button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <p data-reveal="fade" className="mt-8 font-mono text-xs leading-relaxed text-fg-faint">
        <span className="text-ice">{"// let op"}</span> — prijzen zijn indicatief. Voor slijpen
        en onderhoud bekijken we je materiaal en geven we een prijs op maat.
      </p>
    </Container>
  );
}
