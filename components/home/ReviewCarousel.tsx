"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { Review } from "@/types/tour";
import { StarRating } from "@/components/ui/StarRating";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ReviewCarousel({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0);
  const count = reviews.length;

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);
  const active = reviews[index];

  return (
    <section id="reviews" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Traveller Stories"
          title="Loved by travellers from around the world"
          description="Real, verified reviews from guests who explored Sri Lanka with a CeylonRoute driver-guide."
        />

        <div className="relative mt-12">
          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-ink/5 ring-1 ring-ink/5 sm:p-12">
            <Quote className="h-10 w-10 text-gold/40" />
            <blockquote
              key={active.id}
              className="mt-4 text-lg leading-8 text-ink/80 sm:text-xl"
              style={{ animation: "var(--animate-fade-in)" }}
            >
              “{active.comment}”
            </blockquote>

            <div className="mt-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={`https://flagcdn.com/w80/${active.countryCode}.png`}
                  alt={active.country}
                  width={44}
                  height={30}
                  className="h-7 w-auto rounded-sm shadow-sm ring-1 ring-ink/10"
                />
                <div>
                  <p className="font-semibold text-ink">{active.reviewerName}</p>
                  <p className="text-sm text-ink/55">{active.country}</p>
                </div>
              </div>
              <StarRating rating={active.rating} size={18} />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous review"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink/70 shadow ring-1 ring-ink/10 transition-colors hover:bg-ceylon-800 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                  aria-current={i === index}
                  className={[
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-ceylon-800" : "w-2 bg-ink/20 hover:bg-ink/40",
                  ].join(" ")}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next review"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink/70 shadow ring-1 ring-ink/10 transition-colors hover:bg-ceylon-800 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
