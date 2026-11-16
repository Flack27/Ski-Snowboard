import { cache } from "react";
import { unstable_cache } from "next/cache";
import { SITE } from "./site";

// The Google listing's live rating and reviews (Places API, New), for the home page.
// One call a day: the project is capped at 100 Place requests per day, and the review
// fields are billed on Google's priciest Places tier (free up to 1,000 calls a month).

export type GoogleReview = {
  author: string;
  authorUrl: string | null; // the reviewer's Google profile
  authorPhoto: string | null;
  rating: number;
  text: string; // in the reviewer's own words, not Google's translation
  when: string; // e.g. "2 maanden geleden"
  publishTime: string;
  url: string | null; // this review on Google Maps
};

export type GooglePlace = {
  rating: number;
  reviewCount: number;
  reviewsUrl: string;
  reviews: GoogleReview[]; // newest first
};

type ApiText = { text?: string };
type ApiReview = {
  rating?: number;
  text?: ApiText;
  originalText?: ApiText;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};
export type ApiPlace = {
  rating?: number;
  userRatingCount?: number;
  reviews?: ApiReview[];
  googleMapsLinks?: { reviewsUri?: string };
};

const MAX_REVIEWS = 4;

/** The listing as the site shows it: the newest reviews that have text, in their own words. */
export function parsePlace(data: ApiPlace): GooglePlace {
  const reviews = (data.reviews ?? [])
    .map((r) => ({
      author: r.authorAttribution?.displayName?.trim() || "Google-gebruiker",
      authorUrl: r.authorAttribution?.uri || null,
      authorPhoto: r.authorAttribution?.photoUri || null,
      rating: r.rating ?? 0,
      text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
      when: r.relativePublishTimeDescription ?? "",
      publishTime: r.publishTime ?? "",
      url: r.googleMapsUri || null,
    }))
    .filter((r) => r.text)
    .sort((a, b) => b.publishTime.localeCompare(a.publishTime))
    .slice(0, MAX_REVIEWS);

  return {
    rating: typeof data.rating === "number" ? data.rating : SITE.google.rating,
    reviewCount: data.userRatingCount ?? SITE.google.reviewCount,
    reviewsUrl: data.googleMapsLinks?.reviewsUri || SITE.google.reviewsUrl,
    reviews,
  };
}

/** Shown when the API can't be reached: the last known rating, a plain link, no reviews. */
export const FALLBACK_PLACE: GooglePlace = parsePlace({});

// Cached for a day across requests and rebuilds of the page. A failed call throws, so it
// is never cached: the last good result keeps being served until a call succeeds again.
const fetchPlace = unstable_cache(
  async (): Promise<GooglePlace> => {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(SITE.google.placeId)}?languageCode=nl`,
      {
        headers: {
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY ?? "",
          "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsLinks",
        },
      },
    );
    if (!res.ok) throw new Error(`Google Places ${res.status}`);
    return parsePlace((await res.json()) as ApiPlace);
  },
  ["google-place"],
  { revalidate: 86400, tags: ["google-place"] },
);

// React's cache(): the rating in the trust strip and the reviews row share one call per render.
export const getGooglePlace = cache(async (): Promise<GooglePlace> => {
  // No key (local dev without .env.local, or the Docker build step): skip the call
  // entirely, so a key-less build can't cache an empty result for a day.
  if (!process.env.GOOGLE_MAPS_API_KEY) return FALLBACK_PLACE;
  try {
    return await fetchPlace();
  } catch (e) {
    console.warn("Google reviews unavailable:", e instanceof Error ? e.message : e);
    return FALLBACK_PLACE;
  }
});
