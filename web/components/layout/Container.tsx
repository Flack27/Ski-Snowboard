import clsx from "clsx";
import type { ReactNode } from "react";

// Site-wide width constraint. One place to tune how wide the whole site runs.
// `bleedAtWide` drops the side padding once the frame gutters appear (>=1440px),
// so the nav/footer content sits right at the column edge (used by header + footer).
export function Container({
  className,
  children,
  bleedAtWide,
}: {
  className?: string;
  children: ReactNode;
  bleedAtWide?: boolean;
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12",
        bleedAtWide && "3xl:px-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
