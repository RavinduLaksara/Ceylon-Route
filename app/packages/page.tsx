import type { Metadata } from "next";
import { PackageGrid } from "@/components/packages/PackageGrid";
import { travelStyles, tourPackages } from "@/data/mockTours";

export const metadata: Metadata = {
  title: "Tour Packages",
  description:
    "Browse CeylonRoute's private, driver-guided Sri Lanka tour packages — culture, wildlife, adventure and scenic routes with transparent pricing.",
};

export default function PackagesPage() {
  return (
    <div className="bg-surface">
      {/* Page header */}
      <section className="bg-ceylon-800 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Tour Packages
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Find your perfect Sri Lankan journey
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/75">
            Private vehicle, personal driver-guide and a route that bends around you. Filter by the
            style of trip you&apos;re dreaming of.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PackageGrid packages={tourPackages} styles={travelStyles} />
        </div>
      </section>
    </div>
  );
}
