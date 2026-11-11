"use client";

import { useMemo, useState } from "react";
import type { TourPackage } from "@/types/tour";
import { PackageCard } from "./PackageCard";
import { cn } from "@/lib/utils";

export function PackageGrid({
  packages,
  styles,
}: {
  packages: TourPackage[];
  styles: string[];
}) {
  const [filter, setFilter] = useState<string>("All");

  const filters = ["All", ...styles];
  const visible = useMemo(
    () =>
      filter === "All"
        ? packages
        : packages.filter((p) => p.travelStyle.includes(filter)),
    [filter, packages],
  );

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
              filter === f
                ? "bg-ceylon-800 text-white shadow"
                : "bg-white text-ink/70 ring-1 ring-ink/10 hover:ring-ceylon-600",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid — `key` on the wrapper retriggers the fade when the filter changes */}
      <div
        key={filter}
        className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        style={{ animation: "var(--animate-fade-in)" }}
      >
        {visible.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink/55">
          No tours match this style yet — tell us what you&apos;re after on WhatsApp and we&apos;ll
          build one.
        </p>
      )}
    </div>
  );
}
