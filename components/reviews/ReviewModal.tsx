"use client";

import { useEffect, useState } from "react";
import { X, Star, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function ReviewModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !country.trim() || !comment.trim()) {
      setError("Please fill in your name, country and comment.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("reviews").insert({
        reviewer_name: name.trim(),
        country: country.trim(),
        rating,
        comment: comment.trim(),
        is_approved: false,
      });
      if (insertError) {
        setError("Could not submit your review. Please try again.");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Write a review"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        style={{ animation: "var(--animate-fade-in)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Write a review</h2>
            <p className="mt-1 text-sm text-ink/60">Share your CeylonRoute experience.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">Name</span>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/60">Country</span>
              <input
                className={inputCls}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-ink/60">Rating</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-colors",
                        value <= (hover || rating)
                          ? "fill-gold text-gold"
                          : "fill-none text-ink/25",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink/60">Your review</span>
            <textarea
              rows={4}
              className={inputCls}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other travellers about your trip…"
            />
          </label>

          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ceylon-800 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ceylon-600 focus:ring-2 focus:ring-ceylon-600/20";
