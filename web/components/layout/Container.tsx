import clsx from "clsx";
import type { ReactNode } from "react";

// Site-wide width constraint: the 1440px content column every section, the header and
// the footer line up on. Section backgrounds run full width outside it.
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}
