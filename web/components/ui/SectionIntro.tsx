import clsx from "clsx";
import type { ReactNode } from "react";

/** The small mono label in the accent colour that sits above a heading. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("font-mono text-[11px] uppercase tracking-[0.16em] text-ice", className)}>
      {children}
    </div>
  );
}

// Page-load entrance for the parts of an intro, one after another.
const LOAD = [
  "animate-rise",
  "animate-rise [animation-delay:80ms]",
  "animate-rise [animation-delay:160ms]",
];

/**
 * Eyebrow + heading + lead that opens a page or a section. Its parts arrive one after
 * another: on page load for the intro at the top of a page (`enter="load"`, CSS only),
 * or as it scrolls into view for sections further down (`enter="scroll"`).
 */
export function SectionIntro({
  eyebrow,
  title,
  lead,
  as: Heading = "h2",
  enter,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  enter: "load" | "scroll";
  className?: string;
}) {
  let step = 0;
  const anim = () => (enter === "load" ? LOAD[step++] : undefined);

  return (
    <div data-stagger={enter === "scroll" ? "" : undefined} className={className}>
      {eyebrow && <Eyebrow className={anim()}>{eyebrow}</Eyebrow>}
      <Heading
        className={clsx(
          "font-display font-semibold",
          Heading === "h1" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
          eyebrow && "mt-2.5",
          anim(),
        )}
      >
        {title}
      </Heading>
      {lead && (
        <p
          className={clsx(
            "mt-3 max-w-2xl text-base leading-relaxed text-fg-muted",
            Heading === "h1" && "md:text-lg",
            anim(),
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
