import Image from "next/image";

// Product photo (raw upload → run through the house treatment to unify),
// or a clean placeholder when the product has no image yet.
export function ProductImage({ url, alt }: { url: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-ink-800">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
          Foto volgt
        </span>
      </div>
    );
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-ink-800">
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="img-treatment object-cover"
      />
    </div>
  );
}
