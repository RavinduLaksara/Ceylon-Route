"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Loader2,
  Baby,
  Luggage,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatUsd } from "@/lib/pricing";
import { normalizePhone, vehicleLabel } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { BookingStatus, DbBooking } from "@/lib/supabase/types";

type BookingRow = DbBooking & { packages: { title: string } | null };

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const statusStyle: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-ceylon-50 text-ceylon-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<BookingRow | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("bookings")
      .select("*, packages(title)")
      .order("created_at", { ascending: false });
    setBookings((data as BookingRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select("*, packages(title)")
        .order("created_at", { ascending: false });
      if (active) {
        setBookings((data as BookingRow[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      total: bookings.length,
    }),
    [bookings],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "ALL" && b.status !== filter) return false;
      if (!q) return true;
      return (
        b.full_name.toLowerCase().includes(q) ||
        (b.booking_ref ?? "").toLowerCase().includes(q)
      );
    });
  }, [bookings, filter, search]);

  async function updateStatus(id: string, status: BookingStatus) {
    const supabase = createClient();
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Bookings</h1>
          <p className="text-sm text-ink/55">Manage and confirm incoming tour bookings.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-white"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
        <Stat label="Pending" value={stats.pending} accent="text-amber-600" />
        <Stat label="Confirmed" value={stats.confirmed} accent="text-ceylon-700" />
        <Stat label="Total bookings" value={stats.total} accent="text-ink" />
      </div>

      {/* Filters + search */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                filter === s
                  ? "bg-ceylon-800 text-white"
                  : "bg-white text-ink/60 ring-1 ring-ink/10 hover:ring-ceylon-600",
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or ref…"
            className="w-56 rounded-full border border-ink/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-ceylon-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-ink/50">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading bookings…
          </div>
        ) : visible.length === 0 ? (
          <p className="p-12 text-center text-sm text-ink/50">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 bg-surface text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ref</th>
                  <th className="px-4 py-3 font-semibold">Guest</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Tour</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Pickup</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => (
                  <tr key={b.id} className="border-b border-ink/5 last:border-0 hover:bg-surface/60">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-ceylon-800">
                      {b.booking_ref}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{b.full_name}</p>
                      <p className="text-xs text-ink/50">{b.country}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-ink/70 sm:table-cell">
                      {b.packages?.title ?? "Airport / Transfer"}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-ink/70 md:table-cell">
                      {b.pickup_date}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          statusStyle[b.status],
                        )}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(b)}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-ceylon-800 hover:bg-ceylon-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onStatus={(s) => updateStatus(selected.id, s)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/10 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", accent)}>{value}</p>
    </div>
  );
}

function buildConfirmWa(b: BookingRow): string {
  const lines = [
    `Hello ${b.full_name},`,
    "",
    `Your CeylonRoute booking ${b.booking_ref} is CONFIRMED. ✅`,
    `• Tour: ${b.packages?.title ?? "Airport / Point-to-Point transfer"}`,
    `• Vehicle: ${vehicleLabel(b.vehicle_type)}`,
    `• Pickup: ${b.pickup_date} — ${b.pickup_location}`,
    `• Drop: ${b.drop_location}`,
    b.estimated_price != null ? `• Estimated total: ${formatUsd(Number(b.estimated_price))} (pay on arrival)` : "",
    "",
    "We look forward to hosting you!",
  ].filter(Boolean);
  return `https://wa.me/${normalizePhone(b.whatsapp_no)}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function BookingDrawer({
  booking: b,
  onClose,
  onStatus,
}: {
  booking: BookingRow;
  onClose: () => void;
  onStatus: (s: BookingStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-white p-5">
          <div>
            <p className="font-mono text-xs font-semibold text-ceylon-800">{b.booking_ref}</p>
            <h2 className="text-lg font-bold text-ink">{b.full_name}</h2>
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

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap gap-2">
            {b.needs_kids_seat && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-dark">
                <Baby className="h-3.5 w-3.5" /> Kids seat needed
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-ink/60 ring-1 ring-ink/10">
              <Luggage className="h-3.5 w-3.5" /> {b.luggage_count} bags
            </span>
          </div>

          <Section title="Trip">
            <Row label="Tour" value={b.packages?.title ?? "Airport / Point-to-Point transfer"} />
            <Row label="Vehicle" value={vehicleLabel(b.vehicle_type)} />
            <Row
              label="Estimated"
              value={b.estimated_price != null ? formatUsd(Number(b.estimated_price)) : "—"}
            />
            <Row label="Pickup date" value={b.pickup_date} />
            <Row label="Return date" value={b.return_date ?? "—"} />
            <Row label="Pickup" value={b.pickup_location} />
            <Row label="Drop" value={b.drop_location} />
            <Row label="Guests" value={`${b.adults_count} adults · ${b.children_count} children`} />
          </Section>

          <Section title="Guest details">
            <Row label="Email" value={b.email} />
            <Row label="Country" value={b.country} />
            <Row label="Passport" value={b.passport_no} />
            <Row label="WhatsApp" value={b.whatsapp_no} />
          </Section>

          {b.special_requirements && (
            <Section title="Special requirements">
              <p className="text-sm text-ink/70">{b.special_requirements}</p>
            </Section>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
              Status
            </label>
            <select
              value={b.status}
              onChange={(e) => onStatus(e.target.value as BookingStatus)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ceylon-600"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <a
            href={buildConfirmWa(b)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Confirm via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</h3>
      <div className="space-y-1.5 rounded-xl bg-surface p-3 ring-1 ring-ink/5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-ink/50">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
