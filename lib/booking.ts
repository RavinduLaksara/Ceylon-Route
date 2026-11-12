import type { VehicleType } from "@/types/tour";

export interface BookingPayload {
  packageId: string | null;
  packageTitle: string | null;
  vehicleType: VehicleType;
  estimatedPrice: number | null;
  fullName: string;
  email: string;
  country: string;
  passportNo: string;
  whatsappNo: string;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string | null;
  pickupLocation: string;
  dropLocation: string;
  adultsCount: number;
  childrenCount: number;
  luggageCount: number;
  needsKidsSeat: boolean;
  specialRequirements: string | null;
}

const VEHICLES: VehicleType[] = ["Aqua", "Wagon R", "Sedan", "KDH"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a booking payload. Returns a map of field -> message (empty = valid).
 * Shared by the client form and the API route so rules stay in one place.
 */
export function validateBooking(p: Partial<BookingPayload>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!p.fullName?.trim()) errors.fullName = "Full name is required.";
  if (!p.email?.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(p.email)) errors.email = "Enter a valid email address.";
  if (!p.country?.trim()) errors.country = "Country is required.";
  if (!p.passportNo?.trim()) errors.passportNo = "Passport number is required.";
  if (!p.whatsappNo?.trim()) errors.whatsappNo = "WhatsApp number is required.";

  if (!p.vehicleType || !VEHICLES.includes(p.vehicleType))
    errors.vehicleType = "Select a vehicle.";
  if (!p.pickupDate) errors.pickupDate = "Pickup date is required.";
  if (!p.pickupLocation?.trim()) errors.pickupLocation = "Pickup location is required.";
  if (!p.dropLocation?.trim()) errors.dropLocation = "Drop location is required.";

  if (p.adultsCount != null && p.adultsCount < 1)
    errors.adultsCount = "At least one adult is required.";

  if (p.pickupDate && p.returnDate && p.returnDate < p.pickupDate)
    errors.returnDate = "Return date cannot be before pickup date.";

  return errors;
}

/** return_date = pickup_date + (durationDays - 1) nights, as YYYY-MM-DD. */
export function computeReturnDate(pickupDate: string, durationDays: number): string {
  const d = new Date(`${pickupDate}T00:00:00`);
  d.setDate(d.getDate() + Math.max(0, durationDays - 1));
  return d.toISOString().slice(0, 10);
}
