"use client";

import { useState } from "react";
import clsx from "clsx";
import { FAQS } from "@/lib/site";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <button
            key={f.q}
            type="button"
            onClick={() => setOpen(isOpen ? null : i)}
            aria-expanded={isOpen}
            className={clsx(
              "rounded-card border p-5 text-left transition-colors",
              isOpen ? "border-ice/30 bg-ice/5" : "border-line bg-ink-700 hover:border-white/15",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-display text-sm font-semibold leading-snug">{f.q}</span>
              <span className="mt-0.5 shrink-0 text-ice">{isOpen ? "–" : "+"}</span>
            </div>
            {isOpen && <p className="mt-3 text-sm leading-relaxed text-fg-dim">{f.a}</p>}
          </button>
        );
      })}
    </div>
  );
}
