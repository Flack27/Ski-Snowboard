"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { NAV, SITE } from "@/lib/site";
import { Button } from "@/components/ui/Button";
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
      aria-label="Winkelwagen openen"
      className={clsx("relative", className)}
    >
      🛒
      {mounted && count > 0 && (
        <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ice px-1 font-mono text-[9px] font-semibold text-on-ice">
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
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-800/80 backdrop-blur">
      <Container bleedAtWide className="flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt={SITE.name}
            width={1448}
            height={853}
            priority
            className="h-11 w-auto object-contain"
          />
          <span className="font-display text-[15px] font-semibold tracking-tight">
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
                className={clsx(
                  "transition-colors",
                  active ? "text-fg" : "text-fg-dim hover:text-fg",
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

        {/* Mobile: cart + primary CTA (full menu drawer wired in a later step) */}
        <div className="flex items-center gap-5 md:hidden">
          <CartLink count={cartCount} mounted={mounted} className="text-fg-dim" />
          <Button href="/contact#boeken" size="sm">
            Boek nu
          </Button>
        </div>
      </Container>
    </header>
  );
}
