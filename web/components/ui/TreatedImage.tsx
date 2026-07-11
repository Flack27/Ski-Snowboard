import Image from "next/image";
import clsx from "clsx";

// Applies the single house photo recipe (cool, contrasty, near-black edges)
// so every raw uploaded photo reads as one set. Always fills its container —
// give the container a size via `className`. Set `filter={false}` for images
// that are already colour-graded (the marketing/hero shots).
export function TreatedImage({
  src,
  alt,
  className,
  priority,
  sizes = "100vw",
  rounded,
  overlay = "vignette",
  filter = true,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  rounded?: boolean;
  overlay?: "vignette" | "none";
  filter?: boolean;
}) {
  return (
    <div className={clsx("relative overflow-hidden bg-ink-700", rounded && "rounded-card", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={clsx("object-cover", filter && "img-treatment")}
      />
      {overlay === "vignette" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(120% 120% at 60% 10%, transparent 45%, rgba(4,8,11,0.62))",
          }}
        />
      )}
    </div>
  );
}
