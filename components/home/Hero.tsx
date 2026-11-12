"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Clock, Car } from "lucide-react";
import type { PricingSettings, TourPackage, VehicleType } from "@/types/tour";
import { startingDayRate, formatUsd } from "@/lib/pricing";
import { buildWhatsAppLink, vehicleLabel } from "@/lib/whatsapp";
import { vehicleOrder } from "@/data/mockTours";
import { BookingModal } from "@/components/booking/BookingModal";

const durations = [3, 4, 6, 8, 10];

export function Hero({
  settings,
  packages,
}: {
  settings: PricingSettings;
  packages: TourPackage[];
}) {
  const [vehicle, setVehicle] = useState<VehicleType>("Aqua");
  const [days, setDays] = useState<number>(4);
  const [bookingOpen, setBookingOpen] = useState(false);

  const dayRate = useMemo(() => startingDayRate(vehicle, settings), [vehicle, settings]);
  const estimate = useMemo(() => dayRate * days, [dayRate, days]);

  const waHref = buildWhatsAppLink({
    whatsappNumber: settings.whatsappNumber,
    durationLabel: `${days} Days`,
    vehicle,
    estimatedTotal: `~${formatUsd(estimate)}`,
    extraNote: "I used the quick-quote on your homepage.",
  });

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80"
          alt="Misty green mountains and a tranquil lake in the Sri Lankan hill country"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ceylon-900/80 via-ceylon-900/55 to-ceylon-900/85" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ceylon-900/50 to-transparent" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-32">
        {/* Copy */}
        <div className="text-white" style={{ animation: "var(--animate-fade-in)" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-gold" />
            Private driver-guides · 100% tailored routes
          </span>
          <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Discover Sri Lanka at <span className="text-gradient-gold">Your Own Pace</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/85">
            Your own private air-conditioned vehicle and a dedicated local chauffeur-guide. No rigid
            tour buses, no hidden charges — just the freedom to roam the island your way.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ceylon-900 shadow-lg shadow-black/20 transition-transform hover:scale-[1.03]"
            >
              Browse Tour Packages <ChevronRight className="h-4 w-4" />
            </Link>
            <a
              href={buildWhatsAppLink({ whatsappNumber: settings.whatsappNumber })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
            >
              Customize via WhatsApp
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75">
            {[
              "Government-certified drivers",
              "No hidden charges",
              "Clean AC fleet",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Floating quick-quote widget */}
        <div className="lg:justify-self-end">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
            <div className="flex items-center gap-2 text-ceylon-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ceylon-50">
                <Car className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Instant Quick Quote</p>
                <p className="text-xs text-ink/55">Estimate your private tour in seconds</p>
              </div>
            </div>

            {/* Vehicle selector */}
            <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-ink/55">
              Preferred vehicle
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {vehicleOrder.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVehicle(v)}
                  aria-pressed={vehicle === v}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all",
                    vehicle === v
                      ? "border-ceylon-800 bg-ceylon-800 text-white shadow"
                      : "border-ink/10 bg-surface text-ink hover:border-ceylon-600",
                  ].join(" ")}
                >
                  {vehicleLabel(v)}
                </button>
              ))}
            </div>

            {/* Duration selector */}
            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-ink/55">
              Trip duration
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  aria-pressed={days === d}
                  className={[
                    "flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                    days === d
                      ? "border-gold bg-gold/15 text-gold-dark"
                      : "border-ink/10 text-ink/70 hover:border-gold/50",
                  ].join(" ")}
                >
                  <Clock className="h-3.5 w-3.5" /> {d} days
                </button>
              ))}
            </div>

            {/* Estimate readout */}
            <div className="mt-6 rounded-xl bg-ceylon-50 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ceylon-700">
                    Estimated starting price
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    {vehicleLabel(vehicle)} · {days} days
                  </p>
                </div>
                <p
                  key={`${vehicle}-${days}`}
                  className="text-3xl font-bold text-ceylon-800"
                  style={{ animation: "var(--animate-fade-in)" }}
                >
                  {formatUsd(estimate)}
                </p>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-ink/50">
                Indicative only — based on {formatUsd(dayRate)}/day incl. driver allowance. Final
                quote depends on your exact route &amp; distance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ceylon-900 transition-transform hover:scale-[1.02]"
            >
              Book Now · Pay on Arrival
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-ceylon-800/15 px-5 py-2.5 text-sm font-semibold text-ceylon-800 transition-colors hover:bg-ceylon-50"
            >
              Get a tailored quote on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          open
          onClose={() => setBookingOpen(false)}
          settings={settings}
          packages={packages}
          initialVehicle={vehicle}
        />
      )}
    </section>
  );
}
