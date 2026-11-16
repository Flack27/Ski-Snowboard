"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV, SITE } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/layout/Container";
import { useCartCount, useCartDrawer } from "@/lib/cart";

function CartLink({
  count,
  mounted,
  className,
}: {
  count: number;
  mounted: boolean;
  className?: string;
}) {
  const setOpen = useCartDrawer((s) => s.setOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={mounted && count > 0 ? `Winkelwagen openen (${count})` : "Winkelwagen openen"}
      className={clsx("press relative flex h-9 w-9 items-center justify-center", className)}
    >
      <Icon name="cart" />
      {mounted && count > 0 && (
        // Keyed on the count, so the badge pops each time something is added.
        <span
          key={count}
          className="absolute -right-0.5 top-0 flex h-[18px] min-w-[18px] animate-pop items-center justify-center rounded-full bg-ice px-1 font-mono text-[10px] font-semibold text-on-ice"
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);
  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-800/80 backdrop-blur">
      <Container className="flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt={SITE.name}
            width={1448}
            height={853}
            priority
            // Shown ~75px wide; without this every page preloaded a 1920px (3840px on
            // retina) copy of the logo.
            sizes="80px"
            className="h-11 w-auto object-contain"
          />
          {/* Wordmark: hidden on mobile to leave room for the controls */}
          <span className="hidden font-display text-[15px] font-semibold tracking-tight md:inline-block">
            Spapens <span className="font-normal text-fg-dim">Outdoor &amp; Snow</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  // Underline draws in from the left on hover and stays under the current page.
                  "relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-ice after:transition-[scale] after:duration-300",
                  active
                    ? "text-fg after:scale-x-100"
                    : "text-fg-dim after:scale-x-0 hover:text-fg hover:after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <CartLink count={cartCount} mounted={mounted} className="text-fg-dim hover:text-fg" />
          <Button href="/contact#boeken" size="sm">
            Boek nu
          </Button>
        </nav>

        {/* Mobile: cart + CTA + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <CartLink count={cartCount} mounted={mounted} className="text-fg-dim" />
          <Button href="/contact#boeken" size="sm">
            Boek nu
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="press flex h-9 w-9 items-center justify-center text-fg-dim hover:text-fg"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </Container>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="animate-drop border-t border-line bg-ink-800 md:hidden">
          <Container className="flex flex-col py-1">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "border-b border-line py-3 text-sm font-medium last:border-b-0",
                    active ? "text-ice" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </Container>
        </nav>
      )}
    </header>
  );
}
