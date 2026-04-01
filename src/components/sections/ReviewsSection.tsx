"use client";

import { useTranslations } from "next-intl";
import { Star, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import {
  reviews,
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  GOOGLE_MAPS_URL,
} from "@/lib/reviews";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < count
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function Initials({ name }: { name: string }) {
  const parts = name.split(" ");
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`
    : parts[0].slice(0, 2);
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
      {initials.toUpperCase()}
    </div>
  );
}

export function ReviewsSection() {
  const t = useTranslations("reviews");

  return (
    <section className="bg-background py-20" id="reviews">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            {t("label")}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Google rating summary */}
        <Reveal>
          <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            {/* Google "G" logo */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-foreground">
                  {GOOGLE_RATING.toFixed(1)}
                </span>
                <Stars count={Math.round(GOOGLE_RATING)} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("basedOn", { count: GOOGLE_REVIEW_COUNT })}
              </p>
            </div>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Google
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </Reveal>

        {/* Review cards */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                {/* Reviewer info */}
                <div className="flex items-center gap-3">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <Initials name={review.name} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {review.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {review.badge && (
                        <span className="text-xs text-accent">{review.badge}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="mt-3">
                  <Stars count={review.rating} />
                </div>

                {/* Review text */}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
            </Reveal>
          ))}

          {/* "Leave a review" CTA card — always last */}
          <Reveal delay={reviews.length * 0.1}>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-accent hover:bg-accent/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Star className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                {t("leaveReview")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("leaveReviewSub")}
              </p>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
