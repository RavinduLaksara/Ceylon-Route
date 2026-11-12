import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { FleetShowcase } from "@/components/home/FleetShowcase";
import { TrustSection } from "@/components/home/TrustSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { PackageCard } from "@/components/packages/PackageCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { fleet } from "@/data/mockTours";
import {
  getApprovedReviews,
  getFeaturedPackages,
  getPackages,
  getSettings,
} from "@/lib/data/queries";

export default async function Home() {
  const [settings, packages, featured, reviews] = await Promise.all([
    getSettings(),
    getPackages(),
    getFeaturedPackages(),
    getApprovedReviews(),
  ]);

  return (
    <>
      <Hero settings={settings} packages={packages} />

      <FleetShowcase fleet={fleet} packages={packages} />

      {/* Featured packages */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Curated Journeys"
            title="Signature Sri Lanka tour packages"
            description="Hand-crafted routes covering the island's icons — each one fully private and endlessly customisable."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 80} as="div">
                <PackageCard pkg={pkg} settings={settings} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-full border border-ceylon-800 px-6 py-3 text-sm font-semibold text-ceylon-800 transition-colors hover:bg-ceylon-800 hover:text-white"
            >
              View all tour packages <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <TrustSection />

      <ReviewsSection reviews={reviews} />
    </>
  );
}
