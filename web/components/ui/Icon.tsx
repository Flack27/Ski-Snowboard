import clsx from "clsx";

// Line icons in currentColor. Emoji were used before, but emoji ignore CSS colour
// (the "ice" pin and phone rendered red) and look different on every OS.
const PATHS = {
  cart: (
    <>
      <path d="M3 4h2l2.4 10.2a1.5 1.5 0 0 0 1.46 1.16h8.5a1.5 1.5 0 0 0 1.45-1.12L20.5 8H6.2" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  // Filled, for ratings.
  star: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.5l-5.4 2.9 1.2-5.9-4.4-4.1 6-.7L12 3.2z"
    />
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  // Default size as SVG attributes, which any size class (h-4 w-4) overrides. A default
  // h-5 w-5 class used to win over smaller sizes (Tailwind emits h-5 after h-4).
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={clsx("shrink-0", className)}
    >
      {PATHS[name]}
    </svg>
  );
}
