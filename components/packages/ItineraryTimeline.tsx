"use client";

import { useState } from "react";
import { ChevronDown, Clock, BedDouble, MapPin } from "lucide-react";
import type { ItineraryDay } from "@/types/tour";
import { cn } from "@/lib/utils";

export function ItineraryTimeline({ itinerary }: { itinerary: ItineraryDay[] }) {
  // First day open by default.
  const [open, setOpen] = useState<number[]>([itinerary[0]?.day ?? 1]);

  const toggle = (day: number) =>
    setOpen((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

  return (
    <ol className="relative space-y-3">
      {itinerary.map((item) => {
        const isOpen = open.includes(item.day);
        return (
          <li
            key={item.day}
            className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10 transition-shadow hover:shadow-md hover:shadow-ink/5"
          >
            <button
              type="button"
              onClick={() => toggle(item.day)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-ceylon-800 text-white">
                <span className="text-[10px] font-medium uppercase leading-none opacity-70">Day</span>
                <span className="text-base font-bold leading-tight">{item.day}</span>
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-ink">{item.title}</span>
                <span className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/55">
                  {item.travelTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {item.travelTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" /> {item.overnightStay}
                  </span>
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-ink/40 transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-ink/10 px-5 pb-5 pt-4 sm:pl-20">
                  <ul className="space-y-2">
                    {item.activities.map((activity) => (
                      <li key={activity} className="flex items-start gap-2 text-sm text-ink/70">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
