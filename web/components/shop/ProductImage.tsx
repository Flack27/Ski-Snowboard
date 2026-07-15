import Image from "next/image";
import clsx from "clsx";

const DEFAULT_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

// Product photo in a fixed frame. The shots come in every shape — a ski stood
// upright is roughly 1:2, a boot is square — so the photo is contained rather
// than cropped, and the leftover space is filled with a blurred blow-up of the
// same shot (same URL, so no extra request) instead of a flat panel.
// Give the frame its ratio via `className`.
export function ProductImage({
  url,
  alt,
  className,
  sizes = DEFAULT_SIZES,
}: {
  url: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (!url) {
    return (
      <div className={clsx("flex w-full items-center justify-center bg-ink-800", className)}>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
          Foto volgt
        </span>
      </div>
    );
  }
  return (
    <div className={clsx("relative w-full overflow-hidden bg-ink-800", className)}>
      <Image
        src={url}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        className="scale-125 object-cover opacity-30 blur-2xl"
      />
      <Image src={url} alt={alt} fill sizes={sizes} className="img-treatment object-contain" />
    </div>
  );
}
