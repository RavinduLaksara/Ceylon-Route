import type {
  ItineraryDay,
  PricingSettings,
  Review,
  TourPackage,
  VehicleType,
} from "@/types/tour";

// ---------------------------------------------------------------------------
// Raw database row shapes (snake_case, as stored in Postgres)
// ---------------------------------------------------------------------------

export interface DbSettings {
  id: string;
  rate_wagon_r: number;
  rate_aqua: number;
  rate_sedan: number;
  rate_kdh: number;
  driver_daily_batta: number;
  whatsapp_number: string | null;
  admin_email: string | null;
  updated_at: string;
}

export interface DbPackage {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  duration_days: number;
  duration_nights: number;
  approx_distance_km: number;
  travel_style: string[];
  overview: string | null;
  cover_image: string | null;
  gallery_images: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DbReview {
  id: string;
  reviewer_name: string;
  country: string;
  country_code: string | null;
  rating: number;
  comment: string;
  package_id: string | null;
  is_approved: boolean;
  created_at: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface DbBooking {
  id: string;
  booking_ref: string | null;
  package_id: string | null;
  vehicle_type: VehicleType;
  estimated_price: number | null;
  full_name: string;
  email: string;
  country: string;
  passport_no: string;
  whatsapp_no: string;
  pickup_date: string;
  return_date: string | null;
  pickup_location: string;
  drop_location: string;
  adults_count: number;
  children_count: number;
  luggage_count: number;
  needs_kids_seat: boolean;
  special_requirements: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Mappers: DB rows -> camelCase app types used across the UI
// ---------------------------------------------------------------------------

export function mapSettings(r: DbSettings): PricingSettings {
  return {
    rates: {
      "Wagon R": Number(r.rate_wagon_r),
      Aqua: Number(r.rate_aqua),
      Sedan: Number(r.rate_sedan),
      KDH: Number(r.rate_kdh),
    },
    driverDailyBatta: Number(r.driver_daily_batta),
    whatsappNumber: r.whatsapp_number ?? "",
  };
}

export function mapPackage(r: DbPackage): TourPackage {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle ?? "",
    durationDays: r.duration_days,
    durationNights: r.duration_nights,
    approxDistanceKm: Number(r.approx_distance_km),
    travelStyle: r.travel_style ?? [],
    overview: r.overview ?? "",
    coverImage: r.cover_image ?? "",
    galleryImages: r.gallery_images ?? [],
    itinerary: Array.isArray(r.itinerary) ? r.itinerary : [],
    inclusions: r.inclusions ?? [],
    exclusions: r.exclusions ?? [],
    isFeatured: r.is_featured,
  };
}

export function mapReview(r: DbReview): Review {
  return {
    id: r.id,
    reviewerName: r.reviewer_name,
    country: r.country,
    countryCode: r.country_code ?? "",
    rating: r.rating,
    comment: r.comment,
    date: r.created_at,
  };
}
