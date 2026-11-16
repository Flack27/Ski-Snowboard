import { test } from "node:test";
import assert from "node:assert/strict";
import { FALLBACK_PLACE, parsePlace, type ApiPlace } from "@/lib/googlePlace";
import { SITE } from "@/lib/site";

// Regression: the Place ID came from a NEXT_PUBLIC_ build variable that the Docker build
// never received, so production had no reviews link and never fetched the live rating.
test("the reviews link and Place ID need no environment variable", () => {
  assert.equal(process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID, undefined);
  assert.match(SITE.google.placeId, /^ChIJ/);
  assert.ok(SITE.google.reviewsUrl.includes(SITE.google.placeId));
  assert.equal(FALLBACK_PLACE.reviewsUrl, SITE.google.reviewsUrl);
});

const review = (author: string, publishTime: string, text: string, extra = {}) => ({
  rating: 5,
  publishTime,
  relativePublishTimeDescription: "een maand geleden",
  originalText: { text, languageCode: "nl" },
  text: { text: `[vertaald] ${text}`, languageCode: "nl" },
  authorAttribution: { displayName: author, uri: `https://www.google.com/maps/contrib/${author}` },
  googleMapsUri: `https://www.google.com/maps/reviews/${author}`,
  ...extra,
});

test("newest reviews first, at most four, in the reviewer's own words", () => {
  const data: ApiPlace = {
    rating: 4.8,
    userRatingCount: 12,
    googleMapsLinks: { reviewsUri: "https://www.google.com/maps/place//reviews" },
    reviews: [
      review("A", "2026-03-01T10:00:00Z", "Top service"),
      review("B", "2026-10-20T10:00:00Z", "Snel klaar"),
      review("C", "2026-06-15T10:00:00Z", "Ski's als nieuw"),
      review("D", "2026-09-01T10:00:00Z", "Aanrader"),
      review("E", "2026-11-02T10:00:00Z", "Heel vriendelijk"),
    ],
  };
  const place = parsePlace(data);
  assert.deepEqual(place.reviews.map((r) => r.author), ["E", "B", "D", "C"]);
  assert.equal(place.reviews[0].text, "Heel vriendelijk"); // original, not the translation
  assert.equal(place.reviews[0].url, "https://www.google.com/maps/reviews/E");
  assert.equal(place.reviews[0].authorUrl, "https://www.google.com/maps/contrib/E");
  assert.equal(place.rating, 4.8);
  assert.equal(place.reviewCount, 12);
  assert.equal(place.reviewsUrl, "https://www.google.com/maps/place//reviews");
});

test("star-only reviews (no text) are skipped; missing data falls back to the known values", () => {
  const place = parsePlace({
    reviews: [review("A", "2026-01-01T00:00:00Z", "  "), review("B", "2026-02-01T00:00:00Z", "Prima")],
  });
  assert.deepEqual(place.reviews.map((r) => r.author), ["B"]);
  assert.equal(place.rating, SITE.google.rating);
  assert.equal(place.reviewCount, SITE.google.reviewCount);
  assert.equal(place.reviewsUrl, SITE.google.reviewsUrl);
});
