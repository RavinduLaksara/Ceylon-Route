import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, Moon, ChevronRight } from "lucide-react";
import { getPackageBySlug, pricingSettings, tourPackages } from "@/data/mockTours";
import { Gallery } from "@/components/packages/Gallery";
import { ItineraryTimeline } from "@/components/packages/ItineraryTimeline";
import { BookingSidebar } from "@/components/packages/BookingSidebar";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return tourPackages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) return { title: "Tour not found" };
  return {
    title: pkg.title,
    description: pkg.overview.slice(0, 160),
    openGraph: {
      title: pkg.title,
      description: pkg.subtitle,
      images: [pkg.coverImage],
    },
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();

  return (
    <article className="bg-surface">
      {/* Banner */}
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src={pkg.coverImage}
            alt={pkg.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ceylon-900/90 via-ceylon-900/50 to-ceylon-900/40" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20">
          <nav className="flex items-center gap-1.5 text-sm text-white/70">
            <Link href="/" className="hover:text-gold">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/packages" className="hover:text-gold">
              Packages
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/90">{pkg.durationDays}-Day Tour</span>
          </nav>

          <div className="mt-6 flex flex-wrap gap-2">
            {pkg.travelStyle.map((style) => (
              <span
                key={style}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
              >
                {style}
              </span>
            ))}
          </div>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">
            {pkg.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">{pkg.subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gold" /> {pkg.durationDays} Days / {pkg.durationNights}{" "}
              Nights
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold" /> ~{pkg.approxDistanceKm} km
            </span>
            <span className="flex items-center gap-1.5">
              <Moon className="h-4 w-4 text-gold" /> {pkg.durationNights} overnight stays
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* Main column */}
          <div>
            <section>
              <h2 className="text-2xl font-bold text-ink">Tour overview</h2>
              <p className="mt-3 leading-7 text-ink/70">{pkg.overview}</p>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink">Gallery</h2>
              <div className="mt-4">
                <Gallery images={pkg.galleryImages} title={pkg.title} />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-ink">Day-by-day itinerary</h2>
              <p className="mt-2 text-sm text-ink/60">
                Tap any day to expand the highlights, travel times and overnight stays.
              </p>
              <div className="mt-5">
                <ItineraryTimeline itinerary={pkg.itinerary} />
              </div>
            </section>
          </div>

          {/* Sticky booking sidebar */}
          <aside>
            <BookingSidebar pkg={pkg} settings={pricingSettings} />
          </aside>
        </div>
      </div>
    </article>
  );
}
