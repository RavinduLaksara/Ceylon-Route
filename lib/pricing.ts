import type { PricingSettings, VehicleType } from '@/types/tour';

export interface PriceBreakdown {
  vehicle: VehicleType;
  distanceCost: number; // approxDistanceKm * perKmRate
  driverCost: number; // durationDays * driverDailyBatta
  total: number;
  perKmRate: number;
  driverDailyBatta: number;
}

export interface CalculatePriceArgs {
  approxDistanceKm: number;
  durationDays: number;
  vehicle: VehicleType;
  settings: PricingSettings;
}

/**
 * Core pricing formula for CeylonRoute.
 *
 *   Total = (approxDistanceKm x perKmRate) + (durationDays x driverDailyBatta)
 *
 * Example (BDD Scenario 1):
 *   4-day tour, 450 km, Toyota Aqua ($0.45/km, $15/day)
 *   => (450 * 0.45) + (4 * 15) = 202.5 + 60 = 262.5
 *
 * Returns a full breakdown so UIs can show the transparent "no hidden charges"
 * split (fuel/distance + driver allowance).
 */
export function calculatePrice({
  approxDistanceKm,
  durationDays,
  vehicle,
  settings,
}: CalculatePriceArgs): PriceBreakdown {
  const perKmRate = settings.rates[vehicle];
  const { driverDailyBatta } = settings;

  const distanceCost = round2(approxDistanceKm * perKmRate);
  const driverCost = round2(durationDays * driverDailyBatta);
  const total = round2(distanceCost + driverCost);

  return {
    vehicle,
    distanceCost,
    driverCost,
    total,
    perKmRate,
    driverDailyBatta,
  };
}

/**
 * Lowest starting total across the full fleet for a given tour — used for the
 * "from $X" tags on package cards.
 */
export function cheapestTotal(
  approxDistanceKm: number,
  durationDays: number,
  settings: PricingSettings,
): PriceBreakdown {
  const breakdowns = (Object.keys(settings.rates) as VehicleType[]).map((vehicle) =>
    calculatePrice({ approxDistanceKm, durationDays, vehicle, settings }),
  );
  return breakdowns.reduce((min, b) => (b.total < min.total ? b : min));
}

/**
 * Starting per-day rate for a single vehicle (used by the Hero quick-quote).
 * Distance is unknown at that point, so this is driver allowance + an assumed
 * daily touring distance.
 */
export function startingDayRate(
  vehicle: VehicleType,
  settings: PricingSettings,
  assumedKmPerDay = 120,
): number {
  const perKmRate = settings.rates[vehicle];
  return round2(assumedKmPerDay * perKmRate + settings.driverDailyBatta);
}

/** Format a USD amount with no cents when it is a whole number. */
export function formatUsd(amount: number): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
