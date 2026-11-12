"use client";

import { useEffect, useState } from "react";
import { PenLine, CheckCircle2, Star } from "lucide-react";
import type { Review } from "@/types/tour";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ReviewModal } from "@/components/reviews/ReviewModal";

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const writeButton = (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className="inline-flex items-center gap-2 rounded-full border border-ceylon-800 px-6 py-3 text-sm font-semibold text-ceylon-800 transition-colors hover:bg-ceylon-800 hover:text-white"
    >
      <PenLine className="h-4 w-4" /> Write a Review
    </button>
  );

  return (
    <>
      {reviews.length > 0 ? (
        <ReviewCarousel reviews={reviews} action={writeButton} />
      ) : (
        <section id="reviews" className="scroll-mt-20 bg-surface py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <SectionHeading
              eyebrow="Traveller Stories"
              title="Be the first to share your journey"
              description="Travelled with CeylonRoute? Your story helps future travellers plan with confidence."
            />
            <div className="mt-8 flex justify-center">
              <Star className="h-10 w-10 text-gold/40" />
            </div>
            <div className="mt-8">{writeButton}</div>
          </div>
        </section>
      )}

      {modalOpen && (
        <ReviewModal
          open
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            setToast(true);
          }}
        />
      )}

      {/* Success toast */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ceylon-800 px-5 py-3 text-sm font-medium text-white shadow-xl"
          style={{ animation: "var(--animate-fade-in)" }}
          role="status"
        >
          <CheckCircle2 className="h-5 w-5 text-gold" />
          Thank you! Your review will appear once verified.
        </div>
      )}
    </>
  );
}
