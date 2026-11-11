export type VehicleType = 'Aqua' | 'Wagon R' | 'Sedan' | 'KDH';

export interface VehicleRate {
  type: VehicleType;
  modelName: string;
  capacity: string;
  perKmRate: number; // in USD
  image: string;
}

export interface PricingSettings {
  rates: Record<VehicleType, number>;
  driverDailyBatta: number; // Flat USD per day for driver meals/stay
  whatsappNumber: string; // International format: +947XXXXXXXX
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  travelTime?: string;
  overnightStay: string;
}

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  durationDays: number;
  durationNights: number;
  approxDistanceKm: number;
  travelStyle: string[]; // e.g. ['Adventure', 'Wildlife', 'Culture']
  overview: string;
  coverImage: string;
  galleryImages: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  isFeatured: boolean;
}

export interface Review {
  id: string;
  reviewerName: string;
  country: string;
  countryCode: string; // for flag display
  rating: number;
  comment: string;
  date: string;
  packageSlug?: string;
}
