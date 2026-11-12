import { cacheLife, cacheTag } from "next/cache";
import type { PricingSettings, Review, TourPackage } from "@/types/tour";
import { createPublicClient } from "@/lib/supabase/public";
import {
  mapPackage,
  mapReview,
  mapSettings,
  type DbPackage,
  type DbReview,
  type DbSettings,
} from "@/lib/supabase/types";

/** Cache tags — admin mutations call revalidateTag() with these. */
export const CACHE_TAGS = {
  settings: "settings",
  packages: "packages",
  reviews: "reviews",
} as const;

/** Fallback used only if the DB is unreachable or not yet seeded. */
const DEFAULT_SETTINGS: PricingSettings = {
  rates: { "Wagon R": 0.4, Aqua: 0.45, Sedan: 0.5, KDH: 0.7 },
  driverDailyBatta: 15,
  whatsappNumber: "+94770291675",
};

export async function getSettings(): Promise<PricingSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.settings);
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS;
    return mapSettings(data as DbSettings);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getPackages(): Promise<TourPackage[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.packages);
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as DbPackage[]).map(mapPackage);
  } catch {
    return [];
  }
}

export async function getFeaturedPackages(): Promise<TourPackage[]> {
  const all = await getPackages();
  return all.filter((p) => p.isFeatured);
}

export async function getPackageBySlug(
  slug: string,
): Promise<TourPackage | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.packages);
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return null;
    return mapPackage(data as DbPackage);
  } catch {
    return null;
  }
}

/** Distinct travel-style tags across active packages (powers the filter bar). */
export async function getTravelStyles(): Promise<string[]> {
  const packages = await getPackages();
  return Array.from(new Set(packages.flatMap((p) => p.travelStyle))).sort();
}

export async function getApprovedReviews(): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.reviews);
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as DbReview[]).map(mapReview);
  } catch {
    return [];
  }
}
