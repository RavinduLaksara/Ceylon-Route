"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Check, Trash2, Star, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidatePublic } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import type { DbReview } from "@/lib/supabase/types";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"PENDING" | "APPROVED">("PENDING");

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (active) {
        setReviews((data as DbReview[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(
    () => reviews.filter((r) => (tab === "APPROVED" ? r.is_approved : !r.is_approved)),
    [reviews, tab],
  );
  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  async function setApproved(id: string, is_approved: boolean) {
    const supabase = createClient();
    const { error } = await supabase.from("reviews").update({ is_approved }).eq("id", id);
    if (!error) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_approved } : r)));
      await revalidatePublic("reviews");
    }
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      await revalidatePublic("reviews");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Reviews moderation</h1>
      <p className="text-sm text-ink/55">Approve customer reviews to publish them on the homepage.</p>

      <div className="mt-5 flex gap-1.5">
        {(["PENDING", "APPROVED"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              tab === t
                ? "bg-ceylon-800 text-white"
                : "bg-white text-ink/60 ring-1 ring-ink/10 hover:ring-ceylon-600",
            )}
          >
            {t === "PENDING" ? "Pending" : "Approved"}
            {t === "PENDING" && pendingCount > 0 && (
              <span className="rounded-full bg-gold px-1.5 text-[10px] text-ceylon-900">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 p-8 text-ink/50">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading reviews…
          </div>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-sm text-ink/50 ring-1 ring-ink/10">
            No {tab.toLowerCase()} reviews.
          </p>
        ) : (
          visible.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">
                    {r.reviewer_name}{" "}
                    <span className="font-normal text-ink/50">· {r.country}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < r.rating ? "fill-gold text-gold" : "fill-none text-ink/20",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-ink/40">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-ink/70">“{r.comment}”</p>

              <div className="mt-4 flex gap-2">
                {!r.is_approved ? (
                  <button
                    type="button"
                    onClick={() => setApproved(r.id, true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ceylon-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-ceylon-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setApproved(r.id, false)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 hover:bg-surface"
                  >
                    Unapprove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
