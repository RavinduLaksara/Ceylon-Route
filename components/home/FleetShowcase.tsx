"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Users, Briefcase, Snowflake, Plug, BadgeCheck, Check } from "lucide-react";
import type { VehicleRate, VehicleType } from "@/types/tour";
import { fleetDetails, fleetPerks, tourPackages } from "@/data/mockTours";
import { formatUsd } from "@/lib/pricing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * KDH (9 pax) suits every group; smaller cars (3 pax) suit the lighter tours.
 * This is a simple demo mapping of "compatible" packages per vehicle.
 */
function compatiblePackages(vehicle: VehicleType) {
  if (vehicle === "KDH") return tourPackages;
  // Smaller vehicles: everything works for up-to-3 travellers.
  return tourPackages;
}

export function FleetShowcase({ fleet }: { fleet: VehicleRate[] }) {
  const [active, setActive] = useState<VehicleType>("Aqua");
  const current = fleet.find((f) => f.type === active) ?? fleet[0];
  const details = fleetDetails[active];
  const packages = compatiblePackages(active);

  return (
    <section id="fleet" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Our Fleet"
          title="Pick the ride that fits your journey"
          description="Every vehicle is privately yours for the trip — air-conditioned, well-maintained, and driven by an English-speaking local guide."
        />

        {/* Vehicle tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {fleet.map((v) => (
            <button
              key={v.type}
              type="button"
              onClick={() => setActive(v.type)}
              aria-pressed={active === v.type}
              className={[
                "rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                active === v.type
                  ? "bg-ceylon-800 text-white shadow-md"
                  : "bg-white text-ink/70 ring-1 ring-ink/10 hover:ring-ceylon-600",
              ].join(" ")}
            >
              {v.modelName.split("(")[0].trim()}
            </button>
          ))}
        </div>

        {/* Active vehicle panel */}
        <Reveal
          key={active}
          className="mt-10 grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-ink/5 ring-1 ring-ink/5 lg:grid-cols-2"
        >
          <div className="relative min-h-64 lg:min-h-full">
            <Image
              src={current.image}
              alt={current.modelName}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ceylon-900 shadow">
              {details.accent}
            </span>
          </div>

          <div className="p-7 sm:p-9">
            <h3 className="text-2xl font-bold text-ink">{current.modelName}</h3>
            <p className="mt-1 text-sm font-medium text-gold-dark">{details.tagline}</p>
            <p className="mt-3 text-sm leading-6 text-ink/65">{details.bestFor}.</p>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              <Spec icon={<Users className="h-4 w-4" />} label="Capacity" value={details.idealPax} />
              <Spec
                icon={<Briefcase className="h-4 w-4" />}
                label="Luggage"
                value={details.luggage}
              />
              <Spec
                icon={<Snowflake className="h-4 w-4" />}
                label="Climate"
                value="Powerful A/C"
              />
              <Spec
                icon={<Plug className="h-4 w-4" />}
                label="On board"
                value="USB charging"
              />
            </dl>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="text-sm text-ink/60">
                From{" "}
                <span className="text-lg font-bold text-ceylon-800">
                  {formatUsd(current.perKmRate)}
                </span>
                /km
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ceylon-50 px-3 py-1 text-xs font-semibold text-ceylon-700">
                <BadgeCheck className="h-3.5 w-3.5" /> English-speaking driver
              </span>
            </div>

            <ul className="mt-5 space-y-2">
              {details.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-ink/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ceylon-600" /> {h}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-ink/10 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                Great for these tours
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {packages.map((p) => (
                  <Link
                    key={p.id}
                    href={`/packages/${p.slug}`}
                    className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ceylon-800 ring-1 ring-ink/10 transition-colors hover:bg-ceylon-50"
                  >
                    {p.durationDays}-Day {p.travelStyle[0]}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Shared perks strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink/60">
          {fleetPerks.map((perk) => (
            <span key={perk} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-ceylon-600" /> {perk}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-3 ring-1 ring-ink/5">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-ink/50">
        <span className="text-ceylon-600">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
