/**
 * Google Reviews data — easy to update.
 * Just add more objects to the array when new reviews come in.
 *
 * Google Maps link: https://maps.app.goo.gl/gTK9f4JYvophbXnJ8
 */

export interface Review {
  /** Reviewer's display name */
  name: string;
  /** 1–5 star rating */
  rating: number;
  /** Review text (English) */
  text: string;
  /** Approximate date string, e.g. "March 2026" */
  date: string;
  /** Optional avatar URL — falls back to initials */
  avatar?: string;
  /** Optional badge, e.g. "Local Guide" */
  badge?: string;
}

export const GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/gTK9f4JYvophbXnJ8";

/** Overall Google rating */
export const GOOGLE_RATING = 5.0;

/** Total number of Google reviews */
export const GOOGLE_REVIEW_COUNT = 1;

export const reviews: Review[] = [
  {
    name: "Tobiasz Golian",
    rating: 5,
    text: "Had a great experience with the car last year. Smooth booking, pickup and return. Very good value for money.",
    date: "March 2026",
    badge: "Local Guide",
  },
  // Add more reviews here:
  // {
  //   name: "Jane Doe",
  //   rating: 5,
  //   text: "Amazing service!",
  //   date: "April 2026",
  // },
];
