"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { PricingSettings, TourPackage, VehicleType } from "@/types/tour";
import { calculatePrice, formatUsd } from "@/lib/pricing";
import { buildWhatsAppLink, vehicleLabel } from "@/lib/whatsapp";
import { vehicleOrder } from "@/data/mockTours";
import {
  computeReturnDate,
  validateBooking,
  type BookingPayload,
} from "@/lib/booking";
import { WhatsAppGlyph } from "@/components/ui/FloatingWhatsApp";

const TRANSFER = "__transfer__";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  settings: PricingSettings;
  packages: TourPackage[];
  initialPackage?: TourPackage | null;
  initialVehicle?: VehicleType;
}

export function BookingModal({
  open,
  onClose,
  settings,
  packages,
  initialPackage = null,
  initialVehicle = "Aqua",
}: BookingModalProps) {
  const [packageId, setPackageId] = useState<string>(initialPackage?.id ?? TRANSFER);
  const [vehicle, setVehicle] = useState<VehicleType>(initialVehicle);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTouched, setReturnTouched] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [luggageCount, setLuggageCount] = useState(2);
  const [needsKidsSeat, setNeedsKidsSeat] = useState(false);
  const [specialRequirements, setSpecialRequirements] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ bookingRef: string } | null>(null);

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === packageId) ?? null,
    [packages, packageId],
  );

  const estimate = useMemo(() => {
    if (!selectedPackage) return null;
    return calculatePrice({
      approxDistanceKm: selectedPackage.approxDistanceKm,
      durationDays: selectedPackage.durationDays,
      vehicle,
      settings,
    }).total;
  }, [selectedPackage, vehicle, settings]);

  // Return date auto-fills from pickup + package duration, but stays editable.
  const autoReturn =
    selectedPackage && pickupDate
      ? computeReturnDate(pickupDate, selectedPackage.durationDays)
      : "";
  const effectiveReturn = returnTouched ? returnDate : autoReturn;

  // Lock body scroll + ESC to close.
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

  const buildPayload = (): BookingPayload => ({
    packageId: selectedPackage?.id ?? null,
    packageTitle: selectedPackage?.title ?? null,
    vehicleType: vehicle,
    estimatedPrice: estimate,
    fullName,
    email,
    country,
    passportNo,
    whatsappNo,
    pickupDate,
    returnDate: effectiveReturn || null,
    pickupLocation,
    dropLocation,
    adultsCount,
    childrenCount,
    luggageCount,
    needsKidsSeat,
    specialRequirements: specialRequirements.trim() || null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const payload = buildPayload();
    const found = validateBooking(payload);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? {});
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult({ bookingRef: json.bookingRef });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const confirmWa = result
    ? buildWhatsAppLink({
        whatsappNumber: settings.whatsappNumber,
        packageTitle: selectedPackage?.title ?? "Airport / Transfer",
        vehicle,
        extraNote: `My booking reference is ${result.bookingRef}.`,
      })
    : "#";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/70 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Book your tour"
    >
      <div
        className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        style={{ animation: "var(--animate-fade-in)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {result ? (
          <Confirmation
            bookingRef={result.bookingRef}
            packageTitle={selectedPackage?.title ?? "Airport / Point-to-Point transfer"}
            vehicle={vehicle}
            estimate={estimate}
            confirmWa={confirmWa}
            onClose={onClose}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-ink/10 p-5 sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-ink">Book your private tour</h2>
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-ceylon-50 px-3 py-1 text-xs font-semibold text-ceylon-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Book Now, Pay on Arrival / After Confirmation — Zero Advance Needed
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/50 hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* Trip selection */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Trip & vehicle
                </h3>
                <Field label="Tour package" error={errors.packageId}>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className={inputCls}
                  >
                    <option value={TRANSFER}>Airport / Point-to-Point transfer</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </Field>

                <div>
                  <label className={labelCls}>Vehicle</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {vehicleOrder.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVehicle(v)}
                        aria-pressed={vehicle === v}
                        className={[
                          "rounded-xl border px-2 py-2 text-xs font-semibold transition-all",
                          vehicle === v
                            ? "border-ceylon-800 bg-ceylon-800 text-white"
                            : "border-ink/10 text-ink hover:border-ceylon-600",
                        ].join(" ")}
                      >
                        {vehicleLabel(v)}
                      </button>
                    ))}
                  </div>
                  {estimate != null && (
                    <p className="mt-2 text-sm text-ink/60">
                      Estimated total:{" "}
                      <span className="font-bold text-ceylon-800">{formatUsd(estimate)}</span>{" "}
                      <span className="text-xs">(pay on arrival / after confirmation)</span>
                    </p>
                  )}
                </div>
              </section>

              {/* Personal details */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Your details
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Full name *" error={errors.fullName}>
                    <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </Field>
                  <Field label="Email *" error={errors.email}>
                    <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Country *" error={errors.country}>
                    <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} />
                  </Field>
                  <Field label="Passport number *" error={errors.passportNo}>
                    <input className={inputCls} value={passportNo} onChange={(e) => setPassportNo(e.target.value)} />
                  </Field>
                  <Field label="WhatsApp number *" error={errors.whatsappNo}>
                    <input className={inputCls} value={whatsappNo} placeholder="+44 7700 900000" onChange={(e) => setWhatsappNo(e.target.value)} />
                  </Field>
                </div>
              </section>

              {/* Trip details */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink/55">
                  Trip details
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Pickup date *" error={errors.pickupDate}>
                    <input type="date" className={inputCls} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                  </Field>
                  <Field label="Return date" error={errors.returnDate}>
                    <input
                      type="date"
                      className={inputCls}
                      value={effectiveReturn}
                      onChange={(e) => {
                        setReturnTouched(true);
                        setReturnDate(e.target.value);
                      }}
                    />
                  </Field>
                  <Field label="Pickup location *" error={errors.pickupLocation}>
                    <input className={inputCls} value={pickupLocation} placeholder="Airport, hotel or city" onChange={(e) => setPickupLocation(e.target.value)} />
                  </Field>
                  <Field label="Drop location *" error={errors.dropLocation}>
                    <input className={inputCls} value={dropLocation} onChange={(e) => setDropLocation(e.target.value)} />
                  </Field>
                  <Field label="Adults *" error={errors.adultsCount}>
                    <input type="number" min={1} className={inputCls} value={adultsCount} onChange={(e) => setAdultsCount(Number(e.target.value))} />
                  </Field>
                  <Field label="Children">
                    <input type="number" min={0} className={inputCls} value={childrenCount} onChange={(e) => setChildrenCount(Number(e.target.value))} />
                  </Field>
                  <Field label="Luggage (bags)">
                    <input type="number" min={0} className={inputCls} value={luggageCount} onChange={(e) => setLuggageCount(Number(e.target.value))} />
                  </Field>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink/80">
                    <input
                      type="checkbox"
                      checked={needsKidsSeat}
                      onChange={(e) => setNeedsKidsSeat(e.target.checked)}
                      className="h-4 w-4 rounded border-ink/30 text-ceylon-800 focus:ring-ceylon-600"
                    />
                    Need kids support seat
                  </label>
                </div>
                <Field label="Special requirements">
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="Dietary needs, extra stops, flexible timing…"
                  />
                </Field>
              </section>

              {serverError && (
                <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {serverError}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-ink/10 p-5 sm:p-6">
              <p className="text-xs text-ink/50">No payment now. We confirm on WhatsApp.</p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ceylon-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Submitting…" : "Confirm booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Confirmation({
  bookingRef,
  packageTitle,
  vehicle,
  estimate,
  confirmWa,
  onClose,
}: {
  bookingRef: string;
  packageTitle: string;
  vehicle: VehicleType;
  estimate: number | null;
  confirmWa: string;
  onClose: () => void;
}) {
  return (
    <div className="p-7 text-center sm:p-9">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ceylon-50">
        <CheckCircle2 className="h-8 w-8 text-ceylon-700" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink">Booking received!</h2>
      <p className="mt-2 text-sm text-ink/60">
        Thank you. We&apos;ll confirm availability and finalise your trip on WhatsApp shortly.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-surface p-5 ring-1 ring-ink/10">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
          Your booking reference
        </p>
        <p className="mt-1 text-3xl font-bold tracking-wide text-ceylon-800">{bookingRef}</p>
        <div className="mt-4 space-y-1 text-left text-sm text-ink/70">
          <p>
            <span className="text-ink/50">Tour:</span> {packageTitle}
          </p>
          <p>
            <span className="text-ink/50">Vehicle:</span> {vehicleLabel(vehicle)}
          </p>
          {estimate != null && (
            <p>
              <span className="text-ink/50">Estimated total:</span> {formatUsd(estimate)}{" "}
              <span className="text-xs text-ink/50">(pay on arrival)</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={confirmWa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          <WhatsAppGlyph className="h-5 w-5" /> Send Booking ID via WhatsApp
        </a>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface"
        >
          Done
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ceylon-600 focus:ring-2 focus:ring-ceylon-600/20";
const labelCls = "mb-1 block text-xs font-medium text-ink/60";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
