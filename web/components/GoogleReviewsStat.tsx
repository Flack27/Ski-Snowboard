import clsx from "clsx";
import { SITE } from "@/lib/site";

// Fetches the live rating from the Google Places API (New). Cached for a day via ISR.
// Returns null when not configured or on any error, so we fall back to static values.
async function fetchLiveRating(): Promise<{ rating: number; count: number } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = SITE.google.placeId;
  if (!key || !placeId) return null;

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount",
        },
        next: { revalidate: 86400 }, // refresh once a day, no redeploy needed
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { rating?: number; userRatingCount?: number };
    if (typeof data.rating !== "number") return null;
    return { rating: data.rating, count: data.userRatingCount ?? 0 };
  } catch {
    return null;
  }
}

const nf1 = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export async function GoogleReviewsStat({ className }: { className?: string }) {
  const live = await fetchLiveRating();
  const rating = live?.rating ?? SITE.google.rating;
  const count = live?.count ?? SITE.google.reviewCount;
  const href = SITE.google.reviewsUrl;

  const body = (
    <>
      <div className="flex items-center gap-1.5 font-display text-xl font-semibold text-ice">
        <span aria-hidden>★</span>
        {nf1.format(rating)}
      </div>
      <div className="mt-1 text-xs leading-snug text-fg-dim">
        {count} Google reviews{href ? " →" : ""}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${nf1.format(rating)} van 5 sterren op Google — lees ${count} reviews`}
        className={clsx("group block transition-colors hover:bg-ink-700", className)}
      >
        {body}
      </a>
    );
  }
  return <div className={className}>{body}</div>;
}
