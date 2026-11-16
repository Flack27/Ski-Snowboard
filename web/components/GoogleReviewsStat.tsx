import clsx from "clsx";
import { getGooglePlace } from "@/lib/googlePlace";
import { Icon } from "@/components/ui/Icon";

const nf1 = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

// The live Google rating in the home trust strip, linking to all reviews on Google.
export async function GoogleReviewsStat({ className }: { className?: string }) {
  const { rating, reviewCount, reviewsUrl } = await getGooglePlace();

  return (
    <a
      href={reviewsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${nf1.format(rating)} van 5 sterren op Google — lees ${reviewCount} reviews`}
      className={clsx("group block transition-colors hover:bg-ink-700", className)}
    >
      {/* data-reveal: enters with the other cells of the trust strip. */}
      <div data-reveal>
        <div className="flex items-center gap-1.5 font-display text-xl font-semibold text-ice">
          <Icon name="star" />
          {nf1.format(rating)}
        </div>
        <div className="mt-1 text-sm leading-snug text-fg-dim">
          {reviewCount} Google reviews <span className="link-arrow">→</span>
        </div>
      </div>
    </a>
  );
}
