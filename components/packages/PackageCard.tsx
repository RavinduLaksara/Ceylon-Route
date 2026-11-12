import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, ArrowRight, Moon } from "lucide-react";
import type { PricingSettings, TourPackage } from "@/types/tour";
import { cheapestTotal, formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const styleColors: Record<string, string> = {
  Adventure: "bg-gold/15 text-gold-dark",
  Culture: "bg-ceylon-50 text-ceylon-700",
  Wildlife: "bg-amber-100 text-amber-700",
  Scenic: "bg-cyan-50 text-ocean",
};

export function PackageCard({
  pkg,
  settings,
}: {
  pkg: TourPackage;
  settings: PricingSettings;
}) {
  const from = cheapestTotal(pkg.approxDistanceKm, pkg.durationDays, settings);

  return (
    <Link
      href={`/packages/${pkg.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md shadow-ink/5 ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={pkg.coverImage}
          alt={pkg.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-ceylon-800 shadow">
          <Clock className="h-3.5 w-3.5" />
          {pkg.durationDays}D / {pkg.durationNights}N
        </span>
        {pkg.isFeatured && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ceylon-900 shadow">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-1.5">
          {pkg.travelStyle.map((style) => (
            <span
              key={style}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                styleColors[style] ?? "bg-surface text-ink/60",
              )}
            >
              {style}
            </span>
          ))}
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug text-ink transition-colors group-hover:text-ceylon-800">
          {pkg.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink/60">{pkg.subtitle}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-ink/55">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> ~{pkg.approxDistanceKm} km
          </span>
          <span className="flex items-center gap-1">
            <Moon className="h-3.5 w-3.5" /> {pkg.durationNights} nights
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-ink/10 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink/45">From</p>
            <p className="text-xl font-bold text-ceylon-800">{formatUsd(from.total)}</p>
            <p className="text-[11px] text-ink/45">incl. driver &amp; fuel</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold-dark transition-transform group-hover:translate-x-0.5">
            View trip <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
