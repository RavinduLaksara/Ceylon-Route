import type { VehicleRate, VehicleType } from "@/types/tour";

/**
 * Static fleet presentation data (imagery, specs, marketing copy).
 *
 * Note: tour packages, reviews and the live per-km rates now come from Supabase
 * (see `lib/data/queries.ts`). Only the fleet's fixed showcase details live
 * here, since they are not admin-managed in the data model.
 */

const unsplash = (id: string, w = 1600, h = 1000) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const vehicleOrder: VehicleType[] = ["Wagon R", "Aqua", "Sedan", "KDH"];

/** Fallback per-km rates (used by the fleet cards before live settings load). */
export const fleet: VehicleRate[] = [
  {
    type: "Wagon R",
    modelName: "Suzuki Wagon R",
    capacity: "Up to 3 passengers · 2 bags",
    perKmRate: 0.4,
    image: unsplash("1549924231-f129b911e442", 1200, 800),
  },
  {
    type: "Aqua",
    modelName: "Toyota Aqua",
    capacity: "Up to 3 passengers · 3 bags",
    perKmRate: 0.45,
    image: unsplash("1583121274602-3e2820c69888", 1200, 800),
  },
  {
    type: "Sedan",
    modelName: "Premium Sedan (Axio / Prius)",
    capacity: "Up to 3 passengers · 3 large bags",
    perKmRate: 0.5,
    image: unsplash("1552519507-da3b142c6e3d", 1200, 800),
  },
  {
    type: "KDH",
    modelName: "Toyota KDH Van",
    capacity: "Up to 9 passengers · 8+ bags",
    perKmRate: 0.7,
    image: unsplash("1570125909232-eb263c188f7e", 1200, 800),
  },
];

/** Marketing detail for the fleet showcase. */
export const fleetDetails: Record<
  VehicleType,
  {
    tagline: string;
    bestFor: string;
    idealPax: string;
    luggage: string;
    highlights: string[];
    accent: string;
  }
> = {
  "Wagon R": {
    tagline: "Budget-friendly & nimble",
    bestFor: "Solo travellers & couples watching the budget",
    idealPax: "Up to 3 guests",
    luggage: "2 cabin bags",
    highlights: [
      "Most economical per-km rate",
      "Easy in tight hill-country roads",
      "Great fuel economy",
    ],
    accent: "Best Value",
  },
  Aqua: {
    tagline: "Eco-friendly city & touring hybrid",
    bestFor: "Couples & small families who want efficiency",
    idealPax: "Up to 3 guests",
    luggage: "3 bags",
    highlights: ["Hybrid — lowest emissions", "Smooth, quiet ride", "Perfect all-island tourer"],
    accent: "Eco Choice",
  },
  Sedan: {
    tagline: "Comfort & extra luggage space",
    bestFor: "Travellers who want a plush, roomy ride",
    idealPax: "Up to 3 guests",
    luggage: "3 large suitcases",
    highlights: ["Premium comfort seating", "Generous boot space", "Ideal for longer transfers"],
    accent: "Comfort",
  },
  KDH: {
    tagline: "Family & group luxury van",
    bestFor: "Families and groups travelling together",
    idealPax: "Up to 9 guests",
    luggage: "8+ bags",
    highlights: ["Spacious high-roof option", "Keeps groups together", "Room for gear & souvenirs"],
    accent: "Group Luxury",
  },
};

/** Trust signals shared across the fleet. */
export const fleetPerks = [
  "Powerful A/C",
  "USB charging ports",
  "English-speaking driver-guide",
  "Bottled water",
];
