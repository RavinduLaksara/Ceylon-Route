import type { VehicleType } from '@/types/tour';

export interface WhatsAppLinkArgs {
  whatsappNumber: string; // e.g. +94771234567
  packageTitle?: string;
  durationLabel?: string; // e.g. "8 Days / 7 Nights"
  vehicle?: VehicleType;
  estimatedTotal?: string; // pre-formatted, e.g. "$595"
  extraNote?: string;
}

/**
 * Build a wa.me deep link with a pre-filled customization message.
 *
 * Example (BDD Scenario 2): viewing the 8-Day Adventure with a KDH Van selected
 * produces a message naming the package, duration and vehicle, and invites the
 * traveller to customize their route.
 */
export function buildWhatsAppLink(args: WhatsAppLinkArgs): string {
  const phone = normalizePhone(args.whatsappNumber);
  const text = buildWhatsAppMessage(args);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppMessage({
  packageTitle,
  durationLabel,
  vehicle,
  estimatedTotal,
  extraNote,
}: Omit<WhatsAppLinkArgs, 'whatsappNumber'>): string {
  const lines: string[] = ['Hello CeylonRoute! I would like to customize a private tour.'];

  if (packageTitle) lines.push(`• Package: ${packageTitle}`);
  if (durationLabel) lines.push(`• Duration: ${durationLabel}`);
  if (vehicle) lines.push(`• Preferred vehicle: ${vehicleLabel(vehicle)}`);
  if (estimatedTotal) lines.push(`• Estimated total: ${estimatedTotal}`);
  if (extraNote) lines.push('', extraNote);

  lines.push('', 'Could you help me tailor the route and confirm availability?');
  return lines.join('\n');
}

/** Friendly full names for the fleet in messages/UI. */
export function vehicleLabel(vehicle: VehicleType): string {
  switch (vehicle) {
    case 'Aqua':
      return 'Toyota Aqua';
    case 'Wagon R':
      return 'Suzuki Wagon R';
    case 'Sedan':
      return 'Premium Sedan';
    case 'KDH':
      return 'Toyota KDH Van';
    default:
      return vehicle;
  }
}

/** Strip everything but digits so wa.me receives a bare international number. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}
