"use client";

import { useState } from "react";
import clsx from "clsx";
import { FAQS } from "@/lib/site";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div data-stagger className="grid gap-3 sm:grid-cols-2">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <button
            key={f.q}
            type="button"
            onClick={() => setOpen(isOpen ? null : i)}
            aria-expanded={isOpen}
            className={clsx(
              "rounded-card border p-5 text-left transition-[border-color,background-color,scale] active:scale-[0.99]",
              isOpen ? "border-ice/30 bg-ice/5" : "border-line bg-ink-700 hover:border-white/15",
            )}
          >
            <span className="flex items-start justify-between gap-3">
              <span className="font-display text-base font-semibold leading-snug">{f.q}</span>
              {/* A plus that turns into a cross. */}
              <span
                aria-hidden
                className={clsx(
                  "mt-0.5 shrink-0 text-lg leading-none text-ice transition-[rotate] duration-300",
                  isOpen && "rotate-45",
                )}
              >
                +
              </span>
            </span>
            {/* The answer is always in the page (and read by search engines); it opens to its
                real height by animating the grid row from 0fr to 1fr. */}
            <span
              className={clsx(
                "grid transition-[grid-template-rows] duration-300",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              aria-hidden={!isOpen}
            >
              <span className="block overflow-hidden">
                <span className="block pt-3 text-base leading-relaxed text-fg-muted">{f.a}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
