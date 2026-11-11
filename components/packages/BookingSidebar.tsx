"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, X, Plus, MessageCircle, CalendarCheck, Info } from "lucide-react";
import type { PricingSettings, TourPackage, VehicleType } from "@/types/tour";
import { calculatePrice, formatUsd } from "@/lib/pricing";
import { buildWhatsAppLink, vehicleLabel } from "@/lib/whatsapp";
import { vehicleOrder } from "@/data/mockTours";
import { WhatsAppGlyph } from "@/components/ui/FloatingWhatsApp";

export function BookingSidebar({
  pkg,
  settings,
}: {
  pkg: TourPackage;
  settings: PricingSettings;
}) {
  const [vehicle, setVehicle] = useState<VehicleType>("Aqua");
  const [dialogOpen, setDialogOpen] = useState(false);

  const breakdown = useMemo(
    () =>
      calculatePrice({
        approxDistanceKm: pkg.approxDistanceKm,
        durationDays: pkg.durationDays,
        vehicle,
        settings,
      }),
    [vehicle, pkg.approxDistanceKm, pkg.durationDays, settings],
  );

  const durationLabel = `${pkg.durationDays} Days / ${pkg.durationNights} Nights`;

  const waHref = buildWhatsAppLink({
    whatsappNumber: settings.whatsappNumber,
    packageTitle: pkg.title,
    durationLabel,
    vehicle,
    estimatedTotal: formatUsd(breakdown.total),
    extraNote: "I'd like to customize this itinerary.",
  });

  return (
    <div className="lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-ink/5 ring-1 ring-ink/10">
        <div className="bg-ceylon-800 p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">
            Your private tour from
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span
              key={breakdown.total}
              className="text-4xl font-bold"
              style={{ animation: "var(--animate-fade-in)" }}
            >
              {formatUsd(breakdown.total)}
            </span>
            <span className="pb-1 text-sm text-white/70">total</span>
          </div>
          <p className="mt-1 text-xs text-white/60">
            {durationLabel} · ~{pkg.approxDistanceKm} km · {vehicleLabel(vehicle)}
          </p>
        </div>

        <div className="p-5">
          {/* Vehicle selector tabs */}
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">
            Choose your vehicle
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {vehicleOrder.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVehicle(v)}
                aria-pressed={vehicle === v}
                className={[
                  "flex flex-col rounded-xl border px-3 py-2 text-left transition-all",
                  vehicle === v
                    ? "border-ceylon-800 bg-ceylon-50"
                    : "border-ink/10 hover:border-ceylon-600",
                ].join(" ")}
              >
                <span className="text-sm font-semibold text-ink">{vehicleLabel(v)}</span>
                <span className="text-xs text-ink/55">{formatUsd(settings.rates[v])}/km</span>
              </button>
            ))}
          </div>

          {/* Transparent price breakdown */}
          <div className="mt-5 space-y-2 rounded-xl bg-surface p-4 text-sm">
            <Row
              label={`Distance · ${pkg.approxDistanceKm} km × ${formatUsd(breakdown.perKmRate)}`}
              value={formatUsd(breakdown.distanceCost)}
            />
            <Row
              label={`Driver allowance · ${pkg.durationDays} × ${formatUsd(
                breakdown.driverDailyBatta,
              )}`}
              value={formatUsd(breakdown.driverCost)}
            />
            <div className="flex items-center justify-between border-t border-ink/10 pt-2 text-base font-bold text-ceylon-800">
              <span>Total</span>
              <span>{formatUsd(breakdown.total)}</span>
            </div>
            <p className="flex items-start gap-1.5 text-[11px] leading-4 text-ink/50">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Fuel, tolls &amp; parking included. Excludes hotels, tickets &amp; activity fees.
            </p>
          </div>

          {/* CTAs */}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ceylon-900 transition-transform hover:scale-[1.02]"
          >
            <CalendarCheck className="h-4 w-4" /> Book Now
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            <WhatsAppGlyph className="h-5 w-5" /> Customize on WhatsApp
          </a>

          {/* Inclusions / exclusions */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ceylon-700">
                What&apos;s included
              </p>
              <ul className="mt-2 space-y-1.5">
                {pkg.inclusions.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 text-xs text-ink/70">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ceylon-600" /> {inc}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                What&apos;s excluded
              </p>
              <ul className="mt-2 space-y-1.5">
                {pkg.exclusions.map((exc) => (
                  <li key={exc} className="flex items-start gap-2 text-xs text-ink/50">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/30" /> {exc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {dialogOpen && (
        <BookingDialog
          pkg={pkg}
          vehicle={vehicle}
          total={formatUsd(breakdown.total)}
          durationLabel={durationLabel}
          waHref={waHref}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink/70">
      <span className="text-xs">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

function BookingDialog({
  pkg,
  vehicle,
  total,
  durationLabel,
  waHref,
  onClose,
}: {
  pkg: TourPackage;
  vehicle: VehicleType;
  total: string;
  durationLabel: string;
  waHref: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Booking request"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        style={{ animation: "var(--animate-fade-in)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Reserve your journey</h3>
            <p className="mt-1 text-sm text-ink/60">Confirm the details and we&apos;ll take it from here.</p>
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

        <dl className="mt-5 space-y-2 rounded-xl bg-surface p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/55">Tour</dt>
            <dd className="max-w-[60%] text-right font-medium text-ink">{pkg.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/55">Duration</dt>
            <dd className="font-medium text-ink">{durationLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/55">Vehicle</dt>
            <dd className="font-medium text-ink">{vehicleLabel(vehicle)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base">
            <dt className="font-semibold text-ink">Estimated total</dt>
            <dd className="font-bold text-ceylon-800">{total}</dd>
          </div>
        </dl>

        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-ink/55">
          <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
          Our team confirms availability and finalises your custom route directly on WhatsApp —
          usually within a couple of hours.
        </p>

        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ceylon-900 transition-transform hover:scale-[1.02]"
        >
          <MessageCircle className="h-4 w-4" /> Confirm &amp; continue on WhatsApp
        </a>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-full px-5 py-2.5 text-sm font-medium text-ink/55 hover:text-ink"
        >
          Keep browsing
        </button>
      </div>
    </div>
  );
}
