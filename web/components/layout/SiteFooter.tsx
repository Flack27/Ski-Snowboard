import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { Container } from "@/components/layout/Container";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink-800">
      <Container bleedAtWide className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="font-display text-base font-semibold">{SITE.name}</div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-fg-dim">{SITE.description}</p>
        </div>

        <div className="text-sm">
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-ice">Menu</div>
          <ul className="mt-4 space-y-2 text-fg-muted">
            {NAV.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="hover:text-fg">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-ice">Contact</div>
          <address className="mt-4 space-y-2 not-italic text-fg-muted">
            <div>{SITE.address.street}</div>
            <div>
              {SITE.address.postalCode} {SITE.address.city}
            </div>
            <div>
              <a href={`tel:${SITE.phone}`} className="font-mono hover:text-fg">
                {SITE.phoneDisplay}
              </a>
            </div>
            <div>
              <a href={`mailto:${SITE.email}`} className="break-all hover:text-fg">
                {SITE.email}
              </a>
            </div>
          </address>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container bleedAtWide className="flex items-center justify-between py-5 text-xs text-fg-faint">
          <span>
            © {year} {SITE.name}
          </span>
          <span className="font-mono">Geopend op afspraak</span>
        </Container>
      </div>
    </footer>
  );
}
