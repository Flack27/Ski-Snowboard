import clsx from "clsx";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/SectionIntro";
import { Icon } from "@/components/ui/Icon";
import { getGooglePlace, type GoogleReview } from "@/lib/googlePlace";

// Literal class names, so Tailwind generates them: one column per review on wide screens.
const COLS = ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4"];

function Stars({ rating }: { rating: number }) {
  return (
    <div role="img" aria-label={`${rating} van 5 sterren`} className="flex gap-0.5 text-ice">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          name="star"
          className={clsx("h-4 w-4", i >= Math.round(rating) && "opacity-25")}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review: r }: { review: GoogleReview }) {
  return (
    <li className="flex w-[85%] shrink-0 snap-start flex-col rounded-card border border-line bg-ink-700 p-5 sm:w-[55%] md:w-[42%] lg:w-auto">
      <Stars rating={r.rating} />
      <blockquote className="mt-3 line-clamp-5 text-[15px] leading-relaxed text-fg-muted">
        “{r.text}”
      </blockquote>

      <div className="mt-auto flex items-center gap-3 pt-5">
        {r.authorPhoto ? (
          // Google's own avatar URL, shown as-is (re-hosting it via next/image isn't wanted).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.authorPhoto}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-9 w-9 shrink-0 rounded-full bg-ink-800"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ice/10 font-display text-sm font-semibold text-ice"
          >
            {r.author.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          {/* The reviewer's Google profile: shows it is a real person. */}
          {r.authorUrl ? (
            <a
              href={r.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-semibold text-fg transition-colors hover:text-ice"
            >
              {r.author}
            </a>
          ) : (
            <span className="block truncate text-sm font-semibold text-fg">{r.author}</span>
          )}
          {r.when && <span className="block text-xs text-fg-dim">{r.when}</span>}
        </div>
      </div>

      {r.url && (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 border-t border-line pt-3 text-sm font-medium text-ice transition-colors hover:text-ice-hover"
        >
          Bekijk deze review op Google <span className="link-arrow">→</span>
        </a>
      )}
    </li>
  );
}

// The newest Google reviews, right under the rating in the trust strip. Each links to the
// review itself and to its author on Google. Renders nothing when there are none to show.
export async function GoogleReviews() {
  const { reviews, reviewCount, reviewsUrl } = await getGooglePlace();
  if (!reviews.length) return null;

  return (
    <section aria-label="Recente Google reviews">
      <Container className="pt-16 md:pt-20">
        <div data-stagger className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <Eyebrow>Recente Google reviews</Eyebrow>
          <a
            href={reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group text-sm font-medium text-ice transition-colors hover:text-ice-hover"
          >
            Alle {reviewCount} reviews op Google Maps <span className="link-arrow">→</span>
          </a>
        </div>
        {/* Phones and tablets swipe through the cards; wide screens show them side by side. */}
        <ul
          data-stagger
          className={clsx(
            "-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:thin] sm:-mx-8 sm:scroll-px-8 sm:px-8",
            "lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0",
            COLS[reviews.length],
          )}
        >
          {reviews.map((r) => (
            <ReviewCard key={`${r.author}-${r.publishTime}`} review={r} />
          ))}
        </ul>
      </Container>
    </section>
  );
}
